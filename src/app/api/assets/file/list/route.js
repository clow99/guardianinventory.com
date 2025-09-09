import { NextResponse } from "next/server";
import { listAssetFiles } from "@/lib/assetFileHelper";
import { getAuthContext, requireAccountMember } from "@/lib/apiAccess";
import excuteQuery from "@/lib/db";

async function accountIdForAsset(asset_id) {
  const rows = await excuteQuery({
    query: `SELECT p.account_id FROM assets a JOIN products p ON a.product_id = p.product_id WHERE a.asset_id = ? LIMIT 1`,
    values: [asset_id],
  });
  return Number(rows?.[0]?.account_id || 0) || null;
}

export async function GET(request) {
  try {
    const auth = await getAuthContext();
    if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    const { searchParams } = new URL(request.url);
    const asset_id = Number(searchParams.get("asset_id"));
    if (!asset_id) return NextResponse.json({ success: false, error: "asset_id is required" }, { status: 400 });
    const account_id = await accountIdForAsset(asset_id);
    if (!account_id) return NextResponse.json({ success: false, error: "Asset not found" }, { status: 404 });
    const gate = await requireAccountMember(account_id);
    if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });
    const rows = await listAssetFiles(asset_id);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.message || "Error fetching asset files." }, { status: 500 });
  }
}

