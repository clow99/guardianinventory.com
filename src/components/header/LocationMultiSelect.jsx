import React, { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCheckbox from "../inputs/AnimatedCheckbox";

const locations = [
    { id: 1, name: "Toronto" },
    { id: 2, name: "Vancouver" },
    { id: 3, name: "Montreal" },
    { id: 4, name: "Calgary" },
    { id: 5, name: "Edmonton" },
    { id: 6, name: "Ottawa" },
    { id: 7, name: "Winnipeg" },
    { id: 8, name: "Halifax" },
    { id: 9, name: "Quebec City" },
    { id: 10, name: "Saskatoon" },
];

export default function LocationMultiSelect() {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState("");
    const ref = useRef();

    // Handle outside click
    useEffect(() => {
        if (!open) return;
        function handle(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, [open]);

    // Handle select/unselect
    const handleSelect = (locationId) => {
        setSelected((prev) =>
            prev.includes(locationId)
                ? prev.filter((id) => id !== locationId)
                : [...prev, locationId]
        );
    };

    const display =
        selected.length === 0
            ? "All Locations"
            : locations
                  .filter((l) => selected.includes(l.id))
                  .map((l) => l.name)
                  .join(", ");

    return (
        <div className="relative w-full" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`${
                    open ? "bg-neutral-700" : "bg-transparent"
                } w-full h-[35px] px-2 flex items-center border-b hover:bg-neutral-700 ease-in-out duration-200 gap-3 border-neutral-700 text-neutral-300 cursor-pointer`}
            >
                <div className="text-sm truncate text-left w-full">
                    {display}
                </div>
                <ChevronRight
                    className={`w-4 h-4 transform transition-transform group-hover:text-orange-500 ease-in duration-200 ${
                        open ? "rotate-90 text-orange-500" : "text-neutral-400"
                    }`}
                />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="content"
                        className="border-b border-neutral-700 pb-1 h-0 max-h-[250px] overflow-y-auto"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={{
                            hidden: { height: 0, opacity: 0 },
                            visible: {
                                height: "auto",
                                opacity: 1,
                                transition: { duration: 0.25 },
                            },
                            exit: {
                                height: 0,
                                opacity: 0,
                                transition: { duration: 0.2 },
                            },
                        }}
                    >
                        <div className="ml-3 border-l border-neutral-700 pl-1 pr-2 mt-1">
                            <input
                                type="text"
                                className="w-full border-b px-2 h-8 text-sm w-full border-neutral-700 bg-transparent text-neutral-300 focus:outline-none"
                                placeholder="Search Locations..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            {locations
                                .filter((location) =>
                                    location.name
                                        .toLowerCase()
                                        .includes(search.toLowerCase())
                                )
                                .map((location) => (
                                    <div
                                        key={location.id}
                                        className="pl-3 hover:bg-neutral-700 cursor-pointer flex items-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelect(location.id);
                                        }}
                                    >
                                        <AnimatedCheckbox
                                            label=""
                                            id="active"
                                            checked={selected.includes(
                                                location.id
                                            )}
                                            onChange={() =>
                                                handleSelect(location.id)
                                            }
                                        />
                                        <span className="text-neutral-300 text-sm">
                                            {location.name}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
