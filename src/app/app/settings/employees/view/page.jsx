"use client";

import { useEffect, useMemo, useState } from "react";
import AnimatedInput from "@/components/inputs/AnimatedInput";

export default function EmployeesViewPage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [q, setQ] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch("/api/employees", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ active: true }),
                });
                const json = await res.json();
                if (!cancelled) {
                    if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to load employees");
                    setRows(json.data || []);
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
    }, []);

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return rows;
        return (rows || []).filter((r) =>
            (r.full_name || r.username || r.email || "").toLowerCase().includes(needle) ||
            (r.department || "").toLowerCase().includes(needle)
        );
    }, [rows, q]);

    async function deactivate(employee_id) {
        await fetch("/api/employees/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employee_id }),
        });
        setRows((prev) => prev.filter((r) => r.employee_id !== employee_id));
    }

    return (
        <div className="space-y-4">
            <h1 className="text-white text-2xl font-bold">Employees</h1>
            <div className="flex items-end gap-3">
                <AnimatedInput id="search" label="Search employees" value={q} onChange={(e) => setQ(e.target.value)} />
                {loading && <span className="text-xs text-neutral-400">Loading...</span>}
                {error && <span className="text-xs text-red-400">{error}</span>}
            </div>
            <div className="border border-neutral-700 rounded overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-900 text-neutral-400">
                        <tr>
                            <th className="text-left px-2 py-2">Employee</th>
                            <th className="text-left px-2 py-2">Department</th>
                            <th className="text-left px-2 py-2">Job Title</th>
                            <th className="text-right px-2 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((e) => (
                            <tr key={e.employee_id} className="border-t border-neutral-800">
                                <td className="px-2 py-2">
                                    <div className="text-neutral-100">{e.full_name || e.username || e.email}</div>
                                    <div className="text-neutral-400 text-xs">{e.email}</div>
                                </td>
                                <td className="px-2 py-2 text-neutral-300">{e.department || ""}</td>
                                <td className="px-2 py-2 text-neutral-300">{e.job_title || ""}</td>
                                <td className="px-2 py-2 text-right">
                                    <button className="text-red-400 hover:text-red-300" onClick={() => deactivate(e.employee_id)}>
                                        Deactivate
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!filtered.length && (
                            <tr>
                                <td className="px-2 py-3 text-neutral-400" colSpan={4}>No employees.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

