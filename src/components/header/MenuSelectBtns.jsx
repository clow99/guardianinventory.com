"use client";
import { createPortal } from "react-dom";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
    ClipboardList,
    Package,
    FileSearch,
    Wrench,
    Check,
    House,
    ShieldUser,
    ChartNoAxesCombined,
    Settings,
    CircleUser,
    LogOut,
    Calendar,
    Crown,
    MoreVertical,
} from "lucide-react";
// We navigate via next/navigation router so server components refresh properly
import Tooltip from "../misc/Tooltip";
import Modal from "@/components/modals/Modal";
import { signOut } from "next-auth/react";
import TaskListBoard from "@/components/tasks/TaskListBoard";

// Your options array
const options = [
    {
        id: "dashboard",
        icon: House,
        label: "Dashboard",
        href: "/app/dashboard",
    },
    {
        id: "inventory",
        icon: Package,
        label: "Inventory",
        href: "/app/assets/view",
    },
    {
        id: "calendar",
        icon: Calendar,
        label: "Calendar",
        href: "/app/calendar?date=" + new Date().toISOString().split("T")[0],
    },

    {
        id: "charts",
        icon: ChartNoAxesCombined,
        label: "Charts",
        href: "/app/charts",
    },
    {
        id: "tasks",
        icon: ClipboardList,
        label: "Tasks",
        href: "/app/tasks",
    },
    {
        id: "inspections",
        icon: FileSearch,
        label: "Inspections",
        href: "/app/inspections",
    },
    {
        id: "repairs",
        icon: Wrench,
        label: "Repair Status",
        href: "/app/repairs",
    },
    {
        id: "permissions",
        icon: ShieldUser,
        label: "Permissions",
        href: "/app/permissions/view",
    },
    {
        id: "admin",
        icon: Crown,
        label: "Admin",
        href: "/app/admin",
    },
];

export default function MenuSelectBtns({ initialSelection }) {
    const router = useRouter();
    const [selected, setSelected] = useState(initialSelection);
    const { data: session } = useSession();
    const isAdmin = !!(
        session?.user?.is_admin || session?.user?.role === "admin"
    );

    // Overflow menu (three dots) state
    const [moreOpen, setMoreOpen] = useState(false);
    const moreRef = useRef(null);    const [tasksOpen, setTasksOpen] = useState(false);


    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    useEffect(() => {
        if (!moreOpen || !moreRef.current) return;
        const update = () => {
            const rect = moreRef.current.getBoundingClientRect();
            setMenuPos({ top: rect.top, left: rect.left + rect.width + 8 });
        };
        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [moreOpen]);
    const handleSelect = (id, href) => {
    // Intercept Tasks: open modal; avoid server cookie/nav
    if (id === "tasks") {
        setTasksOpen(true);
        setSelected("tasks");
        return;
    }
    // Persist selection so the server layout can read it on navigation
    Cookies.set("selectedSection", id, { expires: 7, path: "/" });
    setSelected(id);
    router.refresh();
    if (!href) return;
    try {
        router.push(href);
    } catch (e) {
        if (typeof window !== "undefined") window.location.assign(href);
    }
};

    // Compute which items belong in the overflow menu
    const overflowIds = new Set(["charts", "tasks", "inspections", "repairs"]);
    const mainItems = options.filter(
        (opt) =>
            !overflowIds.has(opt.id) && (opt.id === "admin" ? isAdmin : true)
    );
    const overflowItems = options.filter((opt) => overflowIds.has(opt.id));
    const overflowSelected = overflowItems.some((o) => o.id === selected);

    // Close the overflow menu when clicking outside
    useEffect(() => {
        function onDocPointerDown(e) {
            if (!moreOpen) return;
            if (!moreRef.current) return;
            if (!moreRef.current.contains(e.target)) {
                setMoreOpen(false);
            }
        }
        document.addEventListener("pointerdown", onDocPointerDown);
        return () => document.removeEventListener("pointerdown", onDocPointerDown);
    }, [moreOpen]);

    const focusRing =
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-800";

    return (
        <div className="px-1 py-2 flex flex-col gap-1 h-full">
            <div className="flex flex-col gap-1">
                {mainItems.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selected === opt.id;
                    return (
                        <div key={opt.id} title={opt.label}>
                            <button
                                type="button"
                                aria-label={opt.label}
                                onClick={() => handleSelect(opt.id, opt.href)}
                                className={`relative group w-10 h-10 cursor-pointer flex items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-700 transition
                        ${isSelected ? "bg-neutral-700" : "bg-transparent"} ${focusRing}`}
                                aria-current={isSelected ? "page" : undefined}
                            >
                                <Icon
                                    className={`w-5 h-5 text-neutral-400 group-hover:text-orange-500 ease-in-out duration-200
                            ${isSelected ? "text-orange-500" : ""}`}
                                />
                            </button>
                        </div>
                    );
                })}

                {/* Overflow (three dots) menu */}
                <div className="relative" ref={moreRef}>
                    <div title="More">
                        <button
                            type="button"
                            aria-label="More"
                            aria-haspopup="menu"
                            aria-expanded={moreOpen}
                            onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMoreOpen((v) => !v);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setMoreOpen((v) => !v);
                                }
                            }}
                            className={`relative group w-10 h-10 cursor-pointer flex items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-700 transition ${
                                overflowSelected
                                    ? "bg-neutral-700"
                                    : "bg-transparent"
                            } ${focusRing}`}
                        >
                            <MoreVertical
                                className={`w-5 h-5 text-neutral-400 group-hover:text-orange-500 ease-in-out duration-200 ${
                                    overflowSelected ? "text-orange-500" : ""
                                }`}
                            />
                        </button>
                    </div>
{moreOpen && typeof window !== "undefined" &&
    createPortal(
        <div
            className="bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl py-1 w-44"
            style={{ position: "fixed", top: menuPos.top, left: menuPos.left, zIndex: 60 }}
         onPointerDown={(e) => e.stopPropagation()}>
            {overflowItems.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selected === opt.id;
                return (
                    <button
                        key={opt.id}
                        type="button"
                        tabIndex={0}
                        onClick={() => {
                            setMoreOpen(false);
                            handleSelect(opt.id, opt.href);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-700 ${
                            isSelected ? "text-orange-400" : "text-neutral-300"
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        <span>{opt.label}</span>
                    </button>
                );
            })}
        </div>,
        document.body
    )
}
                </div>
            </div>
            <div title="Settings" className="mt-auto">
                <button
                    type="button"
                    aria-label="Settings"
                    onClick={() =>
                        handleSelect("settings", "/app/settings/general")
                    }
                    className={`relative group w-10 h-10 cursor-pointer flex items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-700 transition
                        ${
                            selected === "settings"
                                ? "bg-neutral-700"
                                : "bg-transparent"
                        } ${focusRing}`}
                    aria-current={selected === "settings" ? "page" : undefined}
                >
                    <Settings
                        className={`w-5 h-5 text-neutral-400 group-hover:text-orange-500 ease-in-out duration-200
                            ${
                                selected === "settings" ? "text-orange-500" : ""
                            }`}
                    />
                </button>
            </div>
            <div title="Profile" className="">
                <button
                    type="button"
                    aria-label="Profile"
                    onClick={() => handleSelect("profile", "/app/profile/view")}
                    className={`relative group w-10 h-10 cursor-pointer flex items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-700 transition
                        ${
                            selected === "profile"
                                ? "bg-neutral-700"
                                : "bg-transparent"
                        } ${focusRing}`}
                    aria-current={selected === "profile" ? "page" : undefined}
                >
                    <CircleUser
                        className={`w-5 h-5 text-neutral-400 group-hover:text-orange-500 ease-in-out duration-200
                            ${selected === "profile" ? "text-orange-500" : ""}`}
                    />
                </button>
            </div>

            <button
                className={`relative group w-10 h-10 shrink-0 cursor-pointer flex items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-700 transition ${focusRing}`}
                type="button"
                title="Logout"
                onClick={() => signOut({ callbackUrl: "/" })}
            >
                <LogOut
                    className={`w-5 h-5 text-neutral-400 group-hover:text-orange-500 ease-in-out duration-200`}
                />
            </button>
            <div className="h-[10px] shrink-0 w-full"></div>
            {/* Tasks modal */}
            <Modal isOpen={tasksOpen} onClose={() => setTasksOpen(false)}>
                <div className="h-[70vh] w-[80vw] max-w-[1100px] overflow-y-auto">
                    <div className="flex items-center mb-3">
                        <div className="text-white text-xl font-semibold">Tasks</div>
                        <button className="ml-auto text-neutral-400 hover:text-neutral-200" onClick={() => setTasksOpen(false)}>Close</button>
                    </div>
                    <TaskListBoard />
                </div>
            </Modal>
        </div>
    );
}