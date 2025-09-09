import { NextResponse } from "next/server";
import { updateLocation, getLocationById } from "@/lib/locationHelper";
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
        const { location_id, ...updates } = body || {};
        if (!location_id) {
            return NextResponse.json(
                { success: false, error: "location_id is required" },
                { status: 400 }
            );
        }
        await updateLocation(Number(location_id), updates);
        const row = await getLocationById(Number(location_id));
        return NextResponse.json({ success: true, data: row });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error updating location." },
            { status: 500 }
        );
    }
}
