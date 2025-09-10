import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notificationsHelper";
import { getAuthContext } from "@/lib/apiAccess";
import excuteQuery from "@/lib/db";
import { canonicalizeNotificationType, isKnownNotificationType } from "@/lib/notificationTypes";

export async function POST(request) {
    try {
        const auth = await getAuthContext();
        if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        const body = await request.json();
        let { user_id = null, type, title = null, message, entity_type = null, entity_id = null, payload = null, account_id: bodyAccountId = null } = body || {};
        if (!type || !message) {
            return NextResponse.json({ success: false, error: "type and message are required" }, { status: 400 });
        }
        // Standardize type to canonical snake_case
        const canonicalType = canonicalizeNotificationType(type);
        type = canonicalType || type;
        const targetUserId = auth.is_admin ? (user_id ? Number(user_id) : auth.user_id) : auth.user_id;

        // Determine account context to evaluate preferences
        const account_id = Number(bodyAccountId || auth.account_id || 0) || null;

        // Load preferences for target user in this account (if account_id known)
        let allow = true;
        if (account_id) {
            try {
                const rows = await excuteQuery({
                    query: `SELECT JSON_EXTRACT(COALESCE(custom_fields, '{}'), '$.notifications') AS prefs
                            FROM account_users WHERE account_id = ? AND user_id = ? LIMIT 1`,
                    values: [account_id, targetUserId],
                });
                let prefs = {};
                if (rows && rows[0] && rows[0].prefs !== undefined) {
                    try { prefs = JSON.parse(rows[0].prefs) || {}; } catch { prefs = {}; }
                }
                // Basic gating: global enabled, then per-type if present under email or top-level
                const enabled = prefs.enabled !== false; // default true
                const mapKey = String(type || "");
                // If nested channels exist, check both generic and email.* toggles; default allow
                const emailPrefs = (prefs.email || {});
                const perType = (prefs[mapKey] !== undefined) ? prefs[mapKey] : undefined;
                const perEmailType = (emailPrefs[mapKey] !== undefined) ? emailPrefs[mapKey] : undefined;
                const typeAllowed = perType !== undefined ? !!perType : (perEmailType !== undefined ? !!perEmailType : true);
                allow = enabled && typeAllowed;
            } catch {}
        }

        if (!allow) {
            // Respect user preferences: do not create, but report success with suppressed marker
            return NextResponse.json({ success: true, data: { suppressed: true } });
        }

        const id = await createNotification({ user_id: targetUserId, type, title, message, entity_type, entity_id, payload });
        return NextResponse.json({ success: true, data: { id } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error?.message || "Error creating notification." }, { status: 500 });
    }
}
