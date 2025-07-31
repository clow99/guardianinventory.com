import { NextResponse } from "next/server";
import { updateSupplier, getSupplierById } from "@/lib/supplierHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { supplier_id, ...updates } = body;
        if (!supplier_id) {
            return NextResponse.json(
                { success: false, error: "supplier_id is required." },
                { status: 400 }
            );
        }
        await updateSupplier(supplier_id, updates);
        const supplier = await getSupplierById(supplier_id);
        return NextResponse.json({ success: true, data: supplier });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error updating supplier.",
            },
            { status: 500 }
        );
    }
}
