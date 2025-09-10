"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import Modal from "../modals/Modal";
import { useAccount } from "@/app/hooks/useAccount";
export default function AssetGrid({
    searchQuery,
    refreshKey = 0,
    onLoadingChange,
    onMetaChange,
    accountId: propAccountId,
}) {
    const { accountId: hookAccountId } = useAccount();
    const accountId = propAccountId ?? hookAccountId;
    const [expandedId, setExpandedId] = useState(null);
    const [page, setPage] = useState(0);
    const pageSize = 8;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [bump, setBump] = useState(0);

    useEffect(() => {
        let ignore = false;
        const controller = new AbortController();
        async function load() {
            try {
                if (!accountId) {
                    setItems([]);
                    setError("");
                    onLoadingChange && onLoadingChange(false);
                    onMetaChange && onMetaChange(null);
                    return;
                }
                setLoading(true);
                onLoadingChange && onLoadingChange(true);
                setError("");
                const u = new URL("/api/products/list", window.location.origin);
                if (searchQuery) u.searchParams.set("q", searchQuery);
                u.searchParams.set("t", String(Date.now()));
                u.searchParams.set("account_id", String(accountId));
                const res = await fetch(u.toString(), {
                    cache: "no-store",
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                    credentials: "include",
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(
                        data?.error || `Request failed: ${res.status}`
                    );
                }
                const data = await res.json();
                if (process.env.NODE_ENV !== "production" && data?.meta) {
                    console.debug("/api/products/list meta:", data.meta);
                }
                onMetaChange && onMetaChange(data?.meta || null);
                if (!ignore)
                    setItems(Array.isArray(data.data) ? data.data : []);
                // Reset to first page on new data
                if (!ignore) setPage(0);
            } catch (e) {
                if (!ignore && e.name !== "AbortError")
                    setError(e.message || "Failed to load");
            } finally {
                if (!ignore) setLoading(false);
                onLoadingChange && onLoadingChange(false);
            }
        }
        // Avoid clearing when a hard reload will happen to reduce flicker
        if (!window.__accountHardReloadOnAccountChange) {
            // Clear items right away to avoid stale cards during account switches
            setItems([]);
        }
        load();
        return () => {
            ignore = true;
            controller.abort();
        };
    }, [searchQuery, accountId, refreshKey, bump]);

    // Skip local listener if hard reload is enabled; otherwise, refetch on event
    useEffect(() => {
        if (window.__accountHardReloadOnAccountChange) return;
        function onChange() {
            setBump((n) => n + 1);
        }
        window.addEventListener("account:change", onChange);
        return () => window.removeEventListener("account:change", onChange);
    }, []);

    const pagedData = items.slice(page * pageSize, (page + 1) * pageSize);
    const pageCount = Math.ceil((items.length || 0) / pageSize) || 1;

    return (
        <div
            className="flex flex-col h-full relative"
            key={`grid-${accountId}-${refreshKey}`}
        >
            {loading && items.length === 0 ? (
                <div className="text-neutral-400">Loading products…</div>
            ) : error ? (
                <div className="text-red-400">{error}</div>
            ) : items.length === 0 ? (
                <div className="text-neutral-400">No products found.</div>
            ) : null}
            {/* GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {pagedData.map((item) => (
                    <motion.div
                        key={item.product_id}
                        layout
                        className={
                            "bg-neutral-800 border border-neutral-700 rounded overflow-hidden h-fit shrink-0 transition hover:border-orange-400 relative cursor-pointer"
                        }
                        onClick={() => setExpandedId(item.product_id)}
                    >
                        <div className="p-5 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-lg font-bold text-orange-400">
                                    {item.product_name}
                                </span>
                                {item.inventory_locations?.length > 0 && (
                                    <ChevronRight className="h-5 w-5 text-orange-400" />
                                )}
                            </div>
                            <div className="text-neutral-300 text-base truncate">
                                {item.product_description}
                            </div>
                            <div className="flex flex-wrap gap-2 text-sm text-neutral-400">
                                <span>
                                    <span className="font-semibold text-orange-400">
                                        Category:
                                    </span>{" "}
                                    {item.category_name}
                                </span>
                                <span>
                                    <span className="font-semibold text-orange-400">
                                        Manufacturer:
                                    </span>{" "}
                                    {item.manufacturer_name}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-neutral-400 mt-2">
                                <span>
                                    <span className="font-semibold text-orange-400">
                                        Supplier:
                                    </span>{" "}
                                    {item.supplier_name}
                                </span>
                                <span>
                                    <span className="font-semibold text-orange-400">
                                        Updated:
                                    </span>{" "}
                                    {new Date(
                                        item.updated_at
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            {/* PAGINATION */}
            <div className="flex justify-between items-center mt-auto pb-5 gap-4">
                <div className="text-neutral-400 text-sm">
                    Page {page + 1} of {pageCount}
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 rounded bg-neutral-800 text-neutral-300 disabled:opacity-50"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        Prev
                    </button>
                    <button
                        className="px-3 py-1 rounded bg-neutral-800 text-neutral-300 disabled:opacity-50"
                        onClick={() =>
                            setPage((p) => Math.min(pageCount - 1, p + 1))
                        }
                        disabled={page >= pageCount - 1}
                    >
                        Next
                    </button>
                </div>
            </div>
            {/* OVERLAY MODAL */}
            <AnimatePresence>
                {expandedId && (
                    <Modal
                        isOpen={!!expandedId}
                        onClose={() => setExpandedId(null)}
                    >
                        {/* MODAL CONTENT */}
                        {(() => {
                            const item = items.find(
                                (d) => d.product_id === expandedId
                            );
                            if (!item) return null;
                            return (
                                <div>
                                    <div className="mb-4">
                                        <div className="text-2xl font-bold text-orange-400">
                                            {item.product_name}
                                        </div>
                                        <div className="text-neutral-300 text-lg">
                                            {item.product_description}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-neutral-400 text-base mb-4">
                                        <span>
                                            <span className="font-semibold text-orange-400">
                                                Category:
                                            </span>{" "}
                                            {item.category_name}
                                        </span>
                                        <span>
                                            <span className="font-semibold text-orange-400">
                                                Manufacturer:
                                            </span>{" "}
                                            {item.manufacturer_name}
                                        </span>
                                        <span>
                                            <span className="font-semibold text-orange-400">
                                                Supplier:
                                            </span>{" "}
                                            {item.supplier_name}
                                        </span>
                                        <span>
                                            <span className="font-semibold text-orange-400">
                                                Updated:
                                            </span>{" "}
                                            {new Date(
                                                item.updated_at
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="bg-neutral-800 rounded p-4">
                                        <div className="text-orange-400 font-semibold mb-2">
                                            Inventory Locations
                                        </div>
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr>
                                                    <th className="text-left text-orange-400 py-1">
                                                        Location
                                                    </th>
                                                    <th className="text-left text-orange-400 py-1">
                                                        Bin
                                                    </th>
                                                    <th className="text-right text-orange-400 py-1">
                                                        Qty
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {item.inventory_locations
                                                    ?.length > 0 ? (
                                                    item.inventory_locations.map(
                                                        (loc, i) => (
                                                            <tr
                                                                key={i}
                                                                className="border-t border-neutral-700"
                                                            >
                                                                <td className="py-1 text-neutral-300">
                                                                    {
                                                                        loc.location
                                                                    }
                                                                </td>
                                                                <td className="py-1 text-neutral-300">
                                                                    {loc.bin ||
                                                                        "-"}
                                                                </td>
                                                                <td className="py-1 text-neutral-300 text-right">
                                                                    {loc.qty ??
                                                                        "-"}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={3}
                                                            className="py-2 text-neutral-400"
                                                        >
                                                            No locations found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })()}
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}
