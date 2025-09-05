import excuteQuery from "@/lib/db"; // Adjust path as needed

// Resolve the best available display-name column on users table
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
 * Get all assets for a specific account (optionally filter by site, location, status), including joined data.
 */
export async function getAllAssets({
    account_id,
    site_id,
    location_id,
    status,
} = {}) {
    let conditions = [`a.deleted_at IS NULL`];
    let values = [];
    if (account_id) {
        conditions.push("p.account_id = ?");
        values.push(account_id);
    }
    if (site_id) {
        conditions.push("a.site_id = ?");
        values.push(site_id);
    }
    if (location_id) {
        conditions.push("a.location_id = ?");
        values.push(location_id);
    }
    if (status) {
        conditions.push("a.status = ?");
        values.push(status);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    return await excuteQuery({
        query: `
            SELECT 
                a.*,
                s.site_name, 
                l.location_name, 
                p.product_name
            FROM assets a
            LEFT JOIN sites s ON a.site_id = s.site_id
            LEFT JOIN locations l ON a.location_id = l.location_id
            LEFT JOIN products p ON a.product_id = p.product_id
            ${where}
        `,
        values,
    });
}

/**
 * Get all assets for a specific product, including joined data for site, location, and assigned employee/user.
 */
export async function getAssetsByProductId(product_id) {
    if (!product_id || typeof product_id !== "number") {
        throw new Error("Valid product_id is required.");
    }
    const userNameExpr = await getUserNameExpr();
    const assets = await excuteQuery({
        query: `
            SELECT 
                a.*,
                s.site_name,
                s.site_description,
                l.location_name,
                l.address AS location_address,
                e.employee_id AS assigned_employee_id,
                e.job_title AS assigned_employee_job_title,
                e.department AS assigned_employee_department,
                ${userNameExpr} AS assigned_user_full_name,
                u.email AS assigned_user_email
            FROM assets a
            LEFT JOIN sites s ON a.site_id = s.site_id
            LEFT JOIN locations l ON a.location_id = l.location_id
            LEFT JOIN employees e ON a.assigned_to = e.employee_id
            LEFT JOIN users u ON e.user_id = u.id
                        WHERE a.product_id = ?
                            AND a.deleted_at IS NULL
        `,
        values: [product_id],
    });
    return assets;
}

/**
 * Get a single asset by asset_id, with joined info for site, location, assigned employee, and user.
 */
export async function getAssetById(asset_id) {
    if (!asset_id || typeof asset_id !== "number") {
        throw new Error("Valid asset_id is required.");
    }
    const userNameExpr = await getUserNameExpr();
    const assets = await excuteQuery({
        query: `
            SELECT 
                a.*,
                s.site_name,
                s.site_description,
                l.location_name,
                l.address AS location_address,
                e.employee_id AS assigned_employee_id,
                e.job_title AS assigned_employee_job_title,
                e.department AS assigned_employee_department,
                ${userNameExpr} AS assigned_user_full_name,
                u.email AS assigned_user_email
            FROM assets a
            LEFT JOIN sites s ON a.site_id = s.site_id
            LEFT JOIN locations l ON a.location_id = l.location_id
            LEFT JOIN employees e ON a.assigned_to = e.employee_id
            LEFT JOIN users u ON e.user_id = u.id
                        WHERE a.asset_id = ?
                            AND a.deleted_at IS NULL
            LIMIT 1
        `,
        values: [asset_id],
    });
    return assets.length ? assets[0] : null;
}

/**
 * Create a new asset.
 */
export async function createAsset(assetFields) {
    const keys = Object.keys(assetFields).filter(
        (k) => assetFields[k] !== undefined && assetFields[k] !== null
    );
    const values = keys.map((k) =>
        k === "custom_fields" && typeof assetFields[k] === "object"
            ? JSON.stringify(assetFields[k])
            : assetFields[k]
    );
    const placeholders = keys.map(() => "?").join(", ");
    const fieldsSql = keys.join(", ");
    const result = await excuteQuery({
        query: `INSERT INTO assets (${fieldsSql}) VALUES (${placeholders})`,
        values,
    });
    return result.insertId;
}

/**
 * Update an asset.
 */
export async function updateAsset(asset_id, updates) {
    const keys = Object.keys(updates).filter(
        (k) => updates[k] !== undefined && updates[k] !== null
    );
    if (!asset_id || keys.length === 0)
        throw new Error("asset_id and at least one field are required.");
    const values = keys.map((k) =>
        k === "custom_fields" && typeof updates[k] === "object"
            ? JSON.stringify(updates[k])
            : updates[k]
    );
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    await excuteQuery({
        query: `UPDATE assets SET ${setClause}, updated_at = NOW() WHERE asset_id = ?`,
        values: [...values, asset_id],
    });
}

/**
 * Soft-delete an asset.
 */
export async function deleteAsset(asset_id) {
    if (!asset_id) throw new Error("asset_id is required.");
    await excuteQuery({
        query: `UPDATE assets SET deleted_at = NOW() WHERE asset_id = ?`,
        values: [asset_id],
    });
}

/**
 * Get asset move history.
 */
export async function getAssetHistory(asset_id) {
    if (!asset_id) throw new Error("asset_id is required.");
    return await excuteQuery({
        query: `
            SELECT *
            FROM asset_move_history
            WHERE asset_id = ?
            ORDER BY created_at DESC
        `,
        values: [asset_id],
    });
}

/**
 * Batch get assets by IDs.
 */
export async function getAssetsByIds(asset_ids) {
    if (!Array.isArray(asset_ids) || asset_ids.length === 0) return [];
    const placeholders = asset_ids.map(() => "?").join(",");
    return await excuteQuery({
        query: `
            SELECT * FROM assets
                        WHERE asset_id IN (${placeholders})
                            AND deleted_at IS NULL
        `,
        values: asset_ids,
    });
}
