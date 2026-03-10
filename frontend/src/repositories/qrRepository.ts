import { createClient } from "@/lib/supabase/client";

export interface QRStorageResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload QR code blob to storage (client-side only)
 */
export async function uploadQRToStorage(
  fileName: string,
  blob: Blob
): Promise<QRStorageResult> {
  try {
    const supabase = createClient();

    const { error } = await supabase.storage
      .from('ticket')
      .upload(fileName, blob, {
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

/**
 * Check if user is authenticated (client-side only)
 */
export async function checkUserSession(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    return !!sessionData.session;
  } catch {
    return false;
  }
}

export async function updateRegistrantQrUrl(
  registrantId: string,
  qrUrl: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('registrants')
    .update({ qr_url: qrUrl })
    .eq('registrant_id', registrantId);

  if (error) {
    console.error('Failed to save qr_url:', error.message);
  }
}
