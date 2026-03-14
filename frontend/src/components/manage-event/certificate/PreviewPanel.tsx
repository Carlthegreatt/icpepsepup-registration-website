import React, { useRef, useState } from "react";
import { MousePointer2, Keyboard, Eye, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { CertificateConfig } from "@/types/event";
import { getSmartFontSize } from "@/config/certificateConfig";

interface PreviewPanelProps {
  config: CertificateConfig;
  setConfig: React.Dispatch<React.SetStateAction<CertificateConfig>>;
  previewName: string;
  setPreviewName: (name: string) => void;
  satoriSvg: string | null;
  setSatoriSvg: (svg: string | null) => void;
  isRenderingPreview: boolean;
  handleGeneratePreview: () => void;
}

export function PreviewPanel({
  config,
  setConfig,
  previewName,
  setPreviewName,
  satoriSvg,
  setSatoriSvg,
  isRenderingPreview,
  handleGeneratePreview,
}: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 3508, height: 2480 });

  const getRenderStyle = () => {
    if (!imageSize.width || !imageSize.height) return {};

    return {
      left: `${(config.text.x / imageSize.width) * 100}%`,
      top: `${(config.text.y / Math.max(imageSize.height, 1)) * 100}%`,
      width: `${(config.text.width / imageSize.width) * 100}%`,
      height: `${(config.text.height / Math.max(imageSize.height, 1)) * 100}%`,
    };
  };

  return (
    <div className="bg-[#0a1520] border border-white/10 rounded-2xl p-4 overflow-hidden relative shadow-2xl">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 text-white/60 font-urbanist text-sm font-medium">
          <MousePointer2 size={16} /> Drag the blue box to position the
          name
        </div>
      </div>
      
      {/* Live Preview Input + Generate Preview Button */}
      <div className="mb-4 bg-black/40 border border-white/10 rounded-xl p-3 flex items-center gap-3">
        <Keyboard size={18} className="text-cyan-400" />
        <input
          type="text"
          value={previewName}
          onChange={(e) => {
            setPreviewName(e.target.value);
            setSatoriSvg(null); // Clear preview instantly so they know to re-render
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleGeneratePreview();
          }}
          placeholder="Type a name to test font scaling..."
          className="bg-transparent flex-1 text-white font-urbanist text-sm focus:outline-none"
        />
        <span className="text-xs font-mono text-cyan-400/50 bg-cyan-400/10 px-2 py-1 rounded">
          {getSmartFontSize(previewName.length, config.text)}px
        </span>
        <button
          onClick={handleGeneratePreview}
          disabled={isRenderingPreview || !config.templateUrl}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold transition-all disabled:opacity-40 whitespace-nowrap"
        >
          {isRenderingPreview ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Eye size={13} />
          )}
          {isRenderingPreview ? "Rendering..." : "Generate Preview"}
        </button>
      </div>

      {/* Unified preview + drag-box editor — one single panel */}
      {!config.templateUrl ? (
        <div className="aspect-[1.414/1] w-full bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center flex-col gap-4 text-white/40">
          <ImageIcon size={48} className="opacity-50" />
          <p className="font-urbanist">No template uploaded yet</p>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative aspect-[1.414/1] w-full bg-black rounded-xl overflow-hidden select-none shadow-2xl border border-cyan-500/10"
          onMouseMove={(e) => {
            if (!isDragging || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const xPercent = (e.clientX - rect.left) / rect.width;
            const yPercent = (e.clientY - rect.top) / rect.height;
            const limitedX = Math.max(
              0,
              Math.min(xPercent, 1 - config.text.width / imageSize.width),
            );
            const limitedY = Math.max(
              0,
              Math.min(
                yPercent,
                1 - config.text.height / imageSize.height,
              ),
            );
            setConfig((prev) => ({
              ...prev,
              text: {
                ...prev.text,
                x: Math.round(limitedX * imageSize.width),
                y: Math.round(limitedY * imageSize.height),
              },
            }));
            setSatoriSvg(null); // Clear preview when dragged
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          {/* Background: Satori SVG when ready, raw template while first render is loading */}
          {satoriSvg ? (
            <img
              src={`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(satoriSvg)))}`}
              alt="Live Certificate Preview"
              className="w-full h-full object-contain pointer-events-none"
            />
          ) : (
            <>
              <Image
                src={config.templateUrl}
                alt="Template"
                fill
                className="object-contain pointer-events-none"
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  setImageSize({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                  });
                }}
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center text-white/50 font-urbanist text-sm gap-2">
                <Loader2 size={18} className="animate-spin" /> Rendering
                preview...
              </div>
            </>
          )}

          {/* Draggable bounding box — always overlaid on top */}
          <div
            className="absolute border-2 border-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.4)] cursor-move group"
            style={getRenderStyle()}
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsDragging(true);
            }}
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {config.text.width}×{config.text.height} @ ({config.text.x},{" "}
              {config.text.y})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
