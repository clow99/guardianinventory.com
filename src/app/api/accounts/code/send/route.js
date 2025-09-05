import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import excuteQuery from "@/lib/db";
import { sendEmail } from "@/lib/email";

function randomCode(len = 8) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < len; i++)
        out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}

export async function POST(req) {
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

        const body = await req.json();
        const { account_id, email, code } = body || {};
        if (!account_id || !email)
            return NextResponse.json(
                { ok: false, error: "account_id and email required" },
                { status: 400 }
            );

        // Ensure table exists
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

        const finalCode = code ? String(code).trim() : randomCode(10);

        // Upsert code for this email and account
        await excuteQuery({
            query: `INSERT INTO account_invite_codes (account_id, email, code) VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE code = VALUES(code), created_at = CURRENT_TIMESTAMP, used_at = NULL`,
            values: [account_id, email, finalCode],
        });

        // Email the code
        await sendEmail({
            to: email,
            subject: `Your Guardian invite code`,
            html: `<p>You have been invited to join Guardian.</p>
                   <p>Your code: <b>${finalCode}</b></p>
                   <p>Go to <a href="${(
                       process.env.NEXTAUTH_URL || "http://localhost:3000"
                   ).replace(
                       /\/$/,
                       ""
                   )}/auth/join-account">Join Account</a> and enter the code.</p>`,
        });

        return NextResponse.json({ ok: true, code: finalCode });
    } catch (e) {
        return NextResponse.json(
            { ok: false, error: String(e) },
            { status: 500 }
        );
    }
}
