"use client";

import { useState } from "react";
import {
    PackageCheck,
    User,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

export default function AcceptInvitePage() {
    const params = useSearchParams();
    const token = params.get("token");
    const email = params.get("email") || "";
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        try {
            setLoading(true);
            const res = await fetch("/api/auth/accept-invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, username, password }),
            });
            if (!res.ok) throw new Error("Unable to accept invite");
            router.push(
                "/auth/success?title=Account%20created&message=Your%20invite%20has%20been%20accepted."
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
                        You’ve been invited. Set your credentials to finish
                        joining.
                    </div>
                    <ul className="mt-2 space-y-2">
                        {[
                            "Secure one-time link",
                            "Choose a username",
                            "Create your password",
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
                            Accept invite
                        </h1>
                        <p className="text-neutral-300 text-center">
                            {email
                                ? `Invited as ${email}`
                                : "Set up your account"}
                        </p>
                    </div>
                    {!token && (
                        <div className="mb-4 text-sm text-red-400 text-center">
                            Missing or invalid invite token.
                        </div>
                    )}
                    <form
                        onSubmit={handleSubmit}
                        className="w-full flex flex-col gap-4 mb-3"
                    >
                        <div>
                            <label
                                htmlFor="username"
                                className="text-neutral-300 mb-1 text-sm font-medium"
                            >
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-neutral-500" />
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    required
                                    disabled={loading || !token}
                                    className="w-full rounded-lg pl-10 pr-3 py-2 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="text-neutral-300 mb-1 text-sm font-medium"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-neutral-500" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    disabled={loading || !token}
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
                                    disabled={loading || !token}
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
                            whileHover={{ scale: loading || !token ? 1 : 1.02 }}
                            whileTap={{ scale: loading || !token ? 1 : 0.98 }}
                            type="submit"
                            disabled={loading || !token}
                            className="w-full rounded-lg bg-orange-500/90 hover:bg-orange-500 transition text-white py-2.5 px-6 text-sm font-semibold shadow disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />{" "}
                                    Joining...
                                </>
                            ) : (
                                <>Accept invite</>
                            )}
                        </motion.button>
                    </form>
                    <div className="text-center text-xs text-neutral-500 mt-4">
                        Have an account?{" "}
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
