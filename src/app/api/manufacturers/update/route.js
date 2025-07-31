import { NextResponse } from "next/server";
import {
    updateManufacturer,
    getManufacturerById,
} from "@/lib/manufacturerHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { manufacturer_id, ...updates } = body;
        if (!manufacturer_id) {
            return NextResponse.json(
                { success: false, error: "manufacturer_id is required." },
                { status: 400 }
            );
        }
        await updateManufacturer(manufacturer_id, updates);
        const manufacturer = await getManufacturerById(manufacturer_id);
        return NextResponse.json({ success: true, data: manufacturer });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error updating manufacturer.",
            },
            { status: 500 }
        );
    }
}
