import excuteQuery from "@/lib/db";

/**
 * Get all categories (optionally only active).
 */
export async function getAllCategories({ activeOnly = false } = {}) {
    let conditions = [];
    let values = [];
    if (activeOnly) {
        conditions.push("c.deleted_at IS NULL");
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    return await excuteQuery({
        query: `
            SELECT c.*
            FROM categories c
            ${where}
        `,
        values,
    });
}

/**
 * Get a single category by ID.
 */
export async function getCategoryById(category_id) {
    const rows = await excuteQuery({
        query: `
            SELECT c.*
            FROM categories c
            WHERE c.category_id = ?
              AND c.deleted_at IS NULL
            LIMIT 1
        `,
        values: [category_id],
    });
    return rows.length ? rows[0] : null;
}
