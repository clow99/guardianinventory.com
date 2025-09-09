import { NextResponse } from "next/server";
import { deleteLocation } from "@/lib/locationHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok)
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        const { location_id } = await request.json();
        if (!location_id) {
            return NextResponse.json(
                { success: false, error: "location_id is required" },
                { status: 400 }
            );
        }
        await deleteLocation(Number(location_id));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error deleting location." },
            { status: 500 }
        );
    }
}
