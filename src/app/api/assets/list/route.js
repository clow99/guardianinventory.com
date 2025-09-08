import { NextResponse } from "next/server";
import { getAllAssets } from "@/lib/assetHelper";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const account_id = Number(searchParams.get("account_id"));
        const site_id = searchParams.get("site_id");
        const location_id = searchParams.get("location_id");
        const status = searchParams.get("status");

        if (!account_id || Number.isNaN(account_id)) {
            return NextResponse.json(
                { success: false, error: "Valid account_id is required" },
                { status: 400 }
            );
        }

        const filters = { account_id };
        if (site_id) filters.site_id = Number(site_id);
        if (location_id) filters.location_id = Number(location_id);
        if (status) filters.status = status;

        const assets = await getAllAssets(filters);
        return NextResponse.json({ success: true, data: assets });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching assets",
            },
            { status: 500 }
        );
    }
}
