"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import MultiSelectDropdown from "@/components/header/MultiSelectDropdown";

export default function MultiSelectDropdownClient({ initialSelection }) {
    const router = useRouter();
    // Use SSR-provided initialSelection to avoid initial flash
    const [selected, setSelected] = useState(initialSelection);

    const handleSelect = (section) => {
        // update cookie and refresh server-rendered menu
        Cookies.set("selectedSection", section, { expires: 7, path: "/" });
        setSelected(section);
        router.refresh();
    };

    return <MultiSelectDropdown selected={selected} onSelect={handleSelect} />;
}
