import { NextResponse } from "next/server";

export async function GET(req) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { ok: false, error: "Not available" },
            { status: 404 }
        );
    }
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || "next-auth.session-token";
    const value = searchParams.get("value") || "test-token";
    const res = NextResponse.json({ ok: true, set: { name, value } });
    res.cookies.set(name, value, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
    });
    return res;
}
