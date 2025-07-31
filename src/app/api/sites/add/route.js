import { NextResponse } from "next/server";
import { createSite, getSiteById } from "@/lib/siteHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            account_id,
            site_name,
            site_description,
            address,
            custom_fields,
        } = body;
        if (!account_id || !site_name) {
            return NextResponse.json(
                {
                    success: false,
                    error: "account_id and site_name are required.",
                },
                { status: 400 }
            );
        }
        const site_id = await createSite({
            account_id,
            site_name,
            site_description,
            address,
            custom_fields,
        });
        const site = await getSiteById(site_id);
        return NextResponse.json({ success: true, data: site });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error adding site." },
            { status: 500 }
        );
    }
}
