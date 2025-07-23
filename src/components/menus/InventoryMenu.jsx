"use client";

import { useState } from "react";
import { CircleCheckBig, PlusCircle, House, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const projects = [
    {
        folder: "Manage Assets",
        items: ["View Assets", "Assign Assets", "Move Assets"],
    },
    {
        folder: "Assets Settings",
        items: [
            "Assets Types",
            "Custom Fields",
            "Permissions",
            "Notifications",
        ],
    },
];

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.05 },
    }),
    exit: { opacity: 0, x: -10, transition: { duration: 0.15 } },
};

export default function AssetsMenu() {
    const [openFolders, setOpenFolders] = useState({
        "Manage Assets": true,
        "Assets Settings": false,
    });

    const toggleFolder = (folderName) => {
        setOpenFolders((prev) => ({
            ...prev,
            [folderName]: !prev[folderName],
        }));
    };

    return (
        <div className="w-full flex flex-col">
            {projects.map((project, idx) => {
                const isOpen = openFolders[project.folder];

                return (
                    <motion.div
                        key={project.folder}
                        className="relative group"
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 26,
                        }}
                    >
                        {/* Folder Header */}
                        <div
                            className="relative group cursor-pointer"
                            onClick={() => toggleFolder(project.folder)}
                        >
                            <div
                                className={`${
                                    isOpen ? "bg-neutral-700" : ""
                                } w-full group flex border-b border-neutral-700 flex-row items-center gap-1 hover:bg-neutral-700 h-[35px] px-2 py-1 text-neutral-300`}
                            >
                                {/* <Folder className="w-4 h-4 text-neutral-400" /> */}
                                <div className="text-neutral-200 lg:text-sm mr-auto ml-1">
                                    {project.folder}
                                </div>
                                <ChevronRight
                                    className={`w-4 h-4 transform transition-transform group-hover:text-orange-500 ease-in duration-200 ${
                                        isOpen
                                            ? "rotate-90 text-orange-500"
                                            : "text-neutral-400"
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Sub-items */}
                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    key="content"
                                    className="border-b border-neutral-700 pb-1"
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
                                    <div className="ml-3 border-l border-neutral-700 pl-3 pr-2 mt-1">
                                        <AnimatePresence>
                                            {project.items.map((item, i) => (
                                                <motion.div
                                                    key={item}
                                                    className="relative group flex flex-row items-center"
                                                    variants={itemVariants}
                                                    custom={i}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                >
                                                    <div className="w-full cursor-pointer mb-1 h-8 text-left group flex flex-row items-center gap-1 hover:bg-neutral-700 rounded py-2.5 px-5 lg:px-2 lg:py-0.5 text-sm lg:text-xs text-neutral-400 hover:text-white">
                                                        <div className="text-neutral-200 mr-auto">
                                                            {item}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
}
