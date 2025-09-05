"use client";

import { useState } from "react";
import { PackageCheck, Mail, Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function InvitePage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        try {
            setLoading(true);
            const res = await fetch("/api/auth/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error("Unable to send invite");
            const encoded = encodeURIComponent(email);
            router.push(
                `/auth/success?title=Invite%20sent&message=We%20sent%20an%20invite%20to%20${encoded}.`
            );
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
            <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-screen items-center">
                <div className="hidden md:flex flex-col gap-5 p-8 rounded-2xl border border-neutral-700 bg-neutral-900/60">
                    <div className="flex items-center gap-3">
                        <img
                            src="/guardianLogo.png"
                            alt="Guardian"
                            className="h-10 w-10"
                        />
                        <div className="text-white text-2xl font-extrabold tracking-tight">
                            Guardian
                        </div>
                    </div>
                    <div className="text-neutral-300">
                        Invite a teammate to join your organization.
                    </div>
                    <ul className="mt-2 space-y-2">
                        {[
                            "Assign roles automatically",
                            "Track accepted invites",
                            "Expires for security",
                        ].map((b) => (
                            <li
                                key={b}
                                className="flex items-start gap-2 text-neutral-300"
                            >
                                <Check className="h-4 w-4 text-orange-400 mt-0.5" />
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full max-w-md md:max-w-lg mx-auto p-8 bg-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl"
                >
                    <div className="flex flex-col items-center mb-6 gap-2">
                        <PackageCheck className="w-8 h-8 text-orange-500" />
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            Send an invite
                        </h1>
                        <p className="text-neutral-300 text-center">
                            Enter an email to invite a new teammate.
                        </p>
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="w-full flex flex-col gap-4 mb-3"
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="text-neutral-300 mb-1 text-sm font-medium"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-neutral-500" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    disabled={loading}
                                    className="w-full rounded-lg pl-10 pr-3 py-2 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                    placeholder="teammate@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        {error && (
                            <div className="text-red-400 text-sm text-center -mt-1">
                                {error}
                            </div>
                        )}
                        <motion.button
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-orange-500/90 hover:bg-orange-500 transition text-white py-2.5 px-6 text-sm font-semibold shadow disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />{" "}
                                    Sending...
                                </>
                            ) : (
                                <>Send invite</>
                            )}
                        </motion.button>
                    </form>
                    <div className="text-center text-xs text-neutral-500 mt-4">
                        Need to reset a password?{" "}
                        <a
                            href="/auth/forgot-password"
                            className="hover:text-neutral-300"
                        >
                            Forgot password
                        </a>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
