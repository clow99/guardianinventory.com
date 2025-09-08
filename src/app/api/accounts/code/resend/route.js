import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import excuteQuery from "@/lib/db";
import { sendEmail } from "@/lib/email";

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
        const { id } = body || {};
        if (!id)
            return NextResponse.json(
                { ok: false, error: "id required" },
                { status: 400 }
            );

        const rows = await excuteQuery({
            query: `SELECT email, code FROM account_invite_codes WHERE id = ? LIMIT 1`,
            values: [id],
        });
        const row = Array.isArray(rows) ? rows[0] : null;
        if (!row)
            return NextResponse.json(
                { ok: false, error: "Not found" },
                { status: 404 }
            );

        await sendEmail({
            to: row.email,
            subject: `Your Guardian invite code`,
            html: `<p>You have been invited to join Guardian.</p>
                   <p>Your code: <b>${row.code}</b></p>
                   <p>Go to <a href="${(
                       process.env.NEXTAUTH_URL || "http://localhost:3000"
                   ).replace(
                       /\/$/,
                       ""
                   )}/auth/join-account">Join Account</a> and enter the code.</p>`,
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json(
            { ok: false, error: String(e) },
            { status: 500 }
        );
    }
}
