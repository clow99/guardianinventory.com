import { NextResponse } from "next/server";
import { updateRole, getRoleById } from "@/lib/roleHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { role_id, ...updates } = body;
        if (!role_id) {
            return NextResponse.json(
                { success: false, error: "role_id is required." },
                { status: 400 }
            );
        }
        await updateRole(role_id, updates);
        const role = await getRoleById(role_id);
        return NextResponse.json({ success: true, data: role });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error updating role." },
            { status: 500 }
        );
    }
}
