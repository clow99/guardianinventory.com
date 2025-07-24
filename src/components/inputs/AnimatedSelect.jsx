"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

// options: array of { value, label }
export default function AnimatedSelect({
    label,
    value,
    onChange,
    id,
    options = [],
    className = "",
    ...rest
}) {
    const [isFocused, setIsFocused] = useState(false);
    const selectRef = useRef();

    const isFloating = isFocused || (value && value !== "");

    return (
        <div className={`relative w-full py-2 ${className}`}>
            <motion.label
                htmlFor={id}
                initial={false}
                animate={{
                    x: isFloating ? 8 : 16,
                    y: isFloating ? -5 : 18,
                    scale: isFloating ? 0.85 : 1,
                    color: isFloating ? "#fb923c" : "#a3a3a3", // orange-500/neutral-400
                    backgroundColor: isFloating ? "#262626" : "transparent",
                    paddingLeft: isFloating ? 3 : 0,
                    paddingRight: isFloating ? 3 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 23,
                }}
                className="absolute pointer-events-none z-10 px-1 py-1"
                style={{
                    top: 0,
                    left: 0,
                    borderRadius: 4,
                    fontSize: isFloating ? "0.85rem" : "1rem",
                    lineHeight: 1.2,
                }}
            >
                {label}
            </motion.label>
            <select
                ref={selectRef}
                id={id}
                value={value}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={onChange}
                className="w-full rounded h-12 border-2 border-neutral-700 bg-neutral-800 px-4 pt-2 pb-2 text-base text-neutral-100 outline-none focus:border-orange-500 transition appearance-none"
                {...rest}
            >
                <option value="" disabled hidden>
                    {/* Invisible placeholder for correct label animation */}
                </option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {/* Optional: custom arrow */}
            <div className="pointer-events-none text-xs absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                ▼
            </div>
        </div>
    );
}
