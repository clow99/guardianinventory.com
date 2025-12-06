"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export default function MainBtn({ label, href, icon: Icon, onClick }) {
    function handleClick(event) {
        trackEvent("main_button_click", { label, href });
        onClick?.(event);
    }

    return (
        <Link
            href={href}
            onClick={handleClick}
            className="bg-orange-500/80 whitespace-nowrap text-white rounded px-4 py-2 text-sm hover:bg-orange-500 transition cursor-pointer"
        >
            {label}
        </Link>
    );
}
