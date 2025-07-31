import { NextResponse } from "next/server";
import { deleteGroup, getGroupById } from "@/lib/groupHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { group_id } = body;
        if (!group_id) {
            return NextResponse.json(
                { success: false, error: "group_id is required." },
                { status: 400 }
            );
        }
        await deleteGroup(group_id);
        const group = await getGroupById(group_id); // May return null if getGroupById excludes deleted

        return NextResponse.json({ success: true, data: group });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error deleting group.",
            },
            { status: 500 }
        );
    }
}
