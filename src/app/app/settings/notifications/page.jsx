"use client";
import NotificationsPanel from "@/components/settings/NotificationsPanel";
import NotificationPreferences from "@/components/settings/NotificationPreferences";

export default function NotificationSettingsPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-white text-2xl font-bold">Notifications</h1>
            <NotificationPreferences />
            <NotificationsPanel />
        </div>
    );
}
