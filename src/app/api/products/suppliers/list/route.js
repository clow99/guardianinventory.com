import { NextResponse } from "next/server";
import { listProductSuppliers } from "@/lib/productRelationsHelper";
import { requireAdmin } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const { product_id } = await request.json();
        if (!product_id) return NextResponse.json({ success: false, error: "product_id is required" }, { status: 400 });
        const rows = await listProductSuppliers(Number(product_id));
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error fetching product suppliers." }, { status: 500 });
    }
}
