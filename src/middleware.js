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
]; // Public pages (explicit)

function isPublic(pathname) {
    // Always allow framework/static assets
    if (
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico" ||
        pathname.match(/\.(.*)$/)
    )
        return true;

    // Allow NextAuth's own endpoints
    if (pathname.startsWith("/api/auth")) return true;

    // Explicitly allow listed public pages
    if (PUBLIC_PATHS.includes(pathname)) return true;

    // Make all top-level "main" pages public by default (marketing, docs, etc.)
    // Keep application and API areas guarded
    if (!pathname.startsWith("/app") && !pathname.startsWith("/api")) {
        return true;
    }

    return false;
}

export async function middleware(req) {
    const { pathname } = req.nextUrl;
    const accept = req.headers.get("accept") || "";
    // Determine scheme/host as seen by the client, accounting for reverse proxies
    const forwardedProto = req.headers.get("x-forwarded-proto");
    const forwardedHost =
        req.headers.get("x-forwarded-host") || req.headers.get("host");
    const effectiveProto =
        forwardedProto || req.nextUrl.protocol.replace(":", "");
    const effectiveHost = forwardedHost || req.nextUrl.host;
    const effectiveOrigin = `${effectiveProto}://${effectiveHost}`;
    // Support both cookie names to be safe across envs
    const cookieNames = [
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
    ];

    // Normalize legacy /admin path to /app/admin
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        const url = new URL(
            pathname.replace(/^\/admin/, "/app/admin"),
            req.url
        );
        url.search = req.nextUrl.search;
        return NextResponse.redirect(url);
    }

    // Allow dev-only debug endpoints without auth
    if (
        process.env.NODE_ENV !== "production" &&
        pathname.startsWith("/api/debug")
    ) {
        return NextResponse.next();
    }

    // Test hook: in non-production with TEST_AUTH=1, bypass API auth to allow smoke tests
    if (
        process.env.NODE_ENV !== "production" &&
        process.env.TEST_AUTH === "1" &&
        pathname.startsWith("/api")
    ) {
        return NextResponse.next();
    }

    // Be lenient about origin differences in development to prevent cookie domain thrash
    // Only enforce origin redirect in production when NEXTAUTH_URL is explicitly set
    const expected = process.env.NEXTAUTH_URL;
    if (process.env.NODE_ENV === "production" && expected) {
        // Safety: never enforce origin if NEXTAUTH_URL points to localhost/127.0.0.1
        // This prevents deployed environments from redirecting users back to a developer machine.
        const isLocalExpected =
            /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?/i.test(expected);
        if (isLocalExpected) {
            return NextResponse.next();
        }
        try {
            const expectedUrl = new URL(expected);
            // Compare against the origin as seen by the client (from proxy headers)
            const sameOrigin = expectedUrl.origin === effectiveOrigin;
            if (
                !sameOrigin &&
                !pathname.startsWith("/_next") &&
                pathname !== "/favicon.ico"
            ) {
                const redirectTo = new URL(
                    pathname + req.nextUrl.search,
                    expectedUrl.origin
                );
                return NextResponse.redirect(redirectTo);
            }
        } catch {}
    }

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

    // Let next-auth auto-detect the session cookie name
    const jwtSecret =
        process.env.NEXTAUTH_SECRET || "dev-nextauth-secret-change-me";
    // Allow next-auth to auto-detect the cookie name
    const token = await getToken({ req, secret: jwtSecret });
    if (!token) {
        // Debug: check if session cookie exists but failed to decode
        const hasSessionCookie = cookieNames.some(
            (n) => !!req.cookies.get(n)?.value
        );
        if (process.env.NODE_ENV !== "production") {
            console.warn(
                "[middleware] no token; hasCookie=",
                hasSessionCookie,
                "path=",
                pathname
            );
        }
        // If this is an API request expecting JSON, return JSON 401 instead of HTML redirect
        const isApi = pathname.startsWith("/api");
        const wantsJson = accept.includes("application/json");
        if (isApi && wantsJson) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }
        // Send browsers to our styled login page and preserve deep links
        const loginUrl = new URL("/auth/login", req.url);
        const returnTo =
            pathname === "/app" || pathname.startsWith("/app/")
                ? `${pathname}${req.nextUrl.search}`
                : "/app";
        loginUrl.searchParams.set("callbackUrl", returnTo);
        return NextResponse.redirect(loginUrl);
    }

    // Require account assignment for /app* (except admin console); admins can bypass to /app/admin
    if (
        pathname.startsWith("/app") &&
        !pathname.startsWith("/app/public") &&
        !pathname.startsWith("/app/admin")
    ) {
        // Note: join-account lives under /auth, so it isn't matched here.
        // If no account but admin, route to admin console instead of join screen
        // Resolve account context: token.account_id or cookie account_id or DB mapping
        let accountId = Number(token?.account_id);
        if (!Number.isFinite(accountId) || accountId <= 0) {
            accountId = null;
        }
        if (!accountId && token?.is_admin) {
            const accCookie = Number(req.cookies.get("account_id")?.value);
            if (Number.isFinite(accCookie) && accCookie > 0) {
                accountId = accCookie;
            }
        }
        if (!accountId) {
            if (token?.is_admin) {
                if (pathname !== "/app/admin") {
                    const url = new URL("/app/admin", req.url);
                    return NextResponse.redirect(url);
                }
                // already on /app/admin, allow access without account
                return NextResponse.next();
            }
            // If no token/cookie, check DB mapping by email quickly (best-effort)
            // We can't query DB in middleware, so enforce redirect to join screen
            const url = new URL("/auth/join-account", req.url);
            url.searchParams.set("returnTo", pathname + req.nextUrl.search);
            return NextResponse.redirect(url);
        }
    }

    // If hitting /app root, redirect to cookie-selected section and ensure cookie is set
    if (pathname === "/app") {
        const section =
            req.cookies.get("selectedSection")?.value || "dashboard";
        const map = {
            dashboard: "/app/dashboard",
            inventory: "/app/assets/view",
            calendar: "/app/calendar",
            inspections: "/app/inspections",
            repairs: "/app/repairs",
            permissions: "/app/permissions/view",
            admin: "/app/admin",
            settings: "/app/settings/general",
            profile: "/app/profile/view",
        };
        const target = map[section] || "/app/dashboard";
        const res = NextResponse.redirect(new URL(target, req.url));
        res.cookies.set("selectedSection", section, {
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });
        return res;
    }

    // For any /app/* path, if cookie is missing, infer it from the path and set it
    if (pathname.startsWith("/app/")) {
        const cookieExists = !!req.cookies.get("selectedSection")?.value;
        if (!cookieExists) {
            const infer = () => {
                if (pathname.startsWith("/app/assets")) return "inventory";
                if (pathname.startsWith("/app/calendar")) return "calendar";
                if (pathname.startsWith("/app/inspections"))
                    return "inspections";
                if (pathname.startsWith("/app/repairs")) return "repairs";
                if (pathname.startsWith("/app/permissions"))
                    return "permissions";
                if (pathname.startsWith("/app/admin")) return "admin";
                if (pathname.startsWith("/app/settings")) return "settings";
                if (pathname.startsWith("/app/profile")) return "profile";
                return "dashboard";
            };
            const inferred = infer();
            const res = NextResponse.next();
            res.cookies.set("selectedSection", inferred, {
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
            });
            return res;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
