import { useState, useRef, useCallback } from "react";
import { CertificateConfig } from "@/types/event";
import { getSmartFontSize } from "@/config/certificateConfig";

export function useSatoriPreview() {
  const [satoriSvg, setSatoriSvg] = useState<string | null>(null);
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);

  // Cache font and template image data across renders to avoid re-fetching
  const fontCacheRef = useRef<Map<string, ArrayBuffer>>(new Map());
  const bgCacheRef = useRef<Map<string, string>>(new Map());

  // Core Satori rendering function — runs client-side, same engine as @vercel/og
  const renderSatoriPreview = useCallback(
    async (name: string, cfg: CertificateConfig) => {
      if (!cfg.templateUrl) return;

      try {
        setIsRenderingPreview(true);

        // 1. Load font — cached after first fetch
        const fontFile = cfg.text.fontFile;
        if (!fontCacheRef.current.has(fontFile)) {
          const fontRes = await fetch(`/cert-template/${fontFile}`);
          fontCacheRef.current.set(fontFile, await fontRes.arrayBuffer());
        }
        const fontData = fontCacheRef.current.get(fontFile)!;

        // 2. Load template image as base64 — cached after first fetch
        if (!bgCacheRef.current.has(cfg.templateUrl)) {
          const imgRes = await fetch(cfg.templateUrl);
          const buf = await imgRes.arrayBuffer();
          const contentType = imgRes.headers.get("content-type") || "image/png";
          const b64 = Buffer.from(buf).toString("base64");
          bgCacheRef.current.set(
            cfg.templateUrl,
            `data:${contentType};base64,${b64}`,
          );
        }
        const bgBase64 = bgCacheRef.current.get(cfg.templateUrl)!;

        // 3. Dynamically import satori (avoids SSR issues)
        const { default: satori } = await import("satori");

        // 4. Calculate font size — exact same formula as the server
        const dynamicFontSize = getSmartFontSize(name.length, cfg.text);

        // 5. Run Satori — same JSX structure as certificateService.tsx
        const svg = await satori(
          // Cast as any: satori accepts plain React element objects but TS types expect ReactNode
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                width: "100%",
                height: "100%",
                position: "relative",
                backgroundImage: `url(${bgBase64})`,
                backgroundSize: "100% 100%",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      position: "absolute",
                      left: cfg.text.x,
                      top: cfg.text.y,
                      width: cfg.text.width,
                      height: cfg.text.height,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            fontSize: dynamicFontSize,
                            fontFamily: "Montserrat",
                            color: cfg.text.color,
                            fontWeight: cfg.text.fontWeight,
                            fontStyle: cfg.text.fontStyle,
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            lineHeight: 1,
                          },
                          children: name,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          } as any,
          {
            width: 3508,
            height: 2480,
            fonts: [
              {
                name: "Montserrat",
                data: fontData,
                weight: cfg.text.fontWeight as any,
                style: cfg.text.fontStyle as any,
              },
            ],
          },
        );

        setSatoriSvg(svg);
      } catch (e: any) {
        console.error("Satori preview error:", e);
      } finally {
        setIsRenderingPreview(false);
      }
    },
    [],
  );

  return {
    satoriSvg,
    setSatoriSvg,
    isRenderingPreview,
    renderSatoriPreview,
  };
}
