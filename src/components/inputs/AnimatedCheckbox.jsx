"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnimatedCheckbox({
    label,
    id,
    checked,
    onChange,
    className = "",
    defaultChecked, // Take it as a real prop
    ...rest
}) {
    const isControlled = typeof checked === "boolean";
    const [internalChecked, setInternalChecked] = useState(
        () => defaultChecked ?? false
    );
    const isChecked = isControlled ? checked : internalChecked;

    function handleChange(e) {
        if (isControlled) {
            onChange && onChange(e);
        } else {
            setInternalChecked(e.target.checked);
            onChange && onChange(e);
        }
    }

    return (
        <label
            htmlFor={id}
            className={`inline-flex items-center gap-2 cursor-pointer select-none h-8 px-1 py-1 rounded text-xs ${className}`}
            style={{ fontWeight: 500 }}
        >
            <span className="relative flex items-center justify-center w-4 h-4">
                <input
                    id={id}
                    type="checkbox"
                    onChange={handleChange}
                    className="absolute left-0 top-0 w-4 h-4 opacity-0 cursor-pointer m-0"
                    {...(isControlled
                        ? { checked: isChecked }
                        : { defaultChecked: internalChecked })}
                    {...rest}
                />

                <span
                    className={`
                        w-4 h-4 flex items-center justify-center rounded border transition
                        border-neutral-700 bg-neutral-800
                        overflow-hidden
                    `}
                    style={{ boxSizing: "border-box" }}
                >
                    {/* Animated border SVG */}
                    <AnimatePresence>
                        {isChecked && (
                            <motion.svg
                                key="border"
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                style={{ borderRadius: 4 }}
                            >
                                <motion.rect
                                    x="1.5"
                                    y="1.5"
                                    width="17"
                                    height="17"
                                    rx="4"
                                    stroke="#f97316"
                                    strokeWidth="1.3"
                                    fill="none"
                                    variants={{
                                        hidden: { pathLength: 0 },
                                        visible: { pathLength: 1 },
                                    }}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    transition={{
                                        duration: 0.28,
                                        ease: "easeInOut",
                                    }}
                                    style={{
                                        pathLength: isChecked ? 1 : 0,
                                    }}
                                />
                            </motion.svg>
                        )}
                    </AnimatePresence>

                    {/* Orange badge bg for checkmark */}
                    <AnimatePresence>
                        {isChecked && (
                            <motion.span
                                key="check-bg"
                                className="absolute inset-0 m-[2.5px] flex items-center justify-center rounded bg-orange-500/20"
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.7, opacity: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 36,
                                }}
                            />
                        )}
                    </AnimatePresence>
                    {/* Animated checkmark */}
                    <AnimatePresence>
                        {isChecked && (
                            <motion.svg
                                key="check"
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                fill="none"
                                className="w-3.5 h-3.5 z-20"
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.7, opacity: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 380,
                                    damping: 32,
                                }}
                            >
                                <motion.path
                                    d="M5 11L9 15L15 7"
                                    stroke="#fb923c"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    exit={{ pathLength: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        ease: "easeInOut",
                                    }}
                                />
                            </motion.svg>
                        )}
                    </AnimatePresence>
                </span>
            </span>
            <span className="text-neutral-200">{label}</span>
        </label>
    );
}
