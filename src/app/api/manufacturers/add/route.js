import { NextResponse } from "next/server";
import {
    createManufacturer,
    getManufacturerById,
} from "@/lib/manufacturerHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { manufacturer_name, custom_fields } = body;
        if (!manufacturer_name) {
            return NextResponse.json(
                { success: false, error: "manufacturer_name is required." },
                { status: 400 }
            );
        }
        const manufacturer_id = await createManufacturer({
            manufacturer_name,
            custom_fields,
        });
        const manufacturer = await getManufacturerById(manufacturer_id);
        return NextResponse.json({ success: true, data: manufacturer });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error adding manufacturer.",
            },
            { status: 500 }
        );
    }
}
