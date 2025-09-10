"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "@/app/hooks/useAccount";
import { CheckSquare, Square, UserPlus } from "lucide-react";

export default function AssignPage() {
    const { accountId } = useAccount();
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState([]);
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [employeeQuery, setEmployeeQuery] = useState("");
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [assigning, setAssigning] = useState(false);
    const canAssign = useMemo(
        () => selectedIds.size > 0 && !!selectedEmployeeId,
        [selectedIds, selectedEmployeeId]
    );

    // Load assets for current account
    useEffect(() => {
        let ignore = false;
        async function load() {
            if (!accountId) return;
            setLoading(true);
            try {
                const u = new URL("/api/assets/list", window.location.origin);
                u.searchParams.set("account_id", String(accountId));
                const res = await fetch(u.toString(), { cache: "no-store" });
                const data = await res.json();
                if (!data.success) throw new Error(data.error || "Failed");
                if (!ignore)
                    setAssets(Array.isArray(data.data) ? data.data : []);
            } catch (e) {
                console.warn("[assign] assets load failed:", e?.message || e);
                if (!ignore) setAssets([]);
            } finally {
                if (!ignore) setLoading(false);
            }
        }
        setAssets([]);
        setSelectedIds(new Set());
        setPage(0);
        load();
        return () => {
            ignore = true;
        };
    }, [accountId]);

    // Search employees (basic: fetch all, filter client-side by query)
    useEffect(() => {
        let ignore = false;
        async function loadEmployees() {
            try {
                const res = await fetch("/api/employees", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ active: true }),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.error || "Failed");
                if (!ignore)
                    setEmployees(Array.isArray(data.data) ? data.data : []);
            } catch (e) {
                console.warn(
                    "[assign] employees load failed:",
                    e?.message || e
                );
                if (!ignore) setEmployees([]);
            }
        }
        loadEmployees();
        return () => {
            ignore = true;
        };
    }, []);

    const filteredEmployees = useMemo(() => {
        const q = employeeQuery.trim().toLowerCase();
        if (!q) return employees;
        return employees.filter((e) => {
            const name = String(
                e.full_name || e.username || e.email || ""
            ).toLowerCase();
            const dept = String(e.department || "").toLowerCase();
            return name.includes(q) || dept.includes(q);
        });
    }, [employeeQuery, employees]);

    function toggleSelect(assetId) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(assetId)) next.delete(assetId);
            else next.add(assetId);
            return next;
        });
    }

    // Pagination helpers
    const total = assets.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const start = page * pageSize;
    const end = Math.min(start + pageSize, total);
    const pageItems = assets.slice(start, end);

    function toggleSelectAll() {
        // Operate only on current page
        const pageIds = new Set(pageItems.map((a) => a.asset_id));
        const allSelectedOnPage = pageItems.every((a) =>
            selectedIds.has(a.asset_id)
        );
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allSelectedOnPage) {
                // Unselect all on current page
                pageIds.forEach((id) => next.delete(id));
            } else {
                // Select all on current page
                pageIds.forEach((id) => next.add(id));
            }
            return next;
        });
    }

    async function assignSelected() {
        if (!canAssign) return;
        try {
            setAssigning(true);
            const ids = Array.from(selectedIds);
            // Batch update in parallel with small bursts
            const chunkSize = 10;
            for (let i = 0; i < ids.length; i += chunkSize) {
                const slice = ids.slice(i, i + chunkSize);
                await Promise.all(
                    slice.map((asset_id) =>
                        fetch("/api/assets/update", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                asset_id,
                                assigned_to: Number(selectedEmployeeId),
                            }),
                        })
                    )
                );
            }
            // Refresh assets
            const u = new URL("/api/assets/list", window.location.origin);
            u.searchParams.set("account_id", String(accountId));
            const res = await fetch(u.toString(), { cache: "no-store" });
            const data = await res.json();
            if (data.success)
                setAssets(Array.isArray(data.data) ? data.data : []);
            setSelectedIds(new Set());
        } catch (e) {
            console.warn("[assign] bulk assign failed:", e?.message || e);
        } finally {
            setAssigning(false);
        }
    }

    return (
        <div className="h-full mx-auto pb-[100px]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Assign Assets</h2>
            </div>

            {/* Employee picker */}
            <div className="flex items-center gap-2 mb-4">
                <input
                    placeholder="Search employee..."
                    className="h-10 px-3 rounded bg-neutral-800 border border-neutral-700 text-sm text-neutral-200 w-64"
                    value={employeeQuery}
                    onChange={(e) => setEmployeeQuery(e.target.value)}
                />
                <select
                    className="h-10 px-3 rounded bg-neutral-800 border border-neutral-700 text-sm text-neutral-200 w-72"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                >
                    <option value="">Select employee…</option>
                    {filteredEmployees.map((emp) => (
                        <option key={emp.employee_id} value={emp.employee_id}>
                            {(emp.full_name || emp.username || emp.email) +
                                (emp.department ? ` — ${emp.department}` : "")}
                        </option>
                    ))}
                </select>
                <button
                    disabled={!canAssign || assigning}
                    onClick={assignSelected}
                    className={`h-10 px-3 rounded text-sm flex items-center gap-2 ${
                        canAssign && !assigning
                            ? "bg-orange-500/70 hover:bg-orange-500 text-white"
                            : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                    }`}
                >
                    <UserPlus className="w-4 h-4" /> Assign Selected
                </button>
            </div>

            {/* Assets table */}
            <div className="border border-neutral-700 rounded overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-800 border-b border-neutral-700">
                        <tr>
                            <th className="text-left px-3 py-2 w-10">
                                <button
                                    onClick={toggleSelectAll}
                                    className="text-neutral-300"
                                >
                                    {pageItems.length > 0 &&
                                    pageItems.every((a) =>
                                        selectedIds.has(a.asset_id)
                                    ) ? (
                                        <CheckSquare className="w-4 h-4 text-orange-400" />
                                    ) : (
                                        <Square className="w-4 h-4 text-neutral-400" />
                                    )}
                                </button>
                            </th>
                            <th className="text-left px-3 py-2">Product</th>
                            <th className="text-left px-3 py-2">Serial</th>
                            <th className="text-left px-3 py-2">Site</th>
                            <th className="text-left px-3 py-2">Location</th>
                            <th className="text-left px-3 py-2">Assigned To</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-3 py-4 text-neutral-400"
                                >
                                    Loading assets…
                                </td>
                            </tr>
                        ) : assets.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-3 py-4 text-neutral-400"
                                >
                                    No assets found.
                                </td>
                            </tr>
                        ) : (
                            pageItems.map((a) => {
                                const isSel = selectedIds.has(a.asset_id);
                                return (
                                    <tr
                                        key={a.asset_id}
                                        className="odd:bg-neutral-900 even:bg-neutral-800/50"
                                    >
                                        <td className="px-3 py-2">
                                            <button
                                                onClick={() =>
                                                    toggleSelect(a.asset_id)
                                                }
                                                className="text-neutral-300"
                                            >
                                                {isSel ? (
                                                    <CheckSquare className="w-4 h-4 text-orange-400" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-neutral-400" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-3 py-2">
                                            {a.product_name || a.product_id}
                                        </td>
                                        <td className="px-3 py-2">
                                            {a.serial_number}
                                        </td>
                                        <td className="px-3 py-2">
                                            {a.site_name || "-"}
                                        </td>
                                        <td className="px-3 py-2">
                                            {a.location_name || "-"}
                                        </td>
                                        <td className="px-3 py-2">
                                            {a.assigned_user_full_name ||
                                                a.assigned_employee_id ||
                                                "Unassigned"}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-3 text-sm text-neutral-300">
                <div className="flex items-center gap-2">
                    <span>
                        Showing {pageItems.length > 0 ? start + 1 : 0}-{end} of{" "}
                        {total}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                        <span className="text-neutral-400">Rows</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setPage(0);
                            }}
                            className="h-8 px-2 rounded bg-neutral-800 border border-neutral-700 text-neutral-200"
                        >
                            {[10, 25, 50, 100].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            className="px-3 py-1 rounded bg-neutral-800 border border-neutral-700 disabled:opacity-50"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            Prev
                        </button>
                        <span className="text-neutral-400">
                            Page {page + 1} of {pageCount}
                        </span>
                        <button
                            className="px-3 py-1 rounded bg-neutral-800 border border-neutral-700 disabled:opacity-50"
                            onClick={() =>
                                setPage((p) => Math.min(pageCount - 1, p + 1))
                            }
                            disabled={page >= pageCount - 1}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
