"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const defaultData = [
    { name: "Jan", seriesA: 4000, seriesB: 2400, seriesC: 2400 },
    { name: "Feb", seriesA: 3000, seriesB: 1398, seriesC: 2210 },
    { name: "Mar", seriesA: 2000, seriesB: 9800, seriesC: 2290 },
    { name: "Apr", seriesA: 2780, seriesB: 3908, seriesC: 2000 },
    { name: "May", seriesA: 1890, seriesB: 4800, seriesC: 2181 },
    { name: "Jun", seriesA: 2390, seriesB: 3800, seriesC: 2500 },
    { name: "Jul", seriesA: 3490, seriesB: 4300, seriesC: 2100 },
];

import { motion, AnimatePresence } from "framer-motion";

const CustomBarTooltip = ({ active, payload, label }) => (
    <AnimatePresence>
        {active && payload && payload.length && (
            <motion.div
                key="bar-tooltip"
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", duration: 0.22 }}
                className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-lg min-w-[160px]"
                style={{ pointerEvents: "none" }}
            >
                <div className="text-gray-200 font-semibold mb-1">{label}</div>
                <ul className="space-y-1">
                    {payload.map((entry, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                            <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{
                                    background: entry.color || entry.fill,
                                }}
                            />
                            <span className="text-sm text-gray-300">
                                {entry.name}:
                            </span>
                            <span className="font-bold text-gray-100 ml-1">
                                {entry.value}
                            </span>
                        </li>
                    ))}
                </ul>
            </motion.div>
        )}
    </AnimatePresence>
);

export default function DoubleBarGraph({
    graphData = defaultData,
    title = "Double Bar Graph",
}) {
    return (
        <div className="bg-transparent border border-neutral-700 rounded p-4">
            <h2 className="text-neutral-200 text-lg font-semibold mb-4">
                {title}
            </h2>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={graphData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        content={<CustomBarTooltip />}
                    />
                    <Legend />
                    <Bar
                        dataKey="seriesA"
                        name="Series A"
                        barSize={32}
                        radius={[2, 2, 0, 0]}
                        fill="#f97316"
                    />
                    <Bar
                        dataKey="seriesB"
                        name="Series B"
                        barSize={32}
                        radius={[2, 2, 0, 0]}
                        fill="#737373"
                    />
                    <Bar
                        dataKey="seriesC"
                        name="Series C"
                        barSize={32}
                        radius={[2, 2, 0, 0]}
                        fill="#3b82f6"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
