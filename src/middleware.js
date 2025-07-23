import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/", "/auth/login"]; // Add your login page path here!

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
