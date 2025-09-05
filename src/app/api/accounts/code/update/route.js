import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import excuteQuery from "@/lib/db";

export async function POST(req) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        // Ensure requester is admin
        const rows = await excuteQuery({
            query: `SELECT is_admin FROM users WHERE email = ? LIMIT 1`,
            values: [token.email],
        });
        const me = Array.isArray(rows) ? rows[0] : null;
        if (!me || Number(me.is_admin) !== 1) {
            return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { account_id, invite_code } = body || {};
        if (!account_id) return NextResponse.json({ ok: false, error: "account_id required" }, { status: 400 });

        // Update JSON custom_fields.invite_code (set to NULL to clear)
        if (invite_code === null) {
            await excuteQuery({
                query: `UPDATE accounts SET custom_fields = NULL, updated_at = NOW() WHERE account_id = ?`,
                values: [account_id],
            });
        } else {
            await excuteQuery({
                query: `UPDATE accounts 
                        SET custom_fields = JSON_SET(COALESCE(custom_fields, JSON_OBJECT()), '$.invite_code', ?), updated_at = NOW()
                        WHERE account_id = ?`,
                values: [String(invite_code), account_id],
            });
        }
        const out = await excuteQuery({
            query: `SELECT account_id, account_name, description, custom_fields, created_at, updated_at FROM accounts WHERE account_id = ?`,
            values: [account_id],
        });
        return NextResponse.json({ ok: true, data: out?.[0] || null });
    } catch (e) {
        return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
    }
}
