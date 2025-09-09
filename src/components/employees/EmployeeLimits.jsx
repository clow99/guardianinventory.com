"use client";

import { useEffect, useState } from "react";
import AnimatedInput from "@/components/inputs/AnimatedInput";

export default function EmployeeLimits() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [q, setQ] = useState("");

    async function load() {
        try {
            setLoading(true);
            setError("");
            const res = await fetch("/api/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to load employees");
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

    async function updateLimit(employee_id, value) {
        const custom_fields = (() => {
            try {
                const curr = rows.find((r) => r.employee_id === employee_id)?.custom_fields || {};
                return { ...(typeof curr === "object" ? curr : {}), asset_limit: value !== "" ? Number(value) : null };
            } catch {
                return { asset_limit: value !== "" ? Number(value) : null };
            }
        })();
        await fetch("/api/employees/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employee_id, custom_fields }),
        });
        setRows((prev) => prev.map((r) => (r.employee_id === employee_id ? { ...r, custom_fields } : r)));
    }

    const filtered = rows.filter((r) => {
        const s = (r.full_name || r.username || r.email || "").toLowerCase();
        return s.includes(q.toLowerCase());
    });

    return (
        <div className="space-y-3">
            <div className="flex items-end gap-3">
                <AnimatedInput id="search" label="Search employees" value={q} onChange={(e) => setQ(e.target.value)} />
                {loading && <span className="text-xs text-neutral-400">Loading...</span>}
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <table className="w-full text-sm">
                <thead className="text-neutral-400">
                    <tr>
                        <th className="text-left px-2 py-1">Employee</th>
                        <th className="text-left px-2 py-1">Asset Limit</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((e) => {
                        const cf = typeof e.custom_fields === "object" ? e.custom_fields : {};
                        const limit = cf?.asset_limit ?? "";
                        return (
                            <tr key={e.employee_id} className="border-t border-neutral-800">
                                <td className="px-2 py-2">
                                    <div className="text-neutral-100">{e.full_name || e.username || e.email}</div>
                                    <div className="text-neutral-400 text-xs">{e.department || e.job_title || ""}</div>
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="No limit"
                                        className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200 w-32"
                                        value={limit === null ? "" : String(limit)}
                                        onChange={(e2) => updateLimit(e.employee_id, e2.target.value)}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                    {!filtered.length && (
                        <tr>
                            <td className="px-2 py-3 text-neutral-400" colSpan={2}>No employees.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

