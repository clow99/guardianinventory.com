import { NextResponse } from "next/server";
import {
    findUserByEmail,
    findUserByUsername,
    createUser,
} from "@/lib/userHelper";
import { hashPassword } from "@/lib/auth";

export async function POST(req) {
    try {
        const { username, email, password } = await req.json();
        if (!username || !email || !password) {
            return NextResponse.json(
                { message: "Missing fields" },
                { status: 400 }
            );
        }
        const [byEmail, byUser] = await Promise.all([
            findUserByEmail(email),
            findUserByUsername(username),
        ]);
        if (byEmail)
            return NextResponse.json(
                { message: "Email already in use" },
                { status: 409 }
            );
        if (byUser)
            return NextResponse.json(
                { message: "Username already in use" },
                { status: 409 }
            );
        const passwordHash = await hashPassword(password);
        await createUser({ username, email, passwordHash });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
