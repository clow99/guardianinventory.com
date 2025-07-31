import { NextResponse } from "next/server";
import { removePermissionFromRole, getRolePermissions } from "@/lib/roleHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { role_id, permission_id } = body;
        if (!role_id || !permission_id) {
            return NextResponse.json(
                {
                    success: false,
                    error: "role_id and permission_id are required.",
                },
                { status: 400 }
            );
        }
        await removePermissionFromRole(role_id, permission_id);
        const permissions = await getRolePermissions(role_id);
        return NextResponse.json({ success: true, data: permissions });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error removing permission from role.",
            },
            { status: 500 }
        );
    }
}
