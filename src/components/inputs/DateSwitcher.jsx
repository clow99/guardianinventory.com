"use client";

import React, { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateSwitcher() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const paramDate = searchParams.get("date");
    const initialDate = paramDate ? new Date(paramDate) : new Date();
    const [selectedDate, setSelectedDate] = useState(initialDate);

    const updateDate = useCallback(
        (date) => {
            setSelectedDate(date);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            const formatted = `${yyyy}-${mm}-${dd}`;
            router.replace(`?date=${formatted}`, { scroll: false });
        },
        [router]
    );

    const prevMonth = useCallback(() => {
        const prev = new Date(selectedDate);
        prev.setMonth(selectedDate.getMonth() - 1);
        updateDate(prev);
    }, [selectedDate, updateDate]);

    const nextMonth = useCallback(() => {
        const next = new Date(selectedDate);
        next.setMonth(selectedDate.getMonth() + 1);
        updateDate(next);
    }, [selectedDate, updateDate]);

    return (
        <motion.div
            className="flex flex-col gap-1"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <div className=" flex flex-row items-center gap-2 border border-neutral-700 rounded">
                <button
                    className="rounded px-2 py-1 text-neutral-400 hover:bg-neutral-800 transition"
                    onClick={prevMonth}
                    type="button"
                    aria-label="Previous Month"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="relative w-[140px] flex items-center">
                    <label
                        htmlFor="date-switcher-datepicker"
                        className="sr-only"
                    >
                        Select date
                    </label>
                    <ReactDatePicker
                        id="date-switcher-datepicker"
                        aria-label="Select date"
                        selected={selectedDate}
                        onChange={updateDate}
                        dateFormat="MM-dd-yyyy"
                        className="w-[140px] h-8 px-2 rounded text-sm text-neutral-100 border-none focus:outline-none text-center"
                        calendarClassName="border-none shadow-lg"
                        popperPlacement="bottom"
                    />
                </div>

                <button
                    className="rounded px-2 py-1 text-neutral-400 hover:bg-neutral-800 transition"
                    onClick={nextMonth}
                    type="button"
                    aria-label="Next Month"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
