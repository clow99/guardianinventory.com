export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import { getAllProducts } from "@/lib/productHelper";
import excuteQuery from "@/lib/db";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const q = (searchParams.get("q") || "").trim().toLowerCase();
        let accountId = Number(searchParams.get("account_id"));
        let source = "query";
        // Prepare auth token (used for fallback resolution and membership checks)
        const isHttps =
            (process.env.NEXTAUTH_URL || "").startsWith("https://") ||
            !!process.env.VERCEL;
        const cookieName = isHttps
            ? "__Secure-next-auth.session-token"
            : "next-auth.session-token";
        const secret =
            process.env.NEXTAUTH_SECRET || "dev-nextauth-secret-change-me";
        const token = await getToken({ req, secret, cookieName });

        if (!Number.isFinite(accountId) || accountId <= 0) {
            // try cookie
            try {
                const cookieStore = await cookies();
                const accCookie = cookieStore.get("account_id")?.value;
                const accFromCookie = Number(accCookie);
                if (Number.isFinite(accFromCookie) && accFromCookie > 0) {
                    accountId = accFromCookie;
                    source = "cookie";
                }
            } catch {}
        }

        if (!Number.isFinite(accountId) || accountId <= 0) {
            // try token
            if (token?.account_id && Number(token.account_id) > 0) {
                accountId = Number(token.account_id);
                source = "token";
            } else if (token?.email) {
                // Fallback: look up last_selected or first membership for this user
                try {
                    const rows = await excuteQuery({
                        query: `
                            SELECT au.account_id
                            FROM account_users au
                            JOIN users u ON u.id = au.user_id
                            WHERE u.email = ?
                            ORDER BY JSON_EXTRACT(COALESCE(au.custom_fields, '{}'), '$.last_selected') = true DESC,
                                     au.created_at ASC
                            LIMIT 1
                        `,
                        values: [token.email],
                    });
                    if (rows && rows[0]?.account_id) {
                        accountId = Number(rows[0].account_id);
                        source = "db-fallback";
                    }
                } catch {}
            }
        }

        if (!Number.isFinite(accountId) || accountId <= 0) {
            // No account context; return empty list rather than 400 so UI can show empty state
            const res = NextResponse.json(
                {
                    success: true,
                    data: [],
                    meta: { account_id: null, source: "none" },
                },
                { status: 200 }
            );
            res.headers.set("Cache-Control", "no-store");
            return res;
        }

        // Membership guard: ensure requesting user is allowed to see this account's products
        if (token?.email) {
            try {
                const users = await excuteQuery({
                    query: "SELECT id, is_admin FROM users WHERE email = ? LIMIT 1",
                    values: [token.email],
                });
                const user = Array.isArray(users) && users[0];
                const isAdmin = !!(token?.is_admin || user?.is_admin);
                if (!isAdmin) {
                    const rows = await excuteQuery({
                        query: `SELECT 1 FROM account_users WHERE account_id = ? AND user_id = ? LIMIT 1`,
                        values: [accountId, user?.id || 0],
                    });
                    if (!rows || !rows.length) {
                        return NextResponse.json(
                            {
                                success: false,
                                error: "Forbidden: not a member of this account",
                            },
                            { status: 403 }
                        );
                    }
                }
            } catch (e) {
                // On error, fail closed only if we have a token but cannot validate membership
                // To avoid blocking admin flows, allow if token claims admin
                if (!token?.is_admin) {
                    return NextResponse.json(
                        { success: false, error: "Forbidden" },
                        { status: 403 }
                    );
                }
            }
        }

        let products = await getAllProducts({ account_id: accountId });
        if (q) {
            const fields = [
                "product_name",
                "product_description",
                "category_name",
                "manufacturer_name",
                "supplier_name",
            ];
            const norm = (v) => (typeof v === "string" ? v.toLowerCase() : "");
            products = products.filter((p) =>
                fields.some((f) => norm(p[f]).includes(q))
            );
        }
        // Optional server-side debug to verify account routing during dev
        if (process.env.NODE_ENV !== "production") {
            console.info(
                "[products/list] account_id=",
                accountId,
                "source=",
                source,
                "count=",
                (products || []).length
            );
        }
        const res = NextResponse.json(
            {
                success: true,
                data: products || [],
                meta: { account_id: accountId, source },
            },
            { status: 200 }
        );
        res.headers.set("Cache-Control", "no-store");
        return res;
    } catch (error) {
        console.error("/api/products/list error:", error);
        const res = NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching products.",
            },
            { status: 500 }
        );
        res.headers.set("Cache-Control", "no-store");
        return res;
    }
}
