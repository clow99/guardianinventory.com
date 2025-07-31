import React, { useState } from "react";

/**
 * @param {Array<{label: string, key: string, icon?: React.ReactNode}>} tabs
 * @param {string} [value] Controlled active tab key (optional)
 * @param {(key: string) => void} [onChange] Called when tab changes (optional)
 * @param {string} [className] Additional classes for outer div (optional)
 */
export function Tabs({ tabs, value, onChange, className = "" }) {
    // Allow controlled or uncontrolled mode
    const [internalValue, setInternalValue] = useState(tabs[0]?.key ?? "");
    const active = value !== undefined ? value : internalValue;

    const handleSelect = (key) => {
        if (onChange) onChange(key);
        if (value === undefined) setInternalValue(key);
    };

    return (
        <div
            className={`flex flex-row gap-3 border-b border-neutral-700 mb-10 ${className}`}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    className={`group relative px-5 py-2 rounded-t transition
                        ${
                            active === tab.key
                                ? "bg-orange-500/80 text-white"
                                : "text-neutral-400 hover:text-white cursor-pointer"
                        }
                    `}
                    onClick={() => handleSelect(tab.key)}
                    type="button"
                >
                    <span className="flex items-center gap-2 whitesspace-nowrap text-sm">
                        {tab.icon && tab.icon}
                        {tab.label}
                    </span>
                    <div
                        className={`absolute bottom-0 left-0 w-full border-b 
                        ${
                            active === tab.key
                                ? "border-orange-500"
                                : "border-transparent group-hover:border-orange-500"
                        } text-xs`}
                    ></div>
                </button>
            ))}
        </div>
    );
}
