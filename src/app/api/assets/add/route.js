import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import { getAssetById } from "@/lib/assetHelper"; // Adjust path if needed

export async function POST(request) {
    try {
        const body = await request.json();

        // Validate required fields
        const {
            product_id,
            serial_number,
            site_id,
            asset_tag,
            status,
            location_id,
            assigned_to,
            custom_fields,
        } = body;
        if (!product_id || !serial_number) {
            return NextResponse.json(
                {
                    success: false,
                    error: "product_id and serial_number are required.",
                },
                { status: 400 }
            );
        }

        // Build insert fields and values dynamically
        const assetFields = {
            product_id,
            serial_number,
            site_id,
            asset_tag,
            status,
            location_id,
            assigned_to,
            custom_fields,
        };
        const keys = Object.keys(assetFields).filter(
            (k) => assetFields[k] !== undefined && assetFields[k] !== null
        );
        const values = keys.map((k) =>
            k === "custom_fields" && typeof assetFields[k] === "object"
                ? JSON.stringify(assetFields[k])
                : assetFields[k]
        );

        const placeholders = keys.map(() => "?").join(", ");
        const fieldsSql = keys.join(", ");

        // Insert asset
        const result = await excuteQuery({
            query: `INSERT INTO assets (${fieldsSql}) VALUES (${placeholders})`,
            values,
        });
        const asset_id = result.insertId;

        // Get the completed asset record (with all joins)
        const asset = await getAssetById(asset_id);

        return NextResponse.json({ success: true, data: asset });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, error: error?.message || "Error adding asset." },
            { status: 500 }
        );
    }
}
