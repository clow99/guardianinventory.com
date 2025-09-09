import { NextResponse } from "next/server";
import { listNotifications } from "@/lib/notificationsHelper";
import { getAuthContext } from "@/lib/apiAccess";

export async function POST(request) {
    try {
        const auth = await getAuthContext();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const body = (await request.json().catch(() => ({}))) || {};
        const user_id = auth.is_admin ? body.user_id || auth.user_id : auth.user_id;
        const rows = await listNotifications({ user_id, unreadOnly: !!body.unreadOnly });
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error fetching notifications." }, { status: 500 });
    }
}
