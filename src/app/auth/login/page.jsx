"use client";

import { useState } from "react";
import { PackageCheck } from "lucide-react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function LoginPage() {
    // Local state for inputs and submission
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Handler for form submit
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        // For demo, simulate async login (replace with your real signIn logic)
        try {
            // Example with next-auth credentials provider
            // const res = await signIn("credentials", { username, password, redirect: false });
            // if (!res.ok) throw new Error(res.error || "Invalid login");

            // Simulate delay for UI demo
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // Replace with real auth logic!
            if (username !== "admin" || password !== "password") {
                throw new Error("Invalid username or password");
            }
            // redirect or success toast
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <body className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md p-8 bg-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl flex flex-col items-center"
            >
                <div className="flex flex-col items-center mb-6 gap-2">
                    <PackageCheck className="w-8 h-8 text-orange-500" />
                    <h1 className="text-4xl font-bold text-white tracking-tight cursive2">
                        Welcome Back
                    </h1>
                </div>
                <p className="text-neutral-300 mb-8 text-center">
                    Sign in to access your dashboard and unlock exclusive
                    features.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="w-full flex flex-col gap-4 mb-4"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="flex flex-col"
                    >
                        <label
                            htmlFor="username"
                            className="text-neutral-300 mb-1 text-sm font-medium"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            required
                            autoComplete="username"
                            disabled={loading}
                            className="rounded-lg px-4 py-2 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col"
                    >
                        <label
                            htmlFor="password"
                            className="text-neutral-300 mb-1 text-sm font-medium"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            disabled={loading}
                            className="rounded-lg px-4 py-2 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </motion.div>
                    {error && (
                        <div className="text-red-400 text-sm text-center -mt-2">
                            {error}
                        </div>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-orange-500 bg-opacity-90 hover:bg-opacity-100 transition text-white py-3 px-6 text-sm font-semibold shadow mt-2 disabled:opacity-60"
                    >
                        {loading ? (
                            "Signing In..."
                        ) : (
                            <>
                                Sign In <span className="ml-2">→</span>
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="flex flex-row py-5 w-full items-center justify-center gap-3 text-neutral-500">
                    <div className="w-full border-b border-neutral-700 ml-20"></div>
                    <span className="px-3 text-neutral-500">or</span>
                    <div className="w-full border-b border-neutral-700 mr-20"></div>
                </div>

                <motion.button
                    whileHover={{
                        scale: 1.035,
                        boxShadow: "0 4px 18px 0 rgba(60, 120, 246, 0.18)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="
                        flex items-center gap-3 justify-center w-full 
                        py-3 px-5 rounded-full 
                        font-semibold text-base 
                        bg-white border border-gray-200 shadow-md 
                        hover:bg-gray-50 active:bg-gray-100
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/80
                        transition-all duration-150 cursor-pointer
                    "
                    aria-label="Sign in with Google"
                    onClick={() => signIn("google", { callbackUrl: "/home" })}
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
                    <span className="text-gray-700">Sign in with Google</span>
                </motion.button>
            </motion.div>
        </body>
    );
}
