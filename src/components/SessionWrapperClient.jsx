"use client";

import { SessionProvider } from "next-auth/react";

export default function SessionWrapperClient({ children, session = null }) {
    return (
        <SessionProvider
            session={session}
            refetchOnWindowFocus={false}
            refetchInterval={0}
        >
            {children}
        </SessionProvider>
    );
}
