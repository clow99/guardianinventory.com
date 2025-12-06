"use client";

import React, { useState, useEffect } from "react";
import { MoveRight } from "lucide-react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics";

export default function DateRangeSelector({
    label = "Select Date Range",
    startLabel = "Start",
    endLabel = "End",
    value = { start: "", end: "" },
    onChange,
    error,
    ...props
}) {
    const [range, setRange] = useState(value);
    const [arrowKey, setArrowKey] = useState(0);

    useEffect(() => {
        setArrowKey((k) => k + 1); // trigger arrow animation on date change
    }, [range.start, range.end]);

    function serializeDate(date) {
        if (!date) return null;
        if (date instanceof Date && !Number.isNaN(date.getTime())) {
            return date.toISOString();
        }
        if (typeof date === "string") return date;
        return String(date);
    }

    function handleChange(part, newValue) {
        const updated = { ...range, [part]: newValue };
        setRange(updated);
        onChange?.(updated);
        trackEvent("date_range_updated", {
            label,
            field: part,
            start: serializeDate(updated.start),
            end: serializeDate(updated.end),
        });
    }

    return (
        <motion.div
            className="flex flex-col gap-1"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <div className="flex flex-row items-center gap-2 p-2">
                <div className="flex flex-col">
                    <ReactDatePicker
                        selected={range.start}
                        onChange={(date) => handleChange("start", date)}
                        dateFormat="MM-dd-yyyy"
                        className="w-full h-8 px-2 rounded text-sm text-neutral-100 border-b border-neutral-700 focus:outline-none"
                        calendarClassName="border-none shadow-lg ml-[130px]"
                        popperPlacement="bottom"
                    />
                    {error?.start && (
                        <span className="text-xs text-red-500 mt-1">
                            {error.start}
                        </span>
                    )}
                </div>

                <MoveRight className="w-5 h-5 text-neutral-400" />

                <div className="flex flex-col">
                    <ReactDatePicker
                        selected={range.end}
                        onChange={(date) => handleChange("end", date)}
                        dateFormat="MM-dd-yyyy"
                        className="w-full h-8 px-2 rounded text-sm text-neutral-100 border-b border-neutral-700 focus:outline-none"
                        calendarClassName="border-none shadow-lg mr-[130px]"
                        popperPlacement="bottom"
                    />
                    {error?.end && (
                        <span className="text-xs text-red-500 mt-1">
                            {error.end}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
