import { createClient } from "@/lib/supabase/server";

export interface QRStorageResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload QR code buffer to storage (server-side only)
 */
export async function uploadQRBufferToStorage(
  fileName: string,
  buffer: Buffer
): Promise<QRStorageResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from('ticket')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from('ticket')
      .getPublicUrl(fileName);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload QR code'
    };
  }
}
