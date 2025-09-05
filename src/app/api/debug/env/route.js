import { NextResponse } from "next/server";

export async function GET() {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { ok: false, error: "Not available" },
            { status: 404 }
        );
    }
    const secret = process.env.NEXTAUTH_SECRET || "";
    const url = process.env.NEXTAUTH_URL || "";
    return NextResponse.json({
        ok: true,
        NEXTAUTH_URL: url,
        NEXTAUTH_SECRET_set: !!secret,
        NEXTAUTH_SECRET_len: secret.length,
    });
}
