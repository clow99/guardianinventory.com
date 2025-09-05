import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import excuteQuery from "@/lib/db";
import { verifyPassword } from "@/lib/auth";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const { username, password } = credentials || {};
                if (!username || !password) return null;
                const rows = await excuteQuery({
                    query: "SELECT * FROM users WHERE username = ? LIMIT 1",
                    values: [username],
                });
                const user = Array.isArray(rows) && rows[0];
                if (!user) return null;
                const ok = await verifyPassword(password, user.password);
                if (!ok) return null;
                return {
                    id: user.id,
                    name: user.full_name || user.username || user.email,
                    email: user.email,
                };
            },
        }),
    ],
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account.provider === "google") {
                try {
                    const now = new Date();
                    await excuteQuery({
                        error: "/auth/error",
                        query: `
                            INSERT INTO users (email, full_name, created_at, updated_at)
                            VALUES (?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                            full_name = VALUES(full_name),
                            updated_at = VALUES(updated_at)
                        `,
                        values: [user.email, user.name, now, now],
                    });
                } catch (error) {
                    console.error("Audit log error:", error);
                }
            }
            return true; // Always allow sign in
        },
    },
    // ...other options
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
