import { NextResponse } from "next/server";
import { deleteAssetFile } from "@/lib/assetFileHelper";
import { getAuthContext, requireAccountMember } from "@/lib/apiAccess";
import excuteQuery from "@/lib/db";

async function accountIdForFile(id) {
  const rows = await excuteQuery({
    query: `SELECT p.account_id
            FROM asset_files f
            JOIN assets a ON f.asset_id = a.asset_id
            JOIN products p ON a.product_id = p.product_id
            WHERE f.id = ? LIMIT 1`,
    values: [id],
  });
  return Number(rows?.[0]?.account_id || 0) || null;
}

export async function POST(request) {
  try {
    const auth = await getAuthContext();
    if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    const body = await request.json();
    const { id } = body || {};
    if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    const account_id = await accountIdForFile(Number(id));
    if (!account_id) return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    const gate = await requireAccountMember(account_id);
    if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });
    await deleteAssetFile(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.message || "Error deleting asset file." }, { status: 500 });
  }
}

