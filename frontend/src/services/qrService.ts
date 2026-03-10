import { Guest } from "@/types/guest";

export interface QRCodeData {
  name: string;
  registrant_id: string;
  event_id: string;
  event_slug: string;
}

export interface QRGenerationResult {
  success: boolean;
  blob?: Blob;
  fileName?: string;
  error?: string;
}

export async function generateQRCodeBlob(
  qrData: QRCodeData
): Promise<QRGenerationResult> {
  try {
    const qrcode = await import('qrcode');
    const canvas = document.createElement('canvas');
    
    await qrcode.toCanvas(canvas, JSON.stringify(qrData), {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, 'image/png');
    });

    const fileName = `ticket-${qrData.name.replace(/\s+/g, '-')}-${qrData.event_slug}.png`;
    
    return { success: true, blob, fileName };
  } catch (error) {
    console.error('Error generating QR code:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate QR code' 
    };
  }
}

export function createQRDataFromGuest(guest: Guest, eventSlug: string): QRCodeData | null {
  if (!guest.users) {
    return null;
  }

  return {
    name: `${guest.users.first_name || ''} ${guest.users.last_name || ''}`.trim(),
    registrant_id: guest.registrant_id,
    event_id: guest.event_id,
    event_slug: eventSlug
  };
}
