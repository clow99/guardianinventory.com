export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
    Package,
    TrendingUp,
    TrendingDown,
    CircleCheckBig,
} from "lucide-react";
import DoubleBarGraph from "@/components/charts/DoubleBarGraph";
import DonutPieChart from "@/components/charts/DonutPieChart";
import AssetLineChart from "@/components/charts/AssetLineChart";
import DayOfWeekBarChart from "@/components/charts/DayOfWeekBarChart";

function pctChange(curr = 0, prev = 0) {
    const p = Number(prev) || 0;
    if (p === 0) return curr ? 100 : 0;
    return ((Number(curr) - p) / p) * 100;
}

export default async function Home() {
    const session = await getServerSession(authOptions);
    const account_id = session?.user?.account_id || null;

    if (!account_id) {
        return (
            <div className="flex flex-col gap-3">
                <div className="text-neutral-300">
                    Select an account to view dashboard data.
                </div>
            </div>
        );
    }

    let donut = [];
    let line = { data: [], series: [] };
    let dow = [];
    let bars = [];
    try {
        const res = await fetch("/api/charts/overview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ account_id }),
            cache: "no-store",
            // cookies are forwarded automatically in server components
        });
        if (res.ok) {
            const json = await res.json();
            donut = json?.data?.donut || [];
            line = json?.data?.line || { data: [], series: [] };
            dow = json?.data?.dow || [];
            bars = json?.data?.bars || [];
        }
    } catch {}

    const last = bars[bars.length - 1] || {
        seriesA: 0,
        seriesB: 0,
        seriesC: 0,
        name: "",
    };
    const prev = bars[bars.length - 2] || {
        seriesA: 0,
        seriesB: 0,
        seriesC: 0,
    };
    const cards = [
        {
            label: "Assets (month)",
            value: last.seriesA || 0,
            change: pctChange(last.seriesA, prev.seriesA),
            up: (last.seriesA || 0) >= (prev.seriesA || 0),
            icon: Package,
        },
        {
            label: "Tasks Created (month)",
            value: last.seriesB || 0,
            change: pctChange(last.seriesB, prev.seriesB),
            up: (last.seriesB || 0) >= (prev.seriesB || 0),
            icon: CircleCheckBig,
        },
        {
            label: "Tasks Completed (month)",
            value: last.seriesC || 0,
            change: pctChange(last.seriesC, prev.seriesC),
            up: (last.seriesC || 0) >= (prev.seriesC || 0),
            icon: CircleCheckBig,
        },
    ];

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-row gap-3">
                {cards.map((c, idx) => {
                    const Icon = c.icon;
                    const ChangeIcon = c.up ? TrendingUp : TrendingDown;
                    return (
                        <div
                            key={idx}
                            className="flex flex-col border border-neutral-700 p-3 min-w-[225px] rounded h-[80px]"
                        >
                            <div className="flex flex-row items-center">
                                <Icon className="text-neutral-400 h-4" />
                                <span className="text-neutral-400 text-sm">
                                    {c.label}
                                </span>
                            </div>
                            <div className="flex flex-row items-end">
                                <div className="text-white text-3xl font-bold pl-2">
                                    {new Intl.NumberFormat().format(
                                        Number(c.value) || 0
                                    )}
                                </div>
                                <ChangeIcon
                                    className={`${
                                        c.up ? "text-green-500" : "text-red-500"
                                    } h-5 ml-3 mb-1`}
                                />
                                <span
                                    className={`${
                                        c.up ? "text-green-500" : "text-red-500"
                                    } text-sm pl-1 mb-1`}
                                >
                                    {`${c.up ? "+" : ""}${(
                                        c.change || 0
                                    ).toFixed(1)}%`}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <button className="ml-auto group flex h-fit flex-col border gap-1 border-neutral-700 p-2 rounded items-center justify-end cursor-pointer hover:border-neutral-600 ease-in-out duration-200 hover:bg-neutral-700">
                    <span className="text-neutral-400 text-sm pl-2">
                        Edit Dashboard
                    </span>
                </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
                <DoubleBarGraph
                    graphData={bars}
                    title="Assets vs Tasks (monthly)"
                />
            </div>
            <div className="grid grid-cols-3 gap-3">
                <DonutPieChart data={donut} title="Assets by Category" />
                <AssetLineChart
                    data={line.data}
                    series={line.series}
                    title="Top Categories Over Time"
                />
                <DayOfWeekBarChart data={dow} title="Tasks by Weekday" />
            </div>
        </div>
    );
}
