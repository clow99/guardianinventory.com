"use client";

import { useState, useEffect } from "react";
import {
    Settings,
    Users,
    MapPin,
    ChevronRight,
    Palette,
    Bell,
    Settings2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Top-level navigation
const topLevelMenus = [
    { path: "/app/settings/general", label: "General", icon: Settings },
    { path: "/app/settings/appearance", label: "Appearance", icon: Palette },
    { path: "/app/settings/notifications", label: "Notifications", icon: Bell },
    { path: "/app/settings/sites", label: "Sites", icon: MapPin },
];

// Folder projects config with route mapping for sub-items
const projects = [
    {
        icon: Users,
        folder: "Users",
        items: [
            { label: "View Users", path: "/app/settings/users/view" },
            { label: "Roles", path: "/app/settings/users/roles" },
            { label: "Permissions", path: "/app/settings/users/permissions" },
        ],
    },
    {
        icon: Users,
        folder: "Employees",
        items: [
            { label: "View Employees", path: "/app/settings/employees/view" },
            {
                label: "Asset Limits",
                path: "/app/settings/employees/asset-limits",
            },
            {
                label: "Deactivated Employees",
                path: "/app/settings/employees/deactivated",
            },
        ],
    },
    {
        icon: Settings2,
        folder: "Customization",
        items: [
            {
                label: "Asset Fields",
                path: "/app/settings/customization/asset-fields",
            },
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

export default function SettingsMenu() {
    const pathname = usePathname();

    // Determine active top menu
    const activeTopMenu = topLevelMenus.find((menu) =>
        pathname.startsWith(menu.path)
    )?.label;

    // Find active folder and sub-item for side nav
    const [openFolders, setOpenFolders] = useState({});

    // Open the correct folder if its sub-item matches the path
    useEffect(() => {
        projects.forEach((project) => {
            const found = project.items.some((item) =>
                pathname.startsWith(item.path)
            );
            if (found) {
                setOpenFolders((prev) => ({
                    ...prev,
                    [project.folder]: true,
                }));
            }
        });
    }, [pathname]);

    // Handler for clicking folders
    const toggleFolder = (folderName) => {
        setOpenFolders((prev) => ({
            ...prev,
            [folderName]: !prev[folderName],
        }));
    };

    // Utility to find the active folder and sub-item
    const getActiveSubItem = () => {
        for (let project of projects) {
            for (let item of project.items) {
                if (pathname.startsWith(item.path)) {
                    return {
                        folder: project.folder,
                        label: item.label,
                        path: item.path,
                    };
                }
            }
        }
        return { folder: null, label: null, path: null };
    };

    const activeSub = getActiveSubItem();

    return (
        <div className="w-full flex flex-col">
            {/* Top-level menu links */}
            {topLevelMenus.map(({ path, label, icon: Icon }) => (
                <Link
                    key={label}
                    href={path}
                    className={`group w-full h-[35px] px-2 flex items-center hover:bg-neutral-700 gap-2 text-neutral-300 cursor-pointer transition-all duration-200
                        ${
                            activeTopMenu === label
                                ? "bg-neutral-700 text-orange-500"
                                : ""
                        }
                    `}
                >
                    <Icon
                        className={`w-4 h-4 text-neutral-400 group-hover:text-orange-500 ${
                            activeTopMenu === label ? "text-orange-500" : ""
                        }`}
                    />
                    <div className="text-neutral-200 text-sm">{label}</div>
                </Link>
            ))}

            {/* Folder (project) nav */}
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
                                } w-full group flex flex-row items-center gap-1 hover:bg-neutral-700 h-[35px] px-2 py-1 text-neutral-300`}
                            >
                                <project.icon className="w-4 h-4 text-neutral-400" />
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
                                                    key={item.label}
                                                    className="relative group flex flex-row items-center"
                                                    variants={itemVariants}
                                                    custom={i}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                >
                                                    <Link
                                                        href={item.path}
                                                        className={`
                                                            w-full cursor-pointer mb-1 h-8 text-left group flex flex-row items-center gap-1 hover:bg-neutral-700 rounded py-2.5 px-5 lg:px-2 lg:py-0.5 text-sm lg:text-xs transition-all
                                                            ${
                                                                activeSub.folder ===
                                                                    project.folder &&
                                                                activeSub.label ===
                                                                    item.label
                                                                    ? "bg-neutral-700 text-orange-500"
                                                                    : "text-neutral-400 hover:text-white"
                                                            }
                                                        `}
                                                    >
                                                        <div className="text-neutral-200 mr-auto">
                                                            {item.label}
                                                        </div>
                                                    </Link>
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
