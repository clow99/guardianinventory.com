// components/header/ProfileDropdown.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    User as UserIcon,
    Settings as SettingsIcon,
    LogOut as LogOutIcon,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

function getInitials(nameOrEmail) {
    if (!nameOrEmail) return "?";
    const name = String(nameOrEmail);
    if (name.includes("@")) return name[0]?.toUpperCase() || "?";
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase() || first || "?";
}

export default function ProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);
    const { data: session } = useSession();
    const displayName = session?.user?.name || session?.user?.email || "User";
    const email = session?.user?.email || "";

    // close on outside click or ESC
    useEffect(() => {
        function onClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target))
                setIsOpen(false);
        }
        function onEsc(e) {
            if (e.key === "Escape") setIsOpen(false);
        }
        document.addEventListener("mousedown", onClickOutside);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onClickOutside);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    return (
        <div ref={ref} className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen((o) => !o)}
                className="flex items-center gap-2 bg-transparent hover:bg-neutral-700 px-3 py-2 rounded-md transition"
                aria-haspopup="menu"
                aria-expanded={isOpen}
            >
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-bold">
                    {getInitials(displayName)}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-neutral-200 text-sm font-semibold max-w-[180px] truncate">
                        {displayName}
                    </span>
                    {email && (
                        <span className="text-neutral-400 text-xs max-w-[180px] truncate">
                            {email}
                        </span>
                    )}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        role="menu"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 24,
                        }}
                        className="absolute top-full mt-2 right-0 w-56 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg overflow-hidden z-50"
                    >
                        <li className="px-4 py-2 border-b border-neutral-700">
                            <div className="text-neutral-200 text-sm font-semibold truncate">
                                {displayName}
                            </div>
                            {email && (
                                <div className="text-neutral-400 text-xs truncate">
                                    {email}
                                </div>
                            )}
                        </li>
                        <li>
                            <Link
                                href="/app/profile/view"
                                className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-700 text-neutral-200 text-sm"
                                onClick={() => setIsOpen(false)}
                            >
                                <UserIcon className="w-4 h-4" /> Profile
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/app/settings/general"
                                className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-700 text-neutral-200 text-sm"
                                onClick={() => setIsOpen(false)}
                            >
                                <SettingsIcon className="w-4 h-4" /> Settings
                            </Link>
                        </li>
                        <li>
                            <button
                                type="button"
                                className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-neutral-700 text-neutral-200 text-sm"
                                onClick={() => {
                                    setIsOpen(false);
                                    signOut({ callbackUrl: "/auth/login" });
                                }}
                            >
                                <LogOutIcon className="w-4 h-4" /> Sign out
                            </button>
                        </li>
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
