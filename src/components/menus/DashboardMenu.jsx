"use client";

import { useState } from "react";

import DateRangeSelector from "../buttons/DateRangeSelector";
import UserMultiSelect from "../header/UserMultiSelect";
import LocationMultiSelect from "../header/LocationMultiSelect";

export default function DashboardMenu() {
    const [openFolders, setOpenFolders] = useState({
        "Manage Inspections": true,
        "Inspection Settings": false,
    });

    const toggleFolder = (folderName) => {
        setOpenFolders((prev) => ({
            ...prev,
            [folderName]: !prev[folderName],
        }));
    };

    const [dates, setDates] = useState({
        start: "01-01-2023",
        end: "01-31-2023",
    });
    const [error, setError] = useState({});

    // Validation logic
    function validate(range) {
        let err = {};
        if (range.start && range.end && range.start > range.end) {
            err.range = "End date must be after start date";
        }
        if (!range.start) err.start = "Start date required";
        if (!range.end) err.end = "End date required";
        setError(err);
        return Object.keys(err).length === 0;
    }

    function handleChange(range) {
        setDates(range);
        validate(range);
    }

    return (
        <div className="w-full flex flex-col">
            <div className="border-b border-neutral-700">
                <DateRangeSelector
                    label="Booking Dates"
                    value={dates}
                    onChange={handleChange}
                    error={error}
                />
            </div>

            <UserMultiSelect />
            <LocationMultiSelect />

            <button
                className={`w-full h-[35px] px-2 flex items-center hover:bg-neutral-700 ease-in-out duration-200 gap-3 text-neutral-300 cursor-pointer`}
            >
                <div className="text-neutral-200 text-sm mr-auto">
                    Inventory Dashboard
                </div>
            </button>
            <button
                className={`w-full h-[35px] px-2 flex items-center hover:bg-neutral-700 ease-in-out duration-200 gap-3 text-neutral-300 cursor-pointer`}
            >
                <div className="text-neutral-200 text-sm mr-auto">
                    Tasks Dashboard
                </div>
            </button>
        </div>
    );
}
