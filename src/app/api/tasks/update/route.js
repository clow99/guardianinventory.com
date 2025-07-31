import { NextResponse } from "next/server";
import { updateTask, getTaskById } from "@/lib/taskHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { task_id, ...updates } = body;
        if (!task_id) {
            return NextResponse.json(
                { success: false, error: "task_id is required." },
                { status: 400 }
            );
        }
        await updateTask(task_id, updates);
        const task = await getTaskById(task_id);
        return NextResponse.json({ success: true, data: task });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error updating task." },
            { status: 500 }
        );
    }
}
