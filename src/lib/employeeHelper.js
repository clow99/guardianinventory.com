import excuteQuery from "@/lib/db"; // Adjust path as needed

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
 * Get all employees (optionally filter by department, group, or active).
 */
export async function getAllEmployees({ department, active, group_id } = {}) {
    const userNameExpr = await getUserNameExpr();
    let conditions = ["e.deleted_at IS NULL"];
    let values = [];
    if (department) {
        conditions.push("e.department = ?");
        values.push(department);
    }
    if (typeof active === "boolean") {
        conditions.push("u.active = ?");
        values.push(active ? 1 : 0);
    }
    if (group_id) {
        conditions.push("gm.group_id = ?");
        values.push(group_id);
    }

    const joins = [
        "LEFT JOIN users u ON e.user_id = u.id",
        group_id
            ? "LEFT JOIN employee_group_members gm ON e.employee_id = gm.employee_id"
            : "",
    ]
        .filter(Boolean)
        .join("\n");

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    return await excuteQuery({
        query: `
            SELECT e.*, ${userNameExpr} AS full_name, u.email, u.username, u.active
            FROM employees e
            ${joins}
            ${where}
        `,
        values,
    });
}

/**
 * Get a single employee by employee_id (joined with user info).
 */
export async function getEmployeeById(employee_id) {
    if (!employee_id) throw new Error("Valid employee_id is required.");
    const userNameExpr = await getUserNameExpr();
    const rows = await excuteQuery({
        query: `
            SELECT e.*, ${userNameExpr} AS full_name, u.email, u.username, u.active
            FROM employees e
            LEFT JOIN users u ON e.user_id = u.id
                        WHERE e.employee_id = ?
                            AND e.deleted_at IS NULL
            LIMIT 1
        `,
        values: [employee_id],
    });
    return rows.length ? rows[0] : null;
}

/**
 * Get employee by user_id (if you need to look up the employee profile for a logged-in user).
 */
export async function getEmployeeByUserId(user_id) {
    if (!user_id) throw new Error("Valid user_id is required.");
    const userNameExpr = await getUserNameExpr();
    const rows = await excuteQuery({
        query: `
            SELECT e.*, ${userNameExpr} AS full_name, u.email, u.username, u.active
            FROM employees e
            LEFT JOIN users u ON e.user_id = u.id
                        WHERE e.user_id = ?
                            AND e.deleted_at IS NULL
            LIMIT 1
        `,
        values: [user_id],
    });
    return rows.length ? rows[0] : null;
}

/**
 * Get all groups an employee belongs to.
 */
export async function getEmployeeGroups(employee_id) {
    return await excuteQuery({
        query: `
            SELECT g.group_id, g.group_name
            FROM employee_groups g
            INNER JOIN employee_group_members gm ON g.group_id = gm.group_id
                        WHERE gm.employee_id = ?
                            AND g.deleted_at IS NULL
        `,
        values: [employee_id],
    });
}

/**
 * Get all assets assigned to an employee.
 */
export async function getAssetsByEmployee(employee_id) {
    return await excuteQuery({
        query: `
            SELECT a.*, s.site_name, l.location_name, p.product_name
            FROM employee_assets ea
            INNER JOIN assets a ON ea.asset_id = a.asset_id
            LEFT JOIN sites s ON a.site_id = s.site_id
            LEFT JOIN locations l ON a.location_id = l.location_id
            LEFT JOIN products p ON a.product_id = p.product_id
                        WHERE ea.employee_id = ?
                            AND a.deleted_at IS NULL
        `,
        values: [employee_id],
    });
}

/**
 * Add employee to a group.
 */
export async function addEmployeeToGroup(employee_id, group_id) {
    await excuteQuery({
        query: `INSERT IGNORE INTO employee_group_members (employee_id, group_id) VALUES (?, ?)`,
        values: [employee_id, group_id],
    });
}

/**
 * Remove employee from a group.
 */
export async function removeEmployeeFromGroup(employee_id, group_id) {
    await excuteQuery({
        query: `DELETE FROM employee_group_members WHERE employee_id = ? AND group_id = ?`,
        values: [employee_id, group_id],
    });
}

/**
 * Create employee.
 */
export async function createEmployee({
    user_id,
    job_title,
    department,
    custom_fields,
}) {
    const result = await excuteQuery({
        query: `
            INSERT INTO employees (user_id, job_title, department, custom_fields, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `,
        values: [
            user_id,
            job_title,
            department,
            JSON.stringify(custom_fields || {}),
        ],
    });
    return result.insertId;
}

/**
 * Update employee.
 */
export async function updateEmployee(employee_id, updates) {
    const fields = Object.keys(updates)
        .map((k) => `${k} = ?`)
        .join(", ");
    const values = [...Object.values(updates), employee_id];
    await excuteQuery({
        query: `UPDATE employees SET ${fields}, updated_at = NOW() WHERE employee_id = ?`,
        values,
    });
}

/**
 * Soft delete employee.
 */
export async function deleteEmployee(employee_id) {
    await excuteQuery({
        query: `UPDATE employees SET deleted_at = NOW() WHERE employee_id = ?`,
        values: [employee_id],
    });
}
