import { NextResponse } from "next/server";
import { deleteNotification } from "@/lib/notificationsHelper";
import { getAuthContext } from "@/lib/apiAccess";
import excuteQuery from "@/lib/db";

export async function POST(request) {
    try {
        const auth = await getAuthContext();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const { id } = await request.json();
        if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
        if (!auth.is_admin) {
            const rows = await excuteQuery({ query: `SELECT user_id FROM notifications WHERE id = ?`, values: [Number(id)] });
            const row = Array.isArray(rows) ? rows[0] : null;
            if (!row || (row.user_id && Number(row.user_id) !== auth.user_id)) {
                return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
            }
        }
        await deleteNotification(Number(id));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error deleting notification." }, { status: 500 });
    }
}
