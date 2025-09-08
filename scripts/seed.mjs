#!/usr/bin/env node
// Seed the database with realistic demo data for dashboard/charts
// - Accounts, Sites
// - Categories, Manufacturers, Suppliers, Products
// - Locations, Assets (spread over last 6 months)
// - Asset Tasks (created/completed, weekday distribution)

import mysql from "serverless-mysql";
import fs from "fs";
import path from "path";

function loadEnvFile(filename) {
    const p = path.join(process.cwd(), filename);
    if (!fs.existsSync(p)) return;
    const text = fs.readFileSync(p, "utf8");
    for (const line of text.split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const eq = t.indexOf("=");
        if (eq === -1) continue;
        const k = t.slice(0, eq).trim();
        let v = t.slice(eq + 1).trim();
        if (
            (v.startsWith('"') && v.endsWith('"')) ||
            (v.startsWith("'") && v.endsWith("'"))
        ) {
            v = v.slice(1, -1);
        }
        // Do not overwrite if already set to preserve precedence
        if (process.env[k] == null || process.env[k] === "") {
            process.env[k] = v;
        }
    }
}

// Load in order: existing env, then .env, then .env.local (higher precedence)
loadEnvFile(".env");
loadEnvFile(".env.local");

const cfg = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
};

for (const [k, v] of Object.entries(cfg)) {
    if (!v) {
        console.error(`[seed] Missing env for MySQL: ${k}`);
    }
}

const db = mysql({ config: cfg });
async function q(query, values = []) {
    const res = await db.query(query, values);
    return res;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function addMonths(date, n) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + n);
    return d;
}
function startOfMonth(date) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}
function endOfMonth(date) {
    const d = addMonths(startOfMonth(date), 1);
    d.setMilliseconds(-1);
    return d;
}
function sampleDateInMonth(date) {
    const s = startOfMonth(date).getTime();
    const e = endOfMonth(date).getTime();
    const t = s + Math.random() * (e - s);
    return new Date(t);
}

async function ensureAccount(name, description = null) {
    const rows = await q(
        "SELECT account_id FROM accounts WHERE account_name = ? AND deleted_at IS NULL LIMIT 1",
        [name]
    );
    if (rows.length) return rows[0].account_id;
    const res = await q(
        "INSERT INTO accounts (account_name, description, created_at) VALUES (?, ?, NOW())",
        [name, description]
    );
    return res.insertId;
}

async function ensureSite(account_id, site_name) {
    const rows = await q(
        "SELECT site_id FROM sites WHERE account_id = ? AND site_name = ? AND deleted_at IS NULL LIMIT 1",
        [account_id, site_name]
    );
    if (rows.length) return rows[0].site_id;
    const res = await q(
        "INSERT INTO sites (account_id, site_name, created_at) VALUES (?, ?, NOW())",
        [account_id, site_name]
    );
    return res.insertId;
}

async function ensureCategory(name) {
    const rows = await q(
        "SELECT category_id FROM categories WHERE category_name = ? AND deleted_at IS NULL LIMIT 1",
        [name]
    );
    if (rows.length) return rows[0].category_id;
    const res = await q("INSERT INTO categories (category_name) VALUES (?)", [
        name,
    ]);
    return res.insertId;
}
async function ensureManufacturer(name) {
    const rows = await q(
        "SELECT manufacturer_id FROM manufacturers WHERE manufacturer_name = ? AND deleted_at IS NULL LIMIT 1",
        [name]
    );
    if (rows.length) return rows[0].manufacturer_id;
    const res = await q(
        "INSERT INTO manufacturers (manufacturer_name) VALUES (?)",
        [name]
    );
    return res.insertId;
}
async function ensureSupplier(name) {
    const rows = await q(
        "SELECT supplier_id FROM suppliers WHERE supplier_name = ? AND deleted_at IS NULL LIMIT 1",
        [name]
    );
    if (rows.length) return rows[0].supplier_id;
    const res = await q("INSERT INTO suppliers (supplier_name) VALUES (?)", [
        name,
    ]);
    return res.insertId;
}

async function ensureLocation(name) {
    const rows = await q(
        "SELECT location_id FROM locations WHERE location_name = ? AND deleted_at IS NULL LIMIT 1",
        [name]
    );
    if (rows.length) return rows[0].location_id;
    const res = await q("INSERT INTO locations (location_name) VALUES (?)", [
        name,
    ]);
    return res.insertId;
}

async function ensureProduct({
    account_id,
    site_id,
    name,
    category_id,
    manufacturer_id,
    supplier_id,
    created_at,
}) {
    const rows = await q(
        "SELECT product_id FROM products WHERE account_id = ? AND product_name = ? AND deleted_at IS NULL LIMIT 1",
        [account_id, name]
    );
    if (rows.length) return rows[0].product_id;
    const res = await q(
        `INSERT INTO products (account_id, site_id, product_name, product_description, category_id, manufacturer_id, supplier_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            account_id,
            site_id,
            name,
            `${name} description`,
            category_id,
            manufacturer_id,
            supplier_id,
            created_at,
        ]
    );
    return res.insertId;
}

async function ensureAsset({
    product_id,
    site_id,
    serial_number,
    asset_tag,
    location_id,
    status = "available",
    created_at,
}) {
    const rows = await q(
        "SELECT asset_id FROM assets WHERE serial_number = ? LIMIT 1",
        [serial_number]
    );
    if (rows.length) return rows[0].asset_id;
    const res = await q(
        `INSERT INTO assets (product_id, site_id, serial_number, asset_tag, status, location_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            product_id,
            site_id,
            serial_number,
            asset_tag,
            status,
            location_id,
            created_at,
        ]
    );
    return res.insertId;
}

async function ensureTask({
    asset_id,
    title,
    description = null,
    status = "pending",
    created_at,
    completed_at = null,
}) {
    const rows = await q(
        "SELECT id FROM asset_tasks WHERE title = ? AND asset_id = ? LIMIT 1",
        [title, asset_id]
    );
    if (rows.length) return rows[0].id;
    const res = await q(
        `INSERT INTO asset_tasks (asset_id, title, description, status, created_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [asset_id, title, description, status, created_at, completed_at]
    );
    return res.insertId;
}

async function seed() {
    console.log("[seed] Starting...");

    const accountName = "Seed Demo Account";
    const account_id = await ensureAccount(
        accountName,
        "Demo data for development"
    );
    console.log("[seed] account_id:", account_id);

    // Link an admin user to the account (or the first user) and set as last_selected
    const adminEmail = process.env.ADMIN_EMAIL || null;
    let userRow = null;
    if (adminEmail) {
        const rows = await q(
            "SELECT id, email FROM users WHERE email = ? LIMIT 1",
            [adminEmail]
        );
        userRow = rows[0] || null;
    }
    if (!userRow) {
        const rows = await q(
            "SELECT id, email FROM users WHERE is_admin = 1 ORDER BY id ASC LIMIT 1"
        );
        userRow = rows[0] || null;
    }
    if (userRow) {
        await q(
            "INSERT IGNORE INTO account_users (account_id, user_id) VALUES (?, ?)",
            [account_id, userRow.id]
        );
        // Mark last_selected for this account
        await q(
            "UPDATE account_users SET custom_fields = JSON_SET(COALESCE(custom_fields, '{}'), '$.last_selected', false) WHERE user_id = ?",
            [userRow.id]
        );
        await q(
            "UPDATE account_users SET custom_fields = JSON_SET(COALESCE(custom_fields, '{}'), '$.last_selected', true) WHERE user_id = ? AND account_id = ?",
            [userRow.id, account_id]
        );
    }

    const site_id = await ensureSite(account_id, "Main Site");
    const locationIds = [];
    for (const name of [
        "Warehouse A",
        "Warehouse B",
        "Front Office",
        "Field Truck",
    ]) {
        locationIds.push(await ensureLocation(name));
    }

    const categoryNames = [
        "Living room",
        "Kids",
        "Office",
        "Bedroom",
        "Kitchen",
        "Decor",
        "Lighting",
        "Outdoor",
        "Garage",
    ];
    const catIds = {};
    for (const n of categoryNames) catIds[n] = await ensureCategory(n);
    const manId = await ensureManufacturer("Acme Co");
    const supId = await ensureSupplier("Global Supply");

    // Create a few products tied to categories
    const products = [];
    for (const n of ["Sofa", "Desk", "Lamp", "Chair", "Tool Kit"]) {
        const cat =
            n === "Sofa"
                ? catIds["Living room"]
                : n === "Desk"
                ? catIds["Office"]
                : n === "Lamp"
                ? catIds["Lighting"]
                : n === "Chair"
                ? catIds["Office"]
                : catIds["Garage"];
        const created_at = new Date();
        const product_id = await ensureProduct({
            account_id,
            site_id,
            name: `Seed ${n}`,
            category_id: cat,
            manufacturer_id: manId,
            supplier_id: supId,
            created_at,
        });
        products.push({ product_id, name: n, cat });
    }

    // Create assets over last 6 months and tasks
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) months.push(addMonths(now, -i));

    for (const m of months) {
        // Number per month
        const assetsThisMonth = randInt(10, 20);
        for (let i = 0; i < assetsThisMonth; i++) {
            const prod = products[randInt(0, products.length - 1)];
            const created_at = sampleDateInMonth(m);
            const serial = `SEED-${
                prod.product_id
            }-${created_at.getFullYear()}${(created_at.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${i}`;
            const tag = `TAG-${prod.product_id}-${i}`;
            const loc = locationIds[randInt(0, locationIds.length - 1)];
            const asset_id = await ensureAsset({
                product_id: prod.product_id,
                site_id,
                serial_number: serial,
                asset_tag: tag,
                location_id: loc,
                status: "available",
                created_at,
            });

            // Create tasks for ~40% of assets
            if (Math.random() < 0.4) {
                const tasksCount = randInt(1, 3);
                for (let t = 0; t < tasksCount; t++) {
                    const tCreated = sampleDateInMonth(m);
                    const isDone = Math.random() < 0.6;
                    const doneDate = isDone
                        ? new Date(
                              tCreated.getTime() +
                                  randInt(1, 7) * 24 * 3600 * 1000
                          )
                        : null;
                    await ensureTask({
                        asset_id,
                        title: `Seed Task ${asset_id} ${tCreated
                            .toISOString()
                            .slice(0, 7)} #${t}`,
                        description: "Auto-generated seed task",
                        status: isDone ? "completed" : "pending",
                        created_at: tCreated,
                        completed_at: isDone ? doneDate : null,
                    });
                }
            }
        }
    }

    console.log("[seed] Done.");
}

let hadError = false;
seed()
    .catch((e) => {
        hadError = true;
        console.error("[seed] Failed:", e?.message || e);
    })
    .finally(async () => {
        try {
            await db.end();
        } catch {}
        process.exit(hadError ? 1 : 0);
    });
