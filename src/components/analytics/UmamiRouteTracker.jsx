"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackView } from "@/lib/analytics";

export default function UmamiRouteTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const previous = useRef("");

    useEffect(() => {
        if (!pathname) return;
        const search = searchParams?.toString();
        const url = search ? `${pathname}?${search}` : pathname;
        if (previous.current === url) return;
        previous.current = url;
        trackView(url);
    }, [pathname, searchParams]);

    return null;
}
