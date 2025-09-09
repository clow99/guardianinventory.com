import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const { q = "", active = undefined, is_admin = undefined, limit = 100 } = (await request.json().catch(() => ({}))) || {};
        const conditions = ["deleted_at IS NULL OR deleted_at IS NULL"]; // allow nulls
        const values = [];
        if (q) {
            conditions.push("(email LIKE ? OR username LIKE ? OR full_name LIKE ?)");
            values.push(`%${q}%`, `%${q}%`, `%${q}%`);
        }
        if (typeof active === "boolean") {
            conditions.push("active = ?");
            values.push(active ? 1 : 0);
        }
        if (typeof is_admin === "boolean") {
            conditions.push("is_admin = ?");
            values.push(is_admin ? 1 : 0);
        }
        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
        const rows = await excuteQuery({ query: `SELECT id, email, username, full_name, is_admin, active, created_at, updated_at FROM users ${where} ORDER BY created_at DESC LIMIT ?`, values: [...values, Number(limit) || 100] });
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error fetching users." }, { status: 500 });
    }
}
