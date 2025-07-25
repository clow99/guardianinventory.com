"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

// Utility: get X position/width for indicator
function getTabMeta(tabRefs, selectedIdx) {
    const node = tabRefs[selectedIdx]?.current;
    if (node) {
        const { offsetLeft: left, offsetWidth: width } = node;
        return { left, width };
    }
    return { left: 0, width: 0 };
}

export default function AnimatedTabs({
    options = [],
    initial,
    onChange,
    className = "",
    tabClassName = "",
    activeTabClassName = "",
    inactiveTabClassName = "",
    indicatorClassName = "",
}) {
    const [selected, setSelected] = useState(
        initial ?? options[0]?.value ?? ""
    );
    const selectedIdx = options.findIndex((opt) => opt.value === selected);

    // Refs for tab elements (to measure indicator position)
    const tabRefs = options.map(() => useRef(null));
    const [indicator, setIndicator] = useState({ left: 0, width: 0 });

    // Animate indicator when tab or layout changes
    useEffect(() => {
        setTimeout(() => {
            // Let layout update before measuring
            setIndicator(getTabMeta(tabRefs, selectedIdx));
        }, 0);
        // eslint-disable-next-line
    }, [selected, options.length]);

    function handleTab(option) {
        setSelected(option.value);
        onChange?.(option.value);
    }

    return (
        <div
            className={`relative flex w-fit border border-neutral-700 rounded h-8 shrink-0 overflow-hidden bg-transparent ${className}`}
            style={{ minWidth: 180 }}
        >
            {/* Animated Indicator */}
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 330, damping: 30 }}
                className={`absolute top-0 left-0 h-full bg-orange-500/20 rounded ${indicatorClassName}`}
                style={{
                    width: indicator.width,
                    left: indicator.left,
                    zIndex: 1,
                }}
            />
            {options.map((option, i) => (
                <button
                    key={option.value}
                    ref={tabRefs[i]}
                    type="button"
                    className={`
                        relative px-5 text-xs font-semibold h-8 transition-colors duration-150
                        ${
                            i !== options.length - 1
                                ? "border-r border-neutral-700"
                                : ""
                        }
                        ${tabClassName}
                        ${
                            selected === option.value
                                ? `text-orange-400 ${activeTabClassName}`
                                : `text-neutral-400 bg-transparent hover:bg-neutral-700 cursor-pointer ${inactiveTabClassName}`
                        }
                    `}
                    style={{ zIndex: 2, background: "transparent" }}
                    onClick={() => handleTab(option)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
