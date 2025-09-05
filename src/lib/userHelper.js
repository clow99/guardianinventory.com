import excuteQuery from "@/lib/db";

export async function findUserByEmail(email) {
    const rows = await excuteQuery({
        query: "SELECT * FROM users WHERE email = ? LIMIT 1",
        values: [email],
    });
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

export async function findUserByUsername(username) {
    const rows = await excuteQuery({
        query: "SELECT * FROM users WHERE username = ? LIMIT 1",
        values: [username],
    });
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

export async function createUser({
    username,
    email,
    passwordHash,
    fullName = null,
}) {
    const now = new Date();
    return await excuteQuery({
        query: `INSERT INTO users (username, email, password, full_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        values: [username, email, passwordHash || "", fullName, now, now],
    });
}

export async function updateUserPassword(userId, passwordHash) {
    const now = new Date();
    return await excuteQuery({
        query: `UPDATE users SET password = ?, updated_at = ? WHERE id = ?`,
        values: [passwordHash, now, userId],
    });
}
