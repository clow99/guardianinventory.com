import { NextResponse } from "next/server";
import { createTask, getTaskById } from "@/lib/taskHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        // Required: asset_id, title (add more as needed)
        const { asset_id, title } = body;
        if (!asset_id || !title) {
            return NextResponse.json(
                { success: false, error: "asset_id and title are required." },
                { status: 400 }
            );
        }
        const task_id = await createTask(body);
        const task = await getTaskById(task_id);
        return NextResponse.json({ success: true, data: task });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error adding task." },
            { status: 500 }
        );
    }
}
