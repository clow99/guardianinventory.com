"use client";

import Link from "next/link";
import { Shield, Users, Building2, KeyRound } from "lucide-react";
import { usePathname } from "next/navigation";

const links = [
    { label: "Accounts", path: "/app/admin", icon: Shield },
    { label: "Users", path: "/app/settings/users/view", icon: Users },
    { label: "Sites", path: "/app/settings/sites", icon: Building2 },
    { label: "Roles", path: "/app/settings/users/roles", icon: KeyRound },
];

export default function AdminMenu() {
    const pathname = usePathname();

    return (
        <div className="p-2 space-y-1">
            <div className="text-neutral-300 text-sm px-2 py-1">Admin</div>
            {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.path);

                return (
                    <Link
                        key={link.path}
                        href={link.path}
                        className={`group flex items-center gap-2 rounded px-2 py-2 text-sm transition ${
                            isActive
                                ? "bg-neutral-700 text-orange-500"
                                : "text-neutral-200 hover:bg-neutral-700 hover:text-white"
                        }`}
                    >
                        <Icon
                            className={`h-4 w-4 ${
                                isActive
                                    ? "text-orange-500"
                                    : "text-neutral-400 group-hover:text-orange-400"
                            }`}
                        />
                        <span>{link.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
