"use client";
import { useState } from "react";
import Modal from "../Modal";
import AnimatedInput from "@/components/inputs/AnimatedInput";
import { useAuth } from "@/app/hooks/useAuth";

export default function AddLocationModal({ onAdded }) {
    const { isAdmin } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({ location_name: "", address: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    function reset() {
        setForm({ location_name: "", address: "" });
        setError("");
        setSuccess("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!form.location_name.trim()) {
            setError("Location name is required");
            return;
        }
        try {
            setLoading(true);
            const res = await fetch("/api/locations/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    location_name: form.location_name.trim(),
                    address: form.address?.trim() || null,
                }),
            });
            const data = await res.json().catch(() => ({ success: false }));
            if (!data.success)
                throw new Error(data.error || "Failed to add location");
            setSuccess("Location added");
            try {
                onAdded && onAdded(data.data);
            } catch {}
            setTimeout(() => {
                setIsOpen(false);
                reset();
            }, 800);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    if (!isAdmin) {
        // Only admins can add via API (requireAdmin). Hide button if not admin.
        return null;
    }

    return (
        <>
            <button
                className="bg-orange-500/70 text-white rounded cursor-pointer px-3 py-2 h-10 w-fit text-sm hover:bg-orange-500 transition"
                onClick={() => setIsOpen(true)}
            >
                + Add Location
            </button>
            <Modal
                isOpen={isOpen}
                onClose={() => {
                    setIsOpen(false);
                    reset();
                }}
            >
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <h2 className="text-lg text-neutral-200 font-semibold">
                        Add Location
                    </h2>
                    <AnimatedInput
                        id="location_name"
                        label="Location Name"
                        value={form.location_name}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                location_name: e.target.value,
                            }))
                        }
                        required
                    />
                    <AnimatedInput
                        id="address"
                        label="Address (optional)"
                        value={form.address}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, address: e.target.value }))
                        }
                    />
                    {error && (
                        <div className="text-red-400 text-sm">{error}</div>
                    )}
                    {success && (
                        <div className="text-green-400 text-sm">{success}</div>
                    )}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="px-3 py-2 text-sm rounded border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                            onClick={() => {
                                setIsOpen(false);
                                reset();
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-orange-500/70 text-white rounded px-4 py-2 text-sm hover:bg-orange-500 disabled:opacity-60"
                            disabled={loading || !form.location_name.trim()}
                        >
                            {loading ? "Adding..." : "Add Location"}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
