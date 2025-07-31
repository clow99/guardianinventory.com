import { NextResponse } from "next/server";
import { createRole, getRoleById } from "@/lib/roleHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { role_name, description } = body;
        if (!role_name) {
            return NextResponse.json(
                { success: false, error: "role_name is required." },
                { status: 400 }
            );
        }
        const role_id = await createRole({ role_name, description });
        const role = await getRoleById(role_id);
        return NextResponse.json({ success: true, data: role });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error creating role." },
            { status: 500 }
        );
    }
}
