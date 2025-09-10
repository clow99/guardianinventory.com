import excuteQuery from "@/lib/db";

export async function listAccountUsers(account_id) {
    if (!account_id) throw new Error("account_id is required");
    return await excuteQuery({
        query: `
            SELECT au.*, u.email, u.username, u.full_name, r.role_name
            FROM account_users au
            INNER JOIN users u ON au.user_id = u.id
            LEFT JOIN roles r ON au.role_id = r.role_id
            WHERE au.account_id = ?
        `,
        values: [account_id],
    });
}

export async function addUserToAccount({ account_id, user_id, role_id = null, custom_fields = null }) {
    if (!account_id || !user_id) throw new Error("account_id and user_id are required");
    await excuteQuery({
        query: `
            INSERT INTO account_users (account_id, user_id, role_id, custom_fields)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE role_id = VALUES(role_id), custom_fields = VALUES(custom_fields)
        `,
        values: [account_id, user_id, role_id, custom_fields ? JSON.stringify(custom_fields) : null],
    });
}

export async function updateAccountUser({ account_id, user_id, role_id = undefined, custom_fields = undefined }) {
    const updates = {};
    if (role_id !== undefined) updates.role_id = role_id;
    if (custom_fields !== undefined) updates.custom_fields = custom_fields;
    const keys = Object.keys(updates);
    if (!keys.length) return;
    const set = keys.map((k) => `${k} = ?`).join(", ");
    const vals = keys.map((k) => (k === "custom_fields" && typeof updates[k] === "object" ? JSON.stringify(updates[k]) : updates[k]));
    await excuteQuery({
        query: `UPDATE account_users SET ${set} WHERE account_id = ? AND user_id = ?`,
        values: [...vals, account_id, user_id],
    });
}

export async function removeUserFromAccount({ account_id, user_id }) {
    await excuteQuery({
        query: `DELETE FROM account_users WHERE account_id = ? AND user_id = ?`,
        values: [account_id, user_id],
    });
}

