import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import { generateToken, addHours } from "@/lib/tokens";
import { ensureAuthTables } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(req) {
    try {
        const { email, accountId = null, roleId = null } = await req.json();
        if (!email)
            return NextResponse.json(
                { message: "Email required" },
                { status: 400 }
            );
        await ensureAuthTables();
        const token = generateToken(24);
        const expires = addHours(new Date(), 72);
        await excuteQuery({
            query: `INSERT INTO invite_tokens (email, token, account_id, role_id, expires_at) VALUES (?, ?, ?, ?, ?)`,
            values: [email, token, accountId, roleId, expires],
        });
        const base =
            process.env.NEXTAUTH_URL ||
            process.env.VERCEL_URL ||
            "http://localhost:3000";
        const link = `${base.replace(
            /\/$/,
            ""
        )}/auth/accept-invite?token=${token}&email=${encodeURIComponent(
            email
        )}`;
        await sendEmail({
            to: email,
            subject: "You’re invited to Guardian",
            html: `<p>You’ve been invited to join Guardian. Click the link to accept your invite.</p><p><a href="${link}">${link}</a></p>`,
        });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
