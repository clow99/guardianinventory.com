import excuteQuery from "@/lib/db";

/**
 * Get all permissions (optionally only active).
 */
export async function getAllPermissions({ activeOnly = false } = {}) {
    let conditions = [];
    let values = [];
    if (activeOnly) {
        conditions.push("(p.deleted_at IS NULL OR p.deleted_at = '')");
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    return await excuteQuery({
        query: `
            SELECT p.*
            FROM permissions p
            ${where}
        `,
        values,
    });
}

/**
 * Get a single permission by ID.
 */
export async function getPermissionById(permission_id) {
    const rows = await excuteQuery({
        query: `
            SELECT p.*
            FROM permissions p
            WHERE p.permission_id = ?
              AND (p.deleted_at IS NULL OR p.deleted_at = '')
            LIMIT 1
        `,
        values: [permission_id],
    });
    return rows.length ? rows[0] : null;
}

/**
 * Create a new permission.
 */
export async function createPermission({
    permission_name,
    permission_description = null,
}) {
    const result = await excuteQuery({
        query: `
            INSERT INTO permissions (permission_name, permission_description)
            VALUES (?, ?)
        `,
        values: [permission_name, permission_description],
    });
    return result.insertId;
}

/**
 * Update a permission.
 */
export async function updatePermission(permission_id, updates) {
    const fields = Object.keys(updates)
        .map((k) => `${k} = ?`)
        .join(", ");
    const values = [...Object.values(updates), permission_id];
    await excuteQuery({
        query: `UPDATE permissions SET ${fields} WHERE permission_id = ?`,
        values,
    });
}

/**
 * Soft-delete a permission.
 */
export async function deletePermission(permission_id) {
    await excuteQuery({
        query: `
            UPDATE permissions
            SET deleted_at = NOW()
            WHERE permission_id = ?
        `,
        values: [permission_id],
    });
}

/**
 * Get all permissions assigned to a role.
 */
export async function getPermissionsByRoleId(role_id) {
    return await excuteQuery({
        query: `
            SELECT p.*
            FROM role_permissions rp
            INNER JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE rp.role_id = ?
              AND (p.deleted_at IS NULL OR p.deleted_at = '')
        `,
        values: [role_id],
    });
}

/**
 * Assign a permission to a role.
 */
export async function assignPermissionToRole(role_id, permission_id) {
    await excuteQuery({
        query: `
            INSERT IGNORE INTO role_permissions (role_id, permission_id)
            VALUES (?, ?)
        `,
        values: [role_id, permission_id],
    });
}

/**
 * Remove a permission from a role.
 */
export async function removePermissionFromRole(role_id, permission_id) {
    await excuteQuery({
        query: `
            DELETE FROM role_permissions
            WHERE role_id = ? AND permission_id = ?
        `,
        values: [role_id, permission_id],
    });
}
