import { NextResponse } from "next/server";
import { deleteTask, getTaskById } from "@/lib/taskHelper";

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
        await deleteTask(task_id);
        const task = await getTaskById(task_id);
        return NextResponse.json({ success: true, data: task });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error deleting task." },
            { status: 500 }
        );
    }
}
