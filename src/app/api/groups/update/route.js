import { NextResponse } from "next/server";
import { updateGroup, getGroupById } from "@/lib/groupHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { group_id, ...updates } = body;
        if (!group_id) {
            return NextResponse.json(
                { success: false, error: "group_id is required." },
                { status: 400 }
            );
        }
        await updateGroup(group_id, updates);
        const group = await getGroupById(group_id);

        return NextResponse.json({ success: true, data: group });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error updating group.",
            },
            { status: 500 }
        );
    }
}
