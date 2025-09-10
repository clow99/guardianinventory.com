import { NextResponse } from "next/server";
import { getAllLocations } from "@/lib/locationHelper";
import { getAuthContext } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await getAuthContext();
        if (!auth.ok)
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        const body = await request.json().catch(() => ({}));
        const rows = await getAllLocations(body || {});
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error?.message || "Error fetching locations." },
            { status: 500 }
        );
    }
}
