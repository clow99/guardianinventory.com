"use client";
import SitesManager from "@/components/settings/SitesManager";

export default function SitesSettingsPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-white text-2xl font-bold">Sites</h1>
            <SitesManager />
        </div>
    );
}
