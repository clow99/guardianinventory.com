import { NextResponse } from "next/server";
import { addUserToAccount, listAccountUsers } from "@/lib/accountUserHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok)
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        const { account_id, user_id, role_id = null, custom_fields = null } = await request.json();
        if (!account_id || !user_id) {
            return NextResponse.json(
                { success: false, error: "account_id and user_id are required" },
                { status: 400 }
            );
        }
        await addUserToAccount({ account_id: Number(account_id), user_id: Number(user_id), role_id: role_id ? Number(role_id) : null, custom_fields });
        const rows = await listAccountUsers(Number(account_id));
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error adding user to account." },
            { status: 500 }
        );
    }
}
