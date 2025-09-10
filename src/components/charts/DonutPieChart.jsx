"use client";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const defaultData = [
    { name: "Living room", value: 25, color: "#f97316", icon: "🛋️" }, // Brand orange
    { name: "Kids", value: 17, color: "#2563eb", icon: "🧸" }, // Blue-600
    { name: "Office", value: 13, color: "#64748b", icon: "🗄️" }, // Slate-500
    { name: "Bedroom", value: 12, color: "#a3a3a3", icon: "🛏️" }, // Neutral-400
    { name: "Kitchen", value: 9, color: "#22c55e", icon: "🍽️" }, // Emerald-500
    { name: "Decor", value: 5, color: "#475569", icon: "🖼️" }, // Slate-600
    { name: "Lighting", value: 3, color: "#fbbf24", icon: "💡" }, // Amber-400
    { name: "Misc", value: 16, color: "#e11d48", icon: "📦" }, // Red-600
    { name: "Outdoor", value: 10, color: "#8b5cf6", icon: "🌳" }, // Violet-500
    { name: "Garage", value: 8, color: "#f97316", icon: "🚗" }, // Brand orange
];

// Custom Legend stays the same
function CustomLegend({ payload }) {
    return (
        <ul className="space-y-2">
            {payload.map((entry, i) => (
                <li
                    key={i}
                    className="flex items-center gap-2 text-gray-200 text-sm"
                >
                    <span style={{ fontSize: "1.15em" }}>
                        {entry?.payload?.icon}
                    </span>
                    <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ background: entry.color }}
                    />
                    <span className="font-semibold text-gray-50">
                        {entry.value}%
                    </span>
                    <span className="ml-1 text-gray-300 font-medium">
                        {entry?.payload?.name}
                    </span>
                </li>
            ))}
        </ul>
    );
}

// Custom Tooltip for dark mode
import { motion, AnimatePresence } from "framer-motion";

const CustomTooltip = ({ active, payload }) => (
    <AnimatePresence>
        {active && payload && payload.length && (
            <motion.div
                key="tooltip"
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", duration: 0.22 }}
                className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-lg"
                style={{ pointerEvents: "none" }}
            >
                <div className="flex items-center gap-2">
                    <span style={{ fontSize: "1.2em" }}>
                        {payload[0].payload.icon}
                    </span>
                    <span className="text-white font-bold">
                        {payload[0].payload.name}
                    </span>
                </div>
                <div className="mt-1 text-sm">
                    <span className="text-gray-300">Value: </span>
                    <span className="text-gray-100">
                        {payload[0].payload.value}%
                    </span>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default function DonutPieChart({
    data = defaultData,
    title = "Asset Distribution",
}) {
    return (
        <div className="flex flex-row bg-transparent border border-neutral-700 rounded p-4 w-full h-full">
            <div className="flex-1 w-full min-w-0">
                <h2 className="text-xl font-bold mb-5 text-white whitespace-nowrap">
                    {title}
                </h2>
                <CustomLegend
                    payload={data.map((d, i) => ({
                        color: d.color,
                        value: d.value,
                        payload: d,
                    }))}
                />
            </div>
            <div className="flex-1 w-full min-w-0">
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={2}
                            stroke="none"
                        >
                            {data.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            content={<CustomTooltip />}
                            wrapperClassName="!outline-none"
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
