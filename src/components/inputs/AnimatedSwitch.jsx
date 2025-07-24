"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function AnimatedSwitch({
    checked,
    onChange,
    id,
    label,
    className = "",
    ...rest
}) {
    const [internalChecked, setInternalChecked] = useState(false);
    const isControlled = typeof checked === "boolean";
    const isOn = isControlled ? checked : internalChecked;

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
            className={`flex items-center gap-3 cursor-pointer select-none ${className}`}
        >
            <span className="relative inline-flex items-center">
                <input
                    type="checkbox"
                    id={id}
                    checked={isOn}
                    onChange={handleChange}
                    className="sr-only"
                    {...rest}
                />
                <motion.span
                    className={`
            w-10 h-6 flex items-center rounded-full px-1 border
            transition-colors
            ${
                isOn
                    ? "bg-orange-500/20 border-orange-400"
                    : "bg-neutral-800 border-neutral-700"
            }
          `}
                    animate={{
                        backgroundColor: isOn
                            ? "rgba(251,146,60,0.20)"
                            : "#262626",
                        borderColor: isOn ? "#f97316" : "#404040",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                >
                    <motion.span
                        className={`w-4 h-4 rounded-full shadow
              ${isOn ? "bg-orange-400" : "bg-neutral-400"}
            `}
                        layout
                        initial={false}
                        animate={{
                            x: isOn ? 16 : 0,
                            backgroundColor: isOn ? "#f97316" : "#a3a3a3",
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                        }}
                    />
                </motion.span>
            </span>
            {label && (
                <span className={"text-neutral-200 text-sm"}>{label}</span>
            )}
        </label>
    );
}
