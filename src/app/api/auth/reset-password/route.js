import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req) {
    try {
        const { token, password } = await req.json();
        if (!token || !password)
            return NextResponse.json(
                { message: "Missing fields" },
                { status: 400 }
            );
        const rows = await excuteQuery({
            query: `SELECT * FROM password_reset_tokens WHERE token = ? AND used_at IS NULL LIMIT 1`,
            values: [token],
        });
        const rec = Array.isArray(rows) && rows[0];
        if (!rec)
            return NextResponse.json(
                { message: "Invalid token" },
                { status: 400 }
            );
        const now = new Date();
        if (rec.expires_at && new Date(rec.expires_at) < now) {
            return NextResponse.json(
                { message: "Token expired" },
                { status: 400 }
            );
        }
        const hash = await hashPassword(password);
        await excuteQuery({
            query: `UPDATE users SET password = ?, updated_at = ? WHERE id = ?`,
            values: [hash, now, rec.user_id],
        });
        await excuteQuery({
            query: `UPDATE password_reset_tokens SET used_at = ? WHERE id = ?`,
            values: [now, rec.id],
        });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
