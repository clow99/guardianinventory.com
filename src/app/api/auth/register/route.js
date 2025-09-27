import { NextResponse } from "next/server";
import {
    findUserByEmail,
    findUserByUsername,
    createUser,
} from "@/lib/userHelper";
import { hashPassword } from "@/lib/auth";
import excuteQuery from "@/lib/db";
import { ensureCoreUserAccountTables } from "@/lib/schemaSetup";

function isSelfSignupEnabled() {
    if (process.env.ENABLE_SELF_SIGNUP === "1") return true;
    if (process.env.ENABLE_SELF_SIGNUP === "0") return false;
    return process.env.NODE_ENV !== "production";
}

function sanitizeEmail(email = "") {
    return String(email).trim().toLowerCase();
}

function sanitizeUsername(username = "") {
    return String(username).trim();
}

async function createAccountForUser({ accountName, userId, email }) {
    const baseName = accountName.trim();
    const maxAttempts = 3;
    const now = new Date();
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const nameAttempt =
            attempt === 0 ? baseName : `${baseName} (${attempt + 1})`;
        try {
            const accountRes = await excuteQuery({
                query: `INSERT INTO accounts (account_name, description, custom_fields, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?)`,
                values: [
                    nameAttempt,
                    null,
                    JSON.stringify({ created_via: "self-signup", owner_email: email }),
                    now,
                    now,
                ],
            });
            const accountId = accountRes.insertId;

            // Ensure no other memberships claim last_selected
            await excuteQuery({
                query: `UPDATE account_users
                        SET custom_fields = JSON_SET(COALESCE(custom_fields, '{}'), '$.last_selected', false)
                        WHERE user_id = ?`,
                values: [userId],
            });

            // Upsert membership for the creator and mark as last selected
            await excuteQuery({
                query: `INSERT INTO account_users (account_id, user_id, role_id, custom_fields)
                        VALUES (?, ?, NULL, JSON_SET('{}', '$.last_selected', true, '$.joined_via', 'self-signup'))
                        ON DUPLICATE KEY UPDATE
                            custom_fields = JSON_SET(COALESCE(custom_fields, '{}'), '$.last_selected', true, '$.joined_via', 'self-signup'),
                            updated_at = NOW()`,
                values: [accountId, userId],
            });

            // Promote creator to admin for convenience in local environments
            await excuteQuery({
                query: `UPDATE users SET is_admin = 1 WHERE id = ?`,
                values: [userId],
            });

            return { account_id: accountId, account_name: nameAttempt };
        } catch (err) {
            if (err?.code === "ER_DUP_ENTRY") {
                continue;
            }
            throw err;
        }
    }
    throw new Error("Unable to create account with a unique name");
}

export async function POST(req) {
    try {
        const allowAccountCreation = isSelfSignupEnabled();
        const { username, email, password, accountName, fullName } =
            (await req.json()) || {};

        const cleanEmail = sanitizeEmail(email);
        const cleanUsername = sanitizeUsername(username);

        if (!cleanUsername || !cleanEmail || !password) {
            return NextResponse.json(
                { message: "Missing fields" },
                { status: 400 }
            );
        }

        // Ensure tables exist before we attempt inserts in local development
        if (allowAccountCreation) {
            try {
                await ensureCoreUserAccountTables();
            } catch (schemaErr) {
                console.warn(
                    "[register] ensureCoreUserAccountTables failed:",
                    schemaErr?.message || schemaErr
                );
            }
        }

        const [byEmail, byUser] = await Promise.all([
            findUserByEmail(cleanEmail),
            findUserByUsername(cleanUsername),
        ]);
        if (byEmail)
            return NextResponse.json(
                { message: "Email already in use" },
                { status: 409 }
            );
        if (byUser)
            return NextResponse.json(
                { message: "Username already in use" },
                { status: 409 }
            );

        const passwordHash = await hashPassword(password);
        const displayName = (fullName || cleanUsername || cleanEmail).trim();
        const insertRes = await createUser({
            username: cleanUsername,
            email: cleanEmail,
            passwordHash,
            fullName: displayName,
        });
        const userId = insertRes?.insertId;
        if (!userId) {
            throw new Error("User insert did not return an id");
        }

        let accountInfo = null;
        if (allowAccountCreation) {
            const derivedAccountName =
                typeof accountName === "string" && accountName.trim()
                    ? accountName.trim()
                    : `${displayName || cleanUsername || cleanEmail}'s Account`;
            try {
                accountInfo = await createAccountForUser({
                    accountName: derivedAccountName,
                    userId,
                    email: cleanEmail,
                });
            } catch (err) {
                console.warn(
                    "[register] account creation failed; proceeding without account:",
                    err?.message || err
                );
            }
        }

        const res = NextResponse.json({
            ok: true,
            account: accountInfo,
            selfSignupEnabled: allowAccountCreation,
        });
        if (accountInfo?.account_id) {
            res.cookies.set("account_id", String(accountInfo.account_id), {
                path: "/",
                httpOnly: true,
            });
        }
        return res;
    } catch (e) {
        console.error("[register] Server error:", e?.message || e);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
