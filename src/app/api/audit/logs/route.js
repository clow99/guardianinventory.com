import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const { user_id = null, action = null, entity_type = null, entity_id = null } = (await request.json().catch(() => ({}))) || {};
        const conditions = [];
        const values = [];
        if (user_id) { conditions.push("user_id = ?"); values.push(Number(user_id)); }
        if (action) { conditions.push("action = ?"); values.push(action); }
        if (entity_type) { conditions.push("entity_type = ?"); values.push(entity_type); }
        if (entity_id) { conditions.push("entity_id = ?"); values.push(Number(entity_id)); }
        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
        const rows = await excuteQuery({ query: `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC`, values });
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error fetching audit logs." }, { status: 500 });
    }
}
