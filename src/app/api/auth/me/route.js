import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import excuteQuery from "@/lib/db";

export async function GET(req) {
    try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email || null;
    if (!email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        // Detect available columns on users to avoid referencing non-existent fields
        const colRows = await excuteQuery({
            query: `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' 
                    AND COLUMN_NAME IN ('full_name','username','name','image')`,
            values: [],
        }).catch(() => []);
        const present = new Set((Array.isArray(colRows) ? colRows : []).map((r) => r.COLUMN_NAME));
        const hasFullName = present.has("full_name");
        const hasUsername = present.has("username");
        const hasName = present.has("name");
        const hasImage = present.has("image");

        // Build safe SELECT
        const fields = ["id", "email", "is_admin"];
        if (hasFullName) fields.push("full_name");
        if (hasUsername) fields.push("username");
        if (hasName) fields.push("name");
        if (hasImage) fields.push("image");
        const selectSql = `SELECT ${fields.join(", ")} FROM users WHERE email = ? LIMIT 1`;

    const rows = await excuteQuery({ query: selectSql, values: [email] });
        const row = Array.isArray(rows) ? rows[0] : null;
        if (!row) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

        const me = {
            id: row.id,
            email: row.email,
            is_admin: row.is_admin,
            name: (hasFullName && row.full_name) || (hasName && row.name) || (hasUsername && row.username) || row.email,
            image: hasImage ? row.image : null,
        };

        return NextResponse.json({ ok: true, me });
    } catch (e) {
        // Fallback: return minimal shape if any unexpected error
        try {
            const session2 = await getServerSession(authOptions);
            const email2 = session2?.user?.email || "";
            const rows = await excuteQuery({
                query: `SELECT id, email, is_admin FROM users WHERE email = ? LIMIT 1`,
                values: [email2],
            });
            const row = Array.isArray(rows) ? rows[0] : null;
            if (!row) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
            return NextResponse.json({ ok: true, me: { id: row.id, email: row.email, is_admin: row.is_admin, name: row.email } });
        } catch {
            return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
        }
    }
}
