import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";

export async function GET() {
    try {
        const rows = await excuteQuery({
            query: `SELECT account_id, account_name, description, created_at, updated_at
            FROM accounts
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC`,
            values: [],
        });
        return NextResponse.json({ success: true, data: rows || [] });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching accounts.",
            },
            { status: 500 }
        );
    }
}
