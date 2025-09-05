import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";

export async function GET() {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { ok: false, error: "Not available" },
            { status: 404 }
        );
    }
    try {
        const rows = await excuteQuery({
            query: "SELECT NOW() AS now",
            values: [],
        });
        return NextResponse.json({
            ok: true,
            result: rows && rows[0],
            config: {
                host: process.env.MYSQL_HOST,
                port: process.env.MYSQL_PORT || 3306,
                database: process.env.MYSQL_DATABASE,
                user: process.env.MYSQL_USER,
                passwordSet: !!process.env.MYSQL_PASSWORD,
                rawPasswordLength: (process.env.MYSQL_PASSWORD || "").length,
            },
        });
    } catch (e) {
        return NextResponse.json(
            {
                ok: false,
                error: String(e),
                config: {
                    host: process.env.MYSQL_HOST,
                    port: process.env.MYSQL_PORT || 3306,
                    database: process.env.MYSQL_DATABASE,
                    user: process.env.MYSQL_USER,
                    passwordSet: !!process.env.MYSQL_PASSWORD,
                    rawPasswordLength: (process.env.MYSQL_PASSWORD || "")
                        .length,
                },
            },
            { status: 500 }
        );
    }
}
