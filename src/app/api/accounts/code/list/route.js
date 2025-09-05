import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import excuteQuery from "@/lib/db";

export async function GET(req) {
    try {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
        });
        if (!token?.email)
            return NextResponse.json(
                { ok: false, error: "Unauthorized" },
                { status: 401 }
            );
        const meRows = await excuteQuery({
            query: `SELECT is_admin FROM users WHERE email = ? LIMIT 1`,
            values: [token.email],
        });
        const me = Array.isArray(meRows) ? meRows[0] : null;
        if (!me || Number(me.is_admin) !== 1)
            return NextResponse.json(
                { ok: false, error: "Forbidden" },
                { status: 403 }
            );

        const url = new URL(req.url);
        const account_id = Number(url.searchParams.get("account_id"));
        const email = url.searchParams.get("email") || null;
        if (!account_id)
            return NextResponse.json(
                { ok: false, error: "account_id required" },
                { status: 400 }
            );

        // Ensure table exists (no-op if already exists)
        await excuteQuery({
            query: `CREATE TABLE IF NOT EXISTS account_invite_codes (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                account_id BIGINT UNSIGNED NOT NULL,
                email VARCHAR(255) NOT NULL,
                code VARCHAR(64) NOT NULL,
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                used_at TIMESTAMP NULL DEFAULT NULL,
                PRIMARY KEY (id),
                UNIQUE KEY uniq_account_email (account_id, email),
                UNIQUE KEY uniq_code (code)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
            values: [],
        });

        const rows = await excuteQuery({
            query: `SELECT id, email, code, created_at, used_at
                    FROM account_invite_codes
                    WHERE account_id = ? ${email ? "AND email = ?" : ""}
                    ORDER BY created_at DESC
                    LIMIT 50`,
            values: email ? [account_id, email] : [account_id],
        });
        return NextResponse.json({ ok: true, data: rows || [] });
    } catch (e) {
        return NextResponse.json(
            { ok: false, error: String(e) },
            { status: 500 }
        );
    }
}
