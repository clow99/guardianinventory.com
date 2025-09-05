"use client";

import { Suspense, useState, useMemo } from "react";
import { PackageCheck, Lock, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function ResetPasswordContent() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get("token");

    const disabled = useMemo(() => loading || !token, [loading, token]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        try {
            setLoading(true);
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            if (!res.ok) throw new Error("Unable to reset password");
            router.push(
                "/auth/success?title=Password%20updated&message=You%20can%20now%20sign%20in%20with%20your%20new%20password."
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
                        Choose a strong password. Your reset link may expire
                        after use.
                    </div>
                    <ul className="mt-2 space-y-2">
                        {[
                            "At least 8 characters",
                            "Use a mix of letters & numbers",
                            "Keep it private",
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
                            Reset password
                        </h1>
                        <p className="text-neutral-300 text-center">
                            Enter a new password for your account.
                        </p>
                    </div>
                    {!token && (
                        <div className="mb-4 text-sm text-red-400 text-center">
                            Missing or invalid reset token.
                        </div>
                    )}
                    <form
                        onSubmit={handleSubmit}
                        className="w-full flex flex-col gap-4 mb-3"
                    >
                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="text-neutral-300 mb-1 text-sm font-medium"
                            >
                                New password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-neutral-500" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="new-password"
                                    disabled={disabled}
                                    className="w-full rounded-lg pl-10 pr-10 py-2 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                        {/* Confirm */}
                        <div>
                            <label
                                htmlFor="confirm"
                                className="text-neutral-300 mb-1 text-sm font-medium"
                            >
                                Confirm password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-neutral-500" />
                                </div>
                                <input
                                    id="confirm"
                                    type={showConfirm ? "text" : "password"}
                                    required
                                    autoComplete="new-password"
                                    disabled={disabled}
                                    className="w-full rounded-lg pl-10 pr-10 py-2 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                    placeholder="Re-enter your password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                />
                                <button
                                    type="button"
                                    aria-label={
                                        showConfirm
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    onClick={() => setShowConfirm((s) => !s)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300"
                                >
                                    {showConfirm ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                        {error && (
                            <div className="text-red-400 text-sm text-center -mt-1">
                                {error}
                            </div>
                        )}
                        <motion.button
                            whileHover={{ scale: disabled ? 1 : 1.02 }}
                            whileTap={{ scale: disabled ? 1 : 0.98 }}
                            type="submit"
                            disabled={disabled}
                            className="w-full rounded-lg bg-orange-500/90 hover:bg-orange-500 transition text-white py-2.5 px-6 text-sm font-semibold shadow disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />{" "}
                                    Updating...
                                </>
                            ) : (
                                <>Update password</>
                            )}
                        </motion.button>
                    </form>
                    <div className="text-center text-xs text-neutral-500 mt-4">
                        Back to{" "}
                        <a
                            href="/auth/login"
                            className="hover:text-neutral-300"
                        >
                            Sign in
                        </a>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<main className="min-h-screen bg-neutral-900" /> }>
            <ResetPasswordContent />
        </Suspense>
    );
}
