import React from "react";
import { Type, RotateCcw } from "lucide-react";
import { CertificateConfig } from "@/types/event";
import { DEFAULT_CERTIFICATE_CONFIG as DEFAULT_CONFIG } from "@/config/certificateConfig";

interface TypographyMatrixProps {
  config: CertificateConfig;
  setConfig: React.Dispatch<React.SetStateAction<CertificateConfig>>;
}

export function TypographyMatrix({
  config,
  setConfig,
}: TypographyMatrixProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8 space-y-6">
      <h3 className="text-xl font-bold text-white flex items-center gap-2 font-urbanist border-b border-white/10 pb-4">
        <Type className="text-cyan-400" size={20} /> Typography Matrix
      </h3>

      <div className="space-y-3">
        <label className="text-sm text-white/60 font-medium block font-urbanist">
          Text Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={config.text.color}
            onChange={(e) =>
              setConfig({
                ...config,
                text: { ...config.text, color: e.target.value },
              })
            }
            className="w-12 h-12 rounded-lg border-2 border-white/10 cursor-pointer bg-black/50 p-1"
          />
          <input
            type="text"
            value={config.text.color}
            onChange={(e) =>
              setConfig({
                ...config,
                text: { ...config.text, color: e.target.value },
              })
            }
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-base uppercase focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-3">
          <label className="text-sm text-white/60 font-medium block font-urbanist">
            Font Weight
          </label>
          <select
            value={config.text.fontWeight}
            onChange={(e) => {
              const weight = parseInt(e.target.value);
              const isItalic = config.text.fontStyle === "italic";
              let file = "Montserrat-Regular.ttf";

              if (weight === 700 && isItalic)
                file = "Montserrat-BoldItalic.ttf";
              else if (weight === 700) file = "Montserrat-Bold.ttf";

              setConfig({
                ...config,
                text: {
                  ...config.text,
                  fontWeight: weight,
                  fontFile: file,
                },
              });
            }}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
          >
            <option value={400} className="bg-slate-900">
              Regular
            </option>
            <option value={700} className="bg-slate-900">
              Bold
            </option>
          </select>
        </div>
        <div className="space-y-3">
          <label className="text-sm text-white/60 font-medium block font-urbanist">
            Font Style
          </label>
          <select
            value={config.text.fontStyle}
            onChange={(e) => {
              const style = e.target.value as "normal" | "italic";
              const isBold = config.text.fontWeight === 700;
              let file = "Montserrat-Regular.ttf";

              if (isBold && style === "italic")
                file = "Montserrat-BoldItalic.ttf";
              else if (isBold) file = "Montserrat-Bold.ttf";

              setConfig({
                ...config,
                text: {
                  ...config.text,
                  fontStyle: style,
                  fontFile: file,
                },
              });
            }}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
          >
            <option value="normal" className="bg-slate-900">
              Normal
            </option>
            <option value="italic" className="bg-slate-900">
              Italic
            </option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-3">
          <label className="text-sm text-white/60 font-medium font-urbanist flex justify-between items-center group">
            <span>Base Font Size</span>
            <div className="flex items-center gap-2">
              <button
                title="Restore Default"
                onClick={() =>
                  setConfig({
                    ...config,
                    text: {
                      ...config.text,
                      baseFontSize: DEFAULT_CONFIG.text.baseFontSize,
                    },
                  })
                }
                className="text-white/30 hover:text-cyan-400 p-1 transition-all"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </label>
          <input
            type="number"
            value={config.text.baseFontSize}
            onChange={(e) =>
              setConfig({
                ...config,
                text: {
                  ...config.text,
                  baseFontSize: parseInt(e.target.value) || 0,
                },
              })
            }
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
          />
          <p className="text-xs text-white/40 font-urbanist leading-relaxed pt-1">
            Ideal font size.
          </p>
        </div>

        {/* NEW THRESHOLD LENGTH INPUT */}
        <div className="space-y-3">
          <label className="text-sm text-white/60 font-medium font-urbanist flex justify-between items-center group">
            <span>Scale Threshold (Chars)</span>
            <button
              title="Restore Default"
              onClick={() =>
                setConfig({
                  ...config,
                  text: {
                    ...config.text,
                    thresholdLength: DEFAULT_CONFIG.text.thresholdLength,
                  },
                })
              }
              className="text-white/30 hover:text-cyan-400 p-1 transition-all"
            >
              <RotateCcw size={14} />
            </button>
          </label>
          <input
            type="number"
            value={config.text.thresholdLength}
            onChange={(e) =>
              setConfig({
                ...config,
                text: {
                  ...config.text,
                  thresholdLength: parseInt(e.target.value) || 0,
                },
              })
            }
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
          />
          <p className="text-xs text-white/40 font-urbanist leading-relaxed pt-1">
            Names longer than this will visually shrink.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-3">
          <label className="text-sm text-white/60 font-medium font-urbanist flex items-center justify-between group">
            Min Size
            <button
              title="Restore Default"
              onClick={() =>
                setConfig({
                  ...config,
                  text: {
                    ...config.text,
                    minFontSize: DEFAULT_CONFIG.text.minFontSize,
                  },
                })
              }
              className="text-white/30 hover:text-cyan-400 p-1 transition-all"
            >
              <RotateCcw size={14} />
            </button>
          </label>
          <input
            type="number"
            value={config.text.minFontSize}
            onChange={(e) =>
              setConfig({
                ...config,
                text: {
                  ...config.text,
                  minFontSize: parseInt(e.target.value) || 0,
                },
              })
            }
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>
        <div className="space-y-3">
          <label className="text-sm text-white/60 font-medium font-urbanist flex items-center justify-between group">
            Max Size
            <button
              title="Restore Default"
              onClick={() =>
                setConfig({
                  ...config,
                  text: {
                    ...config.text,
                    maxFontSize: DEFAULT_CONFIG.text.maxFontSize,
                  },
                })
              }
              className="text-white/30 hover:text-cyan-400 p-1 transition-all"
            >
              <RotateCcw size={14} />
            </button>
          </label>
          <input
            type="number"
            value={config.text.maxFontSize}
            onChange={(e) =>
              setConfig({
                ...config,
                text: {
                  ...config.text,
                  maxFontSize: parseInt(e.target.value) || 0,
                },
              })
            }
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-3">
          <label className="text-sm text-white/60 font-medium font-urbanist flex items-center justify-between group">
            X Position (Left)
            <button
              title="Restore Default"
              onClick={() =>
                setConfig({
                  ...config,
                  text: { ...config.text, x: DEFAULT_CONFIG.text.x },
                })
              }
              className="text-white/30 hover:text-cyan-400 p-1 transition-all"
            >
              <RotateCcw size={14} />
            </button>
          </label>
          <input
            type="number"
            value={config.text.x}
            onChange={(e) =>
              setConfig({
                ...config,
                text: {
                  ...config.text,
                  x: parseInt(e.target.value) || 0,
                },
              })
            }
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>
        <div className="space-y-3">
          <label className="text-sm text-white/60 font-medium font-urbanist flex items-center justify-between group">
            Y Position (Top)
            <button
              title="Restore Default"
              onClick={() =>
                setConfig({
                  ...config,
                  text: { ...config.text, y: DEFAULT_CONFIG.text.y },
                })
              }
              className="text-white/30 hover:text-cyan-400 p-1 transition-all"
            >
              <RotateCcw size={14} />
            </button>
          </label>
          <input
            type="number"
            value={config.text.y}
            onChange={(e) =>
              setConfig({
                ...config,
                text: {
                  ...config.text,
                  y: parseInt(e.target.value) || 0,
                },
              })
            }
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-3">
          <label className="text-sm text-white/60 font-medium font-urbanist flex items-center justify-between group">
            Target Width
            <button
              title="Restore Default"
              onClick={() =>
                setConfig({
                  ...config,
                  text: {
                    ...config.text,
                    width: DEFAULT_CONFIG.text.width,
                  },
                })
              }
              className="text-white/30 hover:text-cyan-400 p-1 transition-all"
            >
              <RotateCcw size={14} />
            </button>
          </label>
          <input
            type="number"
            value={config.text.width}
            onChange={(e) =>
              setConfig({
                ...config,
                text: {
                  ...config.text,
                  width: parseInt(e.target.value) || 0,
                },
              })
            }
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>
        <div className="space-y-3">
          <label className="text-sm text-white/60 font-medium font-urbanist flex items-center justify-between group">
            Target Height
            <button
              title="Restore Default"
              onClick={() =>
                setConfig({
                  ...config,
                  text: {
                    ...config.text,
                    height: DEFAULT_CONFIG.text.height,
                  },
                })
              }
              className="text-white/30 hover:text-cyan-400 p-1 transition-all"
            >
              <RotateCcw size={14} />
            </button>
          </label>
          <input
            type="number"
            value={config.text.height}
            onChange={(e) =>
              setConfig({
                ...config,
                text: {
                  ...config.text,
                  height: parseInt(e.target.value) || 0,
                },
              })
            }
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
