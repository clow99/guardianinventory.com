import { NextResponse } from "next/server";

export async function middleware(request) {
    const token = request.cookies.get("auth_token")?.value;
    const userIdCookie = request.cookies.get("user_id")?.value;
    const pathname = request.nextUrl.pathname;
    const host = request.headers.get("host");

    if (host?.includes("localhost")) {
        //set a cookie for localhost development
        const response = NextResponse.next();
        response.cookies.set("user_id", "5", {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return response;
    }

    // If no auth_token and on home, redirect to login
    if (!token && pathname === "/") {
        const redirectUri = encodeURIComponent(
            "https://wetaskv2.webersupply.com/auth/callback"
        );
        return NextResponse.redirect(
            `https://identity.webersupply.com/auth/redirect?redirect_uri=${redirectUri}`
        );
    }

    // If we already have user_id cookie, continue
    if (userIdCookie) {
        return NextResponse.next();
    }

    // If we have token but no user_id, fetch user info
    if (token) {
        try {
            // Fetch user info from identity server
            const identityRes = await fetch(
                "https://identity.webersupply.com/user",
                {
                    headers: {
                        cookie: `auth_token=${token};`,
                    },
                }
            );
            if (identityRes.ok) {
                const user = await identityRes.json();
                if (user.id) {
                    // Set the user_id cookie
                    const response = NextResponse.next();
                    response.cookies.set("user_id", String(user.id), {
                        path: "/",
                        httpOnly: true,
                        sameSite: "lax",
                        secure: true,
                        maxAge: 60 * 60 * 24 * 30, // 30 days
                    });
                    return response;
                }
            }
        } catch (e) {
            console.error("Failed to fetch user in middleware:", e);
            // Optionally, handle error (redirect to login, etc.)
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/:path*"],
};
