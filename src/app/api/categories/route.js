import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/categoryHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const categories = await getAllCategories(body || {});
        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching categories.",
            },
            { status: 500 }
        );
    }
}
