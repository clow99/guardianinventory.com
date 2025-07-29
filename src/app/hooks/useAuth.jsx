"use client";

import { useSession, signOut } from "next-auth/react";

export function useAuth() {
    const { data: session, status } = useSession();

    return {
        user: session?.user || null,
        loading: status === "loading",
        isAdmin: session?.user?.role === "admin", // assuming you attach this in your session
        logout: () => signOut({ callbackUrl: "/logged-out" }),
    };
}
