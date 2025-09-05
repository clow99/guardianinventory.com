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

        if (!Number.isFinite(accountId) || accountId <= 0) {
            // try cookie
            try {
                const cookieStore = await cookies();
                const accCookie = cookieStore.get("account_id")?.value;
                const accFromCookie = Number(accCookie);
                if (Number.isFinite(accFromCookie) && accFromCookie > 0) {
                    accountId = accFromCookie;
                }
            } catch {}
        }

        if (!Number.isFinite(accountId) || accountId <= 0) {
            // try token
            const isHttps = (process.env.NEXTAUTH_URL || "").startsWith("https://") || !!process.env.VERCEL;
            const cookieName = isHttps
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token";
            const secret = process.env.NEXTAUTH_SECRET || "dev-nextauth-secret-change-me";
            const token = await getToken({ req, secret, cookieName });
            if (token?.account_id && Number(token.account_id) > 0) {
                accountId = Number(token.account_id);
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
                    }
                } catch {}
            }
        }

        if (!Number.isFinite(accountId) || accountId <= 0) {
            // No account context; return empty list rather than 400 so UI can show empty state
            return NextResponse.json({ success: true, data: [] });
        }

        let products = await getAllProducts({ account_id: accountId });
        if (q) {
            const fields = ["product_name", "product_description", "category_name", "manufacturer_name", "supplier_name"];
            const norm = (v) => (typeof v === "string" ? v.toLowerCase() : "");
            products = products.filter((p) => fields.some((f) => norm(p[f]).includes(q)));
        }
        return NextResponse.json({ success: true, data: products || [] });
    } catch (error) {
        console.error("/api/products/list error:", error);
        return NextResponse.json(
            { success: false, error: error?.message || "Error fetching products." },
            { status: 500 }
        );
    }
}
