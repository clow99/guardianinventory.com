import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";

export async function GET(req) {
    // Only allow in non-production to avoid exposing user data unintentionally
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ ok: false, error: "Not available" }, { status: 404 });
    }
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");
        if (!email) {
            return NextResponse.json({ ok: false, error: "Missing email query param" }, { status: 400 });
        }
        const rows = await excuteQuery({
            query: `SELECT id, email, full_name, last_logon, created_at, updated_at FROM users WHERE email = ? LIMIT 1`,
            values: [email],
        });
        const user = Array.isArray(rows) ? rows[0] || null : null;
        return NextResponse.json({ ok: true, found: !!user, user });
    } catch (e) {
        return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
    }
}
