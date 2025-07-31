import { NextResponse } from "next/server";
import {
    getGroupById,
    getGroupMembers,
    getGroupLimits,
} from "@/lib/groupHelper";

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
        const group = await getGroupById(group_id);
        if (!group) {
            return NextResponse.json(
                { success: false, error: "Group not found." },
                { status: 404 }
            );
        }
        const members = await getGroupMembers(group_id);
        const limits = await getGroupLimits(group_id);

        return NextResponse.json({
            success: true,
            data: { ...group, members, limits },
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching group.",
            },
            { status: 500 }
        );
    }
}
