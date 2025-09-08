"use client";
import React, { useState, useEffect } from "react";
import { useAccount } from "@/app/hooks/useAccount";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowUpAZ,
    ArrowDownAZ,
    ArrowDownUp,
    ChevronRight,
} from "lucide-react";

// Live data fetched from API
function useProducts(
    searchQuery,
    accountId,
    refreshKey,
    onLoadingChange,
    onMetaChange
) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [bump, setBump] = useState(0);

    // Nudge the loader whenever accountId changes to guarantee a new request cycle
    useEffect(() => {
        setBump((n) => n + 1);
    }, [accountId]);

    useEffect(() => {
        let ignore = false;
        const controller = new AbortController();
        async function load() {
            try {
                // Require a selected account; don't fetch with fallbacks to avoid wrong data
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
            } catch (e) {
                if (!ignore && e.name !== "AbortError")
                    setError(e.message || "Failed to load");
            } finally {
                if (!ignore) setLoading(false);
                onLoadingChange && onLoadingChange(false);
            }
        }
        // If we're doing a hard reload on account change, avoid clearing to reduce flicker
        if (!window.__accountHardReloadOnAccountChange) {
            // Clear items immediately when dependencies change to avoid stale display
            setItems([]);
        }
        load();
        return () => {
            ignore = true;
            controller.abort();
        };
    }, [searchQuery, accountId, refreshKey, bump]);

    // If hard reload is enabled, skip local listener; otherwise, refetch on event
    useEffect(() => {
        if (window.__accountHardReloadOnAccountChange) return;
        function onChange() {
            setBump((n) => n + 1);
        }
        window.addEventListener("account:change", onChange);
        return () => window.removeEventListener("account:change", onChange);
    }, []);

    return { items, loading, error };
}

// Lucide-based sortable header
function SortableHeader({ column, label }) {
    const isSorted = column.getIsSorted();
    const iconProps = {
        size: 16,
        className:
            "transition-colors ml-1 " +
            (isSorted
                ? "text-orange-400"
                : "text-neutral-400 group-hover:text-orange-400"),
    };

    return (
        <button
            onClick={column.getToggleSortingHandler()}
            className="flex items-center gap-1 group font-semibold w-full text-left cursor-pointer"
            tabIndex={-1}
        >
            <span>{label}</span>
            <span>
                {isSorted === "asc" ? (
                    <ArrowUpAZ {...iconProps} />
                ) : isSorted === "desc" ? (
                    <ArrowDownAZ {...iconProps} />
                ) : (
                    <ArrowDownUp {...iconProps} />
                )}
            </span>
        </button>
    );
}

const columns = [
    {
        accessorKey: "product_name",
        header: ({ column }) => (
            <SortableHeader column={column} label="Product Name" />
        ),
        enableSorting: true,
        cell: (info) => (
            <span className="font-semibold">{info.getValue()}</span>
        ),
    },
    {
        accessorKey: "product_description",
        header: ({ column }) => (
            <SortableHeader column={column} label="Description" />
        ),
        enableSorting: true,
        cell: (info) => (
            <span className="truncate block max-w-[250px]">
                {info.getValue()}
            </span>
        ),
    },
    {
        accessorKey: "category_name",
        header: ({ column }) => (
            <SortableHeader column={column} label="Category" />
        ),
        enableSorting: true,
        cell: (info) => <span>{info.getValue()}</span>,
    },
    {
        accessorKey: "manufacturer_name",
        header: ({ column }) => (
            <SortableHeader column={column} label="Manufacturer" />
        ),
        enableSorting: true,
        cell: (info) => <span>{info.getValue()}</span>,
    },
    {
        accessorKey: "supplier_name",
        header: ({ column }) => (
            <SortableHeader column={column} label="Supplier" />
        ),
        enableSorting: true,
        cell: (info) => <span>{info.getValue()}</span>,
    },
    {
        accessorKey: "updated_at",
        header: ({ column }) => (
            <SortableHeader column={column} label="Updated" />
        ),
        enableSorting: true,
        cell: (info) => (
            <span className="text-xs text-neutral-400">
                {new Date(info.getValue()).toLocaleDateString()}
            </span>
        ),
    },
];

export default function AssetTable({
    searchQuery,
    refreshKey = 0,
    onLoadingChange,
    onMetaChange,
    accountId: propAccountId,
}) {
    const { accountId: hookAccountId } = useAccount();
    const accountId = propAccountId ?? hookAccountId;
    const { items, loading, error } = useProducts(
        searchQuery,
        accountId,
        refreshKey,
        onLoadingChange,
        onMetaChange
    );
    const [sorting, setSorting] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(15);
    const [expanded, setExpanded] = useState({});

    const table = useReactTable({
        data: items,
        columns,
        state: { sorting, pagination: { pageIndex, pageSize } },
        onSortingChange: setSorting,
        onPaginationChange: (updater) => {
            if (typeof updater === "function") {
                setPageIndex(
                    (old) => updater({ pageIndex: old, pageSize }).pageIndex
                );
            } else {
                setPageIndex(updater.pageIndex);
            }
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: false,
        pageCount: Math.ceil(items.length / pageSize || 1),
    });

    // Reset pagination when account changes
    useEffect(() => {
        setPageIndex(0);
    }, [accountId]);

    const rowHeight = 36;
    const tableBodyHeight = rowHeight * pageSize;

    // refetch when refreshKey changes by bumping an unused state or relying on effect deps
    useEffect(() => {}, [refreshKey]);

    if (loading && items.length === 0) {
        return <div className="text-neutral-400">Loading products…</div>;
    }
    if (error) {
        return <div className="text-red-400">{error}</div>;
    }
    if (items.length === 0) {
        return <div className="text-neutral-400">No products found.</div>;
    }

    return (
        <div
            className="flex flex-col h-full"
            key={`table-${accountId}-${refreshKey}`}
        >
            <div className="overflow-x-auto rounded-lg border border-neutral-700 max-h-[657px] overflow-y-auto">
                <table className="min-w-full border-separate border-spacing-0">
                    <thead className="bg-neutral-800 sticky top-0 z-10">
                        <tr>
                            <th className="w-8 border-b border-neutral-700"></th>
                            {table.getHeaderGroups().map((hg) =>
                                hg.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className="py-2 text-sm px-4 text-left text-neutral-300 font-semibold border-b border-neutral-700 select-none whitespace-nowrap sticky top-0 z-10"
                                        style={{ minWidth: 110 }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <motion.tbody
                        key={pageIndex + "-" + pageSize}
                        layout
                        initial={false}
                        animate={{ height: tableBodyHeight }}
                        style={{
                            position: "relative",
                            minHeight: tableBodyHeight,
                        }}
                    >
                        <AnimatePresence initial={false}>
                            {table.getRowModel().rows.map((row, i) => {
                                const isExpanded = expanded[row.id];
                                return (
                                    <React.Fragment key={row.id}>
                                        <motion.tr
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.18 }}
                                            layout
                                            onClick={() =>
                                                setExpanded((e) => ({
                                                    ...e,
                                                    [row.id]: !isExpanded,
                                                }))
                                            }
                                            className="group"
                                        >
                                            {/* Expand/collapse button */}
                                            <td className="px-2 py-2 align-top w-8 border-b border-neutral-700">
                                                <button
                                                    onClick={() =>
                                                        setExpanded((e) => ({
                                                            ...e,
                                                            [row.id]:
                                                                !isExpanded,
                                                        }))
                                                    }
                                                    className="focus:outline-none"
                                                    aria-label={
                                                        isExpanded
                                                            ? "Collapse"
                                                            : "Expand"
                                                    }
                                                >
                                                    <motion.span
                                                        animate={{
                                                            rotate: isExpanded
                                                                ? 90
                                                                : 0,
                                                        }}
                                                        className={`${
                                                            isExpanded
                                                                ? "text-orange-500"
                                                                : "text-neutral-400"
                                                        } h-6 w-6 flex items-center justify-center rounded hover:bg-neutral-700 hover:text-orange-500 cursor-pointer transition-colors`}
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </motion.span>
                                                </button>
                                            </td>
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <td
                                                        key={cell.id}
                                                        className={`py-2 text-sm px-4 text-neutral-300 whitespace-nowrap border-b border-neutral-700`}
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </td>
                                                ))}
                                        </motion.tr>
                                        {/* Expanded row content */}
                                        <tr>
                                            <td
                                                colSpan={columns.length + 1}
                                                className="p-0 border-none"
                                            >
                                                <AnimatePresence
                                                    initial={false}
                                                >
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{
                                                                height: 0,
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                height: "auto",
                                                                opacity: 1,
                                                            }}
                                                            exit={{
                                                                height: 0,
                                                                opacity: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.2,
                                                            }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="bg-neutral-700 border-b border-neutral-700">
                                                                {row.original
                                                                    .inventory_locations &&
                                                                row.original
                                                                    .inventory_locations
                                                                    .length ? (
                                                                    <table className="w-full text-sm border-x border-neutral-700">
                                                                        <thead>
                                                                            <tr className="text-orange-500">
                                                                                <th className="pl-[55px] px-2 py-2 text-left">
                                                                                    Location
                                                                                </th>
                                                                                <th className="px-2 py-2 text-left">
                                                                                    Bin
                                                                                </th>
                                                                                <th className="px-2 py-2 text-left">
                                                                                    Serial
                                                                                </th>
                                                                                <th className="px-2 py-2 text-right">
                                                                                    Qty
                                                                                </th>
                                                                                <th className="px-2 py-2 text-left">
                                                                                    Expiration
                                                                                </th>
                                                                                <th className="px-2 py-2 text-left">
                                                                                    Last
                                                                                    Updated
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="bg-neutral-800">
                                                                            {row.original.inventory_locations.map(
                                                                                (
                                                                                    loc,
                                                                                    idx
                                                                                ) => (
                                                                                    <tr
                                                                                        key={
                                                                                            idx
                                                                                        }
                                                                                        className="border-t border-neutral-700"
                                                                                    >
                                                                                        <td className="pl-[55px] px-2 py-1 text-neutral-400">
                                                                                            {
                                                                                                loc.location
                                                                                            }
                                                                                        </td>
                                                                                        <td className="px-2 py-1 text-neutral-400">
                                                                                            {loc.bin ??
                                                                                                "-"}
                                                                                        </td>
                                                                                        <td className="px-2 py-1 text-neutral-400">
                                                                                            {loc.serial_number ??
                                                                                                "-"}
                                                                                        </td>
                                                                                        <td className="px-2 py-1 text-right text-neutral-400">
                                                                                            {
                                                                                                loc.quantity
                                                                                            }
                                                                                        </td>
                                                                                        <td className="px-2 py-1 text-neutral-400">
                                                                                            {loc.expiration_date
                                                                                                ? new Date(
                                                                                                      loc.expiration_date
                                                                                                  ).toLocaleDateString()
                                                                                                : "-"}
                                                                                        </td>
                                                                                        <td className="px-2 py-1 text-neutral-400">
                                                                                            {loc.inventory_updated_at
                                                                                                ? new Date(
                                                                                                      loc.inventory_updated_at
                                                                                                  ).toLocaleString()
                                                                                                : "-"}
                                                                                        </td>
                                                                                    </tr>
                                                                                )
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                ) : (
                                                                    <div className="text-neutral-400 text-sm">
                                                                        No
                                                                        locations
                                                                        found.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                            {Array.from({
                                length:
                                    pageSize - table.getRowModel().rows.length,
                            }).map((_, i) => (
                                <tr
                                    key={`empty-${i}`}
                                    className="opacity-0 pointer-events-none"
                                >
                                    <td
                                        colSpan={columns.length + 1}
                                        className="py-2 px-4"
                                    >
                                        &nbsp;
                                    </td>
                                </tr>
                            ))}
                        </AnimatePresence>
                    </motion.tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap justify-between items-center mt-auto pb-5 gap-4">
                <div className="text-neutral-400 text-sm">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="rows-per-page"
                            className="text-neutral-400 text-sm"
                        >
                            Show
                        </label>
                        <select
                            id="rows-per-page"
                            className="px-2 py-1 rounded bg-neutral-800 text-neutral-300"
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setPageIndex(0);
                            }}
                        >
                            {[10, 15, 20, 50].map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                        <span className="text-neutral-400 text-sm">
                            results
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="px-3 py-1 rounded bg-neutral-800 text-neutral-300 disabled:opacity-50"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Prev
                        </button>
                        <button
                            className="px-3 py-1 rounded bg-neutral-800 text-neutral-300 disabled:opacity-50"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
