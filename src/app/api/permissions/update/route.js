import { NextResponse } from "next/server";
import { updatePermission, getPermissionById } from "@/lib/permissionsHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { permission_id, ...updates } = body;
        if (!permission_id) {
            return NextResponse.json(
                { success: false, error: "permission_id is required." },
                { status: 400 }
            );
        }
        await updatePermission(permission_id, updates);
        const permission = await getPermissionById(permission_id);
        return NextResponse.json({ success: true, data: permission });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error updating permission.",
            },
            { status: 500 }
        );
    }
}
