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
        <div ref={containerRef} className="relative">
            <div className="group relative flex items-center h-10 bg-transparent w-full border border-neutral-700 rounded">
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
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
        </div>
    );
}
