import excuteQuery from "@/lib/db";

export async function getAccountById(account_id) {
    const rows = await excuteQuery({
        query: `SELECT * FROM accounts WHERE account_id = ? AND (deleted_at IS NULL OR deleted_at IS NULL) LIMIT 1`,
        values: [account_id],
    });
    return rows?.[0] || null;
}

export async function updateAccount(account_id, updates) {
    const keys = Object.keys(updates).filter((k) => updates[k] !== undefined);
    if (!keys.length) return;
    const set = keys.map((k) => `${k} = ?`).join(", ");
    const vals = keys.map((k) => (k === "custom_fields" && typeof updates[k] === "object" ? JSON.stringify(updates[k]) : updates[k]));
    await excuteQuery({
        query: `UPDATE accounts SET ${set}, updated_at = NOW() WHERE account_id = ?`,
        values: [...vals, account_id],
    });
}

