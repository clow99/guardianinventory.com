"use client";
import React, { useState, useEffect } from "react";
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
        product_description: "MSA - Altair 5X Multigas Detector",
        product_id: 664,
        product_name: "Altair 5X",
        product_updated_at: "2025-07-04 10:16:59",
        supplier_name: "Weber Supply",
        supplier_part_num: "MSA3203F6",
        supplier_phone: "(807) 768-9323",
        updated_at: "2025-06-26T18:18:24.000000Z",
    },
    {
        account_id: 6,
        active: 1,
        added_by: 18,
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
    {
        account_id: 7,
        active: 1,
        added_by: 21,
        category_description: "Eye Protection",
        category_id: 674,
        category_name: "Safety Glasses",
        consumable: 0,
        created_at: "2025-07-03T09:15:00.000000Z",
        inventory_locations: [
            { location: "Hamilton", bin: "C3", qty: 12 },
            { location: "Kitchener", bin: "D1", qty: 7 },
        ],
        manufacturer_name: "Uvex",
        product_description: "Uvex Stealth Safety Goggles",
        product_id: 666,
        product_name: "Uvex Stealth",
        product_updated_at: "2025-07-10 13:22:33",
        supplier_name: "Weber Supply",
        supplier_part_num: "UVX123",
        supplier_phone: "(807) 768-9323",
        updated_at: "2025-07-03T09:15:00.000000Z",
    },
    {
        account_id: 8,
        active: 1,
        added_by: 22,
        category_description: "Hand Protection",
        category_id: 675,
        category_name: "Gloves",
        consumable: 0,
        created_at: "2025-07-05T10:32:11.000000Z",
        inventory_locations: [
            { location: "Windsor", bin: "E2", qty: 8 },
            { location: "Guelph", bin: "F4", qty: 6 },
        ],
        manufacturer_name: "Ansell",
        product_description: "Ansell HyFlex Foam Nitrile Gloves",
        product_id: 667,
        product_name: "HyFlex Gloves",
        product_updated_at: "2025-07-12 09:17:41",
        supplier_name: "Weber Supply",
        supplier_part_num: "ANSL567",
        supplier_phone: "(807) 768-9323",
        updated_at: "2025-07-05T10:32:11.000000Z",
    },
    {
        account_id: 9,
        active: 1,
        added_by: 24,
        category_description: "Head Protection",
        category_id: 676,
        category_name: "Helmets",
        consumable: 0,
        created_at: "2025-07-06T08:24:58.000000Z",
        inventory_locations: [
            { location: "Sudbury", bin: "G7", qty: 4 },
            { location: "Barrie", bin: "H1", qty: 3 },
        ],
        manufacturer_name: "Honeywell",
        product_description: "Honeywell North A79 Hard Hat",
        product_id: 668,
        product_name: "North A79",
        product_updated_at: "2025-07-14 14:05:19",
        supplier_name: "Weber Supply",
        supplier_part_num: "HONA79",
        supplier_phone: "(807) 768-9323",
        updated_at: "2025-07-06T08:24:58.000000Z",
    },
    {
        account_id: 10,
        active: 1,
        added_by: 28,
        category_description: "Hearing Protection",
        category_id: 677,
        category_name: "Earplugs",
        consumable: 0,
        created_at: "2025-07-07T12:45:29.000000Z",
        inventory_locations: [
            { location: "Ottawa", bin: "I2", qty: 9 },
            { location: "Mississauga", bin: "J6", qty: 11 },
        ],
        manufacturer_name: "Moldex",
        product_description: "Moldex SparkPlugs Disposable Earplugs",
        product_id: 669,
        product_name: "SparkPlugs Earplugs",
        product_updated_at: "2025-07-16 16:50:03",
        supplier_name: "Weber Supply",
        supplier_part_num: "MLDX5000",
        supplier_phone: "(807) 768-9323",
        updated_at: "2025-07-07T12:45:29.000000Z",
    },
    {
        account_id: 11,
        active: 1,
        added_by: 30,
        category_description: "Foot Protection",
        category_id: 678,
        category_name: "Boots",
        consumable: 0,
        created_at: "2025-07-08T14:58:44.000000Z",
        inventory_locations: [
            { location: "Sarnia", bin: "K3", qty: 6 },
            { location: "Peterborough", bin: "L2", qty: 7 },
        ],
        manufacturer_name: "Timberland PRO",
        product_description: "Timberland PRO Endurance PR Boots",
        product_id: 670,
        product_name: "Endurance PRO Boots",
        product_updated_at: "2025-07-18 18:33:55",
        supplier_name: "Weber Supply",
        supplier_part_num: "TMBLEND",
        supplier_phone: "(807) 768-9323",
        updated_at: "2025-07-08T14:58:44.000000Z",
    },
    {
        account_id: 12,
        active: 1,
        added_by: 32,
        category_description: "Fire Protection",
        category_id: 679,
        category_name: "Extinguishers",
        consumable: 0,
        created_at: "2025-07-09T11:21:17.000000Z",
        inventory_locations: [
            { location: "Toronto", bin: "M1", qty: 2 },
            { location: "Kingston", bin: "N5", qty: 5 },
        ],
        manufacturer_name: "Kidde",
        product_description: "Kidde ABC Fire Extinguisher",
        product_id: 671,
        product_name: "ABC Fire Extinguisher",
        product_updated_at: "2025-07-20 20:41:26",
        supplier_name: "Weber Supply",
        supplier_part_num: "KIDDABC",
        supplier_phone: "(807) 768-9323",
        updated_at: "2025-07-09T11:21:17.000000Z",
    },
    {
        account_id: 13,
        active: 1,
        added_by: 34,
        category_description: "Fall Protection",
        category_id: 680,
        category_name: "Harness",
        consumable: 0,
        created_at: "2025-07-10T17:43:36.000000Z",
        inventory_locations: [
            { location: "Toronto", bin: "O3", qty: 3 },
            { location: "London", bin: "P1", qty: 2 },
        ],
        manufacturer_name: "DBI-SALA",
        product_description: "DBI-SALA ExoFit NEX Harness",
        product_id: 672,
        product_name: "ExoFit NEX Harness",
        product_updated_at: "2025-07-22 22:09:14",
        supplier_name: "Weber Supply",
        supplier_part_num: "DBIXFIT",
        supplier_phone: "(807) 768-9323",
        updated_at: "2025-07-10T17:43:36.000000Z",
    },
    {
        account_id: 14,
        active: 1,
        added_by: 35,
        category_description: "First Aid",
        category_id: 681,
        category_name: "First Aid Kits",
        consumable: 0,
        created_at: "2025-07-11T08:10:55.000000Z",
        inventory_locations: [
            { location: "Toronto", bin: "Q2", qty: 8 },
            { location: "Barrie", bin: "R3", qty: 3 },
        ],
        manufacturer_name: "Cintas",
        product_description: "Cintas Complete First Aid Kit",
        product_id: 673,
        product_name: "Complete First Aid Kit",
        product_updated_at: "2025-07-24 07:58:45",
        supplier_name: "Weber Supply",
        supplier_part_num: "CNTSAID",
        supplier_phone: "(807) 768-9323",
        updated_at: "2025-07-11T08:10:55.000000Z",
    },
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

export default function AssetTable({ searchQuery }) {
    const [sorting, setSorting] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(15);
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
        <div className="flex flex-col h-full">
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
