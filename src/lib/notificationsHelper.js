import excuteQuery from "@/lib/db";
import { canonicalizeNotificationType } from "@/lib/notificationTypes";

export async function listNotifications({ user_id, unreadOnly = false } = {}) {
    const conditions = [];
    const values = [];
    if (user_id) {
        conditions.push("user_id = ?");
        values.push(user_id);
    }
    if (unreadOnly) conditions.push("read_at IS NULL");
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    return await excuteQuery({
        query: `SELECT * FROM notifications ${where} ORDER BY created_at DESC`,
        values,
    });
}

export async function createNotification({ user_id, type, title, message, entity_type = null, entity_id = null, payload = null }) {
    const canonicalType = canonicalizeNotificationType(type);
    const serializedPayload =
        payload && typeof payload === "object" ? JSON.stringify(payload) : payload;
    const result = await excuteQuery({
        query: `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, payload) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        values: [user_id || null, canonicalType || type, title || null, message, entity_type || null, entity_id || null, serializedPayload || null],
    });
    return result.insertId;
}

export async function markNotificationRead(id) {
    await excuteQuery({
        query: `UPDATE notifications SET read_at = NOW() WHERE id = ?`,
        values: [id],
    });
}

export async function deleteNotification(id) {
    await excuteQuery({
        query: `DELETE FROM notifications WHERE id = ?`,
        values: [id],
    });
}
