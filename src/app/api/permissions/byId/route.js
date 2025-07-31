import { NextResponse } from "next/server";
import { getPermissionById } from "@/lib/permissionsHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { permission_id } = body;
        if (!permission_id) {
            return NextResponse.json(
                { success: false, error: "permission_id is required." },
                { status: 400 }
            );
        }
        const permission = await getPermissionById(permission_id);
        if (!permission) {
            return NextResponse.json(
                { success: false, error: "Permission not found." },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, data: permission });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching permission.",
            },
            { status: 500 }
        );
    }
}
