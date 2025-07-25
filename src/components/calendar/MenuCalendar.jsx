"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year, month) {
    return new Date(year, month, 1).getDay();
}
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MenuCalendar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const today = new Date();

    // Grab the date from the URL (for external control/initialization)
    const urlDateParam = searchParams.get("date");
    let urlDateObj = null;
    if (urlDateParam && /^\d{4}-\d{2}-\d{2}$/.test(urlDateParam)) {
        urlDateObj = new Date(urlDateParam + "T00:00:00");
    }

    const initialYear = urlDateObj
        ? urlDateObj.getFullYear()
        : today.getFullYear();
    const initialMonth = urlDateObj ? urlDateObj.getMonth() : today.getMonth();

    const [currentMonth, setCurrentMonth] = useState(initialMonth);
    const [currentYear, setCurrentYear] = useState(initialYear);
    const [direction, setDirection] = useState(0);

    // Track previous month/year for correct animation direction
    const prevMonthRef = useRef(initialMonth);
    const prevYearRef = useRef(initialYear);

    // --- If the URL date changes, jump/animate to that date ---
    useEffect(() => {
        if (
            urlDateObj &&
            (urlDateObj.getMonth() !== currentMonth ||
                urlDateObj.getFullYear() !== currentYear)
        ) {
            const prevYear = prevYearRef.current;
            const prevMonth = prevMonthRef.current;
            let dir = 0;
            if (urlDateObj.getFullYear() === prevYear) {
                dir =
                    urlDateObj.getMonth() > prevMonth
                        ? 1
                        : urlDateObj.getMonth() < prevMonth
                        ? -1
                        : 0;
            } else {
                const totalNow =
                    urlDateObj.getFullYear() * 12 + urlDateObj.getMonth();
                const totalPrev = prevYear * 12 + prevMonth;
                dir = totalNow > totalPrev ? 1 : -1;
            }
            setDirection(dir);
            setCurrentYear(urlDateObj.getFullYear());
            setCurrentMonth(urlDateObj.getMonth());
            prevMonthRef.current = urlDateObj.getMonth();
            prevYearRef.current = urlDateObj.getFullYear();
        }
        // eslint-disable-next-line
    }, [urlDateParam]); // Only triggers if URL date changes

    // Animate if month/year changes via local arrow navigation
    function changeMonth(newYear, newMonth) {
        const prevYear = prevYearRef.current;
        const prevMonth = prevMonthRef.current;
        let dir = 0;
        if (newYear === prevYear) {
            dir = newMonth > prevMonth ? 1 : newMonth < prevMonth ? -1 : 0;
        } else {
            const totalNow = newYear * 12 + newMonth;
            const totalPrev = prevYear * 12 + prevMonth;
            dir = totalNow > totalPrev ? 1 : -1;
        }
        setDirection(dir);
        setCurrentYear(newYear);
        setCurrentMonth(newMonth);
        prevMonthRef.current = newMonth;
        prevYearRef.current = newYear;
    }

    function prevMonth() {
        let newMonth = currentMonth - 1;
        let newYear = currentYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear = currentYear - 1;
        }
        changeMonth(newYear, newMonth);
    }

    function nextMonth() {
        let newMonth = currentMonth + 1;
        let newYear = currentYear;
        if (newMonth > 11) {
            newMonth = 0;
            newYear = currentYear + 1;
        }
        changeMonth(newYear, newMonth);
    }

    // Calendar day grid
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
    const blanks = Array(firstDayOfWeek).fill(null);
    const days = [...Array(daysInMonth).keys()].map((i) => i + 1);
    const calendarDays = [...blanks, ...days];

    function isToday(day) {
        return (
            day &&
            currentYear === today.getFullYear() &&
            currentMonth === today.getMonth() &&
            day === today.getDate()
        );
    }
    function isSelectedFromURL(day) {
        return (
            urlDateObj &&
            currentYear === urlDateObj.getFullYear() &&
            currentMonth === urlDateObj.getMonth() &&
            day === urlDateObj.getDate()
        );
    }

    // Clicking a day updates the URL, syncing with parent
    function handleDayClick(day) {
        const newDate = new Date(currentYear, currentMonth, day);
        const y = newDate.getFullYear();
        const m = String(newDate.getMonth() + 1).padStart(2, "0");
        const d = String(newDate.getDate()).padStart(2, "0");
        const dateString = `${y}-${m}-${d}`;
        router.push(`?date=${dateString}`);
    }

    return (
        <div className="p-2 min-h-[295px]">
            <div className="flex justify-between items-center mb-2">
                <button
                    onClick={prevMonth}
                    className="relative group w-8 h-8 cursor-pointer flex items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-700 transition bg-transparent"
                    aria-label="Previous Month"
                >
                    <ChevronLeft className="w-5 h-5 text-neutral-400 group-hover:text-orange-500 ease-in-out duration-200" />
                </button>
                <div className="font-bold text-lg text-neutral-200">
                    {new Date(currentYear, currentMonth).toLocaleString(
                        "default",
                        {
                            month: "long",
                            year: "numeric",
                        }
                    )}
                </div>
                <button
                    onClick={nextMonth}
                    className="relative group w-8 h-8 cursor-pointer flex items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-700 transition bg-transparent"
                    aria-label="Next Month"
                >
                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-orange-500 ease-in-out duration-200" />
                </button>
            </div>
            <div className="grid grid-cols-7 text-center mb-2 text-neutral-300 text-xs">
                {WEEK_DAYS.map((day) => (
                    <div key={day}>{day.charAt(0)}</div>
                ))}
            </div>
            <div className="relative min-h-[180px]">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentYear + "-" + currentMonth}
                        className="grid grid-cols-7 text-center gap-1 absolute w-full"
                        custom={direction}
                        initial={{
                            x: direction > 0 ? 40 : direction < 0 ? -40 : 0,
                            opacity: 0,
                        }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{
                            x: direction > 0 ? -40 : direction < 0 ? 40 : 0,
                            opacity: 0,
                        }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                    >
                        {calendarDays.map((day, idx) =>
                            day ? (
                                <button
                                    key={idx}
                                    type="button"
                                    className={`p-1 border-2 rounded cursor-pointer text-sm w-8 h-8 flex items-center justify-center
                                        ${
                                            isSelectedFromURL(day)
                                                ? "border-orange-500/50 text-white font-bold"
                                                : isToday(day)
                                                ? "bg-orange-500/20 text-white border-transparent"
                                                : "hover:bg-orange-500/10 text-neutral-400 border-transparent hover:text-white"
                                        }
                                    `}
                                    onClick={() => handleDayClick(day)}
                                >
                                    {day}
                                </button>
                            ) : (
                                <div key={idx}></div>
                            )
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
