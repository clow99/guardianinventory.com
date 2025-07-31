import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import { getAssetById } from "@/lib/assetHelper"; // Adjust path if needed

export async function POST(request) {
    try {
        const body = await request.json();
        const { asset_id } = body;

        if (!asset_id || typeof asset_id !== "number") {
            return NextResponse.json(
                { success: false, error: "Valid asset_id is required." },
                { status: 400 }
            );
        }

        // Soft delete: set deleted_at
        await excuteQuery({
            query: `UPDATE assets SET deleted_at = NOW() WHERE asset_id = ?`,
            values: [asset_id],
        });

        // Return the asset (will still return the row, but you might want to adjust your getAssetById to show deleted_at)
        const asset = await getAssetById(asset_id);

        return NextResponse.json({ success: true, data: asset });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error deleting asset.",
            },
            { status: 500 }
        );
    }
}
