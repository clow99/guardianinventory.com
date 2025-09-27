import excuteQuery from "@/lib/db";

function getEngineClause() {
    const charset = "utf8mb4";
    const collate = "utf8mb4_unicode_ci";
    return ` ENGINE=InnoDB DEFAULT CHARSET=${charset} COLLATE=${collate}`;
}

export async function ensureCoreUserAccountTables() {
    // Ensure users table has the columns we rely on in local/dev setups
    await excuteQuery({
        query: `CREATE TABLE IF NOT EXISTS users (
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
        )${getEngineClause()};`,
        values: [],
    });

    // Ensure accounts table exists
    await excuteQuery({
        query: `CREATE TABLE IF NOT EXISTS accounts (
            account_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            account_name VARCHAR(255) NOT NULL,
            description TEXT NULL,
            custom_fields JSON NULL,
            deleted_at DATETIME NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (account_id),
            UNIQUE KEY accounts_name_unique (account_name)
        )${getEngineClause()};`,
        values: [],
    });

    // Ensure account_users mapping table exists
    await excuteQuery({
        query: `CREATE TABLE IF NOT EXISTS account_users (
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
        )${getEngineClause()};`,
        values: [],
    });
}
