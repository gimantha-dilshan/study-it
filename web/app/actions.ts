"use server";

import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";

// Server-side admin client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redis = Redis.fromEnv();

export async function registerUser(whatsappNumber: string, email: string) {
  try {
    const pureNumber = whatsappNumber.replace(/\D/g, "");

    if (!pureNumber || pureNumber.length < 8) {
      return { success: false, error: "Please enter a valid WhatsApp number with country code." };
    }

    // Find the user - support both standard JID and the new LID format
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("jid, is_registered")
      .or(`jid.ilike.%${pureNumber}%,phone.ilike.%${pureNumber}%`)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return {
          success: false,
          error: "Number not found. Please send any message to the bot on WhatsApp first so it can recognize you!",
        };
      }
      throw fetchError;
    }

    if (user.is_registered) {
      return { success: false, error: "This account is already registered as Pro!" };
    }

    // Update the user profile to 'is_registered'
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ is_registered: true, email })
      .eq("jid", user.jid);

    if (updateError) throw updateError;

    // Trigger registration event for the WhatsApp bot to send the 'Welcome' message
    const { data: eventData, error: eventError } = await supabaseAdmin
      .from("registration_events")
      .insert({ jid: user.jid })
      .select("id")
      .single();

    if (eventError) throw eventError;

    // Instant Delivery: Push to Upstash Redis queue. 
    // If this fails, the bot's 30-sec Supabase polling will still process it safely!
    try {
      await redis.lpush("queue:registrations", JSON.stringify({ id: eventData.id, jid: user.jid }));
    } catch (redisErr) {
      console.warn("Redis push failed (relying on polling fallback):", redisErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error("Registration Error:", err);
    return { success: false, error: "A server error occurred. Please try again." };
  }
}
