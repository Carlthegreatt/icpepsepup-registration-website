import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";

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

async function loadRsvpTemplate() {
  const templatePath = path.join(
    process.cwd(),
    "public",
    "email-template",
    "adph_rsvp.html",
  );

  return await fs.readFile(templatePath, "utf8");
}

async function loadRegisteredTemplate() {
  const templatePath = path.join(
    process.cwd(),
    "public",
    "email-template",
    "adph_registered.html",
  );

  return await fs.readFile(templatePath, "utf8");
}

export async function sendRsvpPendingEmail(to: string, eventName: string) {
  const { senderEmail, senderPassword, senderName } = getSenderConfig();
  const templateHtml = await loadRsvpTemplate();
  const safeEventName = eventName?.trim() || "our event";
  const html = templateHtml.replace(/\{\{\s*event_name\s*\}\}/gi, safeEventName);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: senderEmail,
      pass: senderPassword,
    },
  });

  const info = await transporter.sendMail({
    from: `${senderName} <${senderEmail}>`,
    to,
    subject: `RSVP Received for ${safeEventName} - Pending Confirmation`,
    html,
  });

  return info.messageId;
}

export async function sendRegisteredConfirmationEmail(to: string, eventName: string) {
  const { senderEmail, senderPassword, senderName } = getSenderConfig();
  const templateHtml = await loadRegisteredTemplate();
  const safeEventName = eventName?.trim() || "our event";
  const html = templateHtml.replace(/\{\{\s*event_name\s*\}\}/gi, safeEventName);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: senderEmail,
      pass: senderPassword,
    },
  });

  const info = await transporter.sendMail({
    from: `${senderName} <${senderEmail}>`,
    to,
    subject: `Your spot at ${safeEventName} is secured`,
    html,
  });

  return info.messageId;
}
