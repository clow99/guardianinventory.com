import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import { getProductById } from "@/lib/productHelper"; // adjust path as needed

export async function POST(request) {
    try {
        const body = await request.json();
        const { product_id } = body;

        // Validation
        if (!product_id || typeof product_id !== "number") {
            return NextResponse.json(
                { success: false, error: "Valid product_id is required." },
                { status: 400 }
            );
        }

        // Soft delete by setting deleted_at
        await excuteQuery({
            query: `UPDATE products SET deleted_at = NOW() WHERE product_id = ?`,
            values: [product_id],
        });

        // Return the (soft) deleted product (may return null if getProductById filters out deleted)
        // If you want to return the row regardless, fetch directly
        const product = await getProductById(product_id);

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error deleting product.",
            },
            { status: 500 }
        );
    }
}
