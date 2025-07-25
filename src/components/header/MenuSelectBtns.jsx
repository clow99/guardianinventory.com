"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
    ClipboardList,
    Package,
    FileSearch,
    Wrench,
    Check,
    House,
    Layers,
    ChartNoAxesCombined,
    Settings,
    CircleUser,
    LogOut,
    Calendar,
} from "lucide-react";
import Link from "next/link";
import Tooltip from "../misc/Tooltip";

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
        href: "/app/inventory",
    },
    {
        id: "calendar",
        icon: Calendar,
        label: "Calendar",
        href: "/app/calendar?date=" + new Date().toISOString().split("T")[0],
    },
    {
        id: "layers",
        icon: Layers,
        label: "Layers",
        href: "/app/layers",
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
];

export default function MenuSelectBtns({ initialSelection }) {
    const router = useRouter();
    const [selected, setSelected] = useState(initialSelection);

    const handleSelect = (id) => {
        Cookies.set("selectedSection", id, { expires: 7, path: "/" });
        setSelected(id);
        router.refresh();
    };

    return (
        <div className="px-1 py-2 flex flex-col gap-1 h-full">
            <div className="flex flex-col gap-1">
                {options.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selected === opt.id;
                    return (
                        <div
                            key={opt.id}
                            onClick={() => handleSelect(opt.id)}
                            title={opt.label}
                            type="button"
                        >
                            <Link
                                className={`relative group w-10 h-10 cursor-pointer flex items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-700 transition
                        ${isSelected ? "bg-neutral-700" : "bg-transparent"}`}
                                href={opt.href}
                            >
                                <Icon
                                    className={`w-5 h-5 text-neutral-400 group-hover:text-orange-500 ease-in-out duration-200
                            ${isSelected ? "text-orange-500" : ""}`}
                                />
                            </Link>
                        </div>
                    );
                })}
            </div>
            <div
                onClick={() => handleSelect("settings")}
                title="Settings"
                type="button"
                className="mt-auto"
            >
                <Link
                    className={`relative group w-10 h-10 cursor-pointer flex items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-700 transition
                        ${
                            selected === "settings"
                                ? "bg-neutral-700"
                                : "bg-transparent"
                        }`}
                    href="/app/settings/general"
                >
                    <Settings
                        className={`w-5 h-5 text-neutral-400 group-hover:text-orange-500 ease-in-out duration-200
                            ${
                                selected === "settings" ? "text-orange-500" : ""
                            }`}
                    />
                </Link>
            </div>
            <div
                onClick={() => handleSelect("profile")}
                title="Profile"
                type="button"
                className=""
            >
                <Link
                    className={`relative group w-10 h-10 cursor-pointer flex items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-700 transition
                        ${
                            selected === "profile"
                                ? "bg-neutral-700"
                                : "bg-transparent"
                        }`}
                    href="/app/profile"
                >
                    <CircleUser
                        className={`w-5 h-5 text-neutral-400 group-hover:text-orange-500 ease-in-out duration-200
                            ${selected === "profile" ? "text-orange-500" : ""}`}
                    />
                </Link>
            </div>

            <button
                className={`relative group w-10 h-10 shrink-0 cursor-pointer flex items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-700 transition`}
                type="button"
                title="Logout"
            >
                <LogOut
                    className={`w-5 h-5 text-neutral-400 group-hover:text-orange-500 ease-in-out duration-200`}
                />
            </button>
            <div className="h-[10px] shrink-0 w-full"></div>
        </div>
    );
}
