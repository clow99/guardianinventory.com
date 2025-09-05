import mysql from "serverless-mysql";

const required = ["MYSQL_HOST", "MYSQL_DATABASE", "MYSQL_USER"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
    // Fail fast with a clear error when essential env vars are missing
    console.error("[db] Missing env:", missing.join(", "));
}

const db = mysql({
    config: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT
            ? parseInt(process.env.MYSQL_PORT, 10)
            : 3306,
        database: process.env.MYSQL_DATABASE,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
    },
});

export default async function excuteQuery({ query, values }) {
    try {
        const results = await db.query(query, values);
        return results;
    } catch (error) {
        console.error("[db] Query error:", error?.message || error);
        throw error;
    } finally {
        try {
            await db.end();
        } catch {}
    }
}
