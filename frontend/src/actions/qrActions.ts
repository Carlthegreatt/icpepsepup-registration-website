"use server";

import { canManageEvent } from "@/services/authService";
import { uploadQRBufferToStorage } from "@/repositories/qrServerRepository";
import { logger } from "@/utils/logger";
import {
  withActionErrorHandler,
  UnauthorizedError,
} from "@/lib/utils/actionError";
import { getRegistrantById } from "@/repositories/registrantRepository";
import { QRCodeData } from "@/services/qrService";

export interface QRUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface QRValidationResult {
  success: boolean;
  guestName?: string;
  error?: string;
}

export const uploadQRCodeAction = withActionErrorHandler(
  async (blob: Blob, fileName: string, eventSlug: string) => {
    const canManage = await canManageEvent(eventSlug);
    if (!canManage) {
      logger.warn("Unauthorized QR upload attempt", { eventSlug });
      throw new UnauthorizedError("Unauthorized");
    }

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadQRBufferToStorage(fileName, buffer);

    if (result.success) {
      logger.info("QR code uploaded successfully");
      return result;
    } else {
      logger.error("QR upload failed", result.error);
      throw new Error(result.error);
    }
  },
);

export const validateQRCodeAction = withActionErrorHandler(
  async (qrData: QRCodeData, eventSlug: string): Promise<QRValidationResult> => {
    const canManage = await canManageEvent(eventSlug);
    if (!canManage) {
      logger.warn("Unauthorized QR validation attempt", { eventSlug });
      throw new UnauthorizedError("Unauthorized to validate tickets");
    }

    console.log("Validating QR code:", {
      qrDataEventSlug: qrData.event_slug,
      currentEventSlug: eventSlug,
      matches: qrData.event_slug === eventSlug
    });

    if (!qrData.event_slug) {
      return {
        success: false,
        error: "Invalid ticket - outdated QR code format. Please regenerate.",
      };
    }

    // Verify the QR code is for THIS specific event
    if (qrData.event_slug !== eventSlug) {
      return {
        success: false,
        error: `Invalid ticket - this is for event "${qrData.event_slug}", not "${eventSlug}"`,
      };
    }

    const registrant = await getRegistrantById(qrData.registrant_id);
    
    if (!registrant) {
      return {
        success: false,
        error: "Invalid ticket - registrant not found",
      };
    }

    if (registrant.event_id !== qrData.event_id) {
      return {
        success: false,
        error: "Invalid ticket - event mismatch",
      };
    }

    return {
      success: true,
      guestName: qrData.name,
    };
  },
);
