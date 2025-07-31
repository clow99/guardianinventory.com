import { NextResponse } from "next/server";
import { removeUserFromRole, getUsersByRoleId } from "@/lib/roleHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { user_id, role_id } = body;
        if (!user_id || !role_id) {
            return NextResponse.json(
                { success: false, error: "user_id and role_id are required." },
                { status: 400 }
            );
        }
        await removeUserFromRole(user_id, role_id);
        const users = await getUsersByRoleId(role_id);
        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error removing user from role.",
            },
            { status: 500 }
        );
    }
}
