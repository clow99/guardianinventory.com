import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok)
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        const rows = await excuteQuery({
            query: `
                SELECT e.*, u.email, u.username
                FROM employees e
                LEFT JOIN users u ON e.user_id = u.id
                WHERE e.deleted_at IS NOT NULL
                ORDER BY e.deleted_at DESC
            `,
            values: [],
        });
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error fetching deactivated employees." },
            { status: 500 }
        );
    }
}

