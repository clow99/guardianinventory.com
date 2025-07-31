import { NextResponse } from "next/server";
import { removeFileFromTask } from "@/lib/taskHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { file_id } = body;
        if (!file_id) {
            return NextResponse.json(
                { success: false, error: "file_id is required." },
                { status: 400 }
            );
        }
        await removeFileFromTask(file_id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error removing file from task.",
            },
            { status: 500 }
        );
    }
}
