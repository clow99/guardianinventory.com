import { NextResponse } from "next/server";
import { getAllEmployees } from "@/lib/employeeHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        // You can pass filters like { department, active, group_id }
        const employees = await getAllEmployees(body || {});
        return NextResponse.json({ success: true, data: employees });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching employees.",
            },
            { status: 500 }
        );
    }
}
