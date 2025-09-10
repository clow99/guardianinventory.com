"use client";

import Link from "next/link";

export default function RepairsMenu() {
    return (
        <div className="p-2 space-y-2">
            <div className="text-neutral-300 text-sm">Repairs</div>
            <Link href="/app/repairs" className="block text-neutral-200 text-sm hover:text-white hover:bg-neutral-700 rounded px-2 py-1">
                All Tasks
            </Link>
        </div>
    );
}

