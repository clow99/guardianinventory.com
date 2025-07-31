"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsUpDown } from "lucide-react";

export default function AccountSelect({
    label,
    id,
    options = [
        {
            value: "account1",
            sites: [
                { name: "Site A", url: "https://site-a.com" },
                { name: "Site B", url: "https://site-b.com" },
            ],
            label: "Account 1",
        },
        { value: "account2", sites: [], label: "Account 2" },
        { value: "account3", sites: [], label: "Account 3" },
    ],
    className = "",
    ...rest
}) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [siteDropdownOpen, setSiteDropdownOpen] = useState(false);
    const boxRef = useRef();

    // Local state for selection
    const [account, setAccount] = useState(options[0].value);

    // Find the selected account object
    const selected = options.find((o) => o.value === account);

    // Local state for site selection
    const [site, setSite] = useState(selected?.sites?.[0]?.name || "");

    // Keep site in sync if account changes
    // (This is important so a stale site doesn't stay selected when switching accounts)
    // We'll use an effect for that.
    if (
        selected &&
        selected.sites?.length > 0 &&
        !selected.sites.some((s) => s.name === site)
    ) {
        setSite(selected.sites[0].name);
    }
    if (selected && (!selected.sites || selected.sites.length === 0) && site) {
        setSite("");
    }

    const isFloating =
        isFocused || dropdownOpen || (account !== "" && account !== undefined);

    function handleBlur(e) {
        if (!boxRef.current.contains(e.relatedTarget)) {
            setDropdownOpen(false);
            setIsFocused(false);
        }
    }

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {/* Account Dropdown */}
            <div
                className="relative"
                tabIndex={-1}
                onBlur={handleBlur}
                ref={boxRef}
            >
                <label className="absolute left-3 top-1 text-[11px] text-neutral-400 z-10">
                    Account
                </label>
                {/* Account select box */}
                <div
                    className={`
                        h-12 border-b border-neutral-700 flex items-center px-3 
                        bg-neutral-800 cursor-pointer relative
                        transition focus-within:border-orange-500 rounded-t pt-3
                        ${dropdownOpen ? "border-orange-500" : ""}
                    `}
                    tabIndex={0}
                    id={id}
                    onClick={() => setDropdownOpen((v) => !v)}
                    onFocus={() => setIsFocused(true)}
                    {...rest}
                >
                    <div className="flex flex-row w-full items-center gap-2">
                        <div className="flex flex-col">
                            <div className="text-neutral-200 text-sm font-semibold truncate max-w-[140px]">
                                {selected?.label || (
                                    <span className="text-neutral-500">
                                        Select...
                                    </span>
                                )}
                            </div>
                        </div>
                        <ChevronsUpDown className="w-4 h-4 ml-auto text-neutral-500" />
                    </div>
                </div>
                {/* Dropdown */}
                <AnimatePresence>
                    {dropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{
                                type: "spring",
                                stiffness: 350,
                                damping: 30,
                            }}
                            className="absolute left-0 right-0 z-50 mt-1 bg-neutral-800 border border-neutral-700 rounded-b shadow-xl max-h-60 overflow-auto"
                        >
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    tabIndex={0}
                                    className={`
                                        w-full text-left px-4 py-2 flex flex-col
                                        ${
                                            opt.value === account
                                                ? "bg-orange-500/10 text-orange-400"
                                                : "hover:bg-neutral-700 text-neutral-300"
                                        }
                                    `}
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        setIsFocused(false);
                                        setAccount(opt.value);
                                        // Reset site to first site of new account
                                        setSite(opt.sites?.[0]?.name || "");
                                    }}
                                >
                                    <span className="text-sm font-semibold">
                                        {opt.label}
                                    </span>
                                    {opt.sites?.length > 0 && (
                                        <span className="text-[11px] text-neutral-400 -mt-0.5">
                                            {opt.sites.length} site
                                            {opt.sites.length > 1 ? "s" : ""}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Site Dropdown (if any) */}
            {selected?.sites && selected.sites.length > 0 && (
                <div className="relative">
                    <label className="absolute left-4 -top-1 text-[11px] text-neutral-400 z-10">
                        Site
                    </label>
                    <div
                        className={`
                            h-10 border-b border-neutral-700 flex items-center px-4 
                            bg-neutral-800 cursor-pointer relative
                            transition focus-within:border-orange-500 rounded-t
                            ${siteDropdownOpen ? "border-orange-500" : ""}
                        `}
                        tabIndex={0}
                        onClick={() => setSiteDropdownOpen((v) => !v)}
                    >
                        <div className="flex flex-row w-full items-center gap-2">
                            <div className="text-neutral-200 pt-2 text-sm font-semibold truncate max-w-[140px]">
                                {site || (
                                    <span className="text-neutral-500">
                                        Select site...
                                    </span>
                                )}
                            </div>
                            <ChevronsUpDown className="w-4 h-4 ml-auto text-neutral-500" />
                        </div>
                    </div>
                    <AnimatePresence>
                        {siteDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 350,
                                    damping: 30,
                                }}
                                className="
                                    absolute left-0 right-0 z-50 mt-1 bg-neutral-800 border border-neutral-700 rounded-b shadow-xl
                                    max-h-60 overflow-auto"
                            >
                                {selected.sites.map((s) => (
                                    <button
                                        key={s.name}
                                        type="button"
                                        tabIndex={0}
                                        className={`
                                            w-full text-left px-4 py-2
                                            ${
                                                site === s.name
                                                    ? "bg-orange-500/10 text-orange-400"
                                                    : "hover:bg-neutral-700 text-neutral-300"
                                            }
                                        `}
                                        onClick={() => {
                                            setSiteDropdownOpen(false);
                                            setSite(s.name);
                                        }}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
