// components/header/ProfileDropdown.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, Settings, LogOut } from "lucide-react";

export default function ProfileDropdown({}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    // close on outside click or ESC
    useEffect(() => {
        function onClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
            }
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
                className="flex items-center gap-2 bg-transparent hover:bg-neutral-700 px-3 py-2 rounded-full transition"
            >
                <span className="text-neutral-200 hidden sm:block"></span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 24,
                        }}
                        className="absolute bottom-full mb-2 right-0 w-48 bg-neutral-800 rounded-md shadow-lg overflow-hidden z-50"
                    ></motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
