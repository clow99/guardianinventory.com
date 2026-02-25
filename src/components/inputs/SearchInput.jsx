"use client";

import { useRef } from "react";
import { Search } from "lucide-react";

export default function SearchBar({
    value = "",
    onChange,
    placeholder = "Search...",
    onKeyDown,
}) {
    const containerRef = useRef(null);

    return (
        <div ref={containerRef} className="relative">
            <div className="group relative flex items-center h-10 bg-transparent w-full border border-neutral-700 rounded">
                <div className="absolute left-0 flex items-center h-full px-3 pointer-events-none">
                    <Search className="w-4 h-4 text-neutral-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className="w-full h-full pl-10 text-sm pr-4 text-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70 rounded"
                    placeholder={placeholder}
                    autoComplete="off"
                    spellCheck="false"
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                />
            </div>
        </div>
    );
}
