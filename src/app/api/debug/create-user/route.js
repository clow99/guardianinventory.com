import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { ok: false, error: "Not available" },
            { status: 404 }
        );
    }
    try {
        const body = await req.json();
        const { username, email, password, full_name } = body || {};
        if (!username || !email || !password) {
            return NextResponse.json(
                { ok: false, error: "username, email, password required" },
                { status: 400 }
            );
        }
        const hash = await bcrypt.hash(password, 10);
        await excuteQuery({
            query: `
                INSERT INTO users (username, email, password, full_name, created_at, updated_at)
                VALUES (?, ?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    username = VALUES(username),
                    password = VALUES(password),
                    full_name = COALESCE(VALUES(full_name), full_name),
                    updated_at = NOW()
            `,
            values: [username, email, hash, full_name || null],
        });
        return NextResponse.json({ ok: true, username, email });
    } catch (e) {
        return NextResponse.json(
            { ok: false, error: String(e) },
            { status: 500 }
        );
    }
}
