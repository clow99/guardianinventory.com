import excuteQuery from "@/lib/db";

export async function getAllLocations({ activeOnly = false } = {}) {
    const conditions = [];
    const values = [];
    if (activeOnly) conditions.push("deleted_at IS NULL");
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    return await excuteQuery({
        query: `SELECT * FROM locations ${where}`,
        values,
    });
}

export async function getLocationById(location_id) {
    const rows = await excuteQuery({
        query: `SELECT * FROM locations WHERE location_id = ? AND (deleted_at IS NULL OR deleted_at IS NULL) LIMIT 1`,
        values: [location_id],
    });
    return rows?.[0] || null;
}

export async function createLocation({ location_name, address = null, custom_fields = null }) {
    const result = await excuteQuery({
        query: `INSERT INTO locations (location_name, address, custom_fields) VALUES (?, ?, ?)`,
        values: [location_name, address, custom_fields ? JSON.stringify(custom_fields) : null],
    });
    return result.insertId;
}

export async function updateLocation(location_id, updates) {
    const keys = Object.keys(updates).filter((k) => updates[k] !== undefined);
    if (!keys.length) return;
    const set = keys
        .map((k) => `${k} = ?`)
        .join(", ");
    const vals = keys.map((k) =>
        k === "custom_fields" && typeof updates[k] === "object"
            ? JSON.stringify(updates[k])
            : updates[k]
    );
    await excuteQuery({
        query: `UPDATE locations SET ${set} WHERE location_id = ?`,
        values: [...vals, location_id],
    });
}

export async function deleteLocation(location_id) {
    await excuteQuery({
        query: `UPDATE locations SET deleted_at = NOW() WHERE location_id = ?`,
        values: [location_id],
    });
}

