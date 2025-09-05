"use client";

import { PackageCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
    const params = useSearchParams();
    const title = params.get("title") || "Success";
    const message = params.get("message") || "Your request completed successfully.";

    return (
        <main className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
            <div className="container mx-auto px-4 py-8 flex min-h-screen items-center justify-center">
                <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} className="w-full max-w-lg mx-auto p-8 bg-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl text-center">
                    <div className="flex flex-col items-center mb-6 gap-2">
                        <PackageCheck className="w-8 h-8 text-orange-500" />
                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{title}</h1>
                        <p className="text-neutral-300 max-w-md">{message}</p>
                    </div>
                    <a href="/auth/login" className="inline-flex items-center justify-center rounded-lg bg-orange-500/90 hover:bg-orange-500 transition text-white py-2.5 px-6 text-sm font-semibold">Go to Sign in</a>
                </motion.div>
            </div>
        </main>
    );
}
