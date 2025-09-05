import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import excuteQuery from "@/lib/db";

export async function POST(req) {
    try {
        const body = await req.json();
        const code = String(body?.code || "").trim();
        if (!code) return NextResponse.json({ ok: false, error: "Missing code" }, { status: 400 });

        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        // Resolve user_id from email
        const users = await excuteQuery({
            query: "SELECT id FROM users WHERE email = ? LIMIT 1",
            values: [token.email],
        });
        const user = Array.isArray(users) ? users[0] : null;
        if (!user?.id) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    // Find account by:
    // 1) per-person code in account_invite_codes (code + email)
    // 2) numeric id fallback
        let account = null;
        // Try per-person code
        const byPerson = await excuteQuery({
            query: `SELECT a.account_id, a.account_name
                    FROM account_invite_codes c
                    JOIN accounts a ON a.account_id = c.account_id
                    WHERE c.code = ? AND c.email = ?
                    LIMIT 1`,
            values: [code, token.email],
        }).catch(() => []);
        if (Array.isArray(byPerson) && byPerson[0]) account = byPerson[0];
        // Fallback: allow numeric code to be account_id
        if (!account) {
            const num = Number(code);
            if (Number.isFinite(num) && num > 0) {
                const byId = await excuteQuery({
                    query: `SELECT account_id, account_name FROM accounts WHERE account_id = ? LIMIT 1`,
                    values: [num],
                });
                if (Array.isArray(byId) && byId[0]) account = byId[0];
            }
        }
        if (!account?.account_id) return NextResponse.json({ ok: false, error: "Invalid invite code" }, { status: 404 });

        // Map user to account (idempotent)
        await excuteQuery({
            query: `INSERT IGNORE INTO account_users (account_id, user_id) VALUES (?, ?)`,
            values: [account.account_id, user.id],
        });

        // Mark per-person code as used if applicable
        await excuteQuery({
            query: `UPDATE account_invite_codes SET used_at = NOW() WHERE account_id = ? AND email = ? AND code = ?`,
            values: [account.account_id, token.email, code],
        }).catch(() => {});

        // Set cookie for SSR fallbacks
        const res = NextResponse.json({ ok: true, account });
        res.cookies.set("account_id", String(account.account_id), { path: "/", httpOnly: true });
        return res;
    } catch (e) {
        return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
    }
}
