// /api/products/get.js (or /route.js if using Next.js app directory)
import { NextResponse } from "next/server";
import { getProductsWithAssets } from "@/lib/productHelper"; // adjust path as needed

export async function POST(request) {
    try {
        const body = await request.json();
        const { account_id } = body;

        const products = await getProductsWithAssets(account_id);

        return NextResponse.json({
            success: true,
            data: products,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching products.",
            },
            { status: 500 }
        );
    }
}
