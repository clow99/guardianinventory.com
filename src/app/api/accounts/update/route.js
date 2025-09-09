import { NextResponse } from "next/server";
import { getAccountById, updateAccount } from "@/lib/accountHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { account_id, ...updates } = body || {};
        if (!account_id) return NextResponse.json({ success: false, error: "account_id is required" }, { status: 400 });
        await updateAccount(Number(account_id), updates);
        const row = await getAccountById(Number(account_id));
        return NextResponse.json({ success: true, data: row });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error updating account." }, { status: 500 });
    }
}

