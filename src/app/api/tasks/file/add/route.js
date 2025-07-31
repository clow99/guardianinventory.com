import { NextResponse } from "next/server";
import { attachFileToTask, getTaskFiles } from "@/lib/taskHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { task_id, file_name, file_path, uploaded_by_user_id } = body;
        if (!task_id || !file_name || !file_path) {
            return NextResponse.json(
                {
                    success: false,
                    error: "task_id, file_name, and file_path are required.",
                },
                { status: 400 }
            );
        }
        await attachFileToTask({
            task_id,
            file_name,
            file_path,
            uploaded_by_user_id,
        });
        const files = await getTaskFiles(task_id);
        return NextResponse.json({ success: true, data: files });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error attaching file to task.",
            },
            { status: 500 }
        );
    }
}
