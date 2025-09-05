import excuteQuery from "@/lib/db";

/**
 * Get all suppliers (optionally only active).
 */
export async function getAllSuppliers({ activeOnly = false } = {}) {
    let conditions = [];
    let values = [];
    if (activeOnly) {
        conditions.push("s.deleted_at IS NULL");
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    return await excuteQuery({
        query: `
            SELECT s.*
            FROM suppliers s
            ${where}
        `,
        values,
    });
}

/**
 * Get a single supplier by ID.
 */
export async function getSupplierById(supplier_id) {
    const rows = await excuteQuery({
        query: `
            SELECT s.*
            FROM suppliers s
                        WHERE s.supplier_id = ?
                            AND s.deleted_at IS NULL
            LIMIT 1
        `,
        values: [supplier_id],
    });
    return rows.length ? rows[0] : null;
}

/**
 * Create a new supplier.
 */
export async function createSupplier({ supplier_name, custom_fields = null }) {
    const result = await excuteQuery({
        query: `
            INSERT INTO suppliers (supplier_name, custom_fields)
            VALUES (?, ?)
        `,
        values: [
            supplier_name,
            custom_fields ? JSON.stringify(custom_fields) : null,
        ],
    });
    return result.insertId;
}

/**
 * Update a supplier.
 */
export async function updateSupplier(supplier_id, updates) {
    const fields = Object.keys(updates)
        .map((k) => `${k} = ?`)
        .join(", ");
    const values = [...Object.values(updates), supplier_id];
    await excuteQuery({
        query: `UPDATE suppliers SET ${fields} WHERE supplier_id = ?`,
        values,
    });
}

/**
 * Soft-delete a supplier.
 */
export async function deleteSupplier(supplier_id) {
    await excuteQuery({
        query: `
            UPDATE suppliers
            SET deleted_at = NOW()
            WHERE supplier_id = ?
        `,
        values: [supplier_id],
    });
}
