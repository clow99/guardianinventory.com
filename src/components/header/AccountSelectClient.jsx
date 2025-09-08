"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsUpDown } from "lucide-react";
import { useAccount } from "@/app/hooks/useAccount";

/**
 * Client-only interactive dropdown for picking an account.
 * Expects SSR-provided options and selectedAccountId for hydration.
 */
export default function AccountSelectClient({
    options: initialOptions = [],
    selectedAccountId = null,
    label = "Account",
    id = "account-select",
    className = "",
    ...rest
}) {
    const { accountId, setAccountId } = useAccount();
    const [options] = useState(() => initialOptions);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const boxRef = useRef();

    // Local selection, seeded from SSR selected or session
    const [account, setAccount] = useState(() =>
        accountId ?? selectedAccountId ?? null
            ? String(accountId ?? selectedAccountId)
            : ""
    );
    // Keep local selection synced with session changes
    useEffect(() => {
        const next = accountId
            ? String(accountId)
            : selectedAccountId
            ? String(selectedAccountId)
            : "";
        setAccount(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountId]);

    const selected = options.find((o) => o.value === account);

    function handleBlur(e) {
        if (!boxRef.current?.contains(e.relatedTarget)) {
            setDropdownOpen(false);
            setIsFocused(false);
        }
    }

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <div
                className="relative"
                tabIndex={-1}
                onBlur={handleBlur}
                ref={boxRef}
            >
                <label className="absolute left-3 top-1 text-[11px] text-neutral-400 z-10">
                    {label}
                </label>
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
                                        Select…
                                    </span>
                                )}
                            </div>
                        </div>
                        <ChevronsUpDown className="w-4 h-4 ml-auto text-neutral-500" />
                    </div>
                </div>
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
                                    onClick={async () => {
                                        setDropdownOpen(false);
                                        setIsFocused(false);
                                        setAccount(opt.value);
                                        // Persist cookie/localStorage and server last_selected first to avoid race
                                        try {
                                            document.cookie = `account_id=${Number(
                                                opt.value
                                            )}; path=/; max-age=${
                                                30 * 24 * 60 * 60
                                            }`;
                                            localStorage.setItem(
                                                "lastAccountId",
                                                String(opt.value)
                                            );
                                        } catch {}
                                        // Update session token + broadcast change immediately
                                        setAccountId(Number(opt.value));
                                        try {
                                            await fetch(
                                                "/api/accounts/select",
                                                {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                    },
                                                    body: JSON.stringify({
                                                        account_id: Number(
                                                            opt.value
                                                        ),
                                                    }),
                                                }
                                            );
                                        } catch {}
                                        // No route refresh; client data hooks refetch on accountId change
                                    }}
                                >
                                    <span className="text-sm font-semibold">
                                        {opt.label}
                                    </span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
