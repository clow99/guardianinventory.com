import excuteQuery from "./db";

// Helper to get current user info
export async function getUserDetails({ user_id = null, email = null }) {
    if (!user_id && !email) {
        throw new Error("user_id or email is required");
    }

    // 1. Get user record (get ID if only email is provided)
    let user;
    if (email && !user_id) {
        [user] = await excuteQuery({
            query: "SELECT * FROM users WHERE email = ? LIMIT 1",
            values: [email],
        });
        if (!user) throw new Error("User not found");
        user_id = user.id;
    } else if (user_id) {
        [user] = await excuteQuery({
            query: "SELECT * FROM users WHERE id = ? LIMIT 1",
            values: [user_id],
        });
        if (!user) throw new Error("User not found");
    }

    // 2. Get all accounts for this user
    const accounts = await excuteQuery({
        query: `
            SELECT a.* 
            FROM accounts a
            INNER JOIN account_users au ON au.account_id = a.account_id
            WHERE au.user_id = ? AND a.deleted_at IS NULL
        `,
        values: [user_id],
    });

    // 3. Get all sites for those accounts
    const accountIds = accounts.map((acc) => acc.account_id);
    let sites = [];
    if (accountIds.length > 0) {
        sites = await excuteQuery({
            query: `
                SELECT * FROM sites
                WHERE account_id IN (${accountIds
                    .map(() => "?")
                    .join(",")}) AND deleted_at IS NULL
            `,
            values: accountIds,
        });
    }

    // 4. Get the user's primary role (assumes one main role)
    let role = null;
    const [roleRow] = await excuteQuery({
        query: `
            SELECT r.*
            FROM roles r
            INNER JOIN user_roles ur ON ur.role_id = r.role_id
            WHERE ur.user_id = ? AND r.deleted_at IS NULL
            LIMIT 1
        `,
        values: [user_id],
    });
    if (roleRow) role = roleRow;

    // 5. Get permissions for the user's role(s)
    let permissions = [];
    if (role) {
        permissions = await excuteQuery({
            query: `
                SELECT p.*
                FROM permissions p
                INNER JOIN role_permissions rp ON rp.permission_id = p.permission_id
                WHERE rp.role_id = ? AND p.deleted_at IS NULL
            `,
            values: [role.role_id],
        });
    }

    // You can expand this to support multiple roles/permissions per user if needed!

    return {
        account: accounts[0] || null,
        sites,
        role: role || null,
        permissions,
    };
}

export async function checkPermission({ permission_id, role_id, user_id }) {
    //check if user has permission to access the resource

    return true; // or false based on permission check
}

const miscHelpers = { getUserDetails, checkPermission };
export default miscHelpers;
