import nodemailer from "nodemailer";

function getMailerConfig() {
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
    const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new Error("SMTP configuration is missing");
    }

    return {
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass
        }
    };
}

export async function sendMail({ to, subject, text, html }) {
    const transporter = nodemailer.createTransport(getMailerConfig());

    return transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.EMAIL_USER || process.env.SMTP_USER,
        to,
        subject,
        text,
        html
    });
}
