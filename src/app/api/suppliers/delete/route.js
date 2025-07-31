import { NextResponse } from "next/server";
import { deleteSupplier, getSupplierById } from "@/lib/supplierHelper";

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
        await deleteSupplier(supplier_id);
        const supplier = await getSupplierById(supplier_id);
        return NextResponse.json({ success: true, data: supplier });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error deleting supplier.",
            },
            { status: 500 }
        );
    }
}
