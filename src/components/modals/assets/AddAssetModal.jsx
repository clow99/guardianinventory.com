"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/modals/Modal";
import AnimatedInput from "@/components/inputs/AnimatedInput";
import AnimatedSelect from "@/components/inputs/AnimatedSelect";
import AnimatedTextarea from "@/components/inputs/AnimatedTextarea";
import { useAccount } from "@/app/hooks/useAccount";
import { CircleHelp } from "lucide-react";

export default function AddAssetModal({ onAdded }) {
    const { accountId } = useAccount();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const [products, setProducts] = useState([]);
    const [sites, setSites] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingSites, setLoadingSites] = useState(false);
    const [loadingLocations, setLoadingLocations] = useState(false);

    const [schema, setSchema] = useState({ fields: [] });
    const [fieldErrors, setFieldErrors] = useState({});

    const [form, setForm] = useState({
        product_id: "",
        serial_number: "",
        site_id: "",
        location_id: "",
        asset_tag: "",
        status: "available",
        custom_fields: {},
    });

    // Load account schema and picklists when modal opens
    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        (async () => {
            try {
                // Load products for selected account
                if (accountId) {
                    setLoadingProducts(true);
                    const u = new URL("/api/products/list", window.location.origin);
                    u.searchParams.set("account_id", String(accountId));
                    const res = await fetch(u.toString());
                    const json = await res.json();
                    if (!cancelled && json?.success) {
                        const opts = (json.data || []).map((p) => ({ value: String(p.product_id), label: p.product_name }));
                        setProducts(opts);
                    }
                }
            } catch {} finally {
                if (!cancelled) setLoadingProducts(false);
            }
            try {
                setLoadingSites(true);
                const res = await fetch("/api/sites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ activeOnly: true, account_id: accountId ? Number(accountId) : undefined }),
                });
                const json = await res.json();
                if (!cancelled && json?.success) {
                    setSites((json.data || []).map((s) => ({ value: String(s.site_id), label: s.site_name || `Site #${s.site_id}` })));
                }
            } catch {} finally {
                if (!cancelled) setLoadingSites(false);
            }
            try {
                setLoadingLocations(true);
                const res = await fetch("/api/locations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activeOnly: true }) });
                const json = await res.json();
                if (!cancelled && json?.success) {
                    setLocations((json.data || []).map((l) => ({ value: String(l.location_id), label: l.location_name })));
                }
            } catch {} finally {
                if (!cancelled) setLoadingLocations(false);
            }
            try {
                const res = await fetch("/api/accounts/list");
                const json = await res.json();
                if (!cancelled && json?.success) {
                    const acct = (json.data || []).find((a) => String(a.account_id) === String(accountId));
                    const cf = acct?.custom_fields || {};
                    const af = cf?.asset_fields || { fields: [] };
                    if (af && typeof af === "object" && Array.isArray(af.fields)) setSchema(af);
                }
            } catch {}
        })();
        return () => { cancelled = true; };
    }, [open, accountId]);

    const statusOptions = [
        { value: "available", label: "Available" },
        { value: "assigned", label: "Assigned" },
        { value: "under_repair", label: "Under Repair" },
        { value: "retired", label: "Retired" },
    ];

    function setField(name, value) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function setCustomField(key, value) {
        setForm((prev) => ({ ...prev, custom_fields: { ...(prev.custom_fields || {}), [key]: value } }));
        setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    function validateDynamic() {
        const errs = {};
        const fields = Array.isArray(schema.fields) ? schema.fields : [];
        for (const f of fields) {
            const key = f.key;
            if (!key) continue;
            const type = f.type || "text";
            const val = (form.custom_fields || {})[key];
            const req = !!f.required;
            if (req && (val === undefined || val === null || val === "")) {
                errs[key] = `${f.label || key} is required`;
                continue;
            }
            if (val === undefined || val === null || val === "") continue; // nothing more to validate
            if (type === "number") {
                const num = typeof val === "number" ? val : Number(val);
                if (!Number.isFinite(num)) {
                    errs[key] = `${f.label || key} must be a number`;
                    continue;
                }
                if (typeof f.min === "number" && num < f.min) {
                    errs[key] = `${f.label || key} must be ≥ ${f.min}`;
                }
                if (typeof f.max === "number" && num > f.max) {
                    errs[key] = `${f.label || key} must be ≤ ${f.max}`;
                }
            } else if (type === "text" || type === "textarea") {
                const s = String(val);
                if (typeof f.minLength === "number" && s.length < f.minLength) {
                    errs[key] = `${f.label || key} must be at least ${f.minLength} characters`;
                }
                if (typeof f.maxLength === "number" && s.length > f.maxLength) {
                    errs[key] = `${f.label || key} must be at most ${f.maxLength} characters`;
                }
                if (f.pattern) {
                    try {
                        const re = new RegExp(f.pattern);
                        if (!re.test(s)) errs[key] = `${f.label || key} is invalid`;
                    } catch {}
                }
            } else if (type === "date") {
                const d = new Date(val);
                if (Number.isNaN(d.getTime())) errs[key] = `${f.label || key} must be a valid date`;
            } else if (type === "select") {
                if (req && !String(val)) errs[key] = `${f.label || key} is required`;
            }
        }
        setFieldErrors(errs);
        return errs;
    }

    async function submit(e) {
        e?.preventDefault?.();
        setError("");
        if (!form.product_id || !form.serial_number) {
            setError("Product and Serial Number are required.");
            return;
        }
        try {
            setSaving(true);
            const dynErrors = validateDynamic();
            if (Object.keys(dynErrors).length > 0) {
                setSaving(false);
                return;
            }
            const payload = {
                product_id: Number(form.product_id),
                serial_number: form.serial_number,
                site_id: form.site_id ? Number(form.site_id) : undefined,
                location_id: form.location_id ? Number(form.location_id) : undefined,
                asset_tag: form.asset_tag || undefined,
                status: form.status || undefined,
                custom_fields: form.custom_fields || undefined,
            };
            const res = await fetch("/api/assets/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to add asset");
            setOpen(false);
            setForm({ product_id: "", serial_number: "", site_id: "", location_id: "", asset_tag: "", status: "available", custom_fields: {} });
            onAdded && onAdded(json.data);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    function renderDynamicField(f) {
        const type = f.type || "text";
        const key = f.key;
        const labelText = (f.label || key) + (f.required ? " *" : "");
        const labelNode = (
            <span className="inline-flex items-center gap-1">
                <span>{labelText}</span>
                {f.help && (
                    <CircleHelp
                        className="w-3 h-3 text-neutral-400"
                        title={f.help}
                    />
                )}
            </span>
        );
        const value = (form.custom_fields || {})[key] ?? "";
        const err = fieldErrors[key];
        if (type === "select" && Array.isArray(f.options)) {
            const opts = f.options.map((o) => ({ value: String(o.value ?? o), label: String(o.label ?? o) }));
            return (
                <AnimatedSelect
                    key={key}
                    label={labelNode}
                    value={String(value || "")}
                    options={[{ value: "", label: "Select" }, ...opts]}
                    onChange={(e) => setCustomField(key, e?.target?.value || "")}
                />
            );
        }
        if (type === "textarea") {
            return (
                <AnimatedTextarea
                    key={key}
                    label={labelNode}
                    value={String(value || "")}
                    onChange={(e) => setCustomField(key, e.target.value)}
                    rows={3}
                />
            );
        }
        if (type === "number") {
            return (
                <AnimatedInput
                    key={key}
                    type="number"
                    label={labelNode}
                    value={String(value || "")}
                    onChange={(e) => setCustomField(key, e.target.value === "" ? "" : Number(e.target.value))}
                />
            );
        }
        if (type === "date") {
            return (
                <AnimatedInput
                    key={key}
                    type="date"
                    label={labelNode}
                    value={String(value || "")}
                    onChange={(e) => setCustomField(key, e.target.value)}
                />
            );
        }
        // default text
        return (
            <AnimatedInput
                key={key}
                label={labelNode}
                value={String(value || "")}
                onChange={(e) => setCustomField(key, e.target.value)}
            />
        );
    }

    return (
        <>
            <button
                type="button"
                className="bg-orange-500/60 text-white rounded px-4 py-2 text-sm hover:bg-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => accountId && setOpen(true)}
                disabled={!accountId}
                title={!accountId ? "Select an account to add assets." : "Add Asset"}
            >
                + Add Asset
            </button>
            <Modal isOpen={open} onClose={() => setOpen(false)}>
                <form className="space-y-3" onSubmit={submit}>
                    <h3 className="text-lg font-semibold text-white">Add Asset</h3>
                    {!accountId && (
                        <div className="text-neutral-400 text-sm">
                            Select an account from the left sidebar, then reopen this form.
                        </div>
                    )}
                    <AnimatedSelect
                        label="Product"
                        value={form.product_id}
                        options={[
                            {
                                value: "",
                                label: loadingProducts
                                    ? "Loading products..."
                                    : "Select product",
                            },
                            ...products,
                        ]}
                        onChange={(e) => setField("product_id", e?.target?.value || "")}
                    />
                    <AnimatedInput
                        label="Serial Number"
                        value={form.serial_number}
                        onChange={(e) => setField("serial_number", e.target.value)}
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <AnimatedSelect
                            label="Site"
                            value={form.site_id}
                            options={[
                                {
                                    value: "",
                                    label: loadingSites ? "Loading sites..." : "(none)",
                                },
                                ...sites,
                            ]}
                            onChange={(e) => setField("site_id", e?.target?.value || "")}
                        />
                        <AnimatedSelect
                            label="Location"
                            value={form.location_id}
                            options={[
                                {
                                    value: "",
                                    label: loadingLocations
                                        ? "Loading locations..."
                                        : "(none)",
                                },
                                ...locations,
                            ]}
                            onChange={(e) => setField("location_id", e?.target?.value || "")}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <AnimatedInput
                            label="Asset Tag"
                            value={form.asset_tag}
                            onChange={(e) => setField("asset_tag", e.target.value)}
                        />
                        <AnimatedSelect
                            label="Status"
                            value={form.status}
                            options={statusOptions}
                            onChange={(e) => setField("status", e?.target?.value || "available")}
                        />
                    </div>

                    {/* Dynamic custom fields */}
                    {Array.isArray(schema.fields) && schema.fields.length > 0 && (
                        <div className="mt-2 border-t border-neutral-800 pt-2">
                            <div className="text-neutral-300 text-sm mb-2">Additional Fields</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {schema.fields.map((f) => (
                                    <div key={f.key} className="flex flex-col gap-1">
                                        {renderDynamicField(f)}
                                        {f.help && (
                                            <div className="text-xs text-neutral-400">{f.help}</div>
                                        )}
                                        {fieldErrors[f.key] && (
                                            <div className="text-xs text-red-400">{fieldErrors[f.key]}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <div className="text-red-400 text-sm">{error}</div>}
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" className="px-4 py-2 rounded border border-neutral-600 text-neutral-300 hover:bg-neutral-800" onClick={() => setOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving || !form.product_id || !form.serial_number} className="px-4 py-2 rounded bg-orange-500/80 hover:bg-orange-500 text-white disabled:opacity-60">
                            {saving ? "Adding..." : "Add Asset"}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
