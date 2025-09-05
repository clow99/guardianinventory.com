"use client";

import ExampleForm from "@/components/forms/ExampleForm";
import GeneralForm from "@/components/forms/GeneralForm";
import AddAccountModal from "@/components/modals/accounts/AddAccountModal";
import AccountsList from "@/components/lists/AccountsList";
import { useState } from "react";

export default function SettingsPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-white text-2xl font-bold">
                    General Settings
                </h1>
                <AddAccountModal
                    onCreated={() => setRefreshKey((k) => k + 1)}
                />
            </div>
            <GeneralForm />
            <div>
                <h2 className="text-white text-xl font-semibold mb-2">
                    Accounts
                </h2>
                <AccountsList refreshKey={refreshKey} />
            </div>
        </div>
    );
}
