import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import { getProductById } from "@/helpers/productHelper"; // adjust path as needed

export async function POST(request) {
    try {
        const body = await request.json();
        const { product_id, ...updates } = body;

        // Validation
        if (!product_id || typeof product_id !== "number") {
            return NextResponse.json(
                { success: false, error: "Valid product_id is required." },
                { status: 400 }
            );
        }

        // Only update fields that are present (ignore undefined/null/empty string)
        const fields = Object.keys(updates).filter(
            (k) =>
                updates[k] !== undefined &&
                updates[k] !== null &&
                updates[k] !== ""
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

        // Serialize custom_fields if necessary
        const values = fields.map((k) =>
            k === "custom_fields" && typeof updates[k] === "object"
                ? JSON.stringify(updates[k])
                : updates[k]
        );
        const setClause = fields.map((k) => `${k} = ?`).join(", ");

        // Update query
        await excuteQuery({
            query: `UPDATE products SET ${setClause}, updated_at = NOW() WHERE product_id = ?`,
            values: [...values, product_id],
        });

        // Return updated product with joins and assets
        const product = await getProductById(product_id);
        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error updating product.",
            },
            { status: 500 }
        );
    }
}
