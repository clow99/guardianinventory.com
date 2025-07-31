import { NextResponse } from "next/server";
import { removeUserFromTask, getTaskAssignees } from "@/lib/taskHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { task_id, user_id } = body;
        if (!task_id || !user_id) {
            return NextResponse.json(
                { success: false, error: "task_id and user_id are required." },
                { status: 400 }
            );
        }
        await removeUserFromTask(task_id, user_id);
        const assignees = await getTaskAssignees(task_id);
        return NextResponse.json({ success: true, data: assignees });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error removing user from task.",
            },
            { status: 500 }
        );
    }
}
