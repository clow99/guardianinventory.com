import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/accept-invite",
    "/auth/invite",
    "/auth/success",
    "/auth/error",
]; // Public pages

function isPublic(pathname) {
    return (
        PUBLIC_PATHS.includes(pathname) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api/auth") ||
        pathname.match(/\.(.*)$/) ||
        pathname === "/favicon.ico"
    );
}

export async function middleware(req) {
    const { pathname } = req.nextUrl;
    const accept = req.headers.get("accept") || "";

    // If a browser hits /api/auth/error directly, send them to the styled page
    if (
        pathname.startsWith("/api/auth/error") &&
        req.method === "GET" &&
        accept.includes("text/html")
    ) {
        const url = new URL("/auth/error", req.url);
        // preserve query string (e.g., ?error=AccessDenied)
        url.search = req.nextUrl.search;
        return NextResponse.redirect(url);
    }

    if (isPublic(pathname)) {
        return NextResponse.next();
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
        const signInUrl = new URL("/api/auth/signin/google", req.url);
        signInUrl.searchParams.set("callbackUrl", req.url);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
