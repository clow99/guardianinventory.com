import { NextResponse } from "next/server";
import {
    getRoleById,
    getRolePermissions,
    getUsersByRoleId,
} from "@/lib/roleHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { role_id } = body;
        if (!role_id) {
            return NextResponse.json(
                { success: false, error: "role_id is required." },
                { status: 400 }
            );
        }
        const role = await getRoleById(role_id);
        if (!role) {
            return NextResponse.json(
                { success: false, error: "Role not found." },
                { status: 404 }
            );
        }
        const permissions = await getRolePermissions(role_id);
        const users = await getUsersByRoleId(role_id);

        return NextResponse.json({
            success: true,
            data: { ...role, permissions, users },
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error fetching role." },
            { status: 500 }
        );
    }
}
