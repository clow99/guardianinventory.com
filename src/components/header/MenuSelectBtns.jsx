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
} from "lucide-react";
import Link from "next/link";

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
    );
}
