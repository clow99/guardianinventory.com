import { NextResponse } from "next/server";
import { removeMemberFromGroup, getGroupMembers } from "@/lib/groupHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { employee_id, group_id } = body;
        if (!employee_id || !group_id) {
            return NextResponse.json(
                {
                    success: false,
                    error: "employee_id and group_id are required.",
                },
                { status: 400 }
            );
        }
        await removeMemberFromGroup(employee_id, group_id);
        const members = await getGroupMembers(group_id);

        return NextResponse.json({ success: true, data: members });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error removing member from group.",
            },
            { status: 500 }
        );
    }
}
