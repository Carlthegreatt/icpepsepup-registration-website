"use client";

import { useState } from "react";
import { CertificateConfig } from "@/types/event";
import { Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveCertificateConfigAction } from "@/actions/certificateActions";
import { DEFAULT_CERTIFICATE_CONFIG as DEFAULT_CONFIG } from "@/config/certificateConfig";
import { useSatoriPreview } from "@/hooks/useSatoriPreview";

// Modular Components
import { CertificateHeader } from "./CertificateHeader";
import { TemplateUpload } from "./TemplateUpload";
import { PreviewPanel } from "./PreviewPanel";
import { TypographyMatrix } from "./TypographyMatrix";

interface CertificateBuilderProps {
  slug: string;
  initialConfig?: CertificateConfig | null;
}

export default function CertificateBuilder({
  slug,
  initialConfig,
}: CertificateBuilderProps) {
  const mergedConfig: CertificateConfig = initialConfig
    ? {
        ...DEFAULT_CONFIG,
        ...initialConfig,
        text: { ...DEFAULT_CONFIG.text, ...initialConfig.text },
      }
    : DEFAULT_CONFIG;

  const [config, setConfig] = useState<CertificateConfig>(mergedConfig);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Name input for live preview
  const [previewName, setPreviewName] = useState("JUAN DELA CRUZ");

  // Live Satori preview hook
  const { satoriSvg, setSatoriSvg, isRenderingPreview, renderSatoriPreview } = useSatoriPreview();

  const handleGeneratePreview = () => {
    if (!config.templateUrl) return;
    renderSatoriPreview(previewName, config);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setIsUploading(true);
    setError(null);
    const supabase = createClient();

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${slug}_template_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("certificates").getPublicUrl(filePath);

      setConfig((prev) => ({
        ...prev,
        templateUrl: publicUrl,
      }));
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const result = await saveCertificateConfigAction(slug, config);
      if (result?.error) throw new Error(result.error);

      alert("Certificate configuration saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <CertificateHeader config={config} setConfig={setConfig} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <TemplateUpload 
            handleImageUpload={handleImageUpload} 
            isUploading={isUploading} 
          />

          <PreviewPanel 
            config={config}
            setConfig={setConfig}
            previewName={previewName}
            setPreviewName={setPreviewName}
            satoriSvg={satoriSvg}
            setSatoriSvg={setSatoriSvg}
            isRenderingPreview={isRenderingPreview}
            handleGeneratePreview={handleGeneratePreview}
          />
        </div>

        <div className="space-y-6">
          <TypographyMatrix config={config} setConfig={setConfig} />

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-sm font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-xl font-bold shadow-xl hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-3 tracking-wide text-lg font-urbanist group"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Save
                size={24}
                className="group-hover:scale-110 transition-transform"
              />
            )}
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
