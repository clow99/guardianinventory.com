"use client";

import { useState } from "react";
import Modal from "@/components/modals/Modal";
import AnimatedInput from "@/components/inputs/AnimatedInput";
import AnimatedTextarea from "@/components/inputs/AnimatedTextarea";

export default function AddAccountModal({ onCreated }) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [customFields, setCustomFields] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function submit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        const trimmed = name.trim();
        if (!trimmed) {
            setError("Account name is required.");
            return;
        }
        let cf = undefined;
        if (customFields.trim()) {
            try {
                cf = JSON.parse(customFields);
            } catch (err) {
                setError("Custom fields must be valid JSON.");
                return;
            }
        }
        try {
            setLoading(true);
            const res = await fetch("/api/accounts/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    account_name: trimmed,
                    description: description || null,
                    custom_fields: cf,
                }),
            });
            const data = await res.json();
            if (!data.success)
                throw new Error(data.error || "Error creating account");
            setSuccess("Account created.");
            onCreated?.(data.data);
            setTimeout(() => setIsOpen(false), 800);
            setName("");
            setDescription("");
            setCustomFields("");
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
                + Add Account
            </button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <form className="flex flex-col space-y-4" onSubmit={submit}>
                    <h2 className="text-lg text-neutral-200 font-semibold mb-2">
                        Add Account
                    </h2>
                    <AnimatedInput
                        label="Account Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <AnimatedTextarea
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                    />
                    <AnimatedTextarea
                        label="Custom Fields"
                        value={customFields}
                        onChange={(e) => setCustomFields(e.target.value)}
                        placeholder='{"tier":"pro"}'
                        rows={4}
                    />
                    {error && (
                        <div className="text-red-400 text-sm">{error}</div>
                    )}
                    {success && (
                        <div className="text-green-400 text-sm">{success}</div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-orange-500/60 text-white cursor-pointer rounded px-4 py-3 w-1/2 ml-auto text-sm hover:bg-orange-500 transition"
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                </form>
            </Modal>
        </>
    );
}
