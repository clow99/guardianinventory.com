import { NextResponse } from "next/server";
import { removeGroupLimit, getGroupLimits } from "@/lib/groupHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { group_id, product_id, period_amount, period_unit } = body;
        if (!group_id || !product_id || !period_amount || !period_unit) {
            return NextResponse.json(
                { success: false, error: "All fields are required." },
                { status: 400 }
            );
        }
        await removeGroupLimit({
            group_id,
            product_id,
            period_amount,
            period_unit,
        });
        const limits = await getGroupLimits(group_id);

        return NextResponse.json({ success: true, data: limits });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error removing group limit.",
            },
            { status: 500 }
        );
    }
}
