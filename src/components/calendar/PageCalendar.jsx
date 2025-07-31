"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import SearchInput from "../inputs/SearchInput";
import AnimatedTabs from "../inputs/AnimatedTabs";
import DateSwitcher from "../inputs/DateSwitcher";
import DayView from "./DayView";

// DEMO EVENTS — replace with your real events source
const demoEvents = [
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-24", // YYYY-MM-DD
        title: "Standup",
        desc: "Daily sync-up",
        hour: 8,
        minute: 0,
    },
    {
        date: "2025-07-25",
        title: "Demo",
        desc: "Client walkthrough",
        hour: 13,
        minute: 15,
    },
    {
        date: "2025-07-25",
        title: "Team Lunch",
        desc: "At the park",
        hour: 12,
        minute: 0,
    },
];

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year, month) {
    return new Date(year, month, 1).getDay();
}
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const today = new Date();

    // --- Parse date from URL ---
    const urlDateParam = searchParams.get("date");
    let urlDateObj = null;
    if (urlDateParam && /^\d{4}-\d{2}-\d{2}$/.test(urlDateParam)) {
        urlDateObj = new Date(urlDateParam + "T00:00:00");
    }

    // --- Track previous month/year to set direction ---
    const prevYearRef = useRef(
        urlDateObj ? urlDateObj.getFullYear() : today.getFullYear()
    );
    const prevMonthRef = useRef(
        urlDateObj ? urlDateObj.getMonth() : today.getMonth()
    );

    // --- State for current visible calendar ---
    const [currentMonth, setCurrentMonth] = useState(
        urlDateObj ? urlDateObj.getMonth() : today.getMonth()
    );
    const [currentYear, setCurrentYear] = useState(
        urlDateObj ? urlDateObj.getFullYear() : today.getFullYear()
    );
    const [selectedDate, setSelectedDate] = useState(null);
    const [direction, setDirection] = useState(0);

    // --- Watch URL date param ---
    useEffect(() => {
        if (urlDateObj) {
            // Figure out animation direction based on month difference
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
                const totalMonthsNow =
                    urlDateObj.getFullYear() * 12 + urlDateObj.getMonth();
                const totalMonthsPrev = prevYear * 12 + prevMonth;
                dir = totalMonthsNow > totalMonthsPrev ? 1 : -1;
            }
            setDirection(dir);
            setCurrentMonth(urlDateObj.getMonth());
            setCurrentYear(urlDateObj.getFullYear());
            prevYearRef.current = urlDateObj.getFullYear();
            prevMonthRef.current = urlDateObj.getMonth();
        }
    }, [urlDateParam]);

    // --- Calendar grid logic ---
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
    const blanks = Array(firstDayOfWeek).fill(null);
    const days = [...Array(daysInMonth).keys()].map((i) => i + 1);
    const calendarDays = [...blanks, ...days];

    // --- Helpers ---
    function isToday(day) {
        return (
            day &&
            currentYear === today.getFullYear() &&
            currentMonth === today.getMonth() &&
            day === today.getDate()
        );
    }

    function goToDate(day) {
        setSelectedDate(new Date(currentYear, currentMonth, day));
    }
    function goBack() {
        setSelectedDate(null);
    }

    // --- Format title helpers ---
    const monthTitle = new Date(currentYear, currentMonth).toLocaleString(
        "default",
        { month: "long", year: "numeric" }
    );
    const monthShort = new Date(currentYear, currentMonth).toLocaleString(
        "default",
        { month: "short" }
    );
    const monthFirstDay = new Date(
        currentYear,
        currentMonth,
        1
    ).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
    const monthLastDay = new Date(
        currentYear,
        currentMonth,
        daysInMonth
    ).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    const tabs = [
        { label: "All Events", value: "all" },
        { label: "Shared", value: "shared" },
        { label: "Personal", value: "personal" },
        { label: "Archived", value: "archived" },
    ];

    // --- Find events for the selected day ---
    const selectedDateStr = selectedDate
        ? `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1)
              .toString()
              .padStart(2, "0")}-${selectedDate
              .getDate()
              .toString()
              .padStart(2, "0")}`
        : null;
    const eventsForSelectedDay = selectedDateStr
        ? demoEvents.filter((ev) => ev.date === selectedDateStr)
        : [];

    return (
        <div className="flex flex-col h-screen w-full">
            <div className="flex flex-row items-center justify-between gap-2">
                <div className="text-xl text-neutral-200 font-semibold">
                    Calendar
                </div>
                <div className="relative w-[350px]">
                    <SearchInput
                        placeholder="Search events..."
                        className="w-[300px]"
                    />
                </div>
            </div>
            <AnimatedTabs
                options={tabs}
                initial="all"
                onChange={(val) => {
                    // Do something on tab change
                    console.log("Selected:", val);
                }}
            />
            {/* Month Header */}
            <div className="p-3 mt-5 gap-5 flex flex-row border border-neutral-700">
                <div className="flex flex-col border border-neutral-700 overflow-hidden rounded">
                    <div className="text-white px-5 text-xs py-1 font-semibold rounded">
                        {monthShort.toUpperCase()}
                    </div>
                    <div className="h-10 flex text-neutral-200 font-bold text-2xl items-center justify-center">
                        {urlDateObj
                            ? urlDateObj.getDate()
                            : today.getMonth() === currentMonth &&
                              today.getFullYear() === currentYear
                            ? today.getDate()
                            : 1}
                    </div>
                </div>
                <div className="flex flex-col mr-auto">
                    <div className="text-2xl font-extrabold text-neutral-200">
                        {monthTitle}
                    </div>
                    <div className="text-neutral-400 text-sm">
                        {monthFirstDay} - {monthLastDay}
                    </div>
                </div>

                <DateSwitcher />
                <button className="border border-neutral-700 px-3 py-1 rounded flex items-center gap-2 h-8 text-sm text-neutral-400 hover:opacity-90">
                    Month View <i className="bi bi-chevron-down text-xs"></i>
                </button>
                <button className="text-white px-3 py-1 rounded flex items-center gap-2 h-8 text-sm text-neutral-900 hover:opacity-90">
                    <i className="bi bi-plus"></i>
                    Add Event
                </button>
            </div>
            {/* Calendar / Day View */}
            <div className="relative min-h-[600px]">
                <AnimatePresence initial={false}>
                    {!selectedDate && (
                        <motion.div
                            key="calendar-view"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Weekdays */}
                            <div className="grid grid-cols-7 border-b border-x border-neutral-700 shrink-0 h-8">
                                {WEEK_DAYS.map((day) => (
                                    <div
                                        key={day}
                                        className="flex items-center justify-center border-r border-neutral-700 text-neutral-500 font-semibold text-xs"
                                        aria-label={`${day} of the week`}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>
                            {/* Animated Month Grid */}
                            <div className="relative">
                                <AnimatePresence
                                    initial={false}
                                    custom={direction}
                                >
                                    <motion.div
                                        key={currentYear + "-" + currentMonth}
                                        custom={direction}
                                        className="grid grid-cols-7 border-x border-b border-neutral-700 rounded-b-lg h-full absolute w-full"
                                        initial={{
                                            x: direction > 0 ? 40 : -40,
                                            opacity: 0,
                                        }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{
                                            x: direction > 0 ? -40 : 40,
                                            opacity: 0,
                                        }}
                                        transition={{
                                            duration: 0.28,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        {calendarDays.map((day, idx) => {
                                            // --- This is the main update! ---
                                            const dateStr = day
                                                ? `${currentYear}-${(
                                                      currentMonth + 1
                                                  )
                                                      .toString()
                                                      .padStart(2, "0")}-${day
                                                      .toString()
                                                      .padStart(2, "0")}`
                                                : null;
                                            const eventsForDay = day
                                                ? demoEvents.filter(
                                                      (ev) =>
                                                          ev.date === dateStr
                                                  )
                                                : [];

                                            return day ? (
                                                <div
                                                    key={idx}
                                                    onClick={() =>
                                                        goToDate(day)
                                                    }
                                                    className={`${
                                                        idx % 7 === 0
                                                            ? "border-l"
                                                            : ""
                                                    } flex flex-col text-neutral-400 border-r shrink-0 h-[125px] border-b border-neutral-700 font-semibold text-xs cursor-pointer hover:bg-neutral-700 transition-colors group
                                                      
                                                    `}
                                                >
                                                    <div className="px-3 pt-3 flex items-center">
                                                        <div
                                                            className={`${
                                                                isToday(day)
                                                                    ? "bg-orange-500/30 font-bold text-white"
                                                                    : ""
                                                            } rounded-full w-6 h-6 flex items-center justify-center group-hover:text-white font-bold`}
                                                        >
                                                            {day}
                                                        </div>
                                                    </div>
                                                    <div className="h-full flex flex-col overflow-auto px-1 mt-2 gap-1">
                                                        {eventsForDay
                                                            .slice(0, 2)
                                                            .map((ev, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="bg-neutral-900 text-white px-2 py-1 text-xs font-semibold rounded truncate"
                                                                >
                                                                    {ev.title}
                                                                </div>
                                                            ))}
                                                        {eventsForDay.length >
                                                            2 && (
                                                            <div className="text-xs text-neutral-400 px-2">
                                                                +
                                                                {eventsForDay.length -
                                                                    2}{" "}
                                                                more
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    key={idx}
                                                    className={`border-b border-r border-neutral-700 ${
                                                        idx % 7 === 0
                                                            ? "border-l"
                                                            : ""
                                                    }`}
                                                ></div>
                                            );
                                        })}
                                    </motion.div>
                                </AnimatePresence>
                                {/* Spacer to keep calendar height stable */}
                                <div className="invisible grid grid-cols-7 border-x border-b border-neutral-700 rounded-b-lg h-full">
                                    {calendarDays.map((_, idx) => (
                                        <div key={idx}></div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Day View */}
                <DayView
                    selectedDate={selectedDate}
                    goBack={goBack}
                    events={eventsForSelectedDay}
                />
            </div>
        </div>
    );
}
