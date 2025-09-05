import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";

export async function POST(request) {
    try {
        const body = await request.json();
        const { account_name, description = null, custom_fields } = body || {};
        const name = typeof account_name === "string" ? account_name.trim() : "";
        if (!name) {
            return NextResponse.json(
                { success: false, error: "account_name is required." },
                { status: 400 }
            );
        }
        const now = new Date();
        const result = await excuteQuery({
            query:
                "INSERT INTO accounts (account_name, description, custom_fields, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            values: [
                name,
                description,
                custom_fields ? JSON.stringify(custom_fields) : null,
                now,
                now,
            ],
        });
        const account_id = result.insertId;
        const rows = await excuteQuery({
            query: "SELECT * FROM accounts WHERE account_id = ?",
            values: [account_id],
        });
        return NextResponse.json({ success: true, data: rows?.[0] || { account_id, account_name: name } });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, error: error?.message || "Error creating account." },
            { status: 500 }
        );
    }
}
