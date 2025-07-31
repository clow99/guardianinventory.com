import { NextResponse } from "next/server";
import { getAllGroups } from "@/lib/groupHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const groups = await getAllGroups(body || {});
        return NextResponse.json({ success: true, data: groups });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching groups.",
            },
            { status: 500 }
        );
    }
}
