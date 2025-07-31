"use client";
import { useState } from "react";
import AnimatedThemeCardSelector from "../inputs/AnimatedThemeCardSelector";
import ColourPicker from "../inputs/ColourPicker";

export default function AppearanceForm({ initialColor }) {
    const [theme, setTheme] = useState("system");

    return (
        <div className="flex flex-col p-2">
            <div className="flex flex-col border-b border-neutral-700 pb-10">
                <AnimatedThemeCardSelector value={theme} onChange={setTheme} />
            </div>
            <div className="flex flex-col border-b border-neutral-700 py-10">
                <ColourPicker initialColor={initialColor} />
            </div>
        </div>
    );
}
