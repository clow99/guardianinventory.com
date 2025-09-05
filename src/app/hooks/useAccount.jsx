"use client";

import { useSession } from "next-auth/react";

export function useAccount() {
    const { data: session, update } = useSession();
    const accountId = session?.user?.account_id ?? null;
    const setAccountId = async (id) => {
        const num = Number(id);
        if (!Number.isFinite(num) || num <= 0) return;
        await update({ account_id: num });
        try {
            // also set cookie for server fallbacks
            document.cookie = `account_id=${num}; path=/; max-age=${
                30 * 24 * 60 * 60
            }`;
            localStorage.setItem("lastAccountId", String(num));
        } catch {}
    };
    return { accountId, setAccountId };
}
