"use client";

import { useEffect, useState } from "react";

export default function AccountsList({ refreshKey }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const res = await fetch("/api/accounts/list", {
                    cache: "no-store",
                });
                const data = await res.json();
                if (!data.success)
                    throw new Error(data.error || "Error fetching accounts");
                if (!ignore) setItems(data.data);
            } catch (err) {
                if (!ignore) setError(err.message);
            } finally {
                if (!ignore) setLoading(false);
            }
        }
        load();
        return () => {
            ignore = true;
        };
    }, [refreshKey]);

    if (loading && items.length === 0)
        return <div className="text-neutral-400">Loading accounts…</div>;
    if (error) return <div className="text-red-400">{error}</div>;
    if (items.length === 0)
        return <div className="text-neutral-400">No accounts yet.</div>;

    return (
        <div className="space-y-2">
            {items.map((a) => (
                <div
                    key={a.account_id}
                    className="border border-neutral-700 rounded p-3 bg-neutral-800 text-neutral-200"
                >
                    <div className="font-semibold">{a.account_name}</div>
                    {a.description && (
                        <div className="text-sm text-neutral-400">
                            {a.description}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
