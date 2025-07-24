"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const themes = [
    {
        key: "system",
        label: "System preference",
        preview: (
            <div className="flex h-16 rounded-[8px] overflow-hidden">
                <div className="w-1/2 bg-neutral-900 flex flex-col p-1">
                    <div className="h-2 w-10 rounded bg-neutral-800 mb-2" />
                    <div className="h-3 rounded bg-neutral-700" />
                    <div className="h-2 w-7 rounded bg-neutral-800 mt-1" />
                </div>
                <div className="w-1/2 bg-neutral-100 flex flex-col p-1">
                    <div className="h-2 w-10 rounded bg-neutral-200 mb-2" />
                    <div className="h-3 rounded bg-neutral-300" />
                    <div className="h-2 w-7 rounded bg-neutral-200 mt-1" />
                </div>
            </div>
        ),
    },
    {
        key: "light",
        label: "Light",
        preview: (
            <div className="flex h-16 bg-neutral-100 rounded-[8px] overflow-hidden">
                <div className="w-1/3 bg-neutral-200 flex flex-col p-1">
                    <div className="h-2 w-7 rounded bg-neutral-300 mb-2" />
                    <div className="h-3 rounded bg-neutral-400" />
                </div>
                <div className="w-2/3 flex flex-col p-1">
                    <div className="h-2 w-10 rounded bg-neutral-200 mb-2" />
                    <div className="h-3 rounded bg-neutral-300" />
                </div>
            </div>
        ),
    },
    {
        key: "dark",
        label: "Dark",
        preview: (
            <div className="flex h-16 bg-neutral-900 rounded-[8px] overflow-hidden">
                <div className="w-1/3 bg-neutral-800 flex flex-col p-1">
                    <div className="h-2 w-7 rounded bg-neutral-700 mb-2" />
                    <div className="h-3 rounded bg-neutral-700" />
                </div>
                <div className="w-2/3 flex flex-col p-1">
                    <div className="h-2 w-10 rounded bg-neutral-800 mb-2" />
                    <div className="h-3 rounded bg-neutral-700" />
                </div>
            </div>
        ),
    },
];

export default function AnimatedThemeCardSelector({ value, onChange }) {
    const [selected, setSelected] = useState(value || "system");
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    function handleSelect(key) {
        setSelected(key);
        onChange && onChange(key);
    }

    return (
        <div>
            <div className="font-medium text-neutral-200 mb-1">
                Interface theme
            </div>
            <div className="text-neutral-400 text-sm mb-4">
                Select or customize your UI theme.
            </div>
            <div className="flex gap-6">
                {themes.map((theme) => {
                    const isActive = selected === theme.key;
                    return (
                        <motion.button
                            key={theme.key}
                            type="button"
                            aria-label={theme.label}
                            layout
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 32,
                            }}
                            whileTap={{ scale: 0.98 }}
                            whileHover={{ scale: 0.98 }}
                            className={`
                                group relative w-56 p-4 rounded-xl flex flex-col items-center 
                                bg-neutral-900/70 outline-none
                                border border-neutral-700 cursor-pointer
                            `}
                            onClick={() => handleSelect(theme.key)}
                        >
                            {/* --- FIX: Border only gets layoutId after mount --- */}
                            {isActive && !hasMounted && (
                                <span className="absolute inset-0 rounded-xl border-2 border-orange-500 pointer-events-none z-20" />
                            )}
                            <AnimatePresence>
                                {isActive && hasMounted && (
                                    <motion.span
                                        layoutId="theme-border-orange"
                                        className="absolute inset-0 rounded-xl border-2 border-orange-500 pointer-events-none z-20"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 350,
                                            damping: 26,
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                            {/* Preview */}
                            <div className="w-full">{theme.preview}</div>
                            {/* Animated checkmark */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.span
                                        key="check"
                                        className="absolute left-3 top-3 bg-orange-500 rounded-full w-5 h-5 flex items-center justify-center shadow z-30"
                                        initial={
                                            hasMounted
                                                ? { scale: 0.7, opacity: 0 }
                                                : false
                                        }
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.7, opacity: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 330,
                                            damping: 26,
                                        }}
                                    >
                                        <Check className="w-4 h-4 text-white" />
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {/* Label */}
                            <div
                                className={`mt-4 font-medium text-base z-30 ${
                                    isActive
                                        ? "text-orange-500"
                                        : "text-neutral-300 group-hover:text-neutral-100"
                                }`}
                            >
                                {theme.label}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
