#!/usr/bin/env node

// Seed the database with realistic demo data for dashboard/charts

// - Accounts, Sites

// - Categories, Manufacturers, Suppliers, Products

// - Locations, Assets (spread over last 6 months)

// - Asset Tasks (created/completed, weekday distribution)

import mysql from "serverless-mysql";

import fs from "fs";

import path from "path";

import bcrypt from "bcryptjs";

// Utility: ensure columns/indexes exist for older databases
async function columnExists(tableName, columnName) {
    const dbName = cfg.database;
    const rows = await q(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
        [dbName, tableName, columnName]
    );
    return rows.length > 0;
}

async function indexExists(tableName, indexName) {
    const dbName = cfg.database;
    const rows = await q(
        `SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1`,
        [dbName, tableName, indexName]
    );
    return rows.length > 0;
}

async function ensureColumn(tableName, columnName, columnDDL) {
    if (!(await columnExists(tableName, columnName))) {
        await q(`ALTER TABLE ${tableName} ADD COLUMN ${columnDDL}`);
    }
}

async function ensureUniqueIndex(tableName, indexName, columnsExpr) {
    if (!(await indexExists(tableName, indexName))) {
        await q(
            `ALTER TABLE ${tableName} ADD UNIQUE KEY ${indexName} (${columnsExpr})`
        );
    }
}

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

const ENGINE =
    " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

async function ensureTables() {
    await q(`CREATE TABLE IF NOT EXISTS users (

        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        username VARCHAR(100) NULL,

        email VARCHAR(255) NOT NULL,

        password VARCHAR(255) NULL,

        full_name VARCHAR(255) NULL,

        is_admin TINYINT(1) NOT NULL DEFAULT 0,

        custom_fields JSON NULL,

        deleted_at DATETIME NULL,

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        UNIQUE KEY users_email_unique (email),

        UNIQUE KEY users_username_unique (username),

        PRIMARY KEY (id)

    )${ENGINE};`);

    await q(`CREATE TABLE IF NOT EXISTS accounts (

        account_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        account_name VARCHAR(255) NOT NULL,

        description TEXT NULL,

        custom_fields JSON NULL,

        deleted_at DATETIME NULL,

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (account_id),

        UNIQUE KEY accounts_name_unique (account_name)

    )${ENGINE};`);

    await q(`CREATE TABLE IF NOT EXISTS categories (

        category_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        category_name VARCHAR(255) NOT NULL,

        category_description TEXT NULL,

        deleted_at DATETIME NULL,

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (category_id),

        UNIQUE KEY categories_name_unique (category_name)

    )${ENGINE};`);

    await q(`CREATE TABLE IF NOT EXISTS manufacturers (

        manufacturer_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        manufacturer_name VARCHAR(255) NOT NULL,

        manufacturer_description TEXT NULL,

        deleted_at DATETIME NULL,

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (manufacturer_id),

        UNIQUE KEY manufacturers_name_unique (manufacturer_name)

    )${ENGINE};`);

    // In case the users table already existed without newer columns/indexes,
    // add them defensively so subsequent inserts won't fail. Ignore failures
    // (e.g., lacking ALTER privilege) and fall back to dynamic inserts.
    try {
        await ensureColumn("users", "username", "username VARCHAR(100) NULL");
    } catch (e) {
        console.warn("[seed] Could not add users.username:", e?.message || e);
    }
    try {
        await ensureColumn("users", "full_name", "full_name VARCHAR(255) NULL");
    } catch (e) {
        console.warn("[seed] Could not add users.full_name:", e?.message || e);
    }
    try {
        await ensureColumn(
            "users",
            "is_admin",
            "is_admin TINYINT(1) NOT NULL DEFAULT 0"
        );
    } catch (e) {
        console.warn("[seed] Could not add users.is_admin:", e?.message || e);
    }
    try {
        await ensureUniqueIndex("users", "users_username_unique", "username");
    } catch (e) {
        console.warn(
            "[seed] Could not add users_username_unique index:",
            e?.message || e
        );
    }
    try {
        await ensureUniqueIndex("users", "users_email_unique", "email");
    } catch (e) {
        console.warn(
            "[seed] Could not add users_email_unique index:",
            e?.message || e
        );
    }

    await q(`CREATE TABLE IF NOT EXISTS suppliers (

        supplier_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        supplier_name VARCHAR(255) NOT NULL,

        supplier_description TEXT NULL,

        deleted_at DATETIME NULL,

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (supplier_id),
        UNIQUE KEY suppliers_name_unique (supplier_name)

    )${ENGINE};`);

    await q(`CREATE TABLE IF NOT EXISTS locations (

        location_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        location_name VARCHAR(255) NOT NULL,

        address VARCHAR(255) NULL,

        custom_fields JSON NULL,

        deleted_at DATETIME NULL,

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (location_id),

        UNIQUE KEY locations_name_unique (location_name)

    )${ENGINE};`);

    await q(`CREATE TABLE IF NOT EXISTS sites (

        site_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        account_id BIGINT UNSIGNED NOT NULL,

        site_name VARCHAR(255) NOT NULL,

        site_description TEXT NULL,

        address VARCHAR(255) NULL,

        deleted_at DATETIME NULL,

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (site_id),

        UNIQUE KEY sites_account_name_unique (account_id, site_name),

        CONSTRAINT sites_account_fk FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE

    )${ENGINE};`);

    await q(`CREATE TABLE IF NOT EXISTS products (

        product_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        account_id BIGINT UNSIGNED NOT NULL,

        site_id BIGINT UNSIGNED NULL,

        product_name VARCHAR(255) NOT NULL,

        product_description TEXT NULL,

        category_id BIGINT UNSIGNED NULL,

        manufacturer_id BIGINT UNSIGNED NULL,

        supplier_id BIGINT UNSIGNED NULL,

        deleted_at DATETIME NULL,

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (product_id),

        UNIQUE KEY products_account_name_unique (account_id, product_name),

        KEY products_category_idx (category_id),

        CONSTRAINT products_account_fk FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,

        CONSTRAINT products_site_fk FOREIGN KEY (site_id) REFERENCES sites(site_id) ON DELETE SET NULL,

        CONSTRAINT products_category_fk FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,

        CONSTRAINT products_manufacturer_fk FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(manufacturer_id) ON DELETE SET NULL,

        CONSTRAINT products_supplier_fk FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL

    )${ENGINE};`);

    await q(`CREATE TABLE IF NOT EXISTS assets (

        asset_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        product_id BIGINT UNSIGNED NOT NULL,

        site_id BIGINT UNSIGNED NULL,

        serial_number VARCHAR(255) NOT NULL,

        asset_tag VARCHAR(255) NULL,

        status VARCHAR(50) NOT NULL DEFAULT 'available',

        location_id BIGINT UNSIGNED NULL,

        purchase_date DATE NULL,

        deleted_at DATETIME NULL,

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (asset_id),

        UNIQUE KEY assets_serial_unique (serial_number),

        KEY assets_tag_idx (asset_tag),

        CONSTRAINT assets_product_fk FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,

        CONSTRAINT assets_site_fk FOREIGN KEY (site_id) REFERENCES sites(site_id) ON DELETE SET NULL,

        CONSTRAINT assets_location_fk FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE SET NULL

    )${ENGINE};`);

    await q(`CREATE TABLE IF NOT EXISTS asset_tasks (

        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        asset_id BIGINT UNSIGNED NOT NULL,

        title VARCHAR(255) NOT NULL,

        description TEXT NULL,

        status VARCHAR(50) NOT NULL DEFAULT 'pending',

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        completed_at DATETIME NULL,

        deleted_at DATETIME NULL,

        PRIMARY KEY (id),

        KEY asset_tasks_asset_idx (asset_id),

        CONSTRAINT asset_tasks_asset_fk FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE

    )${ENGINE};`);

    await q(`CREATE TABLE IF NOT EXISTS account_users (

        account_id BIGINT UNSIGNED NOT NULL,

        user_id BIGINT UNSIGNED NOT NULL,

        role_id BIGINT UNSIGNED NULL,

        custom_fields JSON NULL,

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (account_id, user_id),

        KEY account_users_user_idx (user_id),

        CONSTRAINT account_users_account_fk FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,

        CONSTRAINT account_users_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

    )${ENGINE};`);

    await q(`CREATE TABLE IF NOT EXISTS asset_task_assignees (

        task_id BIGINT UNSIGNED NOT NULL,

        user_id BIGINT UNSIGNED NOT NULL,

        assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        PRIMARY KEY (task_id, user_id),

        CONSTRAINT task_assignee_task_fk FOREIGN KEY (task_id) REFERENCES asset_tasks(id) ON DELETE CASCADE,

        CONSTRAINT task_assignee_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

    )${ENGINE};`);

    await q(`CREATE TABLE IF NOT EXISTS asset_task_files (

        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        task_id BIGINT UNSIGNED NOT NULL,

        file_name VARCHAR(255) NOT NULL,

        file_path VARCHAR(512) NOT NULL,

        uploaded_by_user_id BIGINT UNSIGNED NULL,

        uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        PRIMARY KEY (id),

        KEY task_files_task_idx (task_id),

        CONSTRAINT task_files_task_fk FOREIGN KEY (task_id) REFERENCES asset_tasks(id) ON DELETE CASCADE,

        CONSTRAINT task_files_user_fk FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE SET NULL

    )${ENGINE};`);
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

// (ensureSeedAdmin implementation defined later)

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

async function ensureSeedAdmin() {
    const email = (
        process.env.SEED_ADMIN_EMAIL ||
        process.env.ADMIN_EMAIL ||
        "admin@guardian.test"
    )
        .trim()
        .toLowerCase();
    const username = (
        process.env.SEED_ADMIN_USERNAME ||
        email.split("@")[0] ||
        "guardian"
    ).slice(0, 100);
    const fullName = process.env.SEED_ADMIN_NAME || "Guardian Admin";
    const passwordPlain = process.env.SEED_ADMIN_PASSWORD || "guardian123";

    // Check if user already exists
    const existing = await q(
        "SELECT id, email FROM users WHERE email = ? LIMIT 1",
        [email]
    );
    if (existing.length) {
        const user = existing[0];
        // Update is_admin if column exists
        if (await columnExists("users", "is_admin")) {
            await q("UPDATE users SET is_admin = 1 WHERE id = ?", [user.id]);
        }
        console.log(`[seed] Using existing admin user ${email}`);
        process.env.ADMIN_EMAIL = email;
        return { id: user.id, email };
    }

    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    // Build INSERT statement based on available columns (handle legacy schemas too)
    const cols = ["email", "password"];
    const vals = [email, passwordHash];
    if (await columnExists("users", "username")) {
        cols.unshift("username");
        vals.unshift(username);
    }
    // Some older schemas use `name` instead of `full_name` and may require NOT NULL
    if (await columnExists("users", "full_name")) {
        cols.push("full_name");
        vals.push(fullName);
    }
    if (await columnExists("users", "name")) {
        cols.push("name");
        vals.push(fullName);
    }
    if (await columnExists("users", "is_admin")) {
        cols.push("is_admin");
        vals.push(1);
    }
    const placeholders = cols.map(() => "?").join(", ");
    const sql = `INSERT INTO users (${cols.join(
        ", "
    )}) VALUES (${placeholders})`;
    const res = await q(sql, vals);
    console.log(
        `[seed] Created admin user ${email} with password ${passwordPlain}`
    );
    process.env.ADMIN_EMAIL = email;
    return { id: res.insertId, email };
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

    await ensureTables();

    const accountName = "Seed Demo Account";
    const account_id = await ensureAccount(
        accountName,
        "Demo data for development"
    );
    console.log("[seed] account_id:", account_id);

    const adminUser = await ensureSeedAdmin();
    const userRow = adminUser || null;
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
    } else {
        console.warn(
            "[seed] No admin user available to link to the demo account."
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

    const assetStatusPool = [
        "available",
        "available",
        "available",
        "in_use",
        "maintenance",
        "out_of_service",
    ];

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
            const status =
                assetStatusPool[randInt(0, assetStatusPool.length - 1)];
            const asset_id = await ensureAsset({
                product_id: prod.product_id,
                site_id,
                serial_number: serial,
                asset_tag: tag,
                location_id: loc,
                status,
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
