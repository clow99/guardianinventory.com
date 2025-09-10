import { NextResponse } from "next/server";
import { getAssetHistory } from "@/lib/assetHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function GET(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const { searchParams } = new URL(request.url);
        const asset_id = Number(searchParams.get("asset_id"));
        if (!asset_id) return NextResponse.json({ success: false, error: "asset_id is required" }, { status: 400 });
        const rows = await getAssetHistory(asset_id);
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error fetching asset history." }, { status: 500 });
    }
}
