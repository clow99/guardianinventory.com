import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import excuteQuery from "@/lib/db";
import { verifyPassword } from "@/lib/auth";

async function upsertUserDynamic({ email, name }) {
    // Discover actual columns present in target DB and upsert accordingly
    try {
        const dbName = process.env.MYSQL_DATABASE;
        const colsRows = await excuteQuery({
            query: `SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = 'users'`,
            values: [dbName],
        });
        const cols = new Set((colsRows || []).map((r) => r.COLUMN_NAME));

        // Mandatory unique identifier
        const insertCols = ["email"];
        const insertVals = [email];
        const updates = [];

        // Name column preference: full_name > name > username (map from "name")
        if (cols.has("full_name")) {
            insertCols.push("full_name");
            insertVals.push(name || email);
            updates.push("full_name = VALUES(full_name)");
        } else if (cols.has("name")) {
            insertCols.push("name");
            insertVals.push(name || email);
            updates.push("name = VALUES(name)");
        } else if (cols.has("username")) {
            insertCols.push("username");
            insertVals.push(email);
            updates.push("username = VALUES(username)");
        }
        // Only write email + name variant; do not touch other columns
        const placeholders = insertCols.map(() => "?");
        const sql = `
            INSERT INTO users (${insertCols.join(", ")})
            VALUES (${placeholders.join(", ")})
            ON DUPLICATE KEY UPDATE ${updates.join(", ")}
        `;

        await excuteQuery({ query: sql, values: insertVals });
    } catch (e) {
        console.error("[auth][jwt] dynamic upsert failed:", e?.message || e);
        throw e;
    }
}

const devSecret =
    process.env.NODE_ENV !== "production"
        ? process.env.NEXTAUTH_SECRET || "dev-nextauth-secret-change-me"
        : process.env.NEXTAUTH_SECRET;

export const authOptions = {
    secret: devSecret,
    // In development on localhost or plain HTTP, avoid Secure cookies to prevent silent drops
    useSecureCookies:
        process.env.NODE_ENV === "production" &&
        ((process.env.NEXTAUTH_URL || "").startsWith("https://") ||
            !!process.env.VERCEL),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const { username, password } = credentials || {};
                if (!username || !password) return null;
                const rows = await excuteQuery({
                    query: "SELECT * FROM users WHERE username = ? LIMIT 1",
                    values: [username],
                });
                const user = Array.isArray(rows) && rows[0];
                if (!user) return null;
                const ok = await verifyPassword(password, user.password);
                if (!ok) return null;
                return {
                    id: user.id,
                    name: user.full_name || user.username || user.email,
                    email: user.email,
                };
            },
        }),
    ],
    pages: {
        signIn: "/auth/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        // Refresh the session token more frequently on activity to avoid edge expirations
        // and clock-skew issues. This triggers a lightweight refresh via the SessionProvider.
        updateAge: 60 * 60, // 1 hour
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async signIn({ user, email }) {
            // Enforce account membership for all non-admin users
            try {
                const emailAddr = user?.email || email?.email;
                if (!emailAddr) return true; // allow if we somehow don't have an email

                // Ensure the user row exists (important for first-time OAuth sign-ins)
                try {
                    await upsertUserDynamic({
                        email: emailAddr,
                        name: user?.name || emailAddr,
                    });
                } catch {}

                // Admins are exempt
                const users = await excuteQuery({
                    query: "SELECT id, is_admin FROM users WHERE email = ? LIMIT 1",
                    values: [emailAddr],
                });
                const row = Array.isArray(users) ? users[0] : null;
                const isAdmin = row ? Number(row.is_admin) === 1 : false;
                if (isAdmin) return true;

                // If the user has any account membership, allow sign-in to proceed
                const membership = await excuteQuery({
                    query: `SELECT 1
                           FROM account_users au
                           JOIN users u ON u.id = au.user_id
                           WHERE u.email = ?
                           LIMIT 1`,
                    values: [emailAddr],
                });
                if (Array.isArray(membership) && membership[0]) return true;

                // Otherwise, send them to join an account
                return "/auth/join-account";
            } catch (e) {
                console.warn(
                    "[auth][signIn] membership check failed:",
                    e?.message || e
                );
                return true; // fail-open to avoid blocking sign-in unexpectedly
            }
        },
        async jwt({ token, user, account, trigger, session }) {
            // On first sign in, initialize account_id if you have one on the user object
            if (user && token && token.account_id === undefined) {
                token.account_id = null; // default; can be set later via session.update
            }
            // On initial sign-in, upsert user details (handles Google reliably)
            if (user && user.email) {
                console.log("[auth][jwt] upsert on sign-in", {
                    email: user.email,
                    name: user.name,
                });
                try {
                    await upsertUserDynamic({
                        email: user.email,
                        name: user.name || user.email,
                    });
                } catch {}
            }
            // Ensure is_admin is on the token so middleware can enforce admin access without DB
            if (token?.email && (user || token.is_admin === undefined)) {
                try {
                    const rows = await excuteQuery({
                        query: "SELECT is_admin FROM users WHERE email = ? LIMIT 1",
                        values: [token.email],
                    });
                    const isAdmin =
                        Array.isArray(rows) && rows[0]
                            ? Number(rows[0].is_admin) === 1
                            : false;
                    token.is_admin = isAdmin;
                } catch (e) {
                    console.warn(
                        "[auth][jwt] is_admin fetch failed:",
                        e?.message || e
                    );
                }
            }
            // Allow client to update account on the fly: useSession().update({ account_id })
            if (trigger === "update" && session?.account_id !== undefined) {
                const requested = Number(session.account_id);
                if (
                    Number.isFinite(requested) &&
                    requested > 0 &&
                    token?.email
                ) {
                    try {
                        const users = await excuteQuery({
                            query: "SELECT id FROM users WHERE email = ? LIMIT 1",
                            values: [token.email],
                        });
                        const user = Array.isArray(users) && users[0];
                        const userId = user ? Number(user.id) : null;

                        let isMember = false;
                        if (userId) {
                            const membership = await excuteQuery({
                                query: `
                                    SELECT 1
                                    FROM account_users
                                    WHERE user_id = ? AND account_id = ?
                                    LIMIT 1
                                `,
                                values: [userId, requested],
                            });
                            isMember = Array.isArray(membership) && membership[0];
                        }

                        if (isMember || token?.is_admin) {
                            token.account_id = requested;
                            if (isMember) {
                                // Persist last_selected marker for genuine members
                                await excuteQuery({
                                    query: `UPDATE account_users SET custom_fields = JSON_SET(COALESCE(custom_fields, '{}'), '$.last_selected', false) WHERE user_id = ?`,
                                    values: [userId],
                                });
                                await excuteQuery({
                                    query: `UPDATE account_users SET custom_fields = JSON_SET(COALESCE(custom_fields, '{}'), '$.last_selected', true) WHERE user_id = ? AND account_id = ?`,
                                    values: [userId, requested],
                                });
                            }
                        } else {
                            console.warn(
                                "[auth][jwt] blocked account switch for non-member",
                                { email: token.email, requested }
                            );
                        }
                    } catch (e) {
                        console.warn(
                            "[auth][jwt] account switch failed:",
                            e?.message || e
                        );
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                // If account_id not yet in token, try hydrate from last_selected
                if (
                    (token?.account_id === null ||
                        token?.account_id === undefined) &&
                    token?.email
                ) {
                    try {
                        const rows = await excuteQuery({
                            query: `
                                SELECT au.account_id
                                FROM account_users au
                                JOIN users u ON u.id = au.user_id
                                WHERE u.email = ?
                                  AND JSON_EXTRACT(COALESCE(au.custom_fields, '{}'), '$.last_selected') = true
                                LIMIT 1
                            `,
                            values: [token.email],
                        });
                        if (rows && rows[0]?.account_id) {
                            token.account_id = Number(rows[0].account_id);
                        }
                    } catch {}
                }
                session.user.account_id = token?.account_id ?? null;
                session.user.is_admin = token?.is_admin ?? false;
            }
            return session;
        },
        // No-op signIn; persistence handled in jwt callback above
    },
    // ...other options
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
