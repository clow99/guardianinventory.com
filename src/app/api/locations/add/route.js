import { NextResponse } from "next/server";
import { createLocation, getLocationById } from "@/lib/locationHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok)
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        const { location_name, address = null, custom_fields = null } = await request.json();
        if (!location_name) {
            return NextResponse.json(
                { success: false, error: "location_name is required" },
                { status: 400 }
            );
        }
        const id = await createLocation({ location_name, address, custom_fields });
        const row = await getLocationById(id);
        return NextResponse.json({ success: true, data: row });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error creating location." },
            { status: 500 }
        );
    }
}
