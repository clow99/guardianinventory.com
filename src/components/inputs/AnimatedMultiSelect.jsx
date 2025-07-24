"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCheckbox from "./AnimatedCheckbox";

export default function AnimatedMultiSelect({
    label,
    value = [],
    onChange,
    id,
    options = [],
    className = "",
    ...rest
}) {
    const [isFocused, setIsFocused] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const boxRef = useRef();

    // label floats when focused, open, or any value selected
    const isFloating = isFocused || dropdownOpen || (value && value.length > 0);

    function handleBoxClick() {
        setDropdownOpen((open) => !open);
        setIsFocused(true);
    }

    function handleBlur(e) {
        if (!boxRef.current.contains(e.relatedTarget)) {
            setDropdownOpen(false);
            setIsFocused(false);
        }
    }

    function handleOptionClick(val) {
        let next;
        if (value.includes(val)) {
            next = value.filter((v) => v !== val);
        } else {
            next = [...value, val];
        }
        onChange && onChange(next);
    }

    function handleTagRemove(val, e) {
        e.stopPropagation();
        const newValue = value.filter((v) => v !== val);
        onChange && onChange(newValue);

        // If removing last, close dropdown and "unfocus"
        if (newValue.length === 0) {
            setDropdownOpen(false);
            setIsFocused(false);
        }
    }

    return (
        <div
            className={`relative w-full py-2 ${className}`}
            tabIndex={-1}
            onBlur={handleBlur}
            ref={boxRef}
        >
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
            {/* "Input" box area */}
            <div
                className={`min-h-[48px] w-full flex flex-wrap items-center gap-1 rounded border-2
                    ${dropdownOpen ? "border-orange-500" : "border-neutral-700"}
                    bg-neutral-800 px-4 pt-2 h-12 pb-2 text-base text-neutral-100 outline-none cursor-pointer transition
                    focus:border-orange-500`}
                tabIndex={0}
                onClick={handleBoxClick}
                onFocus={() => setIsFocused(true)}
                id={id}
                {...rest}
            >
                {value.map((val) => {
                    const opt = options.find((o) => o.value === val);
                    return (
                        <span
                            key={val}
                            className="flex items-center gap-1 bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-xs"
                        >
                            {opt?.label ?? val}
                            <button
                                tabIndex={-1}
                                className="ml-1 text-orange-400 hover:text-orange-600 focus:outline-none"
                                onClick={(e) => handleTagRemove(val, e)}
                                type="button"
                            >
                                ×
                            </button>
                        </span>
                    );
                })}
                <div className="flex-1" />
                <span className="ml-2 text-xs text-neutral-400 select-none pointer-events-none">
                    ▼
                </span>
            </div>
            {/* Dropdown */}
            <AnimatePresence>
                {dropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                        }}
                        className="absolute left-0 right-0 mt-1 z-20 rounded shadow-xl bg-neutral-800 border border-neutral-700 py-2"
                    >
                        {options.length === 0 && (
                            <div className="px-4 py-2 text-neutral-400 text-sm">
                                No options
                            </div>
                        )}
                        {options.map((opt) => {
                            const checked = value.includes(opt.value);
                            return (
                                <button
                                    type="button"
                                    tabIndex={0}
                                    key={opt.value}
                                    onClick={() => handleOptionClick(opt.value)}
                                    className={`w-full flex items-center px-4 py-0.5 text-left text-sm
                                        ${
                                            checked
                                                ? "bg-orange-500/10 text-neutral-100"
                                                : "hover:bg-neutral-700 text-neutral-400"
                                        }
                                    `}
                                >
                                    <AnimatedCheckbox
                                        checked={checked}
                                        onChange={() =>
                                            handleOptionClick(opt.value)
                                        }
                                        id={`${id || "multi"}-cb-${opt.value}`}
                                    />
                                    <span>{opt.label}</span>
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
