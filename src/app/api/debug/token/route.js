import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
    // Only allow in non-production to avoid leaking token structure
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { ok: false, error: "Not available" },
            { status: 404 }
        );
    }
    try {
        const cookieNames = [
            "next-auth.session-token",
            "__Secure-next-auth.session-token",
        ];
        const cookiesPresent = cookieNames.filter(
            (n) => !!req.cookies.get(n)?.value
        );
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
        });
        const now = Math.floor(Date.now() / 1000);
        const payload = token || null;
        return NextResponse.json({
            ok: true,
            cookiesPresent,
            authenticated: !!token,
            now,
            tokenIat: token?.iat || null,
            tokenExp: token?.exp || null,
            secondsToExpiry: token?.exp ? token.exp - now : null,
            token,
        });
    } catch (e) {
        return NextResponse.json(
            { ok: false, error: String(e) },
            { status: 500 }
        );
    }
}
