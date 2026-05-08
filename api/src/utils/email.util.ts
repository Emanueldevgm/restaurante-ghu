import nodemailer from 'nodemailer';
import env from '../config/env.config';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: env.SMTP_SECURE === 'true', // true para 465, false para outras
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  const mailOptions = {
    from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}