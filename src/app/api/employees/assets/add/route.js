import { NextResponse } from "next/server";
import { addEmployeeAsset } from "@/lib/employeeAssetHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const { employee_id, asset_id, assigned_date = null } = await request.json();
        if (!employee_id || !asset_id) return NextResponse.json({ success: false, error: "employee_id and asset_id are required" }, { status: 400 });
        await addEmployeeAsset(Number(employee_id), Number(asset_id), assigned_date);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error adding employee asset." }, { status: 500 });
    }
}
