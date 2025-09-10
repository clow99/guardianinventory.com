import excuteQuery from "@/lib/db";

export async function listProductCategories(product_id) {
    return await excuteQuery({
        query: `
            SELECT pc.*, c.category_name
            FROM product_categories pc
            LEFT JOIN categories c ON pc.category_id = c.category_id
            WHERE pc.product_id = ?
        `,
        values: [product_id],
    });
}

export async function addProductCategory(product_id, category_id, custom_fields = null) {
    await excuteQuery({
        query: `INSERT INTO product_categories (product_id, category_id, custom_fields) VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE custom_fields = VALUES(custom_fields)` ,
        values: [product_id, category_id, custom_fields ? JSON.stringify(custom_fields) : null],
    });
}

export async function removeProductCategory(product_id, category_id) {
    await excuteQuery({
        query: `DELETE FROM product_categories WHERE product_id = ? AND category_id = ?`,
        values: [product_id, category_id],
    });
}

export async function listProductManufacturers(product_id) {
    return await excuteQuery({
        query: `
            SELECT pm.*, m.manufacturer_name
            FROM product_manufacturers pm
            LEFT JOIN manufacturers m ON pm.manufacturer_id = m.manufacturer_id
            WHERE pm.product_id = ?
        `,
        values: [product_id],
    });
}

export async function addProductManufacturer(product_id, manufacturer_id, is_preferred = 0) {
    await excuteQuery({
        query: `INSERT INTO product_manufacturers (product_id, manufacturer_id, is_preferred) VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE is_preferred = VALUES(is_preferred)` ,
        values: [product_id, manufacturer_id, is_preferred ? 1 : 0],
    });
}

export async function removeProductManufacturer(product_id, manufacturer_id) {
    await excuteQuery({
        query: `DELETE FROM product_manufacturers WHERE product_id = ? AND manufacturer_id = ?`,
        values: [product_id, manufacturer_id],
    });
}

export async function listProductSuppliers(product_id) {
    return await excuteQuery({
        query: `
            SELECT ps.*, s.supplier_name
            FROM product_suppliers ps
            LEFT JOIN suppliers s ON ps.supplier_id = s.supplier_id
            WHERE ps.product_id = ?
        `,
        values: [product_id],
    });
}

export async function addProductSupplier(product_id, supplier_id, is_preferred = 0) {
    await excuteQuery({
        query: `INSERT INTO product_suppliers (product_id, supplier_id, is_preferred) VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE is_preferred = VALUES(is_preferred)` ,
        values: [product_id, supplier_id, is_preferred ? 1 : 0],
    });
}

export async function removeProductSupplier(product_id, supplier_id) {
    await excuteQuery({
        query: `DELETE FROM product_suppliers WHERE product_id = ? AND supplier_id = ?`,
        values: [product_id, supplier_id],
    });
}

