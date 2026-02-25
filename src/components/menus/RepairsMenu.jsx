"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RepairsMenu() {
    const pathname = usePathname();
    const isActive = pathname.startsWith("/app/repairs");

    return (
        <div className="p-2 space-y-2">
            <div className="text-neutral-300 text-sm">Repairs</div>
            <Link
                href="/app/repairs"
                className={`block text-sm rounded px-2 py-1 transition ${
                    isActive
                        ? "bg-neutral-700 text-orange-500"
                        : "text-neutral-200 hover:text-white hover:bg-neutral-700"
                }`}
                aria-current={isActive ? "page" : undefined}
            >
                All Tasks
            </Link>
        </div>
    );
}

