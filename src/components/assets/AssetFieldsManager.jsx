"use client";

import { useEffect, useMemo, useState } from "react";
import AnimatedTextarea from "@/components/inputs/AnimatedTextarea";
import { useAccount } from "@/app/hooks/useAccount";

export default function AssetFieldsManager() {
    const { accountId } = useAccount();
    const [value, setValue] = useState('{\n  "fields": []\n}');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!accountId) return;
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch("/api/accounts/list");
                const json = await res.json();
                if (!res.ok || json.success === false)
                    throw new Error(json?.error || "Failed to load account");
                const acct = (json.data || []).find(
                    (a) => String(a.account_id) === String(accountId)
                );
                const cf = acct?.custom_fields || {};
                const af = cf?.asset_fields || { fields: [] };
                if (!cancelled)
                    setValue(
                        typeof af === "object"
                            ? JSON.stringify(af, null, 2)
                            : '{\n  "fields": []\n}'
                    );
            } catch (e) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [accountId]);

    const parsed = useMemo(() => {
        try {
            const obj = JSON.parse(value);
            return obj && typeof obj === "object" ? obj : null;
        } catch {
            return null;
        }
    }, [value]);

    async function save() {
        if (!accountId || !parsed) return;
        try {
            setSaving(true);
            setError("");
            // Merge into account.custom_fields.asset_fields
            const body = {
                account_id: Number(accountId),
                custom_fields: { asset_fields: parsed },
            };
            const res = await fetch("/api/accounts/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || "Save failed");
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    if (!accountId)
        return (
            <div className="text-neutral-300">
                Select an account to edit asset fields.
            </div>
        );

    return (
        <div className="space-y-3">
            <div className="text-neutral-300 text-sm">
                Define asset field schema (JSON). Supports keys: key, label,
                type (text, textarea, number, date, select), required (bool),
                min/max (number), minLength/maxLength (text), pattern (regex),
                options (for select), help (helper text under field). Example:{" "}
                <code className="bg-neutral-900/40 px-1 py-0.5 rounded text-neutral-200">{`{"fields":[{"key":"warranty_exp","label":"Warranty Expiration","type":"date","required":true,"help":"When does the warranty end?"}]}`}</code>
            </div>
            {loading && (
                <div className="text-neutral-400 text-sm">Loading...</div>
            )}
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <AnimatedTextarea
                id="asset-fields-json"
                label="Asset Fields JSON"
                rows={16}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <div className="flex justify-end">
                <button
                    className={`rounded px-4 py-2 text-white text-sm ${
                        parsed
                            ? "bg-orange-500/80 hover:bg-orange-500"
                            : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                    }`}
                    disabled={!parsed || saving}
                    onClick={save}
                >
                    {saving ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    );
}
