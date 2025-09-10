"use client";
import { useEffect, useState } from "react";
import { useAccount } from "@/app/hooks/useAccount";
import AnimatedTextarea from "@/components/inputs/AnimatedTextarea";

export default function CustomFieldsPage() {
    const { accountId } = useAccount();
    const [value, setValue] = useState("{\n  \"example\": true\n}");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!accountId) return;
        (async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch("/api/accounts/list");
                const json = await res.json();
                if (!res.ok || json.success === false) throw new Error(json?.error || "Failed to load account");
                const acct = (json.data || []).find((a) => String(a.account_id) === String(accountId));
                const cf = acct?.custom_fields;
                setValue(cf && typeof cf === "object" ? JSON.stringify(cf, null, 2) : "{}");
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [accountId]);

    const parsed = (() => {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    })();

    async function save() {
        if (!accountId || !parsed) return;
        try {
            setSaving(true);
            const res = await fetch("/api/accounts/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ account_id: Number(accountId), custom_fields: parsed }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Save failed");
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    if (!accountId) {
        return <div className="text-neutral-300">Select an account to edit custom fields.</div>;
    }

    return (
        <div className="space-y-3">
            <div className="text-neutral-300 text-sm">
                Define account-level custom fields (stored on the account). Use JSON format.
            </div>
            {loading && <div className="text-neutral-400 text-sm">Loading...</div>}
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <AnimatedTextarea id="custom-fields" label="Custom Fields (JSON)" rows={14} value={value} onChange={(e) => setValue(e.target.value)} />
            <div className="flex justify-end">
                <button className={`rounded px-4 py-2 text-white text-sm ${parsed ? "bg-orange-500/80 hover:bg-orange-500" : "bg-neutral-700 text-neutral-400 cursor-not-allowed"}`} disabled={!parsed || saving} onClick={save}>
                    {saving ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    );
}
