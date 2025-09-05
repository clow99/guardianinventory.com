import excuteQuery from "@/lib/db";

/**
 * Get all roles (optionally only active).
 */
export async function getAllRoles({ activeOnly = false } = {}) {
    let conditions = [];
    let values = [];
    if (activeOnly) {
        conditions.push("r.deleted_at IS NULL");
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    return await excuteQuery({
        query: `
            SELECT r.*
            FROM roles r
            ${where}
        `,
        values,
    });
}

/**
 * Get a single role by ID.
 */
export async function getRoleById(role_id) {
    const rows = await excuteQuery({
        query: `
            SELECT r.*
            FROM roles r
            WHERE r.role_id = ?
                  AND r.deleted_at IS NULL
            LIMIT 1
        `,
        values: [role_id],
    });
    return rows.length ? rows[0] : null;
}

/**
 * Create a new role.
 */
export async function createRole({ role_name, description = null }) {
    const result = await excuteQuery({
        query: `
            INSERT INTO roles (role_name, description)
            VALUES (?, ?)
        `,
        values: [role_name, description],
    });
    return result.insertId;
}

/**
 * Update a role.
 */
export async function updateRole(role_id, updates) {
    const fields = Object.keys(updates)
        .map((k) => `${k} = ?`)
        .join(", ");
    const values = [...Object.values(updates), role_id];
    await excuteQuery({
        query: `UPDATE roles SET ${fields} WHERE role_id = ?`,
        values,
    });
}

/**
 * Soft-delete a role.
 */
export async function deleteRole(role_id) {
    await excuteQuery({
        query: `
            UPDATE roles
            SET deleted_at = NOW()
            WHERE role_id = ?
        `,
        values: [role_id],
    });
}

/**
 * Get all permissions assigned to this role.
 */
export async function getRolePermissions(role_id) {
    return await excuteQuery({
        query: `
            SELECT p.*
            FROM role_permissions rp
            INNER JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE rp.role_id = ?
                  AND p.deleted_at IS NULL
        `,
        values: [role_id],
    });
}

/**
 * Assign a permission to this role.
 */
export async function addPermissionToRole(role_id, permission_id) {
    await excuteQuery({
        query: `
            INSERT IGNORE INTO role_permissions (role_id, permission_id)
            VALUES (?, ?)
        `,
        values: [role_id, permission_id],
    });
}

/**
 * Remove a permission from this role.
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

/**
 * Get all users assigned to this role (directly, via user_roles table).
 */
export async function getUsersByRoleId(role_id) {
    return await excuteQuery({
        query: `
            SELECT u.*
            FROM user_roles ur
            INNER JOIN users u ON ur.user_id = u.id
            WHERE ur.role_id = ?
                  AND u.deleted_at IS NULL
        `,
        values: [role_id],
    });
}

/**
 * Assign a user to this role.
 */
export async function addUserToRole(user_id, role_id) {
    await excuteQuery({
        query: `
            INSERT IGNORE INTO user_roles (user_id, role_id)
            VALUES (?, ?)
        `,
        values: [user_id, role_id],
    });
}

/**
 * Remove a user from this role.
 */
export async function removeUserFromRole(user_id, role_id) {
    await excuteQuery({
        query: `
            DELETE FROM user_roles
            WHERE user_id = ? AND role_id = ?
        `,
        values: [user_id, role_id],
    });
}
