"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Table2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AssetTable from "@/components/tables/AssetTable";
import AssetGrid from "@/components/grids/AssetGrid";
import { useAccount } from "@/app/hooks/useAccount";
import SearchBar from "@/components/inputs/SearchInput";
import AddProductModal from "../modals/products/AddProductModal";
import AddLocationModal from "../modals/locations/AddLocationModal";
import AddAssetModal from "@/components/modals/assets/AddAssetModal";
import { Download } from "lucide-react";

export default function InventoryPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { accountId } = useAccount();
    const [view, setView] = useState("table"); // "table" or "grid"
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState("");
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

    useEffect(() => {
        const urlQ = searchParams?.get("q") || "";
        setSearchQuery(urlQ);
    }, [searchParams]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const currentQ = searchParams?.get("q") || "";
        const nextQ = searchQuery.trim();
        if (currentQ === nextQ) return;
        const params = new URLSearchParams(searchParams?.toString() || "");
        if (nextQ) {
            params.set("q", nextQ);
        } else {
            params.delete("q");
        }
        const nextUrl = params.toString()
            ? `${pathname}?${params.toString()}`
            : pathname;
        router.replace(nextUrl, { scroll: false });
    }, [searchQuery, pathname, router, searchParams]);

    async function exportCsv() {
        if (!accountId || exporting) return;
        setExporting(true);
        setExportMessage("");
        try {
            const u = new URL("/api/products/export", window.location.origin);
            if (debouncedSearchQuery) u.searchParams.set("q", debouncedSearchQuery);
            u.searchParams.set("account_id", String(accountId));
            const res = await fetch(u.toString(), { method: "GET" });
            if (!res.ok) throw new Error("Export failed. Please try again.");

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            setExportMessage("Export ready. Download started.");
        } catch (e) {
            setExportMessage(e.message || "Export failed. Please try again.");
        } finally {
            setExporting(false);
        }
    }

    return (
        <>
            <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-white">
                        {view === "table"
                            ? "Product Assets (Table View)"
                            : "Product Assets (Grid View)"}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setView("table")}
                            className={`flex items-center gap-1 px-4 h-9 rounded border transition text-sm cursor-pointer ${
                                view === "table"
                                    ? "bg-neutral-400/20 text-orange-400 border-neutral-500/70"
                                    : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-orange-500"
                            }`}
                        >
                            <Table2 className="w-4 h-4" />
                            Table
                        </button>
                        <button
                            onClick={() => setView("grid")}
                            className={`flex items-center gap-1 px-4 h-9 rounded border transition text-sm cursor-pointer ${
                                view === "grid"
                                    ? "bg-neutral-400/20 text-orange-400 border-neutral-500/70"
                                    : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-orange-500"
                            }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Grid
                        </button>
                        <SearchBar
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products or assets..."
                        />
                        {loading && (
                            <div className="flex items-center gap-2 text-neutral-400">
                                <span className="h-4 w-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></span>
                                <span className="text-sm">Refreshing…</span>
                            </div>
                        )}
                        {!!exportMessage && (
                            <div className="text-sm text-neutral-400 max-w-[200px] truncate">
                                {exportMessage}
                            </div>
                        )}
                        <button
                            onClick={exportCsv}
                            disabled={!accountId || exporting}
                            className="flex items-center gap-2 h-9 px-3 rounded border border-neutral-700 bg-neutral-800 text-neutral-200 text-sm hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" />
                            {exporting ? "Exporting..." : "Export CSV"}
                        </button>
                        <AddLocationModal
                            onAdded={() => setRefreshKey((k) => k + 1)}
                        />
                        <AddAssetModal
                            onAdded={() => setRefreshKey((k) => k + 1)}
                        />
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
                        searchQuery={debouncedSearchQuery}
                        refreshKey={refreshKey}
                        accountId={accountId}
                        onLoadingChange={setLoading}
                        onMetaChange={setDataMeta}
                    />
                ) : (
                    <AssetGrid
                        searchQuery={debouncedSearchQuery}
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
