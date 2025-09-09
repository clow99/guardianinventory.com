"use client";

import { useEffect, useState } from "react";

export default function NotificationsPanel() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [me, setMe] = useState(null);
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [rows, setRows] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/auth/me");
                const json = await res.json();
                if (json?.ok) setMe(json.me);
            } catch {}
        })();
    }, []);

    useEffect(() => {
        if (!me) return;
        (async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch("/api/notifications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: me?.id, unreadOnly }),
                });
                const json = await res.json();
                if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to load notifications");
                setRows(json.data || []);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [me, unreadOnly]);

    async function markRead(id) {
        await fetch("/api/notifications/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, read_at: new Date().toISOString() } : r)));
    }

    async function remove(id) {
        await fetch("/api/notifications/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setRows((prev) => prev.filter((r) => r.id !== id));
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-neutral-300 text-sm">
                    <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
                    Unread only
                </label>
                {loading && <span className="text-xs text-neutral-400">Loading...</span>}
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <div className="border border-neutral-700 rounded divide-y divide-neutral-800">
                {rows.map((n) => (
                    <div key={n.id} className="p-3 flex items-start gap-3">
                        <div className="flex-1">
                            <div className="text-neutral-200 font-semibold">{n.title || n.type}</div>
                            <div className="text-neutral-300 text-sm whitespace-pre-wrap">{n.message}</div>
                            <div className="text-neutral-500 text-xs mt-1">{new Date(n.created_at).toLocaleString()}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            {!n.read_at && (
                                <button className="text-xs bg-neutral-800 hover:bg-neutral-700 rounded px-2 py-1" onClick={() => markRead(n.id)}>
                                    Mark read
                                </button>
                            )}
                            <button className="text-xs text-red-400 hover:text-red-300" onClick={() => remove(n.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                {!rows.length && (
                    <div className="p-3 text-neutral-400 text-sm">No notifications.</div>
                )}
            </div>
        </div>
    );
}

