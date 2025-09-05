"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    PackageCheck,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    Check,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

function RegisterInner() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams?.get("callbackUrl") || "/app";
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agree, setAgree] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (!agree) {
            setError("Please accept the Terms and Privacy Policy.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        try {
            setLoading(true);
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.message || "Registration failed");
            }
            // Auto sign in with credentials if available
            await signIn("credentials", {
                redirect: true,
                callbackUrl,
                username,
                password,
            });
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
            <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-screen items-center">
                {/* Left: Brand / benefits */}
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
                        Create your account to start managing assets and
                        inspections.
                    </div>
                    <ul className="mt-2 space-y-2">
                        {[
                            "Unlimited assets on paid plans",
                            "Role-based permissions",
                            "QR codes & task automation",
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
                    <div className="mt-4 grid grid-cols-2 gap-3 max-w-sm">
                        <div className="rounded-lg border border-neutral-700 bg-neutral-800/60 p-3 text-sm text-neutral-300">
                            Setup time:{" "}
                            <span className="text-white font-semibold">
                                1 day
                            </span>
                        </div>
                        <div className="rounded-lg border border-neutral-700 bg-neutral-800/60 p-3 text-sm text-neutral-300">
                            Support:{" "}
                            <span className="text-white font-semibold">
                                24/7
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Register card */}
                <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full max-w-md md:max-w-lg mx-auto p-8 bg-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl"
                >
                    <div className="flex flex-col items-center mb-6 gap-2">
                        <PackageCheck className="w-8 h-8 text-orange-500" />
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            Create your account
                        </h1>
                        <p className="text-neutral-300 text-center">
                            Start your free trial — no credit card needed.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="w-full flex flex-col gap-4 mb-3"
                    >
                        {/* Username */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                        >
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
                                    autoComplete="username"
                                    disabled={loading}
                                    className="w-full rounded-lg pl-10 pr-3 py-2 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                            </div>
                        </motion.div>

                        {/* Email */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 }}
                        >
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
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.11 }}
                        >
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
                                    autoComplete="new-password"
                                    disabled={loading}
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
                        </motion.div>

                        {/* Confirm Password */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.14 }}
                        >
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
                                    disabled={loading}
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
                        </motion.div>

                        {/* Terms */}
                        <div className="flex items-start gap-2 text-sm">
                            <input
                                id="agree"
                                type="checkbox"
                                className="mt-0.5 h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-orange-500 focus:ring-orange-500"
                                checked={agree}
                                onChange={() => setAgree((a) => !a)}
                            />
                            <label htmlFor="agree" className="text-neutral-300">
                                I agree to the{" "}
                                <a href="#" className="hover:text-neutral-100">
                                    Terms
                                </a>{" "}
                                and{" "}
                                <a href="#" className="hover:text-neutral-100">
                                    Privacy Policy
                                </a>
                                .
                            </label>
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
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>Create account</>
                            )}
                        </motion.button>
                    </form>

                    <div className="flex flex-row py-5 w-full items-center justify-center gap-3 text-neutral-500">
                        <div className="w-full border-b border-neutral-700 ml-20"></div>
                        <span className="px-3 text-neutral-500">or</span>
                        <div className="w-full border-b border-neutral-700 mr-20"></div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        className="flex items-center gap-3 justify-center w-full py-3 px-5 rounded-lg font-semibold text-base bg-white border border-gray-200 shadow-md hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/80 transition-all duration-150 cursor-pointer"
                        aria-label="Continue with Google"
                        onClick={() => signIn("google", { callbackUrl })}
                    >
                        <span className="h-6 w-6 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 48 48">
                                <g>
                                    <path
                                        fill="#4285F4"
                                        d="M43.6 20.5H42V20H24v8h11.3C34.8 32.5 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l6-5.8C34.5 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-3.5z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M6.3 14.7l6.6 4.8C14.3 16.1 18.7 12 24 12c3.1 0 5.9 1.2 8 3.1l6-5.8C34.5 6.1 29.6 4 24 4c-7.3 0-13.5 4.1-17.7 10.7z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M24 44c5.5 0 10.4-1.8 14.2-4.9l-6.6-5.4C29.2 35.3 26.7 36 24 36c-6.1 0-10.8-3.5-13.3-8.5l-6.5 5c4.1 6.4 11.3 10.5 19.8 10.5z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.8 6.3-7.5 7.6l6.6 5.4C39.2 39.2 44 32.5 44 24c0-1.3-.1-2.7-.4-3.5z"
                                    />
                                </g>
                            </svg>
                        </span>
                        <span className="text-gray-700">
                            Continue with Google
                        </span>
                    </motion.button>
                    <div className="text-center text-xs text-neutral-500 mt-4">
                        Already have an account?{" "}
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

export default function RegisterPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen grid place-items-center text-neutral-300">
                    Loading…
                </div>
            }
        >
            <RegisterInner />
        </Suspense>
    );
}
