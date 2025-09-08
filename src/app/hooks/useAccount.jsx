"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

export function useAccount() {
    const { data: session, update } = useSession();
    // Local state gives us instant reactivity without waiting for session.update roundtrips
    const [accountId, setAccountIdState] = useState(() => {
        const initial = session?.user?.account_id ?? null;
        return initial ? Number(initial) : null;
    });

    // Keep local state in sync when the session value changes (e.g., login or refresh)
    const lastSessionAccRef = useRef(session?.user?.account_id ?? null);
    useEffect(() => {
        const sessAcc = session?.user?.account_id ?? null;
        if (sessAcc !== lastSessionAccRef.current) {
            lastSessionAccRef.current = sessAcc;
            if (Number.isFinite(Number(sessAcc)) && Number(sessAcc) > 0) {
                setAccountIdState(Number(sessAcc));
            }
        }
    }, [session?.user?.account_id]);

    const setAccountId = async (id) => {
        const num = Number(id);
        if (!Number.isFinite(num) || num <= 0) return;
        // Optimistic local update so UI reacts immediately
        setAccountIdState(num);
        // Persist cookie/localStorage early so server sees it on next requests
        try {
            document.cookie = `account_id=${num}; path=/; max-age=${
                30 * 24 * 60 * 60
            }`;
            localStorage.setItem("lastAccountId", String(num));
        } catch {}
        // Persist to session/JWT and storage for server-side and future loads
        try {
            await update({ account_id: num });
        } catch {}
        // Broadcast after persistence so any reload sees the correct state
        try {
            window.dispatchEvent(
                new CustomEvent("account:change", {
                    detail: { account_id: num },
                })
            );
        } catch {}
    };
    return { accountId, setAccountId };
}
