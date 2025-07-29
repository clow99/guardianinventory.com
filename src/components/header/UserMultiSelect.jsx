import React, { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCheckbox from "../inputs/AnimatedCheckbox";

const users = [
    { id: 1, name: "User 1" },
    { id: 2, name: "User 2" },
    { id: 3, name: "User 3" },
    { id: 4, name: "User 4" },
    { id: 5, name: "User 5" },
    { id: 6, name: "User 6" },
    { id: 7, name: "User 7" },
    { id: 8, name: "User 8" },
    { id: 9, name: "User 9" },
    { id: 10, name: "User 10" },
];

export default function UserMultiSelect() {
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
    const handleSelect = (userId) => {
        setSelected((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const display =
        selected.length === 0
            ? "All Users"
            : users
                  .filter((u) => selected.includes(u.id))
                  .map((u) => u.name)
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
                                placeholder="Search Users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            {users
                                .filter((user) =>
                                    user.name
                                        .toLowerCase()
                                        .includes(search.toLowerCase())
                                )
                                .map((user) => (
                                    <div
                                        key={user.id}
                                        className="pl-3 hover:bg-neutral-700 cursor-pointer flex items-center"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Don’t close menu
                                            handleSelect(user.id);
                                        }}
                                    >
                                        <AnimatedCheckbox
                                            label=""
                                            id="active"
                                            checked={selected.includes(user.id)}
                                            onChange={() =>
                                                handleSelect(user.id)
                                            }
                                        />
                                        <span className="text-neutral-300 text-sm">
                                            {user.name}
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
