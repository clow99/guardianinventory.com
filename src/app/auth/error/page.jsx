"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    PackageCheck,
    AlertTriangle,
    ArrowLeft,
    Mail,
    Check,
} from "lucide-react";

const MESSAGES = {
    Configuration: "Auth configuration error. Please contact support.",
    AccessDenied: "Access denied. You don’t have permission to sign in here.",
    Verification:
        "The sign-in link is no longer valid. Please request a new one.",
    OAuthSignin: "Couldn’t complete OAuth sign-in. Please try again.",
    OAuthAccountNotLinked: "Email is already used with a different provider.",
    Callback: "There was a problem finishing sign-in. Please retry.",
    Default: "Something went wrong during sign in.",
};

function AuthErrorInner() {
    const params = useSearchParams();
    const error = params.get("error") || "Default";
    const message = MESSAGES[error] || MESSAGES.Default;
    const mailHref = `mailto:support@guardianinventory.com?subject=Sign-in%20issue&body=Error%20code:%20${encodeURIComponent(
        error
    )}`;

    return (
        <main className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
            <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-screen items-center">
                {/* Left: Brand / tips (matches other auth pages) */}
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
                        We hit a snag signing you in. Here are a few quick
                        checks:
                    </div>
                    <ul className="mt-2 space-y-2">
                        {[
                            "Use your company email",
                            "Try the other provider or credentials",
                            "If invited, ensure the link isn’t expired",
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
                            Status:{" "}
                            <span className="text-white font-semibold">
                                All systems
                            </span>
                        </div>
                        <div className="rounded-lg border border-neutral-700 bg-neutral-800/60 p-3 text-sm text-neutral-300">
                            Support:{" "}
                            <span className="text-white font-semibold">
                                Email
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Error card */}
                <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full max-w-md md:max-w-lg mx-auto p-8 bg-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl"
                >
                    <div className="flex flex-col items-center mb-6 gap-2 text-center">
                        <PackageCheck className="w-8 h-8 text-orange-500" />
                        <AlertTriangle className="w-10 h-10 text-yellow-400" />
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            Sign-in error
                        </h1>
                        <p className="text-neutral-300">{message}</p>
                        <p className="text-neutral-500 text-xs">
                            Error code: {error}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center">
                        <a
                            href="/auth/login"
                            className="inline-flex items-center justify-center rounded-lg bg-orange-500/90 hover:bg-orange-500 transition text-white py-2.5 px-6 text-sm font-semibold"
                        >
                            Back to sign in
                        </a>
                        <a
                            href={mailHref}
                            className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 hover:bg-neutral-900 text-neutral-200 py-2.5 px-6 text-sm"
                        >
                            <Mail className="h-4 w-4" /> Contact support
                        </a>
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 hover:bg-neutral-900 text-neutral-200 py-2.5 px-6 text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" /> Home
                        </a>
                    </div>

                    <div className="text-center text-xs text-neutral-500 mt-5">
                        If this persists, include the error code above when
                        contacting support.
                    </div>
                </motion.div>
            </div>
        </main>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen grid place-items-center text-neutral-300">Loading…</div>}>
            <AuthErrorInner />
        </Suspense>
    );
}
