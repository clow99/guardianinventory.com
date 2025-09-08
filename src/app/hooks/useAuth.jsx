"use client";

import { useSession, signOut } from "next-auth/react";

export function useAuth() {
    const { data: session, status } = useSession();

    const user = session?.user || null;
    const isAdmin = !!user?.is_admin;

    return {
        user,
        loading: status === "loading",
        isAdmin,
        isAuthenticated: !!user,
        logout: () => signOut({ callbackUrl: "/auth/login" }),
    };
}
