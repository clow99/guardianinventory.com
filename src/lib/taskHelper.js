import excuteQuery from "@/lib/db";

async function getUserNameExpr() {
    try {
        const dbName = process.env.MYSQL_DATABASE;
        const rows = await excuteQuery({
            query: `SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = 'users'`,
            values: [dbName],
        });
        const cols = new Set((rows || []).map((r) => r.COLUMN_NAME));
        if (cols.has("full_name")) return "u.full_name";
        if (cols.has("name")) return "u.name";
        if (cols.has("username")) return "u.username";
        return "u.email";
    } catch {
        return "u.email";
    }
}

/**
 * Get all tasks (optionally by asset, status, or assigned user).
 */
export async function getAllTasks({ asset_id, status, assigned_user_id, account_id, site_id } = {}) {
    let conditions = ["t.deleted_at IS NULL"];
    let values = [];
    if (asset_id) {
        conditions.push("t.asset_id = ?");
        values.push(asset_id);
    }
    if (status) {
        conditions.push("t.status = ?");
        values.push(status);
    }
    if (assigned_user_id) {
        conditions.push("ata.user_id = ?");
        values.push(assigned_user_id);
    }
    if (account_id) {
        conditions.push("p.account_id = ?");
        values.push(account_id);
    }
    if (site_id) {
        conditions.push("a.site_id = ?");
        values.push(site_id);
    }
    const joinAssignee = assigned_user_id
        ? "LEFT JOIN asset_task_assignees ata ON t.id = ata.task_id"
        : "";
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    return await excuteQuery({
        query: `
            SELECT t.*
            FROM asset_tasks t
            ${joinAssignee}
            LEFT JOIN assets a ON t.asset_id = a.asset_id
            LEFT JOIN products p ON a.product_id = p.product_id
            ${where}
        `,
        values,
    });
}

/**
 * Get a single task by ID.
 */
export async function getTaskById(task_id) {
    const rows = await excuteQuery({
        query: `
            SELECT t.*
            FROM asset_tasks t
            WHERE t.id = ?
              AND t.deleted_at IS NULL
            LIMIT 1
        `,
        values: [task_id],
    });
    return rows.length ? rows[0] : null;
}

/**
 * Create a new asset task.
 */
export async function createTask(taskData) {
    const fields = Object.keys(taskData).join(",");
    const placeholders = Object.keys(taskData)
        .map(() => "?")
        .join(",");
    const values = Object.values(taskData);

    const result = await excuteQuery({
        query: `INSERT INTO asset_tasks (${fields}) VALUES (${placeholders})`,
        values,
    });
    return result.insertId;
}

/**
 * Update an asset task.
 */
export async function updateTask(task_id, updates) {
    const fields = Object.keys(updates)
        .map((k) => `${k} = ?`)
        .join(", ");
    const values = [...Object.values(updates), task_id];
    await excuteQuery({
        query: `UPDATE asset_tasks SET ${fields}, updated_at = NOW() WHERE id = ?`,
        values,
    });
}

/**
 * Soft-delete a task.
 */
export async function deleteTask(task_id) {
    await excuteQuery({
        query: `
            UPDATE asset_tasks
            SET deleted_at = NOW()
            WHERE id = ?
        `,
        values: [task_id],
    });
}

/**
 * Get all assignees for a task.
 */
export async function getTaskAssignees(task_id) {
    const userNameExpr = await getUserNameExpr();
    return await excuteQuery({
        query: `
            SELECT ata.*, ${userNameExpr} AS full_name, u.email
            FROM asset_task_assignees ata
            INNER JOIN users u ON ata.user_id = u.id
            WHERE ata.task_id = ?
        `,
        values: [task_id],
    });
}

/**
 * Assign a user to a task.
 */
export async function assignUserToTask(task_id, user_id) {
    await excuteQuery({
        query: `
            INSERT IGNORE INTO asset_task_assignees (task_id, user_id)
            VALUES (?, ?)
        `,
        values: [task_id, user_id],
    });
}

/**
 * Remove a user from a task.
 */
export async function removeUserFromTask(task_id, user_id) {
    await excuteQuery({
        query: `
            DELETE FROM asset_task_assignees
            WHERE task_id = ? AND user_id = ?
        `,
        values: [task_id, user_id],
    });
}

/**
 * Get all files attached to a task.
 */
export async function getTaskFiles(task_id) {
    const userNameExpr = await getUserNameExpr();
    return await excuteQuery({
        query: `
            SELECT f.*, ${userNameExpr} AS uploaded_by
            FROM asset_task_files f
            LEFT JOIN users u ON f.uploaded_by_user_id = u.id
            WHERE f.task_id = ?
        `,
        values: [task_id],
    });
}

/**
 * Attach a file to a task.
 */
export async function attachFileToTask({
    task_id,
    file_name,
    file_path,
    uploaded_by_user_id,
}) {
    const result = await excuteQuery({
        query: `
            INSERT INTO asset_task_files (task_id, file_name, file_path, uploaded_by_user_id, uploaded_at)
            VALUES (?, ?, ?, ?, NOW())
        `,
        values: [task_id, file_name, file_path, uploaded_by_user_id],
    });
    return result.insertId;
}

/**
 * Remove a file from a task.
 */
export async function removeFileFromTask(file_id) {
    await excuteQuery({
        query: `
            DELETE FROM asset_task_files
            WHERE id = ?
        `,
        values: [file_id],
    });
}
