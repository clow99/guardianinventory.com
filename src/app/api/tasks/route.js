import { NextResponse } from "next/server";
import { getAllTasks } from "@/lib/taskHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        // body can include { asset_id, status, assigned_user_id }
        const tasks = await getAllTasks(body || {});
        return NextResponse.json({ success: true, data: tasks });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching tasks.",
            },
            { status: 500 }
        );
    }
}
