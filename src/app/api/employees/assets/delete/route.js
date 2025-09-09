import { NextResponse } from "next/server";
import { removeEmployeeAsset } from "@/lib/employeeAssetHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const { employee_id, asset_id } = await request.json();
        if (!employee_id || !asset_id) return NextResponse.json({ success: false, error: "employee_id and asset_id are required" }, { status: 400 });
        await removeEmployeeAsset(Number(employee_id), Number(asset_id));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error removing employee asset." }, { status: 500 });
    }
}
