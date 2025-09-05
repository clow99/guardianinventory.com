import bcrypt from "bcryptjs";
import excuteQuery from "@/lib/db";

export async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password, hash) {
    if (!hash) return false;
    try {
        return await bcrypt.compare(password, hash);
    } catch {
        return false;
    }
}

export async function ensureAuthTables() {
    // Create password_reset_tokens
    await excuteQuery({
        query: `CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT UNSIGNED NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used_at TIMESTAMP NULL DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX (token),
            CONSTRAINT prt_user_fk FOREIGN KEY (user_id) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        values: [],
    });

    // Create invite_tokens
    await excuteQuery({
        query: `CREATE TABLE IF NOT EXISTS invite_tokens (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            email VARCHAR(255) NOT NULL,
            token VARCHAR(255) NOT NULL,
            account_id BIGINT UNSIGNED NULL,
            role_id BIGINT UNSIGNED NULL,
            expires_at TIMESTAMP NOT NULL,
            accepted_at TIMESTAMP NULL DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX (token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        values: [],
    });
}
