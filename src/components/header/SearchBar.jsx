"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";

const suggestions = [
    "Apple",
    "Banana",
    "Cherry",
    "Date",
    "Elderberry",
    // …your real data here
];

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter suggestions
    const filtered = suggestions.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div ref={containerRef} className="relative w-1/2">
            <div className="group relative flex items-center h-12 bg-transparent w-full">
                <div className="absolute left-0 flex items-center h-full px-3 pointer-events-none">
                    <Search className="w-4 h-4 text-neutral-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className="w-full h-full pl-10 text-sm pr-4 text-neutral-200 focus:outline-none"
                    placeholder="Search..."
                    autoComplete="off"
                    spellCheck="false"
                    value={query}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <AnimatePresence>
                {isOpen && filtered.length > 0 && (
                    <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 24,
                        }}
                        className="absolute border border-neutral-700 z-10 mt-0.5 ml-0.5 w-full bg-neutral-800 rounded shadow-lg shadow-neutral-900 overflow-hidden"
                    >
                        {filtered.map((item, idx) => (
                            <motion.li
                                key={item}
                                whileHover={{
                                    backgroundColor: "rgba(249, 115, 22, 0.1)",
                                }}
                                className="px-4 py-2 cursor-pointer text-sm text-neutral-200"
                                onClick={() => {
                                    setQuery(item);
                                    setIsOpen(false);
                                }}
                            >
                                {item}
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
