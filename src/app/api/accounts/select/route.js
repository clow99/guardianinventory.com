import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import excuteQuery from "@/lib/db";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }
        const { account_id } = await request.json();
        const accId = Number(account_id);
        if (!Number.isFinite(accId) || accId <= 0) {
            return NextResponse.json(
                { success: false, error: "Invalid account_id" },
                { status: 400 }
            );
        }

        // Resolve user_id
        const users = await excuteQuery({
            query: "SELECT id FROM users WHERE email = ? LIMIT 1",
            values: [session.user.email],
        });
        const user = Array.isArray(users) && users[0];
        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Optional: verify membership
        const membership = await excuteQuery({
            query: "SELECT 1 FROM account_users WHERE account_id = ? AND user_id = ? LIMIT 1",
            values: [accId, user.id],
        });
        if (!membership.length) {
            // Do not create membership implicitly; deny persist
            return NextResponse.json(
                {
                    success: false,
                    error: "User is not a member of this account",
                },
                { status: 403 }
            );
        }

        // Clear previous last_selected flags
        await excuteQuery({
            query: `UPDATE account_users
                    SET custom_fields = JSON_SET(COALESCE(custom_fields, '{}'), '$.last_selected', false)
                    WHERE user_id = ?`,
            values: [user.id],
        });

        // Set last_selected true for chosen account
        await excuteQuery({
            query: `UPDATE account_users
                    SET custom_fields = JSON_SET(COALESCE(custom_fields, '{}'), '$.last_selected', true)
                    WHERE user_id = ? AND account_id = ?`,
            values: [user.id, accId],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error selecting account",
            },
            { status: 500 }
        );
    }
}
