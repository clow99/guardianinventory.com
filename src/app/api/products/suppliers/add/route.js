import { NextResponse } from "next/server";
import { addProductSupplier } from "@/lib/productRelationsHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const { product_id, supplier_id, is_preferred = 0 } = await request.json();
        if (!product_id || !supplier_id) return NextResponse.json({ success: false, error: "product_id and supplier_id are required" }, { status: 400 });
        await addProductSupplier(Number(product_id), Number(supplier_id), is_preferred ? 1 : 0);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error adding product supplier." }, { status: 500 });
    }
}
