"use client";

import { Guest } from "@/types/guest";
import { uploadSingleQR, uploadBulkQR } from "@/services/qrUploadService";

/**
 * Client-side actions for QR code operations
 * These run on the client and delegate to services
 */

export interface QRActionResult {
  success: boolean;
  url?: string;
  count?: number;
  error?: string;
}

export async function generateSingleQRAction(
  guest: Guest,
  eventSlug: string
): Promise<QRActionResult> {
  return await uploadSingleQR(guest, eventSlug);
}

export async function generateBulkQRAction(
  guests: Guest[],
  eventSlug: string
): Promise<QRActionResult> {
  return await uploadBulkQR(guests, eventSlug);
}
