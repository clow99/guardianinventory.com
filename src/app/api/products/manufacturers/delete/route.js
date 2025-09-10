import { NextResponse } from "next/server";
import { removeProductManufacturer } from "@/lib/productRelationsHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const { product_id, manufacturer_id } = await request.json();
        if (!product_id || !manufacturer_id) return NextResponse.json({ success: false, error: "product_id and manufacturer_id are required" }, { status: 400 });
        await removeProductManufacturer(Number(product_id), Number(manufacturer_id));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error removing product manufacturer." }, { status: 500 });
    }
}
