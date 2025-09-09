import { NextResponse } from "next/server";
import { addProductManufacturer } from "@/lib/productRelationsHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const { product_id, manufacturer_id, is_preferred = 0 } = await request.json();
        if (!product_id || !manufacturer_id) return NextResponse.json({ success: false, error: "product_id and manufacturer_id are required" }, { status: 400 });
        await addProductManufacturer(Number(product_id), Number(manufacturer_id), is_preferred ? 1 : 0);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error adding product manufacturer." }, { status: 500 });
    }
}
