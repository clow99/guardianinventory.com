import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import { findUserByEmail } from "@/lib/userHelper";
import { generateToken, addHours } from "@/lib/tokens";
import { ensureAuthTables } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(req) {
    try {
        const { email } = await req.json();
        if (!email)
            return NextResponse.json(
                { message: "Email required" },
                { status: 400 }
            );
        await ensureAuthTables();
        const user = await findUserByEmail(email);
        // Always return OK to avoid email enumeration
        if (!user) {
            return NextResponse.json({ ok: true });
        }
        const token = generateToken(24);
        const expires = addHours(new Date(), 2);
        await excuteQuery({
            query: `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
            values: [user.id, token, expires],
        });
        const base =
            process.env.NEXTAUTH_URL ||
            process.env.VERCEL_URL ||
            "http://localhost:3000";
        const resetLink = `${base.replace(
            /\/$/,
            ""
        )}/auth/reset-password?token=${token}`;
        await sendEmail({
            to: email,
            subject: "Reset your Guardian password",
            html: `<p>Click the link below to reset your password. This link expires in 2 hours.</p><p><a href="${resetLink}">${resetLink}</a></p>`,
        });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
