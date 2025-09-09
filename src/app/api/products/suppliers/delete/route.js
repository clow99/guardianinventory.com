import { NextResponse } from "next/server";
import { removeProductSupplier } from "@/lib/productRelationsHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const { product_id, supplier_id } = await request.json();
        if (!product_id || !supplier_id) return NextResponse.json({ success: false, error: "product_id and supplier_id are required" }, { status: 400 });
        await removeProductSupplier(Number(product_id), Number(supplier_id));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error removing product supplier." }, { status: 500 });
    }
}
