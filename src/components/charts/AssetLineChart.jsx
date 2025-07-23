"use client";
import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// Example data: Asset value tracked by month
const data = [
    { month: "Jan", Living: 18, Kids: 8, Office: 5, Bedroom: 9 },
    { month: "Feb", Living: 20, Kids: 10, Office: 7, Bedroom: 10 },
    { month: "Mar", Living: 22, Kids: 13, Office: 10, Bedroom: 11 },
    { month: "Apr", Living: 25, Kids: 16, Office: 11, Bedroom: 12 },
    { month: "May", Living: 27, Kids: 19, Office: 13, Bedroom: 13 },
    { month: "Jun", Living: 29, Kids: 17, Office: 12, Bedroom: 15 },
];

const series = [
    { key: "Living", color: "#f97316", icon: "🛋️" },
    { key: "Kids", color: "#2563eb", icon: "🧸" },
    { key: "Office", color: "#64748b", icon: "🗄️" },
    { key: "Bedroom", color: "#a3a3a3", icon: "🛏️" },
];

// Custom Tooltip (animated, dark style)
function CustomTooltip({ active, payload, label }) {
    return (
        <AnimatePresence>
            {active && payload && (
                <motion.div
                    key="tooltip"
                    initial={{ opacity: 0, scale: 0.97, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.18 }}
                    className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-lg"
                    style={{ pointerEvents: "none" }}
                >
                    <div className="text-sm text-gray-100 font-semibold mb-2">
                        {label}
                    </div>
                    <ul>
                        {payload.map((item, i) => (
                            <li
                                key={i}
                                className="flex items-center gap-2 mb-1"
                            >
                                <span style={{ fontSize: "1.1em" }}>
                                    {
                                        series.find((s) => s.key === item.name)
                                            ?.icon
                                    }
                                </span>
                                <span
                                    className="inline-block w-3 h-3 rounded-full"
                                    style={{
                                        background: item.color || item.stroke,
                                    }}
                                />
                                <span className="text-gray-100 font-medium">
                                    {item.name}: {item.value}
                                </span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Custom Legend
function CustomLegend({ payload }) {
    return (
        <ul className="flex flex-wrap gap-4 justify-end">
            {payload.map((entry, i) => (
                <li
                    key={i}
                    className="flex items-center gap-2 text-gray-200 text-sm"
                >
                    <span style={{ fontSize: "1.1em" }}>
                        {series.find((s) => s.key === entry.value)?.icon}
                    </span>
                    <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ background: entry.color }}
                    />
                    <span className="font-semibold text-gray-50">
                        {entry.value}
                    </span>
                </li>
            ))}
        </ul>
    );
}

export default function AssetLineChart() {
    return (
        <div className="flex flex-col bg-transparent border border-neutral-700 rounded p-4 w-full h-full">
            <h2 className="text-xl font-bold mb-4 text-white whitespace-nowrap">
                Asset Trends Over Time
            </h2>
            <ResponsiveContainer width="100%" height={340}>
                <LineChart
                    data={data}
                    margin={{ top: 12, right: 32, left: 0, bottom: 4 }}
                >
                    <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="#334155"
                        opacity={0.35}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="month"
                        tick={{ fill: "#d1d5db", fontSize: 14 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: "#d1d5db", fontSize: 13 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        wrapperClassName="!outline-none"
                    />
                    <Legend
                        verticalAlign="bottom"
                        align="right"
                        iconType="circle"
                        content={<CustomLegend />}
                    />
                    {series.map((s) => (
                        <Line
                            key={s.key}
                            type="monotone"
                            dataKey={s.key}
                            stroke={s.color}
                            strokeWidth={3}
                            dot={{
                                stroke: "#1e293b",
                                strokeWidth: 2,
                                fill: s.color,
                                r: 5,
                            }}
                            activeDot={{
                                r: 7,
                                stroke: "#fff",
                                strokeWidth: 3,
                                fill: s.color,
                            }}
                            isAnimationActive={true}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
