"use client";

import { useEffect, useState } from "react";
import AnimatedSwitch from "@/components/inputs/AnimatedSwitch";
import { useAccount } from "@/app/hooks/useAccount";

const DEFAULT_PREFS = {
    enabled: true,
    email: {
        low_inventory: true,
        task_assigned: true,
        weekly_summary: false,
    },
};

export default function NotificationPreferences() {
    const { accountId } = useAccount();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [prefs, setPrefs] = useState(DEFAULT_PREFS);

    useEffect(() => {
        if (!accountId) return;
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch(`/api/notifications/prefs?account_id=${accountId}`);
                const json = await res.json();
                if (!cancelled) {
                    if (res.ok && json?.success) {
                        const merged = {
                            ...DEFAULT_PREFS,
                            ...(json.data || {}),
                            email: { ...DEFAULT_PREFS.email, ...(json.data?.email || {}) },
                        };
                        setPrefs(merged);
                    } else {
                        setError(json?.error || "Failed to load preferences");
                    }
                }
            } catch (e) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [accountId]);

    async function save(next) {
        if (!accountId) return;
        try {
            setSaving(true);
            setError("");
            const res = await fetch(`/api/notifications/prefs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ account_id: Number(accountId), preferences: next }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to save preferences");
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    function setPref(path, value) {
        setPrefs((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            const parts = path.split(".");
            let obj = next;
            for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]] = obj[parts[i]] ?? {};
            obj[parts[parts.length - 1]] = value;
            // fire-and-forget save
            save(next);
            return next;
        });
    }

    if (!accountId) return <div className="text-neutral-300">Select an account to edit preferences.</div>;

    return (
        <div className="border border-neutral-700 rounded p-3 space-y-2">
            <div className="flex items-center">
                <div className="text-white font-semibold mr-auto">Notification Preferences</div>
                {loading && <div className="text-xs text-neutral-400">Loading...</div>}
                {saving && <div className="text-xs text-neutral-400 ml-2">Saving...</div>}
            </div>
            {error && <div className="text-xs text-red-400">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col">
                    <AnimatedSwitch id="notif-enabled" label="Enable notifications" checked={!!prefs.enabled} onChange={(e) => setPref("enabled", e.target.checked)} />
                    <div className="text-neutral-400 text-xs pl-18">Allow the app to send you notifications.</div>
                </div>
                <div className="flex flex-col">
                    <AnimatedSwitch id="notif-lowinv" label="Email: Low inventory alerts" checked={!!prefs.email.low_inventory} onChange={(e) => setPref("email.low_inventory", e.target.checked)} />
                    <div className="text-neutral-400 text-xs pl-18">Get alerts when stock drops below thresholds.</div>
                </div>
                <div className="flex flex-col">
                    <AnimatedSwitch id="notif-task" label="Email: Task assigned to me" checked={!!prefs.email.task_assigned} onChange={(e) => setPref("email.task_assigned", e.target.checked)} />
                    <div className="text-neutral-400 text-xs pl-18">Receive an email when you are assigned a task.</div>
                </div>
                <div className="flex flex-col">
                    <AnimatedSwitch id="notif-weekly" label="Email: Weekly summary" checked={!!prefs.email.weekly_summary} onChange={(e) => setPref("email.weekly_summary", e.target.checked)} />
                    <div className="text-neutral-400 text-xs pl-18">A weekly summary of activity for your account.</div>
                </div>
            </div>
        </div>
    );
}

