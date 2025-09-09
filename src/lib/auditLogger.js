import excuteQuery from "@/lib/db";

export default async function logAudit({
    action,
    user_id,
    entity_type = null,
    entity_id = null,
    details = null,
}) {
    try {
        const now = new Date();
        const result = await excuteQuery({
            query: `
        INSERT INTO audit_logs
        (action, user_id, entity_type, entity_id, details, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
            values: [action, user_id, entity_type, entity_id, details, now],
        });

        return result;
    } catch (error) {
        console.error("Audit log error:", error);
        return false;
    }
}
