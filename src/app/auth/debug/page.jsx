"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function AuthDebugPage() {
    const { data: session, status } = useSession();
    const [tokenInfo, setTokenInfo] = useState(null);

    useEffect(() => {
        fetch("/api/debug/token").then(async (r) => {
            const data = await r.json().catch(() => null);
            setTokenInfo(data);
        });
    }, []);

    return (
        <main className="min-h-screen bg-neutral-900 text-neutral-200 p-6">
            <div className="container mx-auto max-w-3xl">
                <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
                <div className="mb-4">Status: {status}</div>
                <div className="mb-4">
                    <button
                        className="rounded bg-orange-500 hover:bg-orange-600 px-3 py-2"
                        onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    >
                        Sign out now
                    </button>
                    <a className="ml-3 underline" href="/auth/login">Go to Login</a>
                </div>
                <pre className="bg-neutral-800 p-3 rounded border border-neutral-700 overflow-auto">
{JSON.stringify({ session }, null, 2)}
                </pre>
                <h2 className="text-xl font-semibold mt-6 mb-2">Token</h2>
                <pre className="bg-neutral-800 p-3 rounded border border-neutral-700 overflow-auto">
{JSON.stringify(tokenInfo, null, 2)}
                </pre>
            </div>
        </main>
    );
}
