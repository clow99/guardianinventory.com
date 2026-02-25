"use client";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-100 flex items-center justify-center">
            <div className="text-center space-y-3">
                <div className="text-3xl font-semibold">Page not found</div>
                <p className="text-neutral-400">
                    The page you are looking for does not exist.
                </p>
            </div>
        </div>
    );
}
