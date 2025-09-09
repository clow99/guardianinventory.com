"use client";
import EmployeeLimits from "@/components/employees/EmployeeLimits";

export default function EmployeeLimitsPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-white text-2xl font-bold">Employee Asset Limits</h1>
            <EmployeeLimits />
        </div>
    );
}
