"use client";
import { useEffect, useMemo, useState } from "react";
import DoubleBarGraph from "@/components/charts/DoubleBarGraph";
import DonutPieChart from "@/components/charts/DonutPieChart";
import AssetLineChart from "@/components/charts/AssetLineChart";
import DayOfWeekBarChart from "@/components/charts/DayOfWeekBarChart";
import DateRangeSelector from "@/components/buttons/DateRangeSelector";
import AnimatedSelect from "@/components/inputs/AnimatedSelect";
import { useAccount } from "@/app/hooks/useAccount";

export default function ChartsPage() {
    const [range, setRange] = useState({ start: null, end: null });
    const [sites, setSites] = useState([]);
    const { accountId } = useAccount();
    const [siteId, setSiteId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [data, setData] = useState({
        donut: [],
        line: { data: [], series: [] },
        dow: [],
        bars: [],
    });

    // Load sites for selected account
    useEffect(() => {
        if (!accountId) {
            setSites([]);
            setSiteId("");
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/sites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        activeOnly: true,
                        account_id: Number(accountId),
                    }),
                });
                const json = await res.json();
                if (cancelled) return;
                const opts = (json?.data || []).map((s) => ({
                    value: String(s.site_id),
                    label: s.site_name || `Site #${s.site_id}`,
                }));
                setSites(opts);
                if (opts.length === 0) setSiteId("");
            } catch {}
        })();
        return () => {
            cancelled = true;
        };
    }, [accountId]);

    // Derived filters summary (for future API calls)
    const filterSummary = useMemo(() => {
        return {
            account_id: accountId ? Number(accountId) : undefined,
            site_id: siteId ? Number(siteId) : undefined,
            start: range.start ? new Date(range.start) : undefined,
            end: range.end ? new Date(range.end) : undefined,
        };
    }, [accountId, siteId, range]);

    // Fetch charts data whenever filters change and account_id is set
    useEffect(() => {
        if (!filterSummary.account_id) return;
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError("");
                const payload = {
                    account_id: filterSummary.account_id,
                    site_id: filterSummary.site_id,
                    start: filterSummary.start?.toISOString(),
                    end: filterSummary.end?.toISOString(),
                };
                const res = await fetch("/api/charts/overview", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const json = await res.json();
                if (cancelled) return;
                if (!json.success)
                    throw new Error(json.error || "Failed to load charts");
                setData(json.data || {});
            } catch (e) {
                if (!cancelled) setError(e.message || "Failed to load charts");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [filterSummary]);

    return (
        <div className="flex flex-col gap-3">
            {/* Toolbar */}
            <div className="flex flex-wrap items-end gap-3 border border-neutral-700 rounded p-3">
                <AnimatedSelect
                    label="Site"
                    value={siteId}
                    options={sites}
                    onChange={(e) => setSiteId(e?.target?.value || "")}
                    className="min-w-[200px]"
                />
                <div className="ml-auto">
                    <DateRangeSelector value={range} onChange={setRange} />
                </div>
            </div>

            {/* Charts Grid */}
            {error && <div className="text-red-400">{error}</div>}
            {loading && <div className="text-neutral-400">Loading…</div>}
            {!accountId && (
                <div className="text-neutral-400">
                    Select an account from the left menu to view charts.
                </div>
            )}
            <div className="grid grid-cols-1 gap-3">
                <DoubleBarGraph
                    title="Assets vs Tasks by Month"
                    graphData={data.bars}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <DonutPieChart title="Assets by Category" data={data.donut} />
                <AssetLineChart
                    title="Top Categories by Month"
                    data={data.line?.data}
                    series={data.line?.series}
                />
                <DayOfWeekBarChart
                    title="Tasks by Day of Week"
                    data={data.dow}
                />
            </div>
        </div>
    );
}
