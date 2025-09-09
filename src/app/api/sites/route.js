import { NextResponse } from "next/server";
import { getAllSites } from "@/lib/siteHelper";
import { getAuthContext, requireAccountMember } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await getAuthContext();
        if (!auth.ok)
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        const body = await request.json();
        const filters = body || {};
        if (filters.account_id) {
            const gate = await requireAccountMember(Number(filters.account_id));
            if (!gate.ok)
                return NextResponse.json(
                    { success: false, error: gate.error },
                    { status: gate.status }
                );
        }
        const sites = await getAllSites(filters);
        return NextResponse.json({ success: true, data: sites });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching sites.",
            },
            { status: 500 }
        );
    }
}
