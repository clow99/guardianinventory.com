"use client";

import { SessionProvider } from "next-auth/react";

export default function SessionWrapperClient({ children }) {
    return <SessionProvider>{children}</SessionProvider>;
}
