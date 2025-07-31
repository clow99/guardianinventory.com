import { NextResponse } from "next/server";
import { getAssetsByProductId } from "@/lib/assetHelper"; // Adjust import path as needed

export async function GET(request, { params }) {
    const { product_id } = params;
    const productIdNum = Number(product_id);

    if (!productIdNum || isNaN(productIdNum)) {
        return NextResponse.json(
            { success: false, error: "Valid product_id required." },
            { status: 400 }
        );
    }

    try {
        const assets = await getAssetsByProductId(productIdNum);
        return NextResponse.json({ success: true, data: assets });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching assets.",
            },
            { status: 500 }
        );
    }
}
