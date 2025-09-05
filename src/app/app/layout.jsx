// app/app/layout.jsx (Server Component)
export const dynamic = "force-dynamic"; // ensure fresh session on each request
import { cookies } from "next/headers";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import MenuSelectBtns from "@/components/header/MenuSelectBtns";
import SessionWrapperClient from "@/components/SessionWrapperClient";
import AccountSelectServer from "@/components/header/AccountSelectServer";

//menus
import DashboardMenu from "@/components/menus/DashboardMenu";
import InventoryMenu from "@/components/menus/InventoryMenu";
import SearchBarDropdown from "@/components/header/SearchBarDropdown";
import SettingsMenu from "@/components/menus/SettingsMenu";
import CalendarMenu from "@/components/menus/CalendarMenu";
import PermissionsMenu from "@/components/menus/PermissionsMenu";
import AdminMenu from "@/components/menus/AdminMenu";
import ProfileMenu from "@/components/menus/ProfileMenu";
import ProfileDropdown from "@/components/header/ProfileDropdown";

import {
    House,
    CircleUser,
    LogOut,
    Settings,
    ChevronsUpDown,
} from "lucide-react";

export default async function RootLayout({ children }) {
    let session = null;
    try {
        session = await getServerSession(authOptions);
    } catch (e) {
        console.warn("[auth] getServerSession failed:", e?.message || e);
        session = null;
    }

    console.log("Session:", session);

    const cookieStore = await cookies();
    const selectedSection =
        cookieStore.get("selectedSection")?.value ?? "dashboard";

    const renderSidebar = () => {
        switch (selectedSection) {
            case "dashboard":
                return <DashboardMenu />;
            case "inventory":
                return <InventoryMenu />;
            case "calendar":
                return <CalendarMenu />;
            case "inspections":
                return <></>; // Placeholder for inspections menu
            case "repairs":
                return <></>;
            case "permissions":
                return <PermissionsMenu />;
            case "admin":
                return <AdminMenu />;
            case "settings":
                return <SettingsMenu />;
            case "profile":
                return <ProfileMenu />;
            default:
                return <></>;
        }
    };

    return (
        <div className="antialiased flex flex-row h-screen w-screen bg-neutral-900 text-neutral-200">
            <div className="w-[50px] h-screen shrink-0 bg-neutral-800 border-r border-neutral-700 flex flex-col">
                <div className="h-12 shrink-0 border-b border-neutral-700 flex items-center justify-center">
                    <img src="/guardianLogo.png" className="h-11 w-11" alt="" />
                </div>
                <div className="flex-1 overflow-y-auto thin-scrollbar">
                    <MenuSelectBtns initialSelection={selectedSection} />
                </div>
            </div>
            <div className="w-[250px] h-screen shrink-0 bg-neutral-800 border-r border-neutral-700 flex flex-col">
                {/* Wrap sidebar area with SessionProvider seeded with server session */}
                <SessionWrapperClient session={session}>
                    <AccountSelectServer label="Account" id="account-select" />
                    <div className="flex-1 overflow-y-auto darkScroll">
                        {renderSidebar()}
                    </div>
                </SessionWrapperClient>
                <div className="mt-auto p-2 w-full">
                    <div className="relative bg-neutral-800 border border-neutral-700 w-full rounded-lg flex flex-col p-3">
                        <div className="text-neutral-200 font-extrabold">
                            Upgrade to Pro
                        </div>
                        <div className="text-neutral-400 text-sm">
                            Unlock advanced features and support by upgrading to
                            Pro.
                        </div>
                        <button className="mt-2 bg-orange-500/60 text-white rounded px-4 py-2 text-sm hover:bg-orange-500 transition">
                            Upgrade Now
                        </button>
                        <button
                            aria-label="Close Upgrade Banner"
                            className="absolute top-2 right-2 cursor-pointer text-neutral-500 hover:text-neutral-300"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-full">
                <div className="h-12 w-full shrink-0 border-b border-neutral-700 bg-neutral-800">
                    <div className="flex items-center h-full gap-3 px-2">
                        <SearchBarDropdown />
                        <div className="ml-auto" />
                        {/* Provide SSR session so user shows instantly */}
                        <SessionWrapperClient session={session}>
                            <ProfileDropdown />
                        </SessionWrapperClient>
                    </div>
                </div>
                <div className="w-full h-full overflow-y-auto bg-neutral-800">
                    <SessionWrapperClient session={session}>
                        <div className="container mx-auto px-4 py-4 min-h-full">
                            {children}
                        </div>
                    </SessionWrapperClient>
                </div>
            </div>
        </div>
    );
}
