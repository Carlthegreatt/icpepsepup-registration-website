import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import nunjucks from "nunjucks";
import { normalizeNameKey } from "@/utils/normalizeName";

export const runtime = "nodejs";

type Mapping = {
  recipient: string;
  name: string;
  subject?: string | null;
};

type Attachment = {
  filename: string;
  contentBase64: string;
  contentType?: string;
};

type Payload = {
  rows?: Array<Record<string, string>>;
  mapping?: Mapping;
  template?: string;
  subjectTemplate?: string;
  extraContext?: Record<string, unknown>;
  attachmentsByName?: Record<string, Attachment[]>;
  delayMs?: number;
  jitterMs?: number;
};

function resolveSenderEnv() {
  return {
    email:
      process.env.SENDER_EMAIL || process.env.ARDUINODAYPH_SENDER_EMAIL || "",
    password:
      process.env.SENDER_APP_PASSWORD ||
      process.env.ARDUINODAYPH_SENDER_PASSWORD ||
      "",
    name:
      process.env.SENDER_NAME ||
      process.env.ARDUINODAYPH_SENDER_NAME ||
      process.env.SENDER_EMAIL ||
      process.env.ARDUINODAYPH_SENDER_EMAIL ||
      "",
  };
}

function renderTemplate(
  html: string,
  subject: string | undefined,
  row: Record<string, string>,
  mapping: Mapping,
  extraContext: Record<string, unknown> | undefined,
) {
  const ctx: Record<string, unknown> = {
    ...row,
    ...(extraContext || {}),
    name: row[mapping.name],
    recipient: row[mapping.recipient],
  };

  let body = html;
  let subj = subject || "";

  try {
    body = nunjucks.renderString(html, ctx);
  } catch {}

  if (subject) {
    try {
      subj = nunjucks.renderString(subject, ctx);
    } catch {}
  } else if (mapping.subject && row[mapping.subject]) {
    subj = String(row[mapping.subject]);
  }

  return { body, subj };
}

export async function POST(req: Request) {
  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { rows, mapping, template, subjectTemplate, extraContext, attachmentsByName, delayMs, jitterMs } = payload;

  if (!rows || !Array.isArray(rows) || !mapping || !template) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const sender = resolveSenderEnv();
  if (!sender.email || !sender.password) {
    return NextResponse.json({ ok: false, error: "Sender env vars missing" }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: sender.email,
      pass: sender.password,
    },
  });

  const filtered = rows.filter((r) => r[mapping.recipient]);
  let sent = 0;
  let failed = 0;
  let index = 0;
  const delay = typeof delayMs === "number" && delayMs > 0 ? delayMs : 2000;
  const jitter = typeof jitterMs === "number" && jitterMs >= 0 ? Math.floor(jitterMs) : 250;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const push = (obj: unknown) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));

      push({ type: "start", total: filtered.length });

      for (const row of filtered) {
        const current = index++;
        const { body, subj } = renderTemplate(
          template,
          subjectTemplate,
          row,
          mapping,
          extraContext,
        );

        const nameKey = normalizeNameKey(row[mapping.name] || "");
        const atts = nameKey && attachmentsByName ? attachmentsByName[nameKey] || [] : [];

        try {
          const info = await transporter.sendMail({
            from: `${sender.name} <${sender.email}>`,
            to: row[mapping.recipient],
            subject: subj,
            html: body,
            attachments: atts.map((a) => ({
              filename: a.filename,
              content: a.contentBase64,
              encoding: "base64" as const,
              contentType: a.contentType,
            })),
          });

          sent += 1;
          push({
            type: "item",
            index: current,
            to: row[mapping.recipient],
            status: "sent",
            messageId: info.messageId,
            subject: subj,
            attachments: atts.length,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          failed += 1;
          push({
            type: "item",
            index: current,
            to: row[mapping.recipient],
            status: "error",
            error: error instanceof Error ? error.message : String(error),
            subject: subj,
            attachments: atts.length,
            timestamp: new Date().toISOString(),
          });
        }

        if (delay > 0 && index < filtered.length) {
          const jitterOffset = jitter > 0 ? Math.floor((Math.random() * 2 - 1) * jitter) : 0;
          const wait = Math.max(0, delay + jitterOffset);
          await new Promise((resolve) => setTimeout(resolve, wait));
        }
      }

      push({ type: "done", sent, failed });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
