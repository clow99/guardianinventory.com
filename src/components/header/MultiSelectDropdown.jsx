// components/header/MultiSelectDropdown.jsx

"use client";

import { useRef, useEffect } from "react";
import {
    ClipboardList,
    Package,
    FileSearch,
    Wrench,
    ChevronRight,
    Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const options = [
    {
        id: "tasks",
        label: "Tasks",
        description: "View and complete assigned jobs",
        icon: <ClipboardList className="w-5 h-5 text-blue-400" />,
    },
    {
        id: "inventory",
        label: "Inventory",
        description: "Track items, parts, and stock levels",
        icon: <Package className="w-5 h-5 text-green-400" />,
    },
    {
        id: "inspections",
        label: "Inspections",
        description: "Perform or review site inspections",
        icon: <FileSearch className="w-5 h-5 text-yellow-400" />,
    },
    {
        id: "repairs",
        label: "Repair Status",
        description: "Monitor ongoing repairs and updates",
        icon: <Wrench className="w-5 h-5 text-red-400" />,
    },
];

export default function MultiSelectDropdown({ selected, onSelect }) {
    const ref = useRef();
    const isOpen = selected === null;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                onSelect(selected); // keep current if clicked away
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [selected, onSelect]);

    const handleSelect = (id) => {
        onSelect(id);
    };

    const selectedItem = options.find((o) => o.id === selected);

    return (
        <div className="relative w-full text-sm" ref={ref}>
            <button
                onClick={() => onSelect(null)}
                className="w-full h-12 px-3 flex items-center border-b gap-3 border-r border-neutral-700 bg-transparent text-neutral-300 cursor-pointer"
            >
                <div className="h-12 w-12 rounded shrink-0 flex items-center justify-center bg-neutral-700 border border-neutral-700">
                    {selectedItem?.icon || (
                        <span className="text-white">
                            <img
                                src="./weber_white.png"
                                alt="Weber Logo"
                                className="h-8 w-6"
                            />
                        </span>
                    )}
                </div>
                <div className="flex flex-col items-start justify-center truncate">
                    <span className="text-sm font-medium text-neutral-200">
                        {selectedItem?.label || "Select section"}
                    </span>
                    {selectedItem?.description && (
                        <span className="text-xs text-neutral-400">
                            {selectedItem.description}
                        </span>
                    )}
                </div>
                <ChevronRight className="text-neutral-400 w-4 h-4 ml-auto" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 24,
                        }}
                        className="absolute mt-2 w-full z-50 rounded-md shadow-lg bg-neutral-800 border border-neutral-700"
                    >
                        {options.map((opt) => (
                            <li
                                key={opt.id}
                                onClick={() => handleSelect(opt.id)}
                                className="px-3 py-3 flex items-start gap-3 cursor-pointer hover:bg-neutral-700"
                            >
                                <div className="mt-1">{opt.icon}</div>
                                <div className="flex-1">
                                    <div className="text-neutral-200 font-medium">
                                        {opt.label}
                                    </div>
                                    <div className="text-neutral-400 text-xs">
                                        {opt.description}
                                    </div>
                                </div>
                                {selected === opt.id && (
                                    <Check className="w-4 h-4 text-blue-500 mt-1" />
                                )}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
