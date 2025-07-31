import { NextResponse } from "next/server";
import { getAllPermissions } from "@/lib/permissionsHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const permissions = await getAllPermissions(body || {});
        return NextResponse.json({ success: true, data: permissions });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching permissions.",
            },
            { status: 500 }
        );
    }
}
