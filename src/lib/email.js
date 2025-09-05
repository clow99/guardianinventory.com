import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM || "no-reply@guardian.local";

    if (!host || !user || !pass) {
        // Fallback: Log to console in dev
        console.log("[email:dev] To:", to);
        console.log("[email:dev] Subject:", subject);
        console.log("[email:dev] HTML:\n", html);
        return { ok: true, mocked: true };
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });

    await transporter.sendMail({ from, to, subject, html });
    return { ok: true };
}
