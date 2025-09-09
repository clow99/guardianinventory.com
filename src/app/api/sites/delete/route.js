import { NextResponse } from "next/server";
import { deleteSite, getSiteById } from "@/lib/siteHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok)
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        const body = await request.json();
        const { site_id } = body;
        if (!site_id) {
            return NextResponse.json(
                { success: false, error: "site_id is required." },
                { status: 400 }
            );
        }
        await deleteSite(site_id);
        const site = await getSiteById(site_id);
        return NextResponse.json({ success: true, data: site });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error deleting site." },
            { status: 500 }
        );
    }
}
