import { NextResponse } from "next/server";
import { getTaskById, getTaskAssignees, getTaskFiles } from "@/lib/taskHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { task_id } = body;
        if (!task_id) {
            return NextResponse.json(
                { success: false, error: "task_id is required." },
                { status: 400 }
            );
        }
        const task = await getTaskById(task_id);
        if (!task) {
            return NextResponse.json(
                { success: false, error: "Task not found." },
                { status: 404 }
            );
        }
        const assignees = await getTaskAssignees(task_id);
        const files = await getTaskFiles(task_id);

        return NextResponse.json({
            success: true,
            data: { ...task, assignees, files },
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error fetching task." },
            { status: 500 }
        );
    }
}
