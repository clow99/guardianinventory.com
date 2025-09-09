import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import { requireAccountMember, getAuthContext } from "@/lib/apiAccess";

export async function GET(request) {
    try {
        const auth = await getAuthContext();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const { searchParams } = new URL(request.url);
        const account_id = Number(searchParams.get("account_id")) || auth.account_id || null;
        if (!account_id) return NextResponse.json({ success: false, error: "account_id is required" }, { status: 400 });
        const gate = await requireAccountMember(account_id);
        if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });

        const rows = await excuteQuery({
            query: `SELECT JSON_EXTRACT(COALESCE(custom_fields, '{}'), '$.notifications') AS prefs
                    FROM account_users WHERE account_id = ? AND user_id = ? LIMIT 1`,
            values: [account_id, auth.user_id],
        });
        let prefs = null;
        if (rows && rows[0] && rows[0].prefs !== undefined) {
            try { prefs = JSON.parse(rows[0].prefs); } catch { prefs = null; }
        }
        return NextResponse.json({ success: true, data: prefs || {} });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error fetching preferences." }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const auth = await getAuthContext();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const body = await request.json().catch(() => ({}));
        const account_id = Number(body.account_id || auth.account_id || 0) || null;
        const preferences = body.preferences || body.prefs || {};
        if (!account_id) return NextResponse.json({ success: false, error: "account_id is required" }, { status: 400 });
        const gate = await requireAccountMember(account_id);
        if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });

        // Set JSON field notifications = preferences, preserve other custom_fields keys
        await excuteQuery({
            query: `UPDATE account_users
                    SET custom_fields = JSON_SET(COALESCE(custom_fields, '{}'), '$.notifications', CAST(? AS JSON))
                    WHERE account_id = ? AND user_id = ?`,
            values: [JSON.stringify(preferences || {}), account_id, auth.user_id],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error saving preferences." }, { status: 500 });
    }
}

