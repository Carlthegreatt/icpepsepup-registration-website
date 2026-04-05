import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function resolveSenderEnv() {
  return {
    SENDER_EMAIL:
      process.env.ICPEP_SENDER_EMAIL ||
      process.env.SENDER_EMAIL ||
      process.env.ARDUINODAYPH_SENDER_EMAIL ||
      "",
    SENDER_APP_PASSWORD:
      process.env.ICPEP_SENDER_PASSWORD ||
      process.env.SENDER_APP_PASSWORD ||
      process.env.ARDUINODAYPH_SENDER_PASSWORD ||
      "",
    SENDER_NAME:
      process.env.ICPEP_SENDER_NAME ||
      process.env.SENDER_NAME ||
      process.env.ARDUINODAYPH_SENDER_NAME ||
      "",
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const resolved = resolveSenderEnv();
  const missing = Object.entries(resolved)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return NextResponse.json({ ok: missing.length === 0, missing });
}
