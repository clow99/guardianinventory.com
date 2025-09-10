import { NextResponse } from "next/server";
import { addProductCategory } from "@/lib/productRelationsHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const { product_id, category_id, custom_fields = null } = await request.json();
        if (!product_id || !category_id) return NextResponse.json({ success: false, error: "product_id and category_id are required" }, { status: 400 });
        await addProductCategory(Number(product_id), Number(category_id), custom_fields);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error adding product category." }, { status: 500 });
    }
}
