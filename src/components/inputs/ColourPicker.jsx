"use client";

import { useState, useEffect } from "react";
import AnimatedSelect from "./AnimatedSelect";

export default function ColourPicker({ initialColor }) {
    const [color, setColor] = useState(initialColor);

    // Update document style and set cookie when color changes
    useEffect(() => {
        document.documentElement.style.setProperty("--accent", color);

        // Set cookie for SSR persistence
        document.cookie = `accent-color=${color}; path=/; max-age=31536000`; // 1 year
    }, [color]);

    return (
        <div className="flex flex-col">
            <div className="font-medium text-neutral-200 mb-1">
                Interface theme
            </div>
            <div className="text-neutral-400 text-sm mb-4">
                Select or customize your UI theme.
            </div>
            <div className="flex flex-row items-center gap-10">
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-12 border-2 border-neutral-700 rounded-lg bg-transparent cursor-pointer"
                    style={{ boxShadow: `0 0 0 2px ${color}44` }}
                />
                <div className="w-[300px]">
                    <AnimatedSelect
                        label="Select Option"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        id="select-option"
                        options={[
                            { value: "#f97316", label: "Orange" },
                            { value: "#2563eb", label: "Blue" },
                            { value: "#10b981", label: "Green" },
                            { value: "#e11d48", label: "Red" },
                            { value: "#8b5cf6", label: "Purple" },
                        ]}
                        className=""
                    />
                </div>
            </div>
            <span className="text-neutral-400 text-sm mt-1">{color}</span>
        </div>
    );
}
