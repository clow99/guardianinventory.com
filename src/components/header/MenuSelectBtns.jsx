"use client";

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
// Link not needed; we force full navigation so the server layout re-reads cookies
import Tooltip from "../misc/Tooltip";
import { signOut } from "next-auth/react";

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
    const moreRef = useRef(null);

    const handleSelect = (id, href) => {
        // Write cookie so server layout can read it on next navigation
        Cookies.set("selectedSection", id, { expires: 7, path: "/" });
        setSelected(id);
        if (!href) return;
        if (typeof window !== "undefined") {
            // Force a full reload so server components (layout) pick up the cookie
            window.location.assign(href);
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
        function onDocMouseDown(e) {
            if (!moreOpen) return;
            if (!moreRef.current) return;
            if (!moreRef.current.contains(e.target)) {
                setMoreOpen(false);
            }
        }
        document.addEventListener("mousedown", onDocMouseDown);
        return () => document.removeEventListener("mousedown", onDocMouseDown);
    }, [moreOpen]);

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
                        ${isSelected ? "bg-neutral-700" : "bg-transparent"}`}
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
                            onClick={() => setMoreOpen((v) => !v)}
                            className={`relative group w-10 h-10 cursor-pointer flex items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-700 transition ${
                                overflowSelected
                                    ? "bg-neutral-700"
                                    : "bg-transparent"
                            }`}
                        >
                            <MoreVertical
                                className={`w-5 h-5 text-neutral-400 group-hover:text-orange-500 ease-in-out duration-200 ${
                                    overflowSelected ? "text-orange-500" : ""
                                }`}
                            />
                        </button>
                    </div>
                    {moreOpen && (
                        <div className="absolute left-12 top-0 z-50 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl py-1 w-44">
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
                                            isSelected
                                                ? "text-orange-400"
                                                : "text-neutral-300"
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
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
                        }`}
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
                        }`}
                >
                    <CircleUser
                        className={`w-5 h-5 text-neutral-400 group-hover:text-orange-500 ease-in-out duration-200
                            ${selected === "profile" ? "text-orange-500" : ""}`}
                    />
                </button>
            </div>

            <button
                className={`relative group w-10 h-10 shrink-0 cursor-pointer flex items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-700 transition`}
                type="button"
                title="Logout"
                onClick={() => signOut({ callbackUrl: "/" })}
            >
                <LogOut
                    className={`w-5 h-5 text-neutral-400 group-hover:text-orange-500 ease-in-out duration-200`}
                />
            </button>
            <div className="h-[10px] shrink-0 w-full"></div>
        </div>
    );
}
