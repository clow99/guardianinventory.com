"use client";
import NotificationsPanel from "@/components/settings/NotificationsPanel";

export default function NotificationsPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-white text-2xl font-bold">Notifications</h1>
            <NotificationsPanel />
        </div>
    );
}
