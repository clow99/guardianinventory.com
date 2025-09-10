import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import excuteQuery from "@/lib/db";

export async function POST(req) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { ok: false, error: "Not available" },
            { status: 404 }
        );
    }
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
        await excuteQuery({
            query: `CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                is_admin TINYINT(1) DEFAULT 0,
                full_name VARCHAR(255) NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,
            values: [],
        });
        await excuteQuery({
            query: `INSERT INTO users (email, is_admin) VALUES (?, 1)
                    ON DUPLICATE KEY UPDATE is_admin = 1, updated_at = NOW()`,
            values: [token.email],
        });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json(
            { ok: false, error: String(e) },
            { status: 500 }
        );
    }
}
