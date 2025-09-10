import { NextResponse } from "next/server";

// Lightweight liveness endpoint for session warming/monitoring
export async function GET() {
    return NextResponse.json({ ok: true, ts: Date.now() });
}
