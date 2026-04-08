import { BrevoClient } from "@getbrevo/brevo";

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL ?? "noreply@code-kebab.dev";
const SENDER_NAME = "code-kebab";

export const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export async function sendEmail(opts: {
  to: { email: string; name?: string };
  subject: string;
  htmlContent: string;
  textContent?: string;
}) {
  if (!process.env.BREVO_API_KEY) {
    console.warn("BREVO_API_KEY not set, skipping email");
    return;
  }

  const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  try {
    await brevo.transactionalEmails.sendTransacEmail({
      to: [opts.to],
      sender: { email: SENDER_EMAIL, name: SENDER_NAME },
      subject: opts.subject,
      htmlContent: opts.htmlContent,
      textContent: opts.textContent,
    });
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}
