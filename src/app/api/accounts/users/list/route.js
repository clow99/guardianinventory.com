import { NextResponse } from "next/server";
import { listAccountUsers } from "@/lib/accountUserHelper";
import { requireAccountMember } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const { account_id } = await request.json();
        const auth = await requireAccountMember(Number(account_id));
        if (!auth.ok)
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        if (!account_id) {
            return NextResponse.json(
                { success: false, error: "account_id is required" },
                { status: 400 }
            );
        }
        const rows = await listAccountUsers(Number(account_id));
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error fetching account users." },
            { status: 500 }
        );
    }
}
