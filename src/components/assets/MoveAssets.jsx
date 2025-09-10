"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "@/app/hooks/useAccount";
import AnimatedSelect from "@/components/inputs/AnimatedSelect";
import EditAssetModal from "@/components/modals/assets/EditAssetModal";
import AssetDetailDrawer from "@/components/assets/AssetDetailDrawer";

export default function MoveAssets() {
    const { accountId } = useAccount();
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState([]);
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const [siteOptions, setSiteOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [siteId, setSiteId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [total, setTotal] = useState(0);
    const [viewId, setViewId] = useState(null);
    const canMove = selectedIds.size > 0 && (siteId || locationId);

    // Load assets for current account
    useEffect(() => {
        let ignore = false;
        async function load() {
            if (!accountId) return;
            setLoading(true);
            try {
                const u = new URL("/api/assets/list", window.location.origin);
                u.searchParams.set("account_id", String(accountId));
                u.searchParams.set("limit", String(pageSize));
                u.searchParams.set("offset", String(page * pageSize));
                const res = await fetch(u.toString(), { cache: "no-store" });
                const data = await res.json();
                if (!ignore) {
                    setAssets(res.ok && data.success ? data.data || [] : []);
                    setTotal(Number(data?.meta?.total || 0));
                }
            } catch {
                if (!ignore) setAssets([]);
            } finally {
                if (!ignore) setLoading(false);
            }
        }
        setAssets([]);
        setSelectedIds(new Set());
        load();
        return () => {
            ignore = true;
        };
    }, [accountId, page, pageSize]);

    // Load sites for account
    useEffect(() => {
        if (!accountId) {
            setSiteOptions([]);
            setSiteId("");
            return;
        }
        (async () => {
            try {
                const res = await fetch("/api/sites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ account_id: Number(accountId), activeOnly: true }),
                });
                const json = await res.json();
                if (res.ok && json?.success) {
                    setSiteOptions((json.data || []).map((s) => ({ value: String(s.site_id), label: s.site_name || `Site #${s.site_id}` })));
                }
            } catch {}
        })();
    }, [accountId]);

    // Load locations (global list)
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/locations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activeOnly: true }) });
                const json = await res.json();
                if (res.ok && json?.success) {
                    setLocationOptions((json.data || []).map((l) => ({ value: String(l.location_id), label: l.location_name })));
                }
            } catch {}
        })();
    }, []);

    function toggleSelect(assetId) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(assetId)) next.delete(assetId);
            else next.add(assetId);
            return next;
        });
    }

    async function moveSelected() {
        if (!canMove) return;
        const ids = Array.from(selectedIds);
        const updates = {};
        if (siteId) updates.site_id = Number(siteId);
        if (locationId) updates.location_id = Number(locationId);
        const chunkSize = 10;
        for (let i = 0; i < ids.length; i += chunkSize) {
            const slice = ids.slice(i, i + chunkSize);
            await Promise.all(
                slice.map((asset_id) =>
                    fetch("/api/assets/update", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ asset_id, ...updates }),
                    })
                )
            );
        }
        // refresh list
        const u = new URL("/api/assets/list", window.location.origin);
        u.searchParams.set("account_id", String(accountId));
        u.searchParams.set("limit", String(pageSize));
        u.searchParams.set("offset", String(page * pageSize));
        const res = await fetch(u.toString(), { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data.success) setAssets(data.data || []);
        setSelectedIds(new Set());
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-3">
                <AnimatedSelect id="site" label="New Site" value={siteId} options={[{ value: "", label: "No change" }, ...siteOptions]} onChange={(e) => setSiteId(e?.target?.value || "")} />
                <AnimatedSelect id="location" label="New Location" value={locationId} options={[{ value: "", label: "No change" }, ...locationOptions]} onChange={(e) => setLocationId(e?.target?.value || "")} />
                <button className={`ml-auto rounded px-4 py-2 text-white text-sm ${canMove ? "bg-orange-500/80 hover:bg-orange-500" : "bg-neutral-700 text-neutral-400 cursor-not-allowed"}`} disabled={!canMove} onClick={moveSelected}>
                    Move Selected
                </button>
            </div>
            <div className="border border-neutral-700 rounded overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-900 text-neutral-400">
                        <tr>
                            <th className="text-left px-2 py-2">Select</th>
                            <th className="text-left px-2 py-2">Asset</th>
                            <th className="text-left px-2 py-2">Product</th>
                            <th className="text-left px-2 py-2">Site</th>
                            <th className="text-left px-2 py-2">Location</th>
                            <th className="text-left px-2 py-2">Status</th>
                            <th className="text-right px-2 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((a) => (
                            <tr key={a.asset_id} className="border-t border-neutral-800">
                                <td className="px-2 py-2">
                                    <input type="checkbox" checked={selectedIds.has(a.asset_id)} onChange={() => toggleSelect(a.asset_id)} />
                                </td>
                                <td className="px-2 py-2 text-neutral-100 font-medium">
                                    <button className="text-orange-400 hover:text-orange-300" onClick={() => setViewId(a.asset_id)}>
                                        {a.serial_number || a.asset_tag || `#${a.asset_id}`}
                                    </button>
                                </td>
                                <td className="px-2 py-2 text-neutral-300">{a.product_name || a.product_id}</td>
                                <td className="px-2 py-2 text-neutral-300">{a.site_name || (a.site_id ? `#${a.site_id}` : "-")}</td>
                                <td className="px-2 py-2 text-neutral-300">{a.location_name || (a.location_id ? `#${a.location_id}` : "-")}</td>
                                <td className="px-2 py-2"><span className="px-2 py-0.5 rounded bg-neutral-700 text-neutral-300 text-xs">{a.status}</span></td>
                                <td className="px-2 py-2 text-right">
                                    <EditAssetModal
                                        asset={a}
                                        onUpdated={async () => {
                                            const u = new URL("/api/assets/list", window.location.origin);
                                            u.searchParams.set("account_id", String(accountId));
                                            const res = await fetch(u.toString(), { cache: "no-store" });
                                            const data = await res.json();
                                            if (res.ok && data.success) setAssets(data.data || []);
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                        {!assets.length && (
                            <tr>
                                <td className="px-2 py-3 text-neutral-400" colSpan={6}>{loading ? "Loading..." : "No assets for this account."}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center">
                <div className="text-neutral-400 text-sm">
                    Page {page + 1} of {Math.max(1, Math.ceil((total || 0) / pageSize))} · Total {total}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-1 rounded bg-neutral-800 text-neutral-300 disabled:opacity-50"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        Prev
                    </button>
                    <button
                        className="px-3 py-1 rounded bg-neutral-800 text-neutral-300 disabled:opacity-50"
                        onClick={() => setPage((p) => Math.min(Math.max(0, Math.ceil((total || 0) / pageSize) - 1), p + 1))}
                        disabled={page >= Math.max(0, Math.ceil((total || 0) / pageSize) - 1)}
                    >
                        Next
                    </button>
                    <select
                        className="ml-2 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200"
                        value={String(pageSize)}
                        onChange={(e) => { setPage(0); setPageSize(Number(e.target.value) || 25); }}
                    >
                        {[10, 25, 50, 100].map((n) => (
                            <option key={n} value={n}>{n}/page</option>
                        ))}
                    </select>
                </div>
            </div>
            {viewId && (
                <AssetDetailDrawer
                    assetId={viewId}
                    accountId={accountId}
                    onClose={() => setViewId(null)}
                    onUpdated={async () => {
                        // refresh current page
                        const u = new URL("/api/assets/list", window.location.origin);
                        u.searchParams.set("account_id", String(accountId));
                        u.searchParams.set("limit", String(pageSize));
                        u.searchParams.set("offset", String(page * pageSize));
                        const res = await fetch(u.toString(), { cache: "no-store" });
                        const data = await res.json();
                        if (res.ok && data.success) setAssets(data.data || []);
                    }}
                />
            )}
        </div>
    );
}
