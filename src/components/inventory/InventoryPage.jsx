"use client";

import { useState } from "react";
import { LayoutGrid, Table2 } from "lucide-react";
import AssetTable from "@/components/tables/AssetTable";
import AssetGrid from "@/components/grids/AssetGrid";
import SearchBar from "@/components/inputs/SearchInput";

export default function InventoryPage() {
    const [view, setView] = useState("table"); // "table" or "grid"
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <>
            <div className="grid grid-cols-2">
                <h2 className="text-xl font-bold mb-4 text-white">
                    {view === "table"
                        ? "Product Assets (Table View)"
                        : "Product Assets (Grid View)"}
                </h2>
                <div className="flex items-center justify-end gap-3 mb-8">
                    <SearchBar
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        onClick={() => setView("table")}
                        className={`flex items-center gap-1 px-4 h-10 rounded border transition text-sm cursor-pointer   
                        ${
                            view === "table"
                                ? "bg-orange-500 text-orange-400 text-white border-orange-500"
                                : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-orange-500"
                        }
                    `}
                    >
                        <Table2 className="w-4 h-4" />
                        Table
                    </button>
                    <button
                        onClick={() => setView("grid")}
                        className={`flex items-center gap-1 px-4 h-10 rounded border transition text-sm cursor-pointer 
                        ${
                            view === "grid"
                                ? "bg-orange-500 text-orange-400 text-white border-orange-500"
                                : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-orange-500"
                        }
                    `}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Grid
                    </button>
                </div>
            </div>
            <div className="h-full">
                {view === "table" ? (
                    <AssetTable searchQuery={searchQuery} />
                ) : (
                    <AssetGrid searchQuery={searchQuery} />
                )}
            </div>
        </>
    );
}
