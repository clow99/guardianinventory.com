import { NextResponse } from "next/server";

export async function GET(req) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ ok: false, error: "Not available" }, { status: 404 });
    }
    const cookieNames = [
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
    ];
    const present = cookieNames.filter((n) => !!req.cookies.get(n)?.value);
    return NextResponse.json({ ok: true, present });
}

export async function POST(req) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ ok: false, error: "Not available" }, { status: 404 });
    }
    const body = await req.json().catch(() => ({}));
    const name = body?.name || "next-auth.session-token";
    const value = body?.value || "test";
    const res = NextResponse.json({ ok: true, set: { name, value } });
    res.cookies.set(name, value, { path: "/", httpOnly: true });
    return res;
}
