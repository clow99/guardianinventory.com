"use client";
import { useState } from "react";
import Modal from "../Modal";
import AnimatedInput from "@/components/inputs/AnimatedInput";
import AnimatedTextarea from "@/components/inputs/AnimatedTextarea";
import AnimatedMultiSelect from "@/components/inputs/AnimatedMultiSelect";
import AnimatedSelect from "@/components/inputs/AnimatedSelect";

export default function AddProductModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({
        account_id: "",
        product_name: "",
        product_description: "",
        category_id: [],
        manufacturer_id: [],
        supplier_id: [],
        custom_fields: "",
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSuccessMsg("");

        // Parse custom_fields JSON
        let customFieldsObj = null;
        if (form.custom_fields && form.custom_fields.trim() !== "") {
            try {
                customFieldsObj = JSON.parse(form.custom_fields);
            } catch (err) {
                setError("Custom fields must be valid JSON.");
                return;
            }
        }

        setLoading(true);
        const payload = {
            ...form,
            account_id: Number(form.account_id) || undefined,
            category_id: form.category_id
                ? Number(form.category_id)
                : undefined,
            manufacturer_id: form.manufacturer_id
                ? Number(form.manufacturer_id)
                : undefined,
            supplier_id: form.supplier_id
                ? Number(form.supplier_id)
                : undefined,
            site_id: form.site_id ? Number(form.site_id) : undefined,
            custom_fields: customFieldsObj,
        };

        try {
            const res = await fetch("/api/products/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!data.success)
                throw new Error(data.error || "Error adding product");
            setSuccessMsg(`Product added! ID: ${data.product_id}`);
            setForm({
                account_id: "",
                product_name: "",
                product_description: "",
                category_id: "",
                manufacturer_id: "",
                supplier_id: "",
                site_id: "",
                custom_fields: "{}",
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
                        <AnimatedInput
                            label="Product Name"
                            name="product_name"
                            value={form.product_name}
                            onChange={handleChange}
                        />
                        <AnimatedTextarea
                            label="Product Description"
                            name="product_description"
                            value={form.product_description}
                            onChange={handleChange}
                            rows={3}
                        />
                        <AnimatedMultiSelect
                            label="Category ID"
                            value={form.category_id}
                            options={[
                                { value: "admin", label: "Admin" },
                                { value: "manager", label: "Manager" },
                                { value: "staff", label: "Staff" },
                                { value: "auditor", label: "Auditor" },
                            ]}
                            onChange={(vals) =>
                                setForm((prev) => ({
                                    ...prev,
                                    category_id: vals,
                                }))
                            }
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <AnimatedMultiSelect
                                label="Manufacturer ID"
                                value={form.manufacturer_id}
                                options={[
                                    { value: "1", label: "Manufacturer 1" },
                                    { value: "2", label: "Manufacturer 2" },
                                    { value: "3", label: "Manufacturer 3" },
                                ]}
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
                                options={[
                                    { value: "1", label: "Supplier 1" },
                                    { value: "2", label: "Supplier 2" },
                                    { value: "3", label: "Supplier 3" },
                                ]}
                                onChange={(vals) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        supplier_id: vals,
                                    }))
                                }
                            />
                        </div>

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
