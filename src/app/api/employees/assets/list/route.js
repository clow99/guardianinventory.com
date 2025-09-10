import { NextResponse } from "next/server";
import { listEmployeeAssets } from "@/lib/employeeAssetHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const { employee_id } = await request.json();
        if (!employee_id) return NextResponse.json({ success: false, error: "employee_id is required" }, { status: 400 });
        const rows = await listEmployeeAssets(Number(employee_id));
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error fetching employee assets." }, { status: 500 });
    }
}
