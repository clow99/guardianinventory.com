import { NextResponse } from "next/server";
import { getManufacturerById } from "@/lib/manufacturerHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { manufacturer_id } = body;
        if (!manufacturer_id) {
            return NextResponse.json(
                { success: false, error: "manufacturer_id is required." },
                { status: 400 }
            );
        }
        const manufacturer = await getManufacturerById(manufacturer_id);
        if (!manufacturer) {
            return NextResponse.json(
                { success: false, error: "Manufacturer not found." },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, data: manufacturer });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching manufacturer.",
            },
            { status: 500 }
        );
    }
}
