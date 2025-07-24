"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

// Props: label, value, onChange, id, rows, className, ...rest
export default function AnimatedTextarea({
    label,
    value,
    onChange,
    id,
    rows = 4,
    className = "",
    ...rest
}) {
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef();

    const isFloating = isFocused || (value && value.length > 0);

    return (
        <div className={`relative w-full py-2 ${className}`}>
            <motion.label
                htmlFor={id}
                initial={false}
                animate={{
                    x: isFloating ? 8 : 16,
                    y: isFloating ? -5 : 18,
                    scale: isFloating ? 0.85 : 1,
                    color: isFloating ? "#fb923c" : "#a3a3a3",
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
            <textarea
                ref={textareaRef}
                id={id}
                value={value}
                rows={rows}
                autoComplete="off"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={onChange}
                className="w-full rounded border-2 border-neutral-700 bg-neutral-800 px-4 pt-2 pb-2 text-base text-neutral-100 outline-none focus:border-orange-500 transition min-h-[60px] resize-y"
                {...rest}
            />
        </div>
    );
}
