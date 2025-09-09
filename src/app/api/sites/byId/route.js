import { NextResponse } from "next/server";
import { getSiteById } from "@/lib/siteHelper";
import { getAuthContext } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await getAuthContext();
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
        const site = await getSiteById(site_id);
        if (!site) {
            return NextResponse.json(
                { success: false, error: "Site not found." },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, data: site });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error fetching site." },
            { status: 500 }
        );
    }
}
