"use client";
import { useState, useEffect } from "react";
import { useAccount } from "@/app/hooks/useAccount";
import Modal from "../Modal";
import AnimatedInput from "@/components/inputs/AnimatedInput";
import AnimatedTextarea from "@/components/inputs/AnimatedTextarea";
import AnimatedMultiSelect from "@/components/inputs/AnimatedMultiSelect";
import AnimatedSelect from "@/components/inputs/AnimatedSelect";

export default function AddProductModal({ initialProductName = "", onAdded }) {
    const { accountId } = useAccount();
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({
        account_id: "",
    product_name: initialProductName,
        product_description: "",
        category_id: [],
        manufacturer_id: [],
        supplier_id: [],
        custom_fields: "",
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [catalog, setCatalog] = useState({ categories: [], manufacturers: [], suppliers: [] });
    
    // Autofill account_id from session, URL (?account_id), cookie, or localStorage when the modal opens
    useEffect(() => {
        if (!isOpen) return;
        if (form.account_id) return; // don't override if user already typed

        try {
            if (accountId) {
                setForm((prev) => ({ ...prev, account_id: String(accountId) }));
                return;
            }
            const getCookie = (name) =>
                document.cookie
                    .split("; ")
                    .find((row) => row.startsWith(name + "="))
                    ?.split("=")[1];

            let acc = undefined;
            // 1) URL param
            try {
                const url = new URL(window.location.href);
                acc = url.searchParams.get("account_id") || undefined;
            } catch {}
            // 2) Cookie
            if (!acc) acc = getCookie("account_id");
            // 3) LocalStorage fallback
            if (!acc) acc = window.localStorage.getItem("lastAccountId");

            const accNum = acc ? Number(acc) : 0;
            if (Number.isFinite(accNum) && accNum > 0) {
                setForm((prev) => ({ ...prev, account_id: String(accNum) }));
            }
        } catch {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, accountId]);

    // Load options when modal opens
    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        (async () => {
            try {
                const payload = { activeOnly: true };
                const jsonReq = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                };
                const [catsRes, mansRes, supsRes] = await Promise.all([
                    fetch("/api/categories", jsonReq),
                    fetch("/api/manufacturers", jsonReq),
                    fetch("/api/suppliers", jsonReq),
                ]);
                const [cats, mans, sups] = await Promise.all([
                    catsRes.json().catch(() => ({ success: false, data: [] })),
                    mansRes.json().catch(() => ({ success: false, data: [] })),
                    supsRes.json().catch(() => ({ success: false, data: [] })),
                ]);
                if (cancelled) return;
                setCatalog({
                    categories: (cats.data || []).map((c) => ({ value: String(c.category_id), label: c.category_name })),
                    manufacturers: (mans.data || []).map((m) => ({ value: String(m.manufacturer_id), label: m.manufacturer_name })),
                    suppliers: (sups.data || []).map((s) => ({ value: String(s.supplier_id), label: s.supplier_name })),
                });
            } catch {}
        })();
        return () => { cancelled = true; };
    }, [isOpen]);

    // Load sites when modal opens (filter by account if available)
    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        (async () => {
            try {
                const acc = Number(form.account_id || accountId) || undefined;
                const res = await fetch("/api/sites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ activeOnly: true, account_id: acc }),
                });
                const data = await res
                    .json()
                    .catch(() => ({ success: false, data: [] }));
                if (cancelled) return;
                setCatalog((prev) => ({
                    ...prev,
                    sites: (data.data || []).map((s) => ({ value: String(s.site_id), label: s.site_name })),
                }));
            } catch {}
        })();
        return () => { cancelled = true; };
    }, [isOpen, form.account_id, accountId]);

    function handleChange(e) {
        const { name, value, type } = e.target;
        // Trim product_name; keep others as-is
        const nextVal = name === "product_name" ? value.trimStart() : value;
        setForm((prev) => ({ ...prev, [name]: nextVal }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSuccessMsg("");

        // Parse custom_fields JSON; allow blank values
        let customFieldsObj = undefined;
        if (typeof form.custom_fields === "string" && form.custom_fields.trim() !== "") {
            try {
                customFieldsObj = JSON.parse(form.custom_fields);
            } catch (err) {
                setError("Custom fields must be valid JSON.");
                return;
            }
        }

        // Basic required validation
            // Basic required validation (user-friendly)
            const accIdNum = Number(form.account_id);
            if (!accIdNum) {
                setError("An account is required.");
                return;
            }

        const asNum = (v) => {
            if (Array.isArray(v)) return Number(v[0]);
            return v !== "" && v != null ? Number(v) : undefined;
        };

        // Validate FK selections against loaded catalogs (avoid sending invalid ids)
    const validVal = (val, list = []) => {
            if (!val && val !== 0) return undefined;
            const str = String(val);
            return list.some((o) => String(o.value) === str) ? Number(val) : undefined;
        };

        setLoading(true);
        const payload = {
            product_name: form.product_name,
            product_description: form.product_description,
            account_id: accIdNum,
            category_id: Number.isFinite(asNum(form.category_id))
                ? validVal(asNum(form.category_id), catalog.categories)
                : undefined,
            manufacturer_id: Number.isFinite(asNum(form.manufacturer_id))
                ? validVal(asNum(form.manufacturer_id), catalog.manufacturers)
                : undefined,
            supplier_id: Number.isFinite(asNum(form.supplier_id))
                ? validVal(asNum(form.supplier_id), catalog.suppliers)
                : undefined,
            site_id: Number.isFinite(asNum(form.site_id))
                ? validVal(asNum(form.site_id), catalog.sites)
                : undefined,
            custom_fields: customFieldsObj,
        };

        try {
            const res = await fetch("/api/products/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            // Try to parse JSON; if not JSON (e.g., HTML due to redirect), show a friendly error
            const contentType = res.headers.get("content-type") || "";
            const data = contentType.includes("application/json")
                ? await res.json()
                : { success: false, error: `Unexpected response (${res.status})` };
            if (!data.success) {
                const msg = data.error === "account_id is required."
                    ? "An account is required."
                    : data.error || "Error adding product";
                throw new Error(msg);
            }
            const newId = data?.data?.product_id || data?.product_id;
            setSuccessMsg(`Product added! ID: ${newId ?? "(unknown)"}`);
            // Notify parent to refresh
            try { onAdded && onAdded(newId); } catch {}
            
            // Remember the account id for next time
            try {
                if (accIdNum && Number.isFinite(accIdNum) && accIdNum > 0) {
                    window.localStorage.setItem(
                        "lastAccountId",
                        String(accIdNum)
                    );
                    // 30 days cookie
                    document.cookie = `account_id=${accIdNum}; path=/; max-age=${30 * 24 * 60 * 60}`;
                }
            } catch {}

            setForm({
                account_id: "",
                product_name: "",
                product_description: "",
                category_id: [],
                manufacturer_id: [],
                supplier_id: [],
                site_id: "",
                custom_fields: "",
            });
            setTimeout(() => setIsOpen(false), 1000); // auto-close after 1s
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                className="bg-orange-500/70 text-white rounded cursor-pointer px-5 py-2 h-10 w-fit text-sm hover:bg-orange-500 transition"
                onClick={() => setIsOpen(true)}
            >
                + Add Product
            </button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <form
                    className="flex flex-col space-y-4"
                    onSubmit={handleSubmit}
                >
                    <h2 className="text-lg text-neutral-200 font-semibold mb-2">
                        Add Product
                    </h2>
                    <div className="flex flex-col">
                        {/** account_id is auto-filled; no visible field **/}
                        <AnimatedInput
                            label="Product Name"
                            name="product_name"
                            id="product_name"
                            value={form.product_name}
                            onChange={handleChange}
                            required
                        />
                        <AnimatedTextarea
                            label="Product Description"
                            name="product_description"
                            value={form.product_description}
                            onChange={handleChange}
                            rows={3}
                        />
                        <AnimatedSelect
                            label="Category"
                            value={Array.isArray(form.category_id) ? form.category_id[0] ?? "" : form.category_id ?? ""}
                            options={catalog.categories}
                            onChange={(e) => {
                                const val = e?.target?.value ?? "";
                                setForm((prev) => ({ ...prev, category_id: val ? [val] : [] }));
                            }}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <AnimatedMultiSelect
                                label="Manufacturer ID"
                                value={form.manufacturer_id}
                                options={catalog.manufacturers}
                                onChange={(vals) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        manufacturer_id: vals,
                                    }))
                                }
                            />
                            <AnimatedMultiSelect
                                label="Supplier ID"
                                value={form.supplier_id}
                                options={catalog.suppliers}
                                onChange={(vals) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        supplier_id: vals,
                                    }))
                                }
                            />
                        </div>

                        <AnimatedSelect
                            label="Site"
                            value={Array.isArray(form.site_id) ? form.site_id[0] ?? "" : form.site_id ?? ""}
                            options={catalog.sites || []}
                            onChange={(e) => {
                                const val = e?.target?.value ?? "";
                                setForm((prev) => ({ ...prev, site_id: val ? [val] : [] }));
                            }}
                        />

                        <AnimatedTextarea
                            label="Custom Fields"
                            name="custom_fields"
                            value={form.custom_fields}
                            onChange={handleChange}
                            placeholder='Custom Fields (JSON format, e.g. {"key": "value"})'
                            rows={4}
                        />
                    </div>
                    {error && <div className="text-red-400">{error}</div>}
                    {successMsg && (
                        <div className="text-green-400">{successMsg}</div>
                    )}
                    <button
                        type="submit"
                        className="bg-orange-500/60 text-white cursor-pointer rounded px-4 py-3 w-1/2 ml-auto text-sm hover:bg-orange-500 transition"
                        disabled={loading}
                    >
                        {loading ? "Adding..." : "Add Product"}
                    </button>
                </form>
            </Modal>
        </>
    );
}
