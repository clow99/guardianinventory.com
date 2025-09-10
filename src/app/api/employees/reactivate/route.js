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
        const { employee_id } = await request.json();
        if (!employee_id)
            return NextResponse.json(
                { success: false, error: "employee_id is required" },
                { status: 400 }
            );
        await excuteQuery({
            query: `UPDATE employees SET deleted_at = NULL, updated_at = NOW() WHERE employee_id = ?`,
            values: [Number(employee_id)],
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error reactivating employee." },
            { status: 500 }
        );
    }
}

