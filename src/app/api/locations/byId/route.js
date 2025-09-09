import { NextResponse } from "next/server";
import { getLocationById } from "@/lib/locationHelper";
import { getAuthContext } from "@/lib/apiAccess";

export async function GET(request) {
    try {
        const auth = await getAuthContext();
        if (!auth.ok)
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        const { searchParams } = new URL(request.url);
        const id = Number(searchParams.get("location_id"));
        if (!id) {
            return NextResponse.json(
                { success: false, error: "location_id query param is required" },
                { status: 400 }
            );
        }
        const row = await getLocationById(id);
        return NextResponse.json({ success: true, data: row });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error fetching location." },
            { status: 500 }
        );
    }
}
