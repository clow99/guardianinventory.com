"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import Modal from "../modals/Modal";

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
export default function AssetGrid({ searchQuery }) {
    const [expandedId, setExpandedId] = useState(null);
    const [page, setPage] = useState(0);
    const pageSize = 8;
    const pagedData = data.slice(page * pageSize, (page + 1) * pageSize);
    const pageCount = Math.ceil(data.length / pageSize);

    return (
        <div className="flex flex-col h-full relative">
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
                            const item = data.find(
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
