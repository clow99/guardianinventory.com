import {
    Package,
    TrendingUp,
    TrendingDown,
    CircleCheckBig,
    CopyPlus,
} from "lucide-react";
import DoubleBarGraph from "@/components/charts/DoubleBarGraph";
import DonutPieChart from "@/components/charts/DonutPieChart";
import AssetLineChart from "@/components/charts/AssetLineChart";
import DayOfWeekBarChart from "@/components/charts/DayOfWeekBarChart";

export default function Home() {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-row gap-3">
                <div className="flex flex-col border border-neutral-700 p-3 min-w-[225px] rounded h-[80px]">
                    <div className="flex flex-row items-center">
                        <Package className="text-neutral-400 h-4" />
                        <span className="text-neutral-400 text-sm">Assets</span>
                    </div>
                    <div className="flex flex-row items-end">
                        <div className="text-white text-3xl font-bold pl-2">
                            23,010
                        </div>
                        <TrendingUp className="text-green-500 h-5 ml-3 mb-1" />
                        <span className="text-green-500 text-sm pl-1 mb-1">
                            +2.5%
                        </span>
                    </div>
                </div>
                <div className="flex flex-col border border-neutral-700 p-3 min-w-[225px] rounded h-[80px]">
                    <div className="flex flex-row items-center">
                        <CircleCheckBig className="text-neutral-400 h-4" />
                        <span className="text-neutral-400 text-sm">Tasks</span>
                    </div>
                    <div className="flex flex-row items-end">
                        <div className="text-white text-3xl font-bold pl-2">
                            34
                        </div>
                        <TrendingDown className="text-red-500 h-5 ml-3 mb-1" />
                        <span className="text-red-500 text-sm pl-1 mb-1">
                            -2.5%
                        </span>
                    </div>
                </div>
                <div className="flex flex-col border border-neutral-700 p-3 min-w-[225px] rounded h-[80px]">
                    <div className="flex flex-row items-center">
                        <Package className="text-neutral-400 h-4" />
                        <span className="text-neutral-400 text-sm">Assets</span>
                    </div>
                    <div className="flex flex-row items-end">
                        <div className="text-white text-3xl font-bold pl-2">
                            23,010
                        </div>
                        <TrendingUp className="text-green-500 h-5 ml-3 mb-1" />
                        <span className="text-green-500 text-sm pl-1 mb-1">
                            +2.5%
                        </span>
                    </div>
                </div>
                <div className="flex flex-col border border-neutral-700 p-3 min-w-[225px] rounded h-[80px]">
                    <div className="flex flex-row items-center">
                        <Package className="text-neutral-400 h-4" />
                        <span className="text-neutral-400 text-sm">Assets</span>
                    </div>
                    <div className="flex flex-row items-end">
                        <div className="text-white text-3xl font-bold pl-2">
                            3,310
                        </div>
                        <TrendingUp className="text-green-500 h-5 ml-3 mb-1" />
                        <span className="text-green-500 text-sm pl-1 mb-1">
                            +3.1%
                        </span>
                    </div>
                </div>
                <button className="ml-auto group flex h-fit flex-col border gap-1 border-neutral-700 p-2 rounded flex items-center justify-end cursor-pointer hover:border-neutral-600 ease-in-out duration-200 hover:bg-neutral-700">
                    <span className="text-neutral-400 text-sm pl-2">
                        Edit Dashboard
                    </span>
                </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
                <DoubleBarGraph />
            </div>
            <div className="grid grid-cols-3 gap-3">
                <DonutPieChart />
                <AssetLineChart />
                <DayOfWeekBarChart />
            </div>
        </div>
    );
}
