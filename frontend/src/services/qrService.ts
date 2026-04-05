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
