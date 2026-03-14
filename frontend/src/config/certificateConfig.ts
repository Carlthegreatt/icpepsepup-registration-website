import { CertificateConfig } from "@/types/event";

export const DEFAULT_CERTIFICATE_CONFIG: CertificateConfig = {
  isEnabled: false,
  templateUrl: "",
  text: {
    x: 934,
    y: 993,
    width: 2407,
    height: 182,
    color: "#2490ab",
    baseFontSize: 80,
    thresholdLength: 20,
    minFontSize: 30,
    maxFontSize: 80,
    fontFile: "Montserrat-BoldItalic.ttf",
    fontWeight: 700,
    fontStyle: "italic",
  },
};

/**
 * Smart font size calculator to fit long names within the bounding box
 * Scales dynamically based on: config.thresholdLength characters = config.baseFontSize.
 * Caps at maxFontSize for shorter names.
 */
export const getSmartFontSize = (textLength: number, config: NonNullable<CertificateConfig["text"]>): number => {
  if (textLength === 0 || !config?.thresholdLength) return config.maxFontSize;
  
  // Base case from the config (e.g., 20 characters)
  const targetWidth = config.thresholdLength * config.baseFontSize;
  const calculatedSize = Math.floor(targetWidth / textLength);
  
  return Math.max(
    config.minFontSize, 
    Math.min(config.maxFontSize, calculatedSize)
  );
};
