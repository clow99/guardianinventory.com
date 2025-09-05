import excuteQuery from "@/lib/db";

/**
 * Get all manufacturers (optionally only active).
 */
export async function getAllManufacturers({ activeOnly = false } = {}) {
    let conditions = [];
    let values = [];
    if (activeOnly) {
        conditions.push("m.deleted_at IS NULL");
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    return await excuteQuery({
        query: `
            SELECT m.*
            FROM manufacturers m
            ${where}
        `,
        values,
    });
}

/**
 * Get a single manufacturer by ID.
 */
export async function getManufacturerById(manufacturer_id) {
    const rows = await excuteQuery({
        query: `
            SELECT m.*
            FROM manufacturers m
                        WHERE m.manufacturer_id = ?
                            AND m.deleted_at IS NULL
            LIMIT 1
        `,
        values: [manufacturer_id],
    });
    return rows.length ? rows[0] : null;
}

/**
 * Create a new manufacturer.
 */
export async function createManufacturer({
    manufacturer_name,
    custom_fields = null,
}) {
    const result = await excuteQuery({
        query: `
            INSERT INTO manufacturers (manufacturer_name, custom_fields)
            VALUES (?, ?)
        `,
        values: [
            manufacturer_name,
            custom_fields ? JSON.stringify(custom_fields) : null,
        ],
    });
    return result.insertId;
}

/**
 * Update a manufacturer.
 */
export async function updateManufacturer(manufacturer_id, updates) {
    const fields = Object.keys(updates)
        .map((k) => `${k} = ?`)
        .join(", ");
    const values = [...Object.values(updates), manufacturer_id];
    await excuteQuery({
        query: `UPDATE manufacturers SET ${fields} WHERE manufacturer_id = ?`,
        values,
    });
}

/**
 * Soft-delete a manufacturer.
 */
export async function deleteManufacturer(manufacturer_id) {
    await excuteQuery({
        query: `
            UPDATE manufacturers
            SET deleted_at = NOW()
            WHERE manufacturer_id = ?
        `,
        values: [manufacturer_id],
    });
}
