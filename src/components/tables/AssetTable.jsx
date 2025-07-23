"use client";
import React, { useState } from "react";
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

// Example data in your shape
const data = [
    {
        account_id: 5,
        active: 1,
        added_by: 17,
        category_description: "Personal Protective Equipment",
        category_id: 672,
        category_name: "PPE",
        consumable: 0,
        created_at: "2025-06-26T18:18:24.000000Z",
        inventory_locations: [
            { location: "Toronto", bin: "A1", qty: 7 },
            { location: "London", bin: "B2", qty: 5 },
            { location: "Waterloo", bin: "C5", qty: 2 },
        ],
        manufacturer_name: "MSA",
        product_description: "MSA -Altair 5X Multigas Detector",
        product_id: 664,
        product_name: "Altair 5x",
        product_updated_at: "2025-07-04 10:16:59",
        supplier_name: "Weber Supply",
        supplier_part_num: "3M3203F6",
        supplier_phone: "(807) 768-9323",
        updated_at: "2025-06-26T18:18:24.000000Z",
    },
    {
        account_id: 6,
        active: 1,
        added_by: 17,
        category_description: "Respiratory",
        category_id: 673,
        category_name: "Respirator",
        consumable: 0,
        created_at: "2025-07-01T15:40:12.000000Z",
        inventory_locations: [
            { location: "Thunder Bay", bin: "R1", qty: 3 },
            { location: "Ottawa", bin: "Z2", qty: 10 },
        ],
        manufacturer_name: "3M",
        product_description: "3M Half Facepiece Reusable Respirator 6200",
        product_id: 665,
        product_name: "3M 6200",
        product_updated_at: "2025-07-09 11:35:12",
        supplier_name: "Weber Supply",
        supplier_part_num: "3M6200",
        supplier_phone: "(807) 768-9323",
        updated_at: "2025-07-01T15:40:12.000000Z",
    },
    // ...add more
];

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
            className="flex items-center gap-1 group font-semibold w-full text-left"
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
        enableSorting: false,
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

export default function AssetTable() {
    const [sorting, setSorting] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [expanded, setExpanded] = useState({});

    const table = useReactTable({
        data,
        columns,
        state: { sorting, pagination: { pageIndex, pageSize } },
        onSortingChange: setSorting,
        onPaginationChange: (updater) => {
            if (typeof updater === "function") {
                setPageIndex((old) => updater({ pageIndex: old }).pageIndex);
            } else {
                setPageIndex(updater.pageIndex);
            }
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: false,
        pageCount: Math.ceil(data.length / pageSize),
    });

    const rowHeight = 36;
    const tableBodyHeight = rowHeight * pageSize;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4 text-white">
                Product Assets
            </h2>
            <div className="overflow-x-auto rounded-lg border border-neutral-700 max-h-[700px] overflow-y-auto">
                <table className="min-w-full border-separate border-spacing-0">
                    <thead className="bg-neutral-800 sticky top-0 z-10">
                        <tr>
                            <th className="w-8 border-b border-neutral-700"></th>
                            {table.getHeaderGroups().map((hg) =>
                                hg.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className="py-3 px-4 text-left text-neutral-300 font-semibold border-b border-neutral-700 select-none whitespace-nowrap sticky top-0 z-10"
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
                                                        className={`py-2 px-4 text-neutral-300 whitespace-nowrap border-b border-neutral-700`}
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
                                                                            <tr className="">
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
            <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
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
