"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/modals/Modal";
import AnimatedInput from "@/components/inputs/AnimatedInput";
import AnimatedSelect from "@/components/inputs/AnimatedSelect";
import AnimatedTextarea from "@/components/inputs/AnimatedTextarea";
import { trackEvent, trackError } from "@/lib/analytics";

export default function AssetDetailDrawer({ assetId, accountId, onClose, onUpdated }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [asset, setAsset] = useState(null);
    const [history, setHistory] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [schema, setSchema] = useState({ fields: [] });
    const [tasks, setTasks] = useState([]);
    const [taskFiles, setTaskFiles] = useState([]); // flattened files
    const [assetFiles, setAssetFiles] = useState([]);
    const [newFileName, setNewFileName] = useState("");
    const [newFilePath, setNewFilePath] = useState("");
    const [siteOptions, setSiteOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});

    useEffect(() => {
        if (!assetId) return;
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError("");
                const [assetRes, histRes] = await Promise.all([
                    fetch(`/api/assets/byId?asset_id=${assetId}`),
                    fetch(`/api/assets/history?asset_id=${assetId}`),
                ]);
                const [assetJson, histJson] = await Promise.all([
                    assetRes.json().catch(() => ({})),
                    histRes.json().catch(() => ({})),
                ]);
                if (cancelled) return;
                if (assetRes.ok && assetJson?.success) {
                    setAsset(assetJson.data);
                    setForm({
                        site_id: assetJson.data?.site_id ? String(assetJson.data.site_id) : "",
                        location_id: assetJson.data?.location_id ? String(assetJson.data.location_id) : "",
                        status: assetJson.data?.status || "available",
                        asset_tag: assetJson.data?.asset_tag || "",
                        assigned_to: assetJson.data?.assigned_employee_id ? String(assetJson.data.assigned_employee_id) : "",
                        custom_fields: typeof assetJson.data?.custom_fields === "object" ? assetJson.data.custom_fields : {},
                    });
                    trackEvent("asset_detail_opened", {
                        assetId,
                        accountId,
                        hasFiles: Array.isArray(assetJson?.data?.files) && assetJson.data.files.length > 0,
                    });
                } else {
                    setError(assetJson?.error || "Failed to load asset");
                    trackError("asset_detail_load_failed", { assetId, message: assetJson?.error || "unknown" });
                }
                if (histRes.ok && histJson?.success) setHistory(histJson.data || []);
            } catch (e) {
                if (!cancelled) {
                    setError(e.message);
                    trackError("asset_detail_load_exception", { assetId, message: e.message });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
            try {
                const res = await fetch(`/api/assets/file/list?asset_id=${assetId}`);
                const json = await res.json();
                if (!cancelled && res.ok && json?.success) setAssetFiles(json.data || []);
            } catch (e) {
                if (!cancelled) {
                    trackError("asset_file_list_failed", { assetId, message: e.message });
                }
            }
        })();
        return () => { cancelled = true; };
    }, [assetId]);

    // Load employees for assignment (admin-only route; may fail quietly if not admin)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: true }) });
                const json = await res.json();
                if (!cancelled && res.ok && json?.success) {
                    setEmployees((json.data || []).map((e) => ({ value: String(e.employee_id), label: e.full_name || e.username || e.email })));
                }
            } catch (e) {
                if (!cancelled) {
                    trackError("asset_employee_list_failed", { assetId, message: e.message });
                }
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Load schema and task files
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                if (accountId) {
                    const res = await fetch("/api/accounts/list");
                    const json = await res.json();
                    if (!cancelled && res.ok && json?.success) {
                        const acct = (json.data || []).find((a) => String(a.account_id) === String(accountId));
                        const cf = acct?.custom_fields || {};
                        const af = cf?.asset_fields || { fields: [] };
                        if (af && typeof af === "object" && Array.isArray(af.fields)) setSchema(af);
                    }
                }
            } catch (e) {
                if (!cancelled) {
                    trackError("asset_schema_load_failed", { assetId, message: e.message });
                }
            }
            try {
                // fetch tasks for this asset then collect files via byId
                const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ asset_id: Number(assetId) }) });
                const json = await res.json();
                if (!cancelled && res.ok && json?.success) {
                    setTasks(json.data || []);
                    const files = [];
                    for (const t of json.data || []) {
                        try {
                            const r = await fetch("/api/tasks/byId", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task_id: t.id }) });
                            const j = await r.json();
                            if (r.ok && j?.success) {
                                (j.data?.files || []).forEach((f) => files.push({ ...f, task_id: t.id }));
                            }
                        } catch {}
                    }
                    if (!cancelled) setTaskFiles(files);
                }
            } catch (e) {
                if (!cancelled) {
                    trackError("asset_task_list_failed", { assetId, message: e.message });
                }
            }
        })();
        return () => { cancelled = true; };
    }, [assetId, accountId]);

    // Load dropdown data for site/location
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                if (accountId) {
                    const res = await fetch("/api/sites", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ activeOnly: true, account_id: Number(accountId) }),
                    });
                    const json = await res.json();
                    if (!cancelled && res.ok && json?.success) {
                        setSiteOptions((json.data || []).map((s) => ({ value: String(s.site_id), label: s.site_name || `Site #${s.site_id}` })));
                    }
                } else {
                    setSiteOptions([]);
                }
            } catch {}
            try {
                const res = await fetch("/api/locations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activeOnly: true }) });
                const json = await res.json();
                if (!cancelled && res.ok && json?.success) setLocationOptions((json.data || []).map((l) => ({ value: String(l.location_id), label: l.location_name })));
            } catch {}
        })();
        return () => { cancelled = true; };
    }, [accountId]);

    const siteName = asset?.site_name || (asset?.site_id ? `#${asset.site_id}` : "-");
    const locationName = asset?.location_name || (asset?.location_id ? `#${asset.location_id}` : "-");

    async function saveQuickEdit() {
        try {
            setLoading(true);
            const payload = {
                asset_id: Number(assetId),
                site_id: form.site_id ? Number(form.site_id) : undefined,
                location_id: form.location_id ? Number(form.location_id) : undefined,
                status: form.status || undefined,
                asset_tag: form.asset_tag || undefined,
                assigned_to: form.assigned_to ? Number(form.assigned_to) : undefined,
                custom_fields: form.custom_fields || undefined,
            };
            const res = await fetch("/api/assets/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Save failed");
            setAsset(json.data);
            onUpdated && onUpdated(json.data);
            setEditing(false);
            trackEvent("asset_quick_edit_saved", {
                assetId,
                siteId: payload.site_id ?? null,
                locationId: payload.location_id ?? null,
                status: payload.status ?? null,
            });
        } catch (e) {
            setError(e.message);
            trackError("asset_quick_edit_failed", { assetId, message: e.message });
        } finally {
            setLoading(false);
        }
    }

    if (!assetId) return null;

    return (
        <Modal isOpen={!!assetId} onClose={onClose}>
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-white text-xl font-semibold">Asset Details</h3>
                    <div className="ml-auto" />
                    {!editing ? (
                        <button className="text-sm px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700" onClick={() => setEditing(true)}>Quick Edit</button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button className="text-sm px-3 py-1 rounded border border-neutral-700 hover:bg-neutral-800" onClick={() => setEditing(false)}>Cancel</button>
                            <button className="text-sm px-3 py-1 rounded bg-orange-500/80 hover:bg-orange-500 text-white" onClick={saveQuickEdit} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
                        </div>
                    )}
                </div>
                {error && <div className="text-red-400 text-sm">{error}</div>}
                {!editing ? (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <div className="text-neutral-400 text-xs">Serial</div>
                            <div className="text-neutral-100 font-semibold">{asset?.serial_number || ""}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-neutral-400 text-xs">Tag</div>
                            <div className="text-neutral-100 font-semibold">{asset?.asset_tag || "-"}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-neutral-400 text-xs">Product</div>
                            <div className="text-neutral-100 font-semibold">{asset?.product_name || asset?.product_id}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-neutral-400 text-xs">Status</div>
                            <div className="text-neutral-100 font-semibold">{asset?.status}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-neutral-400 text-xs">Site</div>
                            <div className="text-neutral-100 font-semibold">{siteName}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-neutral-400 text-xs">Location</div>
                            <div className="text-neutral-100 font-semibold">{locationName}</div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <AnimatedInput label="Asset Tag" value={form.asset_tag || ""} onChange={(e) => setForm((f) => ({ ...f, asset_tag: e.target.value }))} />
                        <AnimatedSelect label="Status" value={form.status || "available"} options={["available","assigned","under_repair","retired"].map((v) => ({ value: v, label: v.replace(/_/g, " ") }))} onChange={(e) => setForm((f) => ({ ...f, status: e?.target?.value || "available" }))} />
                        <AnimatedSelect label="Assigned To" value={form.assigned_to || ""} options={[{ value: "", label: "(none)" }, ...employees]} onChange={(e) => setForm((f) => ({ ...f, assigned_to: e?.target?.value || "" }))} />
                        <AnimatedSelect label="Site" value={form.site_id || ""} options={[{ value: "", label: "(none)" }, ...siteOptions]} onChange={(e) => setForm((f) => ({ ...f, site_id: e?.target?.value || "" }))} />
                        <AnimatedSelect label="Location" value={form.location_id || ""} options={[{ value: "", label: "(none)" }, ...locationOptions]} onChange={(e) => setForm((f) => ({ ...f, location_id: e?.target?.value || "" }))} />
                        {Array.isArray(schema.fields) && schema.fields.length > 0 && (
                            <div className="col-span-2">
                                <div className="text-neutral-300 text-sm mb-1">Additional Fields</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {schema.fields.map((f) => {
                                        const key = f.key;
                                        const label = f.label || key;
                                        const type = f.type || "text";
                                        const val = (form.custom_fields || {})[key] ?? "";
                                        if (type === "textarea") return <AnimatedTextarea key={key} label={label} value={String(val || "")} onChange={(e) => setForm((p) => ({ ...p, custom_fields: { ...(p.custom_fields||{}), [key]: e.target.value } }))} rows={3} />;
                                        if (type === "number") return <AnimatedInput key={key} type="number" label={label} value={String(val || "")} onChange={(e) => setForm((p) => ({ ...p, custom_fields: { ...(p.custom_fields||{}), [key]: e.target.value === "" ? "" : Number(e.target.value) } }))} />;
                                        if (type === "date") return <AnimatedInput key={key} type="date" label={label} value={String(val || "")} onChange={(e) => setForm((p) => ({ ...p, custom_fields: { ...(p.custom_fields||{}), [key]: e.target.value } }))} />;
                                        if (type === "select" && Array.isArray(f.options)) {
                                            const opts = f.options.map((o) => ({ value: String(o.value ?? o), label: String(o.label ?? o) }));
                                            return <AnimatedSelect key={key} label={label} value={String(val || "")} options={[{ value: "", label: "Select" }, ...opts]} onChange={(e) => setForm((p) => ({ ...p, custom_fields: { ...(p.custom_fields||{}), [key]: e?.target?.value || "" } }))} />;
                                        }
                                        return <AnimatedInput key={key} label={label} value={String(val || "")} onChange={(e) => setForm((p) => ({ ...p, custom_fields: { ...(p.custom_fields||{}), [key]: e.target.value } }))} />;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* History */}
                <div className="border border-neutral-700 rounded p-3">
                    <div className="text-white font-semibold mb-2">Move History</div>
                    <div className="max-h-48 overflow-auto divide-y divide-neutral-800">
                        {(history || []).map((h) => (
                            <div key={h.id} className="py-1 text-sm text-neutral-300">
                                <span className="text-neutral-400">{new Date(h.created_at).toLocaleString()}</span>
                                {" · "}
                                {h.move_reason || "Updated"}
                            </div>
                        ))}
                        {!history?.length && (
                            <div className="text-neutral-400 text-sm">No history.</div>
                        )}
                    </div>
                </div>

                {/* Asset Files */}
                <div className="border border-neutral-700 rounded p-3">
                    <div className="text-white font-semibold mb-2">Asset Files</div>
                    <div className="space-y-1">
                        {(assetFiles || []).map((f) => (
                            <div key={f.id} className="flex items-center justify-between text-sm">
                                <a className="text-orange-400 hover:text-orange-300 truncate" href={f.file_path} target="_blank" rel="noreferrer">{f.file_name}</a>
                                <button className="text-xs text-red-400 hover:text-red-300" onClick={async () => {
                                    const deleteRes = await fetch(`/api/assets/file/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: f.id }) });
                                    if (deleteRes.ok) {
                                        trackEvent("asset_file_deleted", { assetId, fileId: f.id });
                                    } else {
                                        trackError("asset_file_delete_failed", { assetId, fileId: f.id, status: deleteRes.status });
                                    }
                                    const res = await fetch(`/api/assets/file/list?asset_id=${assetId}`);
                                    const json = await res.json();
                                    if (res.ok && json?.success) setAssetFiles(json.data || []);
                                }}>Delete</button>
                            </div>
                        ))}
                        {!assetFiles?.length && (
                            <div className="text-neutral-400 text-sm">No files attached to asset.</div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                            <AnimatedInput label="File name" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />
                            <AnimatedInput label="File URL / path" value={newFilePath} onChange={(e) => setNewFilePath(e.target.value)} />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button className={`rounded px-3 py-1.5 text-sm text-white ${newFileName.trim() && newFilePath.trim() ? 'bg-orange-500/80 hover:bg-orange-500' : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'}`} disabled={!newFileName.trim() || !newFilePath.trim()} onClick={async () => {
                                const payload = { asset_id: Number(assetId), file_name: newFileName.trim(), file_path: newFilePath.trim() };
                                const addRes = await fetch(`/api/assets/file/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                                if (addRes.ok) {
                                    trackEvent("asset_file_added", { assetId, fileName: payload.file_name });
                                } else {
                                    trackError("asset_file_add_failed", { assetId, status: addRes.status });
                                }
                                setNewFileName(''); setNewFilePath('');
                                const res = await fetch(`/api/assets/file/list?asset_id=${assetId}`);
                                const json = await res.json();
                                if (res.ok && json?.success) setAssetFiles(json.data || []);
                            }}>Add file</button>
                        </div>
                    </div>
                </div>

                {/* Related Task Files */}
                <div className="border border-neutral-700 rounded p-3">
                    <div className="text-white font-semibold mb-2">Related Files</div>
                    <div className="space-y-1">
                        {(taskFiles || []).map((f) => (
                            <div key={f.id} className="flex items-center justify-between text-sm">
                                <a className="text-orange-400 hover:text-orange-300 truncate" href={f.file_path} target="_blank" rel="noreferrer">{f.file_name}</a>
                                <span className="text-neutral-500 text-xs">Task #{f.task_id}</span>
                            </div>
                        ))}
                        {!taskFiles?.length && (
                            <div className="text-neutral-400 text-sm">No files (files can be attached to tasks).</div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
