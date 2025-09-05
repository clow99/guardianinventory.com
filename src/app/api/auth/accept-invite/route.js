import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import {
    findUserByEmail,
    findUserByUsername,
    createUser,
} from "@/lib/userHelper";
import { hashPassword } from "@/lib/auth";

export async function POST(req) {
    try {
        const { token, username, password } = await req.json();
        if (!token || !username || !password) {
            return NextResponse.json(
                { message: "Missing fields" },
                { status: 400 }
            );
        }
        const rows = await excuteQuery({
            query: `SELECT * FROM invite_tokens WHERE token = ? AND accepted_at IS NULL LIMIT 1`,
            values: [token],
        });
        const inv = Array.isArray(rows) && rows[0];
        if (!inv)
            return NextResponse.json(
                { message: "Invalid token" },
                { status: 400 }
            );
        const now = new Date();
        if (inv.expires_at && new Date(inv.expires_at) < now) {
            return NextResponse.json(
                { message: "Token expired" },
                { status: 400 }
            );
        }
        const existing = await Promise.all([
            findUserByEmail(inv.email),
            findUserByUsername(username),
        ]);
        if (existing[0])
            return NextResponse.json(
                { message: "Email already in use" },
                { status: 409 }
            );
        if (existing[1])
            return NextResponse.json(
                { message: "Username already in use" },
                { status: 409 }
            );
        const passwordHash = await hashPassword(password);
        await createUser({ username, email: inv.email, passwordHash });
        await excuteQuery({
            query: `UPDATE invite_tokens SET accepted_at = ? WHERE id = ?`,
            values: [now, inv.id],
        });
        // TODO: optionally add user to account/role from inv.account_id, inv.role_id
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
