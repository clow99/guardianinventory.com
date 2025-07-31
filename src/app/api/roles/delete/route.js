import { NextResponse } from "next/server";
import { deleteRole, getRoleById } from "@/lib/roleHelper";

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
        await deleteRole(role_id);
        const role = await getRoleById(role_id);
        return NextResponse.json({ success: true, data: role });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error deleting role." },
            { status: 500 }
        );
    }
}
