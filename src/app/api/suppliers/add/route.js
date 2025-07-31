import { NextResponse } from "next/server";
import { createSupplier, getSupplierById } from "@/lib/supplierHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { supplier_name, custom_fields } = body;
        if (!supplier_name) {
            return NextResponse.json(
                { success: false, error: "supplier_name is required." },
                { status: 400 }
            );
        }
        const supplier_id = await createSupplier({
            supplier_name,
            custom_fields,
        });
        const supplier = await getSupplierById(supplier_id);
        return NextResponse.json({ success: true, data: supplier });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error adding supplier.",
            },
            { status: 500 }
        );
    }
}
