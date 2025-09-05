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
 * Get all employee groups (optionally only active).
 */
export async function getAllGroups({ activeOnly = false } = {}) {
    let conditions = [];
    let values = [];
    if (activeOnly) {
        conditions.push("g.deleted_at IS NULL");
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    return await excuteQuery({
        query: `
            SELECT g.*
            FROM employee_groups g
            ${where}
        `,
        values,
    });
}

/**
 * Get a single group by ID.
 */
export async function getGroupById(group_id) {
    const rows = await excuteQuery({
        query: `
            SELECT g.*
            FROM employee_groups g
                        WHERE g.group_id = ?
                            AND g.deleted_at IS NULL
            LIMIT 1
        `,
        values: [group_id],
    });
    return rows.length ? rows[0] : null;
}

/**
 * Create a new employee group.
 */
export async function createGroup({ group_name }) {
    const result = await excuteQuery({
        query: `
            INSERT INTO employee_groups (group_name)
            VALUES (?)
        `,
        values: [group_name],
    });
    return result.insertId;
}

/**
 * Update group details.
 */
export async function updateGroup(group_id, updates) {
    const fields = Object.keys(updates)
        .map((k) => `${k} = ?`)
        .join(", ");
    const values = [...Object.values(updates), group_id];
    await excuteQuery({
        query: `UPDATE employee_groups SET ${fields} WHERE group_id = ?`,
        values,
    });
}

/**
 * Soft-delete a group.
 */
export async function deleteGroup(group_id) {
    await excuteQuery({
        query: `UPDATE employee_groups SET deleted_at = NOW() WHERE group_id = ?`,
        values: [group_id],
    });
}

/**
 * Get all members of a group (with employee and user info).
 */
export async function getGroupMembers(group_id) {
    const userNameExpr = await getUserNameExpr();
    const rows = await excuteQuery({
        query: `
            SELECT e.*, ${userNameExpr} AS full_name, u.email, u.username
            FROM employee_group_members gm
            INNER JOIN employees e ON gm.employee_id = e.employee_id
            LEFT JOIN users u ON e.user_id = u.id
            WHERE gm.group_id = ?
              AND e.deleted_at IS NULL
        `,
        values: [group_id],
    });
    return rows;
}

/**
 * Add employee to a group.
 */
export async function addMemberToGroup(employee_id, group_id) {
    await excuteQuery({
        query: `
            INSERT IGNORE INTO employee_group_members (employee_id, group_id)
            VALUES (?, ?)
        `,
        values: [employee_id, group_id],
    });
}

/**
 * Remove employee from a group.
 */
export async function removeMemberFromGroup(employee_id, group_id) {
    await excuteQuery({
        query: `
            DELETE FROM employee_group_members
            WHERE employee_id = ? AND group_id = ?
        `,
        values: [employee_id, group_id],
    });
}

/**
 * Get all group limits for a group.
 */
export async function getGroupLimits(group_id) {
    return await excuteQuery({
        query: `
            SELECT gl.*, p.product_name
            FROM group_limits gl
            LEFT JOIN products p ON gl.product_id = p.product_id
            WHERE gl.group_id = ?
        `,
        values: [group_id],
    });
}

/**
 * Set or update a limit for a group/product/period.
 */
export async function setGroupLimit({
    group_id,
    product_id,
    limit_quantity,
    period_amount,
    period_unit,
}) {
    await excuteQuery({
        query: `
            INSERT INTO group_limits (group_id, product_id, limit_quantity, period_amount, period_unit)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE limit_quantity = VALUES(limit_quantity)
        `,
        values: [
            group_id,
            product_id,
            limit_quantity,
            period_amount,
            period_unit,
        ],
    });
}

/**
 * Remove a group limit.
 */
export async function removeGroupLimit({
    group_id,
    product_id,
    period_amount,
    period_unit,
}) {
    await excuteQuery({
        query: `
            DELETE FROM group_limits
            WHERE group_id = ? AND product_id = ? AND period_amount = ? AND period_unit = ?
        `,
        values: [group_id, product_id, period_amount, period_unit],
    });
}
