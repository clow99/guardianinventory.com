import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import excuteQuery from "@/lib/db";

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

        await excuteQuery({
            query: `DELETE FROM account_invite_codes WHERE id = ?`,
            values: [id],
        });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json(
            { ok: false, error: String(e) },
            { status: 500 }
        );
    }
}
