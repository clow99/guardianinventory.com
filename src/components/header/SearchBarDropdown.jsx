"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

function getAccountIdFromCookie() {
    try {
        const match = document.cookie
            .split("; ")
            .find((part) => part.startsWith("account_id="));
        if (!match) return null;
        const raw = Number(match.split("=")[1] || 0);
        return Number.isFinite(raw) && raw > 0 ? raw : null;
    } catch {
        return null;
    }
}

export default function SearchBarDropdown() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
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

    useEffect(() => {
        if (!isOpen) return;
        const trimmed = query.trim();
        if (!trimmed) {
            setResults([]);
            setLoading(false);
            return;
        }

        const accountId = getAccountIdFromCookie();
        if (!accountId) {
            setResults([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const u = new URL("/api/products/list", window.location.origin);
                u.searchParams.set("q", trimmed);
                u.searchParams.set("account_id", String(accountId));
                u.searchParams.set("limit", "8");
                const res = await fetch(u.toString(), {
                    signal: controller.signal,
                    cache: "no-store",
                });
                const json = await res.json();
                if (!cancelled && res.ok && Array.isArray(json?.data)) {
                    setResults(json.data);
                }
            } catch (e) {
                if (!cancelled && e.name !== "AbortError") {
                    setResults([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
            controller.abort();
        };
    }, [query, isOpen]);

    function runSearch(value) {
        const trimmed = String(value || "").trim();
        if (!trimmed) return;
        setIsOpen(false);
        router.push(`/app/assets/view?q=${encodeURIComponent(trimmed)}`);
    }

    return (
        <div ref={containerRef} className="relative w-1/2">
            <div className="group relative flex items-center h-12 bg-transparent w-full">
                <div className="absolute left-0 flex items-center h-full px-3 pointer-events-none">
                    <Search className="w-4 h-4 text-neutral-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className="w-full h-full pl-10 text-sm pr-4 text-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70 rounded"
                    placeholder="Search..."
                    autoComplete="off"
                    spellCheck="false"
                    value={query}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            runSearch(query);
                        }
                        if (e.key === "Escape") {
                            setIsOpen(false);
                        }
                    }}
                />
            </div>

            <AnimatePresence>
                {isOpen && query.trim().length > 0 && (
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
                        {loading && (
                            <li className="px-4 py-2 text-sm text-neutral-400">
                                Searching products...
                            </li>
                        )}
                        {!loading && results.length === 0 && (
                            <li className="px-4 py-2 text-sm text-neutral-400">
                                No products found. Press Enter to search all assets.
                            </li>
                        )}
                        {!loading &&
                            results.map((item) => (
                                <motion.li
                                    key={item.product_id}
                                    whileHover={{
                                        backgroundColor: "rgba(249, 115, 22, 0.1)",
                                    }}
                                    className="px-4 py-2 cursor-pointer text-sm text-neutral-200"
                                    onClick={() => runSearch(item.product_name)}
                                >
                                    {item.product_name}
                                </motion.li>
                            ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
