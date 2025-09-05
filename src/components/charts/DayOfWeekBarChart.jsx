"use client";
import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// Example data: one sum per day
const defaultData = [
    { day: "Mon", value: 16, icon: "🌑" },
    { day: "Tue", value: 23, icon: "🌒" },
    { day: "Wed", value: 12, icon: "🌓" },
    { day: "Thu", value: 19, icon: "🌔" },
    { day: "Fri", value: 29, icon: "🌕" },
    { day: "Sat", value: 15, icon: "🌖" },
    { day: "Sun", value: 9, icon: "🌗" },
];

// You can customize bar colors per day or use one color:
const barColors = [
    "#f97316", // Mon
    "#f97316", // Tue
    "#f97316", // Wed
    "#f97316", // Thu
    "#f97316", // Fri
    "#f97316", // Sat
    "#f97316", // Sun
];

// Custom Tooltip
function CustomTooltip({ active, payload }) {
    return (
        <AnimatePresence>
            {active && payload && payload.length > 0 && (
                <motion.div
                    key="tooltip"
                    initial={{ opacity: 0, scale: 0.97, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.18 }}
                    className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-lg"
                    style={{ pointerEvents: "none" }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <span style={{ fontSize: "1.2em" }}>
                            {payload[0].payload.icon}
                        </span>
                        <span className="text-white font-semibold">
                            {payload[0].payload.day}
                        </span>
                    </div>
                    <div className="text-sm">
                        <span className="text-gray-300">Sum: </span>
                        <span className="text-gray-100">
                            {payload[0].payload.value}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Custom Legend (optional)
function CustomLegend({ payload }) {
    return (
        <ul className="flex flex-wrap gap-4">
            {payload.map((entry, i) => (
                <li
                    key={i}
                    className="flex items-center gap-2 text-gray-200 text-sm"
                >
                    <span style={{ fontSize: "1.1em" }}>{dayData[i].icon}</span>
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

export default function DayOfWeekBarChart({
    data = defaultData,
    title = "Sums by Day of Week",
}) {
    return (
        <div className="flex flex-col bg-transparent border border-neutral-700 rounded p-4 w-full h-full">
            <h2 className="text-xl font-bold mb-4 text-white whitespace-nowrap">
                {title}
            </h2>
            <ResponsiveContainer width="100%" height={320}>
                <BarChart
                    data={data}
                    margin={{ top: 18, right: 24, left: 0, bottom: 6 }}
                >
                    <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="#334155"
                        opacity={0.34}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="day"
                        tick={{
                            fill: "#d1d5db",
                            fontSize: 15,
                        }}
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
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    />
                    {/* <Legend content={<CustomLegend />} />  Uncomment if you want a legend */}
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} minPointSize={2}>
                        {data.map((entry, idx) => (
                            <Cell
                                key={`cell-${idx}`}
                                fill={barColors[idx % barColors.length]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
