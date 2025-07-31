import { NextResponse } from "next/server";
import { createPermission, getPermissionById } from "@/lib/permissionsHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { permission_name, permission_description } = body;
        if (!permission_name) {
            return NextResponse.json(
                { success: false, error: "permission_name is required." },
                { status: 400 }
            );
        }
        const permission_id = await createPermission({
            permission_name,
            permission_description,
        });
        const permission = await getPermissionById(permission_id);
        return NextResponse.json({ success: true, data: permission });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error adding permission.",
            },
            { status: 500 }
        );
    }
}
