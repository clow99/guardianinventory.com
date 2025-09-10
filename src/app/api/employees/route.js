import { NextResponse } from "next/server";
import { getAllEmployees } from "@/lib/employeeHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok)
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        const body = await request.json().catch(() => ({}));
        const rows = await getAllEmployees(body || {});
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error fetching employees." },
            { status: 500 }
        );
    }
}
