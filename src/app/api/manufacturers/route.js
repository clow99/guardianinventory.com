import { NextResponse } from "next/server";
import { getAllManufacturers } from "@/lib/manufacturerHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const manufacturers = await getAllManufacturers(body || {});
        return NextResponse.json({ success: true, data: manufacturers });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching manufacturers.",
            },
            { status: 500 }
        );
    }
}
