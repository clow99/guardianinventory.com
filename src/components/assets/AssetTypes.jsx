"use client";

import { useEffect, useState } from "react";

export default function AssetTypes() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch("/api/categories", { method: "POST" });
                const json = await res.json();
                if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to load categories");
                setRows(json.data || []);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="space-y-3">
            {loading && <div className="text-neutral-400 text-sm">Loading...</div>}
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <table className="w-full text-sm">
                <thead className="text-neutral-400">
                    <tr>
                        <th className="text-left px-2 py-1">Category</th>
                        <th className="text-left px-2 py-1">ID</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((c) => (
                        <tr key={c.category_id} className="border-t border-neutral-800">
                            <td className="px-2 py-2 text-neutral-100">{c.category_name}</td>
                            <td className="px-2 py-2 text-neutral-400">{c.category_id}</td>
                        </tr>
                    ))}
                    {!rows.length && !loading && (
                        <tr>
                            <td className="px-2 py-3 text-neutral-400" colSpan={2}>No categories found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

