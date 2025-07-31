import { NextResponse } from "next/server";
import { addPermissionToRole, getRolePermissions } from "@/lib/roleHelper";

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
        await addPermissionToRole(role_id, permission_id);
        const permissions = await getRolePermissions(role_id);
        return NextResponse.json({ success: true, data: permissions });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error adding permission to role.",
            },
            { status: 500 }
        );
    }
}
