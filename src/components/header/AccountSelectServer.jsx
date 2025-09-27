// Server Component that renders AccountSelect with SSR options
export const dynamic = "force-dynamic";
import excuteQuery from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AccountSelectClient from "./AccountSelectClient";

async function getAccounts(session) {
    try {
        const email = session?.user?.email || null;
        const isAdmin =
            session?.user?.is_admin === true ||
            session?.user?.is_admin === 1 ||
            session?.user?.is_admin === "1";

        if (!email && !isAdmin) {
            return [];
        }

        const rows = await excuteQuery({
            query: isAdmin
                ? `SELECT account_id, account_name FROM accounts WHERE deleted_at IS NULL ORDER BY created_at DESC`
                : `
                    SELECT a.account_id, a.account_name
                    FROM account_users au
                    JOIN users u ON u.id = au.user_id
                    JOIN accounts a ON a.account_id = au.account_id
                    WHERE u.email = ?
                      AND a.deleted_at IS NULL
                    ORDER BY a.created_at DESC
                `,
            values: isAdmin ? [] : [email],
        });
        return (rows || []).map((r) => ({
            value: String(r.account_id),
            label: r.account_name,
        }));
    } catch (e) {
        console.warn(
            "[AccountSelectServer] accounts fetch failed:",
            e?.message || e
        );
        return [];
    }
}

async function getSelectedAccountId(session) {
    const tokenAccount = session?.user?.account_id ?? null;
    if (tokenAccount) return Number(tokenAccount);
    // Fallback: check last_selected in account_users
    if (session?.user?.email) {
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
                values: [session.user.email],
            });
            if (rows && rows[0]?.account_id) return Number(rows[0].account_id);
        } catch {}
    }
    return null;
}

export default async function AccountSelectServer(props) {
    const session = await getServerSession(authOptions).catch(() => null);
    const [options, selectedAccountIdRaw] = await Promise.all([
        getAccounts(session),
        getSelectedAccountId(session),
    ]);
    const optionIds = new Set(options.map((opt) => opt.value));
    const selectedAccountId = optionIds.has(
        String(selectedAccountIdRaw ?? "")
    )
        ? selectedAccountIdRaw
        : null;
    return (
        <AccountSelectClient
            options={options}
            selectedAccountId={selectedAccountId}
            {...props}
        />
    );
}
