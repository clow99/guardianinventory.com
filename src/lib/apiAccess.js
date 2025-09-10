import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import excuteQuery from "@/lib/db";

export async function getAuthContext() {
    // Test hook: allow tests to short-circuit auth without DB/next-auth
    if (process.env.TEST_AUTH === "1" && process.env.NODE_ENV !== "production") {
        const isAdmin = String(process.env.TEST_IS_ADMIN || "0") === "1";
        const userId = Number(process.env.TEST_USER_ID || 0) || null;
        const accountId = Number(process.env.TEST_ACCOUNT_ID || 0) || null;
        if (!userId) return { ok: false, status: 401, error: "Unauthorized" };
        return { ok: true, user_id: userId, is_admin: isAdmin, account_id: accountId, email: "test@example.com" };
    }
    const session = await getServerSession(authOptions);
    const email = session?.user?.email || null;
    if (!email) return { ok: false, status: 401, error: "Unauthorized" };
    const rows = await excuteQuery({
        query: `SELECT id, is_admin FROM users WHERE email = ? LIMIT 1`,
        values: [email],
    });
    const user = Array.isArray(rows) ? rows[0] : null;
    if (!user) return { ok: false, status: 401, error: "Unauthorized" };
    return {
        ok: true,
        user_id: Number(user.id),
        is_admin: Number(user.is_admin) === 1,
        account_id: session?.user?.account_id || null,
        email,
    };
}

export async function requireAdmin() {
    const ctx = await getAuthContext();
    if (!ctx.ok) return ctx;
    if (!ctx.is_admin)
        return { ok: false, status: 403, error: "Admin access required" };
    return ctx;
}

export async function requireAccountMember(account_id) {
    const ctx = await getAuthContext();
    if (!ctx.ok) return ctx;
    if (ctx.is_admin) return ctx;
    const rows = await excuteQuery({
        query: `SELECT 1 FROM account_users WHERE account_id = ? AND user_id = ? LIMIT 1`,
        values: [Number(account_id), Number(ctx.user_id)],
    });
    if (!rows || !rows[0])
        return { ok: false, status: 403, error: "Account membership required" };
    return ctx;
}
