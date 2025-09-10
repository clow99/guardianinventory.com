"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { startSessionHeartbeat, stopSessionHeartbeat } from "@/lib/authClient";

export default function SessionWrapperClient({ children, session = null }) {
    useEffect(() => {
        // Keep the session warm while the tab is active
        startSessionHeartbeat({ intervalMs: 3 * 60 * 1000 });
        return () => stopSessionHeartbeat();
    }, []);

    // Reload the entire page when the active account changes
    useEffect(() => {
        if (typeof window === "undefined") return;
        // Avoid duplicate listeners across multiple wrappers/usages
        if (window.__accountReloadListenerRegistered) return;
        window.__accountReloadListenerRegistered = true;
        // Signal to data views that we perform a hard reload on account change
        window.__accountHardReloadOnAccountChange = true;

        const onAccountChange = () => {
            // Small delay ensures cookie writes/async state flush before reload
            setTimeout(() => {
                try {
                    window.location.reload();
                } catch {
                    // Fallback if reload throws due to browser quirks
                    window.location.assign(window.location.href);
                }
            }, 75);
        };
        window.addEventListener("account:change", onAccountChange);
        return () => {
            window.removeEventListener("account:change", onAccountChange);
            // Intentionally keep the registration flag to avoid duplicate bindings across remounts
        };
    }, []);

    return (
        <SessionProvider
            session={session}
            // Refresh session occasionally and on focus to mitigate silent expiry
            refetchOnWindowFocus={true}
            refetchInterval={5 * 60} // 5 minutes
        >
            {children}
        </SessionProvider>
    );
}
