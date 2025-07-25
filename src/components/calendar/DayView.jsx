import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function DayView({ selectedDate, goBack, events = [] }) {
    // Generate all 15-minute increments
    const intervals = 96;
    const timeSlots = Array.from({ length: intervals }).map((_, idx) => {
        const hour = Math.floor(idx / 4);
        const minute = (idx % 4) * 15;
        return {
            label: new Date(0, 0, 0, hour, minute).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            hour,
            minute,
            idx,
        };
    });

    const [expanded, setExpanded] = useState({}); // { "8-0": true }

    function handleAddEvent(hour, minute) {
        alert(`Add event at ${hour}:${minute.toString().padStart(2, "0")}`);
    }

    function toggleExpand(hour, minute) {
        const key = `${hour}-${minute}`;
        setExpanded((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    }

    return (
        <AnimatePresence>
            {selectedDate && (
                <motion.div
                    key="dayview"
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.98, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-0 h-full overflow-auto left-0 w-full border-x border-b border-neutral-700 rounded-b-lg p-5"
                >
                    <button
                        onClick={goBack}
                        className="mb-4 sticky top-1 text-sm text-orange-500 hover:underline cursor-pointer"
                    >
                        ← Back to Calendar
                    </button>
                    <h2 className="text-2xl font-bold text-neutral-100 mb-4">
                        Day View –{" "}
                        {selectedDate.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </h2>

                    <div className="flex flex-col gap-1">
                        {timeSlots.map(({ label, hour, minute, idx }) => {
                            const eventsAtThisTime = events.filter(
                                (e) => e.hour === hour && e.minute === minute
                            );
                            const key = `${hour}-${minute}`;
                            const isExpanded = expanded[key];

                            return (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 group"
                                >
                                    <div className="w-24 text-right pr-3 text-neutral-400 text-xs">
                                        {label}
                                    </div>
                                    <div className="flex-1">
                                        {eventsAtThisTime.length > 0 ? (
                                            <div>
                                                {!isExpanded ? (
                                                    <button
                                                        onClick={() =>
                                                            toggleExpand(
                                                                hour,
                                                                minute
                                                            )
                                                        }
                                                        className="w-full text-left px-3 py-2 rounded bg-orange-900/40 border border-orange-400 text-orange-200 transition flex items-center justify-between"
                                                    >
                                                        <div>
                                                            <div className="font-semibold">
                                                                {
                                                                    eventsAtThisTime[0]
                                                                        .title
                                                                }
                                                            </div>
                                                            <div className="text-xs text-neutral-400">
                                                                {
                                                                    eventsAtThisTime[0]
                                                                        .desc
                                                                }
                                                            </div>
                                                        </div>
                                                        {eventsAtThisTime.length >
                                                            1 && (
                                                            <span className="ml-2 text-xs text-orange-300 underline">
                                                                +
                                                                {eventsAtThisTime.length -
                                                                    1}{" "}
                                                                more
                                                            </span>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        {eventsAtThisTime.map(
                                                            (event, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="bg-orange-900/40 border border-orange-400 text-orange-200 px-3 py-2 rounded mb-1 flex items-center justify-between"
                                                                >
                                                                    <div>
                                                                        <div className="font-semibold">
                                                                            {
                                                                                event.title
                                                                            }
                                                                        </div>
                                                                        <div className="text-xs text-neutral-400">
                                                                            {
                                                                                event.desc
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    {i ===
                                                                        0 && (
                                                                        <button
                                                                            onClick={() =>
                                                                                toggleExpand(
                                                                                    hour,
                                                                                    minute
                                                                                )
                                                                            }
                                                                            className="ml-2 text-xs text-orange-300 underline"
                                                                        >
                                                                            Collapse
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    handleAddEvent(hour, minute)
                                                }
                                                className="w-full text-left px-3 py-2 rounded hover:bg-neutral-800/70 bg-neutral-900/30 border border-neutral-700 text-neutral-300"
                                            >
                                                <span className="text-xs italic text-neutral-500 group-hover:text-orange-300">
                                                    + Add event
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
