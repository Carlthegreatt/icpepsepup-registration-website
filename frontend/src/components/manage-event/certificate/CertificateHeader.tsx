import React from "react";
import { ImageIcon } from "lucide-react";
import { CertificateConfig } from "@/types/event";

interface CertificateHeaderProps {
  config: CertificateConfig;
  setConfig: React.Dispatch<React.SetStateAction<CertificateConfig>>;
}

export function CertificateHeader({ config, setConfig }: CertificateHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="animate-in fade-in slide-in-from-left duration-700">
        <h2 className="text-3xl md:text-4xl font-black text-white font-urbanist flex items-center gap-3 tracking-tight">
          <ImageIcon className="text-cyan-400" /> Certificate Configuration
        </h2>
        <p className="text-white/60 font-urbanist mt-2 max-w-2xl text-sm leading-relaxed">
          Upload your custom certificate template (e.g. from Canva or Figma)
          and drag the bounding box below to configure exactly where the
          attendee's name should be positioned.
        </p>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto bg-white/5 px-6 py-4 rounded-xl border border-white/10">
        <label className="flex items-center gap-3 cursor-pointer relative">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={config.isEnabled}
            onChange={(e) =>
              setConfig({ ...config, isEnabled: e.target.checked })
            }
          />
          <div className="w-12 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-500 shadow-inner"></div>
          <span className="text-base font-bold text-white select-none font-urbanist tracking-wide">
            Enable Certificates
          </span>
        </label>
      </div>
    </div>
  );
}
