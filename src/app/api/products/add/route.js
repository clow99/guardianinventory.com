import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import excuteQuery from "@/lib/db";
import { getProductById } from "@/lib/productHelper"; // adjust path as needed

async function existsById(table, idField, id) {
    if (!Number.isFinite(id) || id <= 0) return false;
    const rows = await excuteQuery({
        query: `SELECT 1 FROM ${table} WHERE ${idField} = ? LIMIT 1`,
        values: [id],
    });
    return rows && rows.length > 0;
}

export async function POST(request) {
    try {
        const body = await request.json();
    console.log("[products/add] incoming body:", body);
        // Extract fields (add more as needed)
        const {
            account_id,
            product_name,
            product_description,
            category_id,
            manufacturer_id,
            supplier_id,
            site_id,
            custom_fields,
        } = body;

        // Coerce and validate required fields
        // Fallback: allow account_id from cookie when not provided
        let coercedAccountId = Number(account_id);
        if (!Number.isFinite(coercedAccountId) || coercedAccountId <= 0) {
            try {
                const cookieStore = cookies();
                const accCookie = cookieStore.get("account_id")?.value;
                const accFromCookie = Number(accCookie);
                if (Number.isFinite(accFromCookie) && accFromCookie > 0) {
                    coercedAccountId = accFromCookie;
                }
            } catch {}
        }
    const trimmedName = typeof product_name === "string" ? product_name.trim() : "";
    const effectiveName = trimmedName || "New Product"; // default if omitted
    if (!Number.isFinite(coercedAccountId) || coercedAccountId <= 0) {
            return NextResponse.json(
                {
                    success: false,
            error: "account_id is required.",
                },
                { status: 400 }
            );
        }

        // Prepare fields for insert
        // Start by coercing to numbers/null
        let coercedCategoryId = Number.isFinite(Number(category_id)) && Number(category_id) > 0 ? Number(category_id) : null;
        let coercedManufacturerId = Number.isFinite(Number(manufacturer_id)) && Number(manufacturer_id) > 0 ? Number(manufacturer_id) : null;
        let coercedSupplierId = Number.isFinite(Number(supplier_id)) && Number(supplier_id) > 0 ? Number(supplier_id) : null;
        let coercedSiteId = Number.isFinite(Number(site_id)) && Number(site_id) > 0 ? Number(site_id) : null;

        // Debug before existence checks
        console.log("[products/add] coerced IDs before exists:", {
            category_id: coercedCategoryId,
            manufacturer_id: coercedManufacturerId,
            supplier_id: coercedSupplierId,
            site_id: coercedSiteId,
        });

        // Validate existence to avoid FK errors; null out if not found
        if (coercedCategoryId && !(await existsById("categories", "category_id", coercedCategoryId))) {
            coercedCategoryId = null;
        }
        if (coercedManufacturerId && !(await existsById("manufacturers", "manufacturer_id", coercedManufacturerId))) {
            coercedManufacturerId = null;
        }
        if (coercedSupplierId && !(await existsById("suppliers", "supplier_id", coercedSupplierId))) {
            coercedSupplierId = null;
        }
        if (coercedSiteId && !(await existsById("sites", "site_id", coercedSiteId))) {
            coercedSiteId = null;
        }

        console.log("[products/add] IDs after exists:", {
            category_id: coercedCategoryId,
            manufacturer_id: coercedManufacturerId,
            supplier_id: coercedSupplierId,
            site_id: coercedSiteId,
        });

        const productFields = {
            account_id: coercedAccountId,
            product_name: effectiveName,
            product_description,
            category_id: coercedCategoryId,
            manufacturer_id: coercedManufacturerId,
            supplier_id: coercedSupplierId,
            site_id: coercedSiteId,
            custom_fields,
        };

        // Only insert fields that are present
    const keys = Object.keys(productFields).filter(
            (k) =>
                productFields[k] !== undefined &&
                productFields[k] !== null &&
                productFields[k] !== ""
        );
        const values = keys.map((k) =>
            k === "custom_fields" && typeof productFields[k] === "object"
                ? JSON.stringify(productFields[k])
                : productFields[k]
        );
        const placeholders = keys.map(() => "?").join(", ");
        const fieldsSql = keys.join(", ");

        // Insert the product
    const result = await excuteQuery({
            query: `INSERT INTO products (${fieldsSql}) VALUES (${placeholders})`,
            values,
        });
    console.log("[products/add] inserted keys:", fieldsSql, "values:", values);
        const product_id = result.insertId;

        // Fetch full product details (with joins and assets)
        const product = await getProductById(product_id);

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error adding product.",
            },
            { status: 500 }
        );
    }
}
