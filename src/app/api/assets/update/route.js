import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import { getAssetById } from "@/lib/assetHelper"; // adjust path as needed

export async function POST(request) {
    try {
        const body = await request.json();

        const { asset_id, ...updates } = body;

        // Validate
        if (!asset_id || typeof asset_id !== "number") {
            return NextResponse.json(
                { success: false, error: "Valid asset_id is required." },
                { status: 400 }
            );
        }
        // Remove undefined/null values from updates
        const fields = Object.keys(updates).filter(
            (k) => updates[k] !== undefined && updates[k] !== null
        );
        if (fields.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "At least one field to update is required.",
                },
                { status: 400 }
            );
        }

        // Handle custom_fields serialization
        const values = fields.map((k) =>
            k === "custom_fields" && typeof updates[k] === "object"
                ? JSON.stringify(updates[k])
                : updates[k]
        );
        const setClause = fields.map((k) => `${k} = ?`).join(", ");

        // Update query
        await excuteQuery({
            query: `UPDATE assets SET ${setClause}, updated_at = NOW() WHERE asset_id = ?`,
            values: [...values, asset_id],
        });

        // Get and return the updated asset
        const asset = await getAssetById(asset_id);

        return NextResponse.json({ success: true, data: asset });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error updating asset.",
            },
            { status: 500 }
        );
    }
}
