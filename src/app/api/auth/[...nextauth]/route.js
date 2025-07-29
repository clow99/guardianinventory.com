import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import excuteQuery from "../../../../../lib/db";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account.provider === "google") {
                try {
                    // insert or update user in your database
                    const result = await excuteQuery({
                        query: `
                            INSERT INTO users (email, name, created_at, updated_at)
                            VALUES (?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                            email = VALUES(email),
                            name = VALUES(name),
                            updated_at = VALUES(updated_at)
                        `,
                        values: [user.email, user.name, new Date(), new Date()],
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
