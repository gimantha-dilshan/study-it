"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegistrationPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [whatsappId, setWhatsappId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // Normalize number: remove all non-digits (e.g. +94 71... -> 9471...)
      const pureNumber = whatsappId.replace(/\D/g, "");

      if (!pureNumber) {
        setStatus("error");
        setMessage("Please enter a valid WhatsApp number.");
        return;
      }

      // Find user by searching the 'jid' column OR the 'id' column with the number
      // Hint: If the bot is storing @s.whatsapp.net nodes, the jid will contain the number.
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .or(`jid.ilike.%${pureNumber}%,phone.ilike.%${pureNumber}%`) // Search in both jid and new phone column
        .single();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      if (!user) {
        setStatus("error");
        setMessage("WhatsApp number not found. Please message the bot once first!");
        return;
      }

      // Update user to registered
      const { error: updateError } = await supabase
        .from("users")
        .update({ 
          is_registered: true,
          email: email
        })
        .eq("jid", user.jid); // Use the found JID

      if (updateError) throw updateError;

      setStatus("success");
      setMessage("Registration successful! Your daily limit has been increased to 50 messages. 🎓✨");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again.");
    }
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black">
      {/* Decorative Blur */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass rounded-3xl p-8 space-y-8 animate-float">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Study-It
          </h1>
          <p className="text-gray-400 text-sm">Elevate your learning experience.</p>
        </div>

        {status === "success" ? (
          <div className="space-y-6 text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white">All Set!</h2>
            <p className="text-gray-400">{message}</p>
            <button 
              onClick={() => setStatus("idle")}
              className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
            >
              Back
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-1">WhatsApp Number</label>
              <input 
                type="text"
                required
                placeholder="e.g. 947xxxxxxxx"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white placeholder:text-gray-600"
                value={whatsappId}
                onChange={(e) => setWhatsappId(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 px-1 opacity-60">Enter the number you use to message the bot.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-1">Email Address</label>
              <input 
                type="email"
                required
                placeholder="alex@gmail.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white placeholder:text-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {status === "error" && (
              <p className="text-red-400 text-sm text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20">
                {message}
              </p>
            )}

            <button 
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              {status === "loading" ? "Registering..." : "Level Up Now"}
            </button>
          </form>
        )}

        <div className="text-center">
          <p className="text-xs text-gray-600">
            Securely managed by Supabase & Gemini
          </p>
        </div>
      </div>
    </main>
  );
}
