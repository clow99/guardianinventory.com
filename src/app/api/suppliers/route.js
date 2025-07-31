import { NextResponse } from "next/server";
import { getAllSuppliers } from "@/lib/supplierHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const suppliers = await getAllSuppliers(body || {});
        return NextResponse.json({ success: true, data: suppliers });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching suppliers.",
            },
            { status: 500 }
        );
    }
}
