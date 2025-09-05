import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import excuteQuery from "@/lib/db";

export async function POST(req) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ ok: false, error: "Not available" }, { status: 404 });
    }
    try {
        const isHttps = (process.env.NEXTAUTH_URL || "").startsWith("https://") || !!process.env.VERCEL;
        const cookieName = isHttps ? "__Secure-next-auth.session-token" : "next-auth.session-token";
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, cookieName });
        if (!token?.email) {
            return NextResponse.json({ ok: false, error: "No session email" }, { status: 401 });
        }
        const now = new Date();
        const lastLogon = now.toISOString();
        const email = token.email;
        const fullName = token.name || token.email;
        await excuteQuery({
            query: `
                INSERT INTO users (email, full_name, objectguid, last_logon, created_at, updated_at)
                VALUES (?, ?, NULL, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    full_name = VALUES(full_name),
                    last_logon = VALUES(last_logon),
                    updated_at = VALUES(updated_at)
            `,
            values: [email, fullName, lastLogon, now, now],
        });
        return NextResponse.json({ ok: true, email });
    } catch (e) {
        return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
    }
}
