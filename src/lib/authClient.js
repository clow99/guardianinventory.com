"use client";

import { getSession, signIn } from "next-auth/react";

// Fetch wrapper that automatically retries once on 401 by refreshing the session.
export async function authFetch(input, init = {}) {
    const res = await fetch(input, init);
    if (res.status !== 401) return res;

    // Attempt a lightweight session refresh
    await getSession();

    const retry = await fetch(input, init);
    if (retry.status === 401) {
        // If still unauthorized, send the user to sign-in preserving return url
        const url =
            typeof window !== "undefined" ? window.location.href : "/app";
        signIn(undefined, { callbackUrl: url });
    }
    return retry;
}

let heartbeatTimer = null;

// Start a small heartbeat to keep the session warm while the tab is active.
export function startSessionHeartbeat({ intervalMs = 5 * 60 * 1000 } = {}) {
    stopSessionHeartbeat();
    // Only run in the foreground tab
    const tick = async () => {
        if (document.hidden) return;
        try {
            // Lightweight session refresh
            await getSession();
        } catch {}
    };
    heartbeatTimer = setInterval(tick, intervalMs);
}

export function stopSessionHeartbeat() {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
}
