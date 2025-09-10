"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Table2 } from "lucide-react";
import AssetTable from "@/components/tables/AssetTable";
import AssetGrid from "@/components/grids/AssetGrid";
import { useAccount } from "@/app/hooks/useAccount";
import SearchBar from "@/components/inputs/SearchInput";
import AddProductModal from "../modals/products/AddProductModal";
import AddAssetModal from "@/components/modals/assets/AddAssetModal";
import { Download } from "lucide-react";

export default function InventoryPage() {
    const { accountId } = useAccount();
    const [view, setView] = useState("table"); // "table" or "grid"
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [dataMeta, setDataMeta] = useState(null); // { account_id, source }

    // When hard reload is enabled, skip local refetch to prevent flicker
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            window.__accountHardReloadOnAccountChange
        )
            return;
        function onAccChange() {
            setRefreshKey((k) => k + 1);
        }
        window.addEventListener("account:change", onAccChange);
        return () => window.removeEventListener("account:change", onAccChange);
    }, []);

    function exportCsv() {
        if (!accountId) return;
        const u = new URL("/api/products/export", window.location.origin);
        if (searchQuery) u.searchParams.set("q", searchQuery);
        u.searchParams.set("account_id", String(accountId));
        // Trigger browser download via navigation
        window.location.assign(u.toString());
    }

    return (
        <>
            <div className="grid grid-cols-2">
                <h2 className="text-xl font-bold mb-4 text-white">
                    {view === "table"
                        ? "Product Assets (Table View)"
                        : "Product Assets (Grid View)"}
                </h2>
                <div className="flex items-center justify-end gap-3 mb-8">
                    <button
                        onClick={() => setView("table")}
                        className={`flex items-center gap-1 px-4 h-10 rounded border transition text-sm cursor-pointer   
                        ${
                            view === "table"
                                ? "bg-neutral-400/20 text-orange-400 border-neutral-500/70"
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
                                ? "bg-neutral-400/20 text-orange-400 border-neutral-500/70"
                                : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-orange-500"
                        }
                    `}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Grid
                    </button>
                    <SearchBar
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-3">
                        {loading && (
                            <div className="flex items-center gap-2 text-neutral-400">
                                <span className="h-4 w-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></span>
                                <span className="text-sm">Refreshing…</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportCsv}
                            className="flex items-center gap-2 h-10 px-3 rounded border border-neutral-700 bg-neutral-800 text-neutral-200 text-sm hover:border-orange-500"
                        >
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                        <AddAssetModal onAdded={() => setRefreshKey((k) => k + 1)} />
                        <AddProductModal
                            initialProductName={searchQuery}
                            onAdded={() => setRefreshKey((k) => k + 1)}
                        />
                    </div>
                </div>
            </div>
            <div className="h-full">
                {view === "table" ? (
                    <AssetTable
                        searchQuery={searchQuery}
                        refreshKey={refreshKey}
                        accountId={accountId}
                        onLoadingChange={setLoading}
                        onMetaChange={setDataMeta}
                    />
                ) : (
                    <AssetGrid
                        searchQuery={searchQuery}
                        refreshKey={refreshKey}
                        accountId={accountId}
                        onLoadingChange={setLoading}
                        onMetaChange={setDataMeta}
                    />
                )}
            </div>
        </>
    );
}
