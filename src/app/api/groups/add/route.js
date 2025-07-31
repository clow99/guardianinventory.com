import { NextResponse } from "next/server";
import { createGroup, getGroupById } from "@/lib/groupHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { group_name } = body;
        if (!group_name) {
            return NextResponse.json(
                { success: false, error: "group_name is required." },
                { status: 400 }
            );
        }
        const group_id = await createGroup({ group_name });
        const group = await getGroupById(group_id);

        return NextResponse.json({ success: true, data: group });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error creating group.",
            },
            { status: 500 }
        );
    }
}
