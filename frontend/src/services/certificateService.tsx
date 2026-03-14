import { ImageResponse } from "@vercel/og";
import fs from "fs";
import path from "path";
import { logger } from "@/utils/logger";
import { CertificateConfig } from "@/types/event";
import { DEFAULT_CERTIFICATE_CONFIG, getSmartFontSize } from "@/config/certificateConfig";
import { getEventDetails } from "@/services/eventService";

// Font base directory — fonts are always loaded from local files
const fontDir = path.join(process.cwd(), "public", "cert-template");

/**
 * Core rendering function — renders a certificate image given a name and a fully-resolved config.
 * Both the survey action and the admin preview API route call this.
 */
export const renderCertificateImage = async (
  name: string,
  certConfig: CertificateConfig
): Promise<string> => {
  // 1. Fetch the background template from Supabase Storage
  const templateResponse = await fetch(certConfig.templateUrl!);
  if (!templateResponse.ok) {
    throw new Error(`Failed to fetch certificate template from URL: ${certConfig.templateUrl}`);
  }
  const arrayBuffer = await templateResponse.arrayBuffer();
  const bgBuffer = Buffer.from(arrayBuffer);
  const contentType = templateResponse.headers.get("content-type") || "image/png";
  const bgBase64 = `data:${contentType};base64,${bgBuffer.toString("base64")}`;

  // 2. Load the Montserrat font variation from local public files
  const fontPath = path.join(fontDir, certConfig.text.fontFile);
  if (!fs.existsSync(fontPath)) {
    throw new Error(`Font file missing: ${fontPath}`);
  }
  const fontBuffer = fs.readFileSync(fontPath);
  const fontData: ArrayBuffer = fontBuffer.buffer.slice(
    fontBuffer.byteOffset,
    fontBuffer.byteOffset + fontBuffer.byteLength
  );

  // 3. Calculate dynamic font size
  const dynamicFontSize = getSmartFontSize(name.length, certConfig.text);

  // 4. Render the certificate image
  const response = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: `url(${bgBase64})`,
          backgroundSize: "100% 100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: certConfig.text.x,
            top: certConfig.text.y,
            width: certConfig.text.width,
            height: certConfig.text.height,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: dynamicFontSize,
              fontFamily: "Montserrat",
              color: certConfig.text.color,
              fontWeight: certConfig.text.fontWeight as any,
              fontStyle: certConfig.text.fontStyle,
              textAlign: "center",
              whiteSpace: "nowrap",
              lineHeight: 1,
              marginTop: 0,
              marginBottom: 0,
            }}
          >
            {name}
          </span>
        </div>
      </div>
    ),
    {
      width: 3508,
      height: 2480,
      fonts: [
        {
          name: "Montserrat",
          data: fontData,
          style: certConfig.text.fontStyle,
          weight: certConfig.text.fontWeight as any,
        },
      ],
    }
  );

  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
};

/**
 * Generates a certificate for a submitted survey.
 * Fetches the event's certificate config from the database.
 */
export const generateCertificate = async (name: string, eventSlug: string): Promise<string> => {
  try {
    const event = await getEventDetails(eventSlug);

    if (!event.certificateConfig || !event.certificateConfig.templateUrl) {
      throw new Error(
        `Certificate not configured for event "${eventSlug}". Please upload a template and save the configuration in the admin panel.`
      );
    }

    // Deep-merge with defaults to fill in any missing properties added after initial save.
    const certConfig: CertificateConfig = {
      ...DEFAULT_CERTIFICATE_CONFIG,
      ...event.certificateConfig,
      text: {
        ...DEFAULT_CERTIFICATE_CONFIG.text,
        ...event.certificateConfig.text,
      },
      isEnabled: true,
    };

    logger.info("Resolved Certificate Config:", JSON.stringify(certConfig, null, 2));
    return await renderCertificateImage(name, certConfig);
  } catch (error) {
    logger.error("Failed to generate certificate", error);
    throw error;
  }
};
