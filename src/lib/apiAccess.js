import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { headers } from "next/headers";
import excuteQuery from "@/lib/db";

export async function getAuthContext() {
    // Test hook: allow tests to short-circuit auth without DB/next-auth
    if (
        process.env.TEST_AUTH === "1" &&
        process.env.NODE_ENV !== "production"
    ) {
        // Allow per-request overrides via headers to avoid relying on process env between test runs
        // Fallback to process.env when not provided.
        let hdrs = null;
        try {
            // Next.js 15 dynamic API: must await headers() in async contexts
            hdrs = await headers();
        } catch {}
        const get = (name) => (hdrs ? hdrs.get(name) : null);
        const hIsAdmin = get("x-test-is-admin");
        const hUserId = get("x-test-user-id");
        const hAccountId = get("x-test-account-id");

        const isAdmin =
            hIsAdmin !== null
                ? String(hIsAdmin) === "1"
                : String(process.env.TEST_IS_ADMIN || "0") === "1";
        const userId =
            hUserId !== null
                ? Number(hUserId)
                : Number(process.env.TEST_USER_ID || 0) || null;
        const accountId =
            hAccountId !== null
                ? Number(hAccountId)
                : Number(process.env.TEST_ACCOUNT_ID || 0) || null;

        if (process.env.NODE_ENV !== "production") {
            // Debug logging to help diagnose test header propagation issues
            console.warn(
                "[getAuthContext][TEST_AUTH] headers: isAdmin=",
                hIsAdmin,
                "userId=",
                hUserId,
                "accountId=",
                hAccountId
            );
            console.warn(
                "[getAuthContext][TEST_AUTH] computed: is_admin=",
                isAdmin,
                "user_id=",
                userId,
                "account_id=",
                accountId
            );
        }
        if (!userId) return { ok: false, status: 401, error: "Unauthorized" };
        return {
            ok: true,
            user_id: userId,
            is_admin: isAdmin,
            account_id: accountId,
            email: "test@example.com",
        };
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
