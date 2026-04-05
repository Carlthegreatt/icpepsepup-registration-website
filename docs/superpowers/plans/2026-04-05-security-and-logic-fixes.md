# Security & Logic Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate critical security vulnerabilities, logic bugs, and UX defects found in the registration website codebase.

**Architecture:** Five independent task groups targeting: (1) unauthenticated API endpoints, (2) boolean logic bugs leaking PII/bypassing terms, (3) QR code security, (4) double check-in detection, (5) email service hardening.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase SSR, Zod, nodemailer, CryptoJS

---

## Audit Summary

| # | Severity | Area | Issue |
|---|----------|------|-------|
| 1 | 🔴 CRITICAL | Security | `/api/send/stream` POST has no auth check — anyone can trigger mass email |
| 2 | 🔴 CRITICAL | Security | `/api/env` GET has no auth check — exposes sender config key names |
| 3 | 🔴 CRITICAL | Logic | `terms_approval || true` is always `true` even when `false` is passed |
| 4 | 🟠 HIGH | Security | `handleActionError` returns raw internal error messages to the client |
| 5 | 🟠 HIGH | Security | QR payload stores name + email in **plaintext JSON** — readable by anyone who scans |
| 6 | 🟠 HIGH | Security | `checkEmailAction` leaks account existence (user enumeration) |
| 7 | 🟡 MEDIUM | Logic | `validateQRCodeAction` never checks if already checked in → silent double check-in |
| 8 | 🟡 MEDIUM | UX | No "already checked in" message shown to organizer |
| 9 | 🟡 MEDIUM | Performance | Nodemailer transporter + email templates re-created per send call |

---

## File Map

| File | Task | Change |
|------|------|--------|
| `frontend/src/app/api/send/stream/route.ts` | 1 | Add auth guard |
| `frontend/src/app/api/env/route.ts` | 1 | Add auth guard |
| `frontend/src/services/registrantService.ts` | 2 | Fix `|| true` → explicit required bool |
| `frontend/src/validators/registrantValidators.ts` | 2 | Make `terms_approval` required boolean |
| `frontend/src/lib/utils/actionError.ts` | 2 | Harden error message before returning to client |
| `frontend/src/services/qrService.ts` | 3 | Remove PII from QR payload |
| `frontend/src/actions/qrActions.ts` | 4 | Return `alreadyCheckedIn` flag |
| `frontend/src/repositories/registrantRepository.ts` | 4 | checkInRegistrant returns current check_in state |
| `frontend/src/services/rsvpEmailService.ts` | 5 | Cache transporter and templates |

---

## Task 1 — Protect Unauthenticated API Endpoints

**Problem:** `POST /api/send/stream` and `GET /api/env` require no session. The stream endpoint lets anyone trigger mass email using the server's SMTP credentials.

**Files:**
- Modify: `frontend/src/app/api/send/stream/route.ts`
- Modify: `frontend/src/app/api/env/route.ts`

- [ ] **Step 1: Add auth helper** — add a `getSessionOrUnauthorized` helper at the top of `route.ts` (stream). Import `createClient` from `@/lib/supabase/server`.

In `frontend/src/app/api/send/stream/route.ts`, add at the top of the `POST` function, before `req.json()`:

```typescript
import { createClient } from "@/lib/supabase/server";

// inside POST, as the first line:
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}
```

- [ ] **Step 2: Apply the same guard to `GET /api/env`** — in `frontend/src/app/api/env/route.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const resolved = resolveSenderEnv();
  const missing = Object.entries(resolved)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return NextResponse.json({ ok: missing.length === 0, missing });
}
```

- [ ] **Step 3: Verify manually** — with no session cookie, `curl -X POST http://localhost:3000/api/send/stream` must return `401`. Authenticated request must proceed normally.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/api/send/stream/route.ts frontend/src/app/api/env/route.ts
git commit -m "fix: require authenticated session on /api/send/stream and /api/env"
```

---

## Task 2 — Fix `terms_approval` Bug + Harden Error Messages

### 2a — `terms_approval || true` is always `true`

**Problem:** In `registrantService.ts`:
```ts
terms_approval: terms_approval || true,
```
`false || true` evaluates to `true`. A user who explicitly declines terms is silently accepted.

**Fix:** Make `terms_approval` required. Reject the registration if it is `false`.

**Files:**
- Modify: `frontend/src/validators/registrantValidators.ts`
- Modify: `frontend/src/services/registrantService.ts`

- [ ] **Step 1: Make `terms_approval` required in Zod schema**

In `frontend/src/validators/registrantValidators.ts`, change:
```typescript
// BEFORE:
export const CreateRegistrantSchema = z.object({
  event_id: z.string().min(1, "Event ID cannot be empty"),
  user_id: z.string().min(1, "User ID cannot be empty"),
  terms_approval: z.boolean().optional(),
  form_answers: z.record(z.string(), z.string()),
});
```
to:
```typescript
// AFTER:
export const CreateRegistrantSchema = z.object({
  event_id: z.string().min(1, "Event ID cannot be empty"),
  user_id: z.string().min(1, "User ID cannot be empty"),
  terms_approval: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms to register." }),
  }),
  form_answers: z.record(z.string(), z.string()),
});

export type CreateRegistrantInput = z.infer<typeof CreateRegistrantSchema>;
```

- [ ] **Step 2: Remove the `|| true` default in service**

In `frontend/src/services/registrantService.ts`, change `registerForEvent` signature and usage:
```typescript
// BEFORE:
export async function registerForEvent({
  event_id,
  user_id,
  terms_approval,    // was optional
  form_answers,
}: {
  event_id: string;
  user_id: string;
  terms_approval?: boolean;
  form_answers: Record<string, string>;
}) {
  // ...
  const data = await createRegistrant({
    // ...
    terms_approval: terms_approval || true,   // BUG
  });
```

```typescript
// AFTER:
export async function registerForEvent({
  event_id,
  user_id,
  terms_approval,
  form_answers,
}: {
  event_id: string;
  user_id: string;
  terms_approval: boolean;
  form_answers: Record<string, string>;
}) {
  if (!terms_approval) {
    throw new Error("You must accept the terms to register.");
  }
  // ...
  const data = await createRegistrant({
    // ...
    terms_approval,
  });
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/validators/registrantValidators.ts frontend/src/services/registrantService.ts
git commit -m "fix: terms_approval || true logic bug — false is now correctly rejected"
```

### 2b — Harden error messages returned to the client

**Problem:** `handleActionError` returns `error.message` raw, which can expose SQL errors, Supabase query details, or internal paths.

**Fix:** Allow only safe, explicitly thrown `ActionError` messages through. Sanitize generic `Error` messages.

**Files:**
- Modify: `frontend/src/lib/utils/actionError.ts`

- [ ] **Step 4: Sanitize generic errors before client return**

In `frontend/src/lib/utils/actionError.ts`, change the `error instanceof Error` branch:
```typescript
// BEFORE:
  if (error instanceof Error) {
    logger.error("[Server Action Error]:", error);
    return {
      success: false,
      error: error.message || "An unexpected server error occurred.",
      code: 500,
    };
  }
```
```typescript
// AFTER:
  if (error instanceof Error) {
    logger.error("[Server Action Error]:", { message: error.message, stack: error.stack });
    // Do not leak internal messages. Only forward messages from deliberately thrown ActionErrors
    // (handled above). Generic Error messages may reveal DB structure or internal paths.
    return {
      success: false,
      error: "An unexpected server error occurred.",
      code: 500,
    };
  }
```

> **Note:** Existing code already handles `ActionError` before this branch, so intentional user-facing messages (like "Registration for this event is closed") still reach the client correctly — they are thrown as `new Error(...)` which flows through `withActionErrorHandler` and up to this branch. To preserve those messages, change the throwing sites in `registrantService.ts` to use `new ActionError(...)` instead of `new Error(...)`.

- [ ] **Step 5: Convert service user-facing errors to `ActionError`**

In `frontend/src/services/registrantService.ts`, update the import and convert user-facing throws:
```typescript
import { ActionError } from "@/lib/utils/actionError";

// Replace these specific user-facing throws:
// throw new Error("Registration for this event is closed");
throw new ActionError("Registration for this event is closed.", 400);

// throw new Error("You have already registered for this event");
throw new ActionError("You have already registered for this event.", 409);

// throw new Error("You must be logged in to register");
throw new ActionError("You must be logged in to register.", 401);

// throw new Error("Unauthorized registration request");
throw new ActionError("Unauthorized registration request.", 403);

// throw new Error("You must accept the terms to register.");
throw new ActionError("You must accept the terms to register.", 400);

// throw new Error("Event not found");  — keep as ActionError so it reaches the client
throw new ActionError("Event not found.", 404);
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/utils/actionError.ts frontend/src/services/registrantService.ts
git commit -m "fix: harden server action error messages — internal errors no longer leak to client"
```

---

## Task 3 — Remove PII from QR Code Payload

**Problem:** `createRegistrantQrData` in `qrService.ts` stores a JSON blob containing the attendee's `name` and `email` in the QR code. This JSON is stored in the `registrants.qr_data` column and encoded into the QR image. Anyone who scans the QR with a phone camera can read the attendee's personal information.

**Fix:** The QR payload should only contain the opaque token (already a SHA-256 hash) and the minimum lookup identifiers. Name and email are not needed for check-in — the server looks them up from the DB after validating the token.

**Files:**
- Modify: `frontend/src/services/qrService.ts`

- [ ] **Step 1: Slim down `RegistrantQrPayload` and `createRegistrantQrData`**

Replace the entire file's type and functions with:

```typescript
import CryptoJS from "crypto-js";

// Minimal payload stored in QR — no PII
export type RegistrantQrPayload = {
  token: string;
  issued_at: string;
  registrant: {
    id: string;
    user_id: string;
  };
  event: {
    id: string;
    slug: string | null;
  };
};

export async function generateQRCodeDataUrl(qrData: string): Promise<string> {
  const qrcode = await import("qrcode");
  return qrcode.toDataURL(qrData, {
    errorCorrectionLevel: "L",
    width: 400,
    margin: 2,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}

export function createRegistrantQrToken(input: {
  registrantId: string;
  eventId: string;
  userId: string;
}): string {
  const seed = [
    input.registrantId,
    input.eventId,
    input.userId,
    Date.now().toString(),
    Math.random().toString(36),
  ].join(":");
  return CryptoJS.SHA256(seed).toString(CryptoJS.enc.Hex);
}

export function createRegistrantQrData(input: {
  token: string;
  registrantId: string;
  userId: string;
  eventId: string;
  eventSlug?: string | null;
  // name/email intentionally removed — looked up server-side during check-in
}): string {
  const payload: RegistrantQrPayload = {
    token: input.token,
    issued_at: new Date().toISOString(),
    registrant: {
      id: input.registrantId,
      user_id: input.userId,
    },
    event: {
      id: input.eventId,
      slug: input.eventSlug ?? null,
    },
  };
  return JSON.stringify(payload);
}

export function parseRegistrantQrData(
  value: string,
): RegistrantQrPayload | null {
  try {
    const parsed = JSON.parse(value) as Partial<RegistrantQrPayload>;
    if (!parsed || typeof parsed !== "object") return null;

    if (
      typeof parsed.token !== "string" ||
      !parsed.registrant ||
      typeof parsed.registrant.id !== "string" ||
      !parsed.event ||
      typeof parsed.event.id !== "string"
    ) {
      return null;
    }

    return {
      token: parsed.token,
      issued_at:
        typeof parsed.issued_at === "string"
          ? parsed.issued_at
          : new Date().toISOString(),
      registrant: {
        id: parsed.registrant.id,
        user_id:
          typeof parsed.registrant.user_id === "string"
            ? parsed.registrant.user_id
            : "",
      },
      event: {
        id: parsed.event.id,
        slug: typeof parsed.event.slug === "string" ? parsed.event.slug : null,
      },
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Update the two call sites that passed `attendeeName`/`attendeeEmail`**

In `frontend/src/services/registrantService.ts`, remove `attendeeName` and `attendeeEmail` from both `createRegistrantQrData` calls:

```typescript
// In registerForEvent():
const qrData = createRegistrantQrData({
  token,
  registrantId: data.registrant_id,
  userId: data.users_id,
  eventId: data.event_id,
  eventSlug: event_id,
  // removed: attendeeName, attendeeEmail, eventName
});

// In updateGuestStatus():
const nextQrData = nowRegistered
  ? createRegistrantQrData({
      token,
      registrantId: registrant.registrant_id,
      userId: registrant.users_id,
      eventId: registrant.event_id,
      eventSlug: registrant.event?.slug ?? eventSlug,
      // removed: attendeeName, attendeeEmail, eventName
    })
  : null;
```

- [ ] **Step 3: Verify TypeScript compiles with no errors**

```bash
cd frontend && npx tsc --noEmit
```
Expected: no errors related to `qrService.ts` types.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/services/qrService.ts frontend/src/services/registrantService.ts
git commit -m "fix: remove PII (name, email) from QR code payload — token + IDs only"
```

---

## Task 4 — Detect and Report Double Check-In

**Problem:** `validateQRCodeAction` calls `checkInRegistrant()` unconditionally. If the same QR is scanned twice, the second scan overwrites `check_in_time` with a new timestamp, and the organizer sees another success — with no indication the person was already checked in. This is an event management issue (inflated scan counts, lost original check-in time).

**Files:**
- Modify: `frontend/src/repositories/registrantRepository.ts` — `checkInRegistrant` should not overwrite if already checked in
- Modify: `frontend/src/actions/qrActions.ts` — `validateQRCodeAction` should return `alreadyCheckedIn` flag
- Modify: `frontend/src/actions/qrActions.ts` — `QRValidationResult` type extended

- [ ] **Step 1: Extend `QRValidationResult` with `alreadyCheckedIn` flag**

In `frontend/src/actions/qrActions.ts`, update the interface:
```typescript
export interface QRValidationResult {
  success: boolean;
  guestName?: string;
  guestEmail?: string;
  alreadyCheckedIn?: boolean;
  checkInTime?: string | null;
  error?: string;
}
```

- [ ] **Step 2: Guard against double check-in in `validateQRCodeAction`**

In `frontend/src/actions/qrActions.ts`, in the `validateQRCodeAction` body, after the `!registrant.is_registered` check:

```typescript
    // Already checked in — return early with informative flag instead of overwriting
    if (registrant.check_in) {
      const guestName = [
        registrant.users?.first_name,
        registrant.users?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      return {
        success: true,
        guestName: guestName || "Guest",
        guestEmail: registrant.users?.email ?? undefined,
        alreadyCheckedIn: true,
        checkInTime: registrant.check_in_time ?? null,
      };
    }

    await checkInRegistrant(registrant.registrant_id);
```

- [ ] **Step 3: Fetch `check_in` and `check_in_time` in `getRegistrantByQrData`**

In `frontend/src/repositories/registrantRepository.ts`, verify `getRegistrantByQrData` selects `check_in` and `check_in_time`. It currently does **not** — add them:

```typescript
// In getRegistrantByQrData(), the select string — add check_in, check_in_time:
    .select(
      `
      registrant_id,
      event_id,
      users_id,
      terms_approval,
      form_answers,
      is_registered,
      is_going,
      qr_data,
      check_in,
      check_in_time,
      users!users_id (
        first_name,
        last_name,
        email
      )
    `,
    )
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/actions/qrActions.ts frontend/src/repositories/registrantRepository.ts
git commit -m "fix: detect already-checked-in QR scans and return alreadyCheckedIn flag"
```

---

## Task 5 — Email Service: Cache Templates and Transporter

**Problem:** `rsvpEmailService.ts` reads HTML templates from disk and creates a new nodemailer transporter on every single email send. On registration spikes this causes:
- Redundant filesystem reads per request
- A new TCP/TLS handshake to Gmail SMTP per email

**Files:**
- Modify: `frontend/src/services/rsvpEmailService.ts`

- [ ] **Step 1: Replace per-call setup with module-level cache**

Replace the entire content of `frontend/src/services/rsvpEmailService.ts`:

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/rsvpEmailService.ts
git commit -m "perf: cache nodemailer transporter and email templates at module level"
```

---

## Self-Review

**Spec coverage:**
- Task 1 covers issues #1, #2 (unauthenticated API endpoints)
- Task 2 covers issues #3, #4 (terms bug, error message leakage)
- Task 3 covers issue #5 (PII in QR)
- Task 4 covers issues #7, #8 (double check-in)
- Task 5 covers issue #9 (email performance)

**Issue #6 (user enumeration via `checkEmailAction`)** — this is intentional UX design: the registration flow shows "sign in" vs "create account" based on email existence. Eliminating it would require redesigning the auth flow. Flagged for future consideration but not blocking — it does not expose passwords or account details.

**Placeholder scan:** None found.

**Type consistency:** `RegistrantQrPayload` loses `name`/`email` fields in Task 3. Both call sites are updated in the same task. `QRValidationResult` extended in Task 4 — `alreadyCheckedIn` and `checkInTime` are optional so existing callers that don't use them are unaffected.
