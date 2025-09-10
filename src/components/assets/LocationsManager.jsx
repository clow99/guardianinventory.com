"use client";

import { useEffect, useMemo, useState } from "react";
import AnimatedInput from "@/components/inputs/AnimatedInput";

export default function LocationsManager() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [rows, setRows] = useState([]);
    const [q, setQ] = useState("");
    const [form, setForm] = useState({ location_name: "", address: "" });
    const [saving, setSaving] = useState(false);

    async function load() {
        try {
            setLoading(true);
            setError("");
            const res = await fetch("/api/locations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activeOnly: true }) });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to load locations");
            setRows(json.data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function create() {
        if (!form.location_name.trim()) return;
        try {
            setSaving(true);
            const res = await fetch("/api/locations/add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location_name: form.location_name.trim(), address: form.address || null }) });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Create failed");
            setRows((prev) => [json.data, ...prev]);
            setForm({ location_name: "", address: "" });
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    async function update(location_id, updates) {
        await fetch("/api/locations/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location_id, ...updates }) });
        setRows((prev) => prev.map((r) => (r.location_id === location_id ? { ...r, ...updates } : r)));
    }

    async function remove(location_id) {
        await fetch("/api/locations/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location_id }) });
        setRows((prev) => prev.filter((r) => r.location_id !== location_id));
    }

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return rows;
        return (rows || []).filter((r) => (r.location_name || "").toLowerCase().includes(needle) || (r.address || "").toLowerCase().includes(needle));
    }, [rows, q]);

    return (
        <div className="space-y-4">
            <div className="border border-neutral-700 rounded p-3">
                <h2 className="text-white font-semibold mb-2">Add Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <AnimatedInput id="loc_name" label="Location name" value={form.location_name} onChange={(e) => setForm((f) => ({ ...f, location_name: e.target.value }))} />
                    <AnimatedInput id="loc_addr" label="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                    {error && <span className="text-red-400 text-sm mr-auto">{error}</span>}
                    <button className="bg-orange-500/80 hover:bg-orange-500 text-white rounded px-4 py-2 text-sm disabled:opacity-60" disabled={saving || !form.location_name.trim()} onClick={create}>
                        {saving ? "Saving..." : "Add location"}
                    </button>
                </div>
            </div>

            <div className="flex items-end gap-3">
                <AnimatedInput id="search" label="Search locations" value={q} onChange={(e) => setQ(e.target.value)} />
                {loading && <span className="text-xs text-neutral-400">Loading...</span>}
            </div>

            <div className="border border-neutral-700 rounded overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-900 text-neutral-400">
                        <tr>
                            <th className="text-left px-2 py-2">Name</th>
                            <th className="text-left px-2 py-2">Address</th>
                            <th className="text-right px-2 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((l) => (
                            <tr key={l.location_id} className="border-t border-neutral-800">
                                <td className="px-2 py-2 text-neutral-100">
                                    <input className="bg-transparent border border-transparent focus:border-neutral-600 rounded px-2 py-1" defaultValue={l.location_name} onBlur={(e) => update(l.location_id, { location_name: e.target.value })} />
                                </td>
                                <td className="px-2 py-2">
                                    <input className="bg-transparent border border-transparent focus:border-neutral-600 rounded px-2 py-1 w-full" defaultValue={l.address || ""} onBlur={(e) => update(l.location_id, { address: e.target.value || null })} />
                                </td>
                                <td className="px-2 py-2 text-right">
                                    <button className="text-red-400 hover:text-red-300" onClick={() => remove(l.location_id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {!filtered.length && (
                            <tr>
                                <td className="px-2 py-3 text-neutral-400" colSpan={3}>No locations.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

