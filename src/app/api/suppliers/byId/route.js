import { NextResponse } from "next/server";
import { getSupplierById } from "@/lib/supplierHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { supplier_id } = body;
        if (!supplier_id) {
            return NextResponse.json(
                { success: false, error: "supplier_id is required." },
                { status: 400 }
            );
        }
        const supplier = await getSupplierById(supplier_id);
        if (!supplier) {
            return NextResponse.json(
                { success: false, error: "Supplier not found." },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, data: supplier });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching supplier.",
            },
            { status: 500 }
        );
    }
}
