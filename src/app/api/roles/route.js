import { NextResponse } from "next/server";
import { getAllRoles } from "@/lib/roleHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const roles = await getAllRoles(body || {});
        return NextResponse.json({ success: true, data: roles });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching roles.",
            },
            { status: 500 }
        );
    }
}
