import { NextResponse } from "next/server";
import { removeUserFromAccount } from "@/lib/accountUserHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok)
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        const { account_id, user_id } = await request.json();
        if (!account_id || !user_id) {
            return NextResponse.json(
                { success: false, error: "account_id and user_id are required" },
                { status: 400 }
            );
        }
        await removeUserFromAccount({ account_id: Number(account_id), user_id: Number(user_id) });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error removing user from account." },
            { status: 500 }
        );
    }
}
