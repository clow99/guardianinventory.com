export default function AuthDebugPage() {
    return (
        <main className="min-h-screen bg-neutral-900 text-neutral-200 p-6">
            <div className="container mx-auto max-w-3xl">
                <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
                <div className="mb-4">
                    <a className="underline" href="/api/auth/session">
                        View current session JSON
                    </a>
                </div>
                <div className="mb-3">
                    <a className="underline" href="/api/debug/token">
                        View token debug JSON
                    </a>
                </div>
                <p className="text-neutral-400">
                    This page is intentionally static-safe for production builds.
                </p>
            </div>
        </main>
    );
}
