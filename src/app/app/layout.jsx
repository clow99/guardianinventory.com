// app/layout.js (Server Component)
import { cookies } from "next/headers";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import MenuSelectBtns from "@/components/header/MenuSelectBtns";

//menus
import DashboardMenu from "@/components/menus/DashboardMenu";
import InventoryMenu from "@/components/menus/InventoryMenu";
import SearchBar from "@/components/header/SearchBar";
import SettingsMenu from "@/components/menus/SettingsMenu";

import {
    House,
    CircleUser,
    LogOut,
    Settings,
    ChevronsUpDown,
} from "lucide-react";

export default async function RootLayout({ children }) {
    const session = await getServerSession(authOptions);

    console.log("Session:", session);

    const cookieStore = await cookies();
    const selectedSection =
        cookieStore.get("selectedSection")?.value ?? "tasks";

    const renderSidebar = () => {
        switch (selectedSection) {
            case "dashboard":
                return <DashboardMenu />;
            case "inventory":
                return <InventoryMenu />;
            case "inspections":
                return <></>; // Placeholder for inspections menu
            case "repairs":
                return <></>;
            case "settings":
                return <SettingsMenu />;
            default:
                return <></>;
        }
    };

    return (
        <body className={`antialiased flex flex-row h-screen w-screen`}>
            <div className="w-[50px] h-screen overflow-auto shrink-0 bg-neutral-800 border-r border-neutral-700 flex flex-col">
                <div className="h-12 shrink-0 border-b border-neutral-700 flex items-center justify-center">
                    <img src="/guardianLogo.png" className="h-11 w-11" alt="" />
                </div>
                <MenuSelectBtns initialSelection={selectedSection} />
            </div>
            <div className="w-[250px] h-screen shrink-0 bg-neutral-800 border-r border-neutral-700 flex flex-col">
                <div className="h-12 border-b border-neutral-700 flex items-center px-3">
                    <div className="flex flex-row w-full items-center gap-2">
                        <div className="flex flex-col">
                            <div className="text-neutral-200 text-sm font-semibold">
                                Weber Supply
                            </div>
                            <div className="text-neutral-400 -mt-0.5 text-[11px]">
                                Home Office
                            </div>
                        </div>
                        <ChevronsUpDown className="w-4 h-4 ml-auto text-neutral-500" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto darkScroll">
                    {renderSidebar()}
                </div>
                <div className="mt-auto p-2 w-full">
                    <div className="relative bg-neutral-800 border border-neutral-700 w-full rounded-lg flex flex-col p-3">
                        <div className="text-neutral-200 font-extrabold">
                            Upgrade to Pro
                        </div>
                        <div className="text-neutral-400 text-sm">
                            Unlock advanced features and support by upgrading to
                            Pro.
                        </div>
                        <button className="mt-2 bg-orange-500 text-white rounded px-4 py-2 text-sm hover:bg-orange-600 transition">
                            Upgrade Now
                        </button>
                        <button className="absolute top-2 right-2 cursor-pointer text-neutral-500 hover:text-neutral-300">
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
                    <div className="flex items-center h-full">
                        <SearchBar />
                    </div>
                </div>
                <div className="w-full h-full overflow-y-auto p-4 bg-neutral-800">
                    <div className="h-screen">{children}</div>
                </div>
            </div>
        </body>
    );
}
