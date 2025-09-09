import { NextResponse } from "next/server";
import { updateAccountUser } from "@/lib/accountUserHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok)
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        const { account_id, user_id, role_id = undefined, custom_fields = undefined } = await request.json();
        if (!account_id || !user_id) {
            return NextResponse.json(
                { success: false, error: "account_id and user_id are required" },
                { status: 400 }
            );
        }
        await updateAccountUser({ account_id: Number(account_id), user_id: Number(user_id), role_id: role_id !== undefined ? Number(role_id) : undefined, custom_fields });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error updating account user." },
            { status: 500 }
        );
    }
}
