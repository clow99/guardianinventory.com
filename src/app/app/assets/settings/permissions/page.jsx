"use client";
import PermissionPage from "@/components/permissions/PermissionPage";

export default function PermissionsPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-white text-2xl font-bold">Permissions</h1>
            <PermissionPage />
        </div>
    );
}
