import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

function getSenderConfig() {
  const senderEmail =
    process.env.ARDUINODAYPH_SENDER_EMAIL || process.env.SENDER_EMAIL;
  const senderPassword =
    process.env.ARDUINODAYPH_SENDER_PASSWORD || process.env.SENDER_APP_PASSWORD;
  const senderName =
    process.env.ARDUINODAYPH_SENDER_NAME ||
    process.env.SENDER_NAME ||
    senderEmail;

  if (!senderEmail || !senderPassword) {
    throw new Error("Sender email configuration is missing");
  }

  return { senderEmail, senderPassword, senderName };
}

// Module-level transport singleton (reused across requests in the same process)
let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!_transporter) {
    const { senderEmail, senderPassword } = getSenderConfig();
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: senderEmail, pass: senderPassword },
    });
  }
  return _transporter;
}

// Module-level template cache (files read once per process lifetime)
const _templateCache = new Map<string, string>();

async function loadTemplate(name: string): Promise<string> {
  if (_templateCache.has(name)) return _templateCache.get(name)!;
  const templatePath = path.join(
    process.cwd(),
    "public",
    "email-template",
    name,
  );
  const html = await fs.readFile(templatePath, "utf8");
  _templateCache.set(name, html);
  return html;
}

export async function sendRsvpPendingEmail(to: string, eventName: string) {
  const { senderEmail, senderName } = getSenderConfig();
  const templateHtml = await loadTemplate("adph_rsvp.html");
  const safeEventName = eventName?.trim() || "our event";
  const html = templateHtml.replace(/\{\{\s*event_name\s*\}\}/gi, safeEventName);

  const info = await getTransporter().sendMail({
    from: `${senderName} <${senderEmail}>`,
    to,
    subject: `RSVP Received for ${safeEventName} - Pending Confirmation`,
    html,
  });

  return info.messageId;
}

export async function sendRegisteredConfirmationEmail(
  to: string,
  eventName: string,
) {
  const { senderEmail, senderName } = getSenderConfig();
  const templateHtml = await loadTemplate("adph_registered.html");
  const safeEventName = eventName?.trim() || "our event";
  const html = templateHtml.replace(/\{\{\s*event_name\s*\}\}/gi, safeEventName);

  const info = await getTransporter().sendMail({
    from: `${senderName} <${senderEmail}>`,
    to,
    subject: `Your spot at ${safeEventName} is secured`,
    html,
  });

  return info.messageId;
}
