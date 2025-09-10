"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function JoinAccountPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // Prefill code from query string if present
        try {
            const sp = new URLSearchParams(window.location.search);
            const q = sp.get("code");
            if (q) setCode(q);
        } catch {}
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/accounts/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (!res.ok || !data?.ok)
                throw new Error(data?.error || "Join failed");
            router.replace("/app");
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-neutral-900 text-white px-4">
            <div className="w-full max-w-md bg-neutral-800 border border-neutral-700 rounded-xl p-6">
                <h1 className="text-2xl font-bold mb-2">Join your account</h1>
                <p className="text-neutral-300 mb-4">
                    Enter your invite code to continue.
                </p>
                <form onSubmit={submit} className="space-y-3">
                    <input
                        className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Invite code"
                        required
                    />
                    {error && (
                        <div className="text-red-400 text-sm">{error}</div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-orange-500/90 hover:bg-orange-500 px-4 py-2 font-semibold disabled:opacity-60"
                    >
                        {loading ? "Joining..." : "Join account"}
                    </button>
                </form>
            </div>
        </main>
    );
}
