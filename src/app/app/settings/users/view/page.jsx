"use client";
import UsersSettings from "@/components/settings/UsersSettings";

export default function UsersViewPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-white text-2xl font-bold">Users</h1>
            <UsersSettings />
        </div>
    );
}
