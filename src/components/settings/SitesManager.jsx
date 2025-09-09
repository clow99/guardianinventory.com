"use client";

import { useEffect, useMemo, useState } from "react";
import AnimatedInput from "@/components/inputs/AnimatedInput";
import AnimatedTextarea from "@/components/inputs/AnimatedTextarea";
import AnimatedSelect from "@/components/inputs/AnimatedSelect";
import { useAccount } from "@/app/hooks/useAccount";

export default function SitesManager() {
    const { accountId } = useAccount();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sites, setSites] = useState([]);
    const [q, setQ] = useState("");

    const [form, setForm] = useState({ site_name: "", site_description: "", address: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!accountId) return;
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch("/api/sites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ account_id: Number(accountId), activeOnly: true }),
                });
                const json = await res.json();
                if (!cancelled) {
                    if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to load sites");
                    setSites(json.data || []);
                }
            } catch (e) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [accountId]);

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return sites;
        return (sites || []).filter((s) =>
            (s.site_name || "").toLowerCase().includes(needle) ||
            (s.address || "").toLowerCase().includes(needle)
        );
    }, [sites, q]);

    async function createSite() {
        if (!accountId || !form.site_name.trim()) return;
        try {
            setSaving(true);
            const res = await fetch("/api/sites/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    account_id: Number(accountId),
                    site_name: form.site_name.trim(),
                    site_description: form.site_description || null,
                    address: form.address || null,
                }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Create failed");
            setSites((prev) => [json.data, ...prev]);
            setForm({ site_name: "", site_description: "", address: "" });
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    async function updateSite(site_id, updates) {
        await fetch("/api/sites/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ site_id, ...updates }),
        });
        setSites((prev) => prev.map((s) => (s.site_id === site_id ? { ...s, ...updates } : s)));
    }

    async function removeSite(site_id) {
        await fetch("/api/sites/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ site_id }),
        });
        setSites((prev) => prev.filter((s) => s.site_id !== site_id));
    }

    if (!accountId)
        return <div className="text-neutral-300">Select an account to manage sites.</div>;

    return (
        <div className="space-y-4">
            <div className="border border-neutral-700 rounded p-3">
                <h2 className="text-white font-semibold mb-3">Add Site</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <AnimatedInput id="site_name" label="Site name" value={form.site_name} onChange={(e) => setForm((f) => ({ ...f, site_name: e.target.value }))} />
                    <AnimatedInput id="address" label="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
                    <AnimatedInput id="desc" label="Description" value={form.site_description} onChange={(e) => setForm((f) => ({ ...f, site_description: e.target.value }))} />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                    {error && <span className="text-red-400 text-sm mr-auto">{error}</span>}
                    <button className="bg-orange-500/80 hover:bg-orange-500 text-white rounded px-4 py-2 text-sm disabled:opacity-60" disabled={saving || !form.site_name.trim()} onClick={createSite}>
                        {saving ? "Saving..." : "Add site"}
                    </button>
                </div>
            </div>

            <div className="flex items-end gap-3">
                <AnimatedInput id="search" label="Search sites" value={q} onChange={(e) => setQ(e.target.value)} />
                {loading && <span className="text-xs text-neutral-400">Loading...</span>}
            </div>

            <div className="border border-neutral-700 rounded overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-900 text-neutral-400">
                        <tr>
                            <th className="text-left px-2 py-2">Name</th>
                            <th className="text-left px-2 py-2">Address</th>
                            <th className="text-left px-2 py-2">Description</th>
                            <th className="text-right px-2 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((s) => (
                            <tr key={s.site_id} className="border-t border-neutral-800">
                                <td className="px-2 py-2 text-neutral-100">
                                    <input className="bg-transparent border border-transparent focus:border-neutral-600 rounded px-2 py-1" defaultValue={s.site_name} onBlur={(e) => updateSite(s.site_id, { site_name: e.target.value })} />
                                </td>
                                <td className="px-2 py-2">
                                    <input className="bg-transparent border border-transparent focus:border-neutral-600 rounded px-2 py-1 w-full" defaultValue={s.address || ""} onBlur={(e) => updateSite(s.site_id, { address: e.target.value || null })} />
                                </td>
                                <td className="px-2 py-2">
                                    <input className="bg-transparent border border-transparent focus:border-neutral-600 rounded px-2 py-1 w-full" defaultValue={s.site_description || ""} onBlur={(e) => updateSite(s.site_id, { site_description: e.target.value || null })} />
                                </td>
                                <td className="px-2 py-2 text-right">
                                    <button className="text-red-400 hover:text-red-300" onClick={() => removeSite(s.site_id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {!filtered.length && (
                            <tr>
                                <td className="px-2 py-3 text-neutral-400" colSpan={4}>No sites.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

