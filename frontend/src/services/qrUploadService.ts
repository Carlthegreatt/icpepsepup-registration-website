import { Guest } from "@/types/guest";
import { generateQRCodeBlob, createQRDataFromGuest } from "@/services/qrService";
import { uploadQRToStorage, checkUserSession, updateRegistrantQrUrl } from "@/repositories/qrRepository";

export interface QRUploadResult {
  success: boolean;
  url?: string;
  count?: number;
  error?: string;
}

/**
 * Upload a single QR code to storage
 * Business logic for QR code generation and upload
 */
export async function uploadSingleQR(
  guest: Guest,
  eventSlug: string
): Promise<QRUploadResult> {
  try {
    const isAuthenticated = await checkUserSession();
    if (!isAuthenticated) {
      return { success: false, error: 'You must be logged in to generate QR codes' };
    }

    const qrData = createQRDataFromGuest(guest, eventSlug);
    if (!qrData) {
      return { success: false, error: 'User data not available' };
    }

    const blobResult = await generateQRCodeBlob(qrData);
    if (!blobResult.success || !blobResult.blob || !blobResult.fileName) {
      return { success: false, error: blobResult.error || 'Failed to generate QR code' };
    }

    const uploadResult = await uploadQRToStorage(blobResult.fileName, blobResult.blob);
    
    if (uploadResult.success && uploadResult.url) {
      await updateRegistrantQrUrl(guest.registrant_id, uploadResult.url);
      return { success: true, url: uploadResult.url };
    }
    return { success: false, error: uploadResult.error };
  } catch (error) {
    console.error('Error uploading QR code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function uploadBulkQR(
  guests: Guest[],
  eventSlug: string
): Promise<QRUploadResult> {
  try {
    let uploadedCount = 0;

    for (const guest of guests) {
      if (!guest.users) continue;

      const qrData = createQRDataFromGuest(guest, eventSlug);
      if (!qrData) continue;

      const blobResult = await generateQRCodeBlob(qrData);
      if (!blobResult.success || !blobResult.blob || !blobResult.fileName) {
        console.error(`Failed to generate QR for ${guest.registrant_id}`);
        continue;
      }

      const uploadResult = await uploadQRToStorage(blobResult.fileName, blobResult.blob);

      if (uploadResult.success && uploadResult.url) {
        await updateRegistrantQrUrl(guest.registrant_id, uploadResult.url);
        uploadedCount++;
      } else {
        console.error(`Failed to upload ${blobResult.fileName}:`, uploadResult.error);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    return { success: true, count: uploadedCount };
  } catch (error) {
    console.error('Error uploading bulk QR codes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
