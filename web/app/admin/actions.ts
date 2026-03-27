"use server";

export async function verifyAdminPasscode(input: string) {
    const secret = process.env.ADMIN_PASSCODE;
    
    if (!secret) {
        console.error("ADMIN_PASSCODE not found in environment variables.");
        return { success: false, error: "Server Configuration Error" };
    }

    if (input === secret) {
        return { success: true };
    }

    return { success: false, error: "Incorrect Passcode" };
}
