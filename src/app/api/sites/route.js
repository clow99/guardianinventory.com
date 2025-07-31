import { NextResponse } from "next/server";
import { getAllSites } from "@/lib/siteHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        // body can include: { account_id, activeOnly }
        const sites = await getAllSites(body || {});
        return NextResponse.json({ success: true, data: sites });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching sites.",
            },
            { status: 500 }
        );
    }
}
