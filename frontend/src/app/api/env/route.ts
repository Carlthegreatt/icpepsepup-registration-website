import { NextResponse } from "next/server";

export const runtime = "nodejs";

function resolveSenderEnv() {
  return {
    SENDER_EMAIL:
      process.env.SENDER_EMAIL || process.env.ARDUINODAYPH_SENDER_EMAIL || "",
    SENDER_APP_PASSWORD:
      process.env.SENDER_APP_PASSWORD ||
      process.env.ARDUINODAYPH_SENDER_PASSWORD ||
      "",
    SENDER_NAME:
      process.env.SENDER_NAME || process.env.ARDUINODAYPH_SENDER_NAME || "",
  };
}

export async function GET() {
  const resolved = resolveSenderEnv();

  const missing = Object.entries(resolved)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return NextResponse.json({
    ok: missing.length === 0,
    missing,
  });
}
