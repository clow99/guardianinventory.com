import excuteQuery from "@/lib/db";

/**
 * Get all tasks (optionally by asset, status, or assigned user).
 */
export async function getAllTasks({ asset_id, status, assigned_user_id } = {}) {
    let conditions = ["(t.deleted_at IS NULL OR t.deleted_at = '')"];
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
    const joinAssignee = assigned_user_id
        ? "LEFT JOIN asset_task_assignees ata ON t.id = ata.task_id"
        : "";
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    return await excuteQuery({
        query: `
            SELECT t.*
            FROM asset_tasks t
            ${joinAssignee}
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
              AND (t.deleted_at IS NULL OR t.deleted_at = '')
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
    return await excuteQuery({
        query: `
            SELECT ata.*, u.full_name, u.email
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
    return await excuteQuery({
        query: `
            SELECT f.*, u.full_name AS uploaded_by
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
