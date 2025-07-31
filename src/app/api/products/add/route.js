import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import { getProductById } from "@/lib/productHelper"; // adjust path as needed

export async function POST(request) {
    try {
        const body = await request.json();
        // Extract fields (add more as needed)
        const {
            account_id,
            product_name,
            product_description,
            category_id,
            manufacturer_id,
            supplier_id,
            site_id,
            custom_fields,
        } = body;

        // Validate required fields
        if (!account_id || !product_name) {
            return NextResponse.json(
                {
                    success: false,
                    error: "account_id and product_name are required.",
                },
                { status: 400 }
            );
        }

        // Prepare fields for insert
        const productFields = {
            account_id,
            product_name,
            product_description,
            category_id,
            manufacturer_id,
            supplier_id,
            site_id,
            custom_fields,
        };

        // Only insert fields that are present
        const keys = Object.keys(productFields).filter(
            (k) =>
                productFields[k] !== undefined &&
                productFields[k] !== null &&
                productFields[k] !== ""
        );
        const values = keys.map((k) =>
            k === "custom_fields" && typeof productFields[k] === "object"
                ? JSON.stringify(productFields[k])
                : productFields[k]
        );
        const placeholders = keys.map(() => "?").join(", ");
        const fieldsSql = keys.join(", ");

        // Insert the product
        const result = await excuteQuery({
            query: `INSERT INTO products (${fieldsSql}) VALUES (${placeholders})`,
            values,
        });
        const product_id = result.insertId;

        // Fetch full product details (with joins and assets)
        const product = await getProductById(product_id);

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error adding product.",
            },
            { status: 500 }
        );
    }
}
