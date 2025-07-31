import excuteQuery from "@/lib/db";
import { getAssetsByProductId } from "@/lib/assetHelper";

/**
 * Get all products for an account, including their category, manufacturer, supplier, and all assets (with joins).
 */
export async function getProductsWithAssets(account_id) {
    const id = Number(account_id);
    if (!id || isNaN(id)) throw new Error("Valid account_id is required.");

    const products = await excuteQuery({
        query: `
            SELECT
                p.*,
                c.category_name,
                m.manufacturer_name,
                s.supplier_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
            LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
            WHERE p.account_id = ? AND (p.deleted_at IS NULL OR p.deleted_at = '')
        `,
        values: [id],
    });

    if (!products.length) return [];

    return await Promise.all(
        products.map(async (product) => ({
            ...product,
            assets: await getAssetsByProductId(product.product_id),
        }))
    );
}

/**
 * Get a single product by ID, with category, manufacturer, supplier, and assets.
 */
export async function getProductById(product_id) {
    const id = Number(product_id);
    if (!id || isNaN(id)) throw new Error("Valid product_id is required.");

    const products = await excuteQuery({
        query: `
            SELECT
                p.*,
                c.category_name,
                m.manufacturer_name,
                s.supplier_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
            LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
            WHERE p.product_id = ? AND (p.deleted_at IS NULL OR p.deleted_at = '')
            LIMIT 1
        `,
        values: [id],
    });

    if (!products.length) return null;

    return {
        ...products[0],
        assets: await getAssetsByProductId(id),
    };
}

/**
 * Get all products for an account (with optional filters).
 */
export async function getAllProducts({
    account_id,
    category_id,
    site_id,
} = {}) {
    let conditions = [`(p.deleted_at IS NULL OR p.deleted_at = '')`];
    let values = [];
    if (account_id) {
        conditions.push("p.account_id = ?");
        values.push(Number(account_id));
    }
    if (category_id) {
        conditions.push("p.category_id = ?");
        values.push(Number(category_id));
    }
    if (site_id) {
        conditions.push("p.site_id = ?");
        values.push(Number(site_id));
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    return await excuteQuery({
        query: `
            SELECT
                p.*,
                c.category_name,
                m.manufacturer_name,
                s.supplier_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
            LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
            ${where}
        `,
        values,
    });
}

/**
 * Create a new product. Returns the new product_id.
 * @param {Object} productFields
 * @returns {Promise<number>}
 */
export async function createProduct(productFields) {
    const keys = Object.keys(productFields).filter(
        (k) =>
            productFields[k] !== undefined &&
            productFields[k] !== null &&
            productFields[k] !== ""
    );
    if (!keys.length) throw new Error("No product fields provided.");
    const values = keys.map((k) =>
        k === "custom_fields" && typeof productFields[k] === "object"
            ? JSON.stringify(productFields[k])
            : productFields[k]
    );
    const placeholders = keys.map(() => "?").join(", ");
    const fieldsSql = keys.join(", ");
    const result = await excuteQuery({
        query: `INSERT INTO products (${fieldsSql}) VALUES (${placeholders})`,
        values,
    });
    return result.insertId;
}

/**
 * Update a product.
 * @param {number} product_id
 * @param {Object} updates
 * @returns {Promise<void>}
 */
export async function updateProduct(product_id, updates) {
    const id = Number(product_id);
    if (!id || isNaN(id)) throw new Error("Valid product_id is required.");
    const keys = Object.keys(updates).filter(
        (k) =>
            updates[k] !== undefined && updates[k] !== null && updates[k] !== ""
    );
    if (!keys.length)
        throw new Error("At least one field to update is required.");
    const values = keys.map((k) =>
        k === "custom_fields" && typeof updates[k] === "object"
            ? JSON.stringify(updates[k])
            : updates[k]
    );
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    await excuteQuery({
        query: `UPDATE products SET ${setClause}, updated_at = NOW() WHERE product_id = ?`,
        values: [...values, id],
    });
}

/**
 * Soft-delete a product.
 * @param {number} product_id
 * @returns {Promise<void>}
 */
export async function deleteProduct(product_id) {
    const id = Number(product_id);
    if (!id || isNaN(id)) throw new Error("Valid product_id is required.");
    await excuteQuery({
        query: `UPDATE products SET deleted_at = NOW() WHERE product_id = ?`,
        values: [id],
    });
}
