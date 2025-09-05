import excuteQuery from "@/lib/db";

/**
 * Get all sites (optionally only active).
 */
export async function getAllSites({ account_id, activeOnly = false } = {}) {
    let conditions = [];
    let values = [];
    if (account_id) {
        conditions.push("s.account_id = ?");
        values.push(account_id);
    }
    if (activeOnly) {
        conditions.push("s.deleted_at IS NULL");
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    return await excuteQuery({
        query: `
            SELECT s.*, a.account_name
            FROM sites s
            LEFT JOIN accounts a ON s.account_id = a.account_id
            ${where}
        `,
        values,
    });
}

/**
 * Get a single site by ID.
 */
export async function getSiteById(site_id) {
    const rows = await excuteQuery({
        query: `
            SELECT s.*, a.account_name
            FROM sites s
            LEFT JOIN accounts a ON s.account_id = a.account_id
                        WHERE s.site_id = ?
                            AND s.deleted_at IS NULL
            LIMIT 1
        `,
        values: [site_id],
    });
    return rows.length ? rows[0] : null;
}

/**
 * Create a new site.
 */
export async function createSite({
    account_id,
    site_name,
    site_description,
    address,
    custom_fields = null,
}) {
    const result = await excuteQuery({
        query: `
            INSERT INTO sites (account_id, site_name, site_description, address, custom_fields, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        `,
        values: [
            account_id,
            site_name,
            site_description,
            address,
            custom_fields ? JSON.stringify(custom_fields) : null,
        ],
    });
    return result.insertId;
}

/**
 * Update a site.
 */
export async function updateSite(site_id, updates) {
    const fields = Object.keys(updates)
        .map((k) => `${k} = ?`)
        .join(", ");
    const values = [...Object.values(updates), site_id];
    await excuteQuery({
        query: `UPDATE sites SET ${fields}, updated_at = NOW() WHERE site_id = ?`,
        values,
    });
}

/**
 * Soft-delete a site.
 */
export async function deleteSite(site_id) {
    await excuteQuery({
        query: `
            UPDATE sites
            SET deleted_at = NOW()
            WHERE site_id = ?
        `,
        values: [site_id],
    });
}
