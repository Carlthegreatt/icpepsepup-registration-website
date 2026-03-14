import React from "react";
import { Upload, Loader2 } from "lucide-react";

interface TemplateUploadProps {
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isUploading: boolean;
}

export function TemplateUpload({ handleImageUpload, isUploading }: TemplateUploadProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30 text-cyan-400">
          <Upload size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white font-urbanist">
            Background Template
          </h3>
          <p className="text-sm text-white/50 font-urbanist">
            Upload a high-resolution PNG image without the attendee's
            name.
          </p>
        </div>
      </div>
      <div>
        <input
          type="file"
          id="template-upload"
          accept="image/png, image/jpeg"
          className="hidden"
          onChange={handleImageUpload}
          disabled={isUploading}
        />
        <label
          htmlFor="template-upload"
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg font-urbanist cursor-pointer inline-flex items-center gap-2 ${
            isUploading
              ? "bg-white/10 text-white/40 border border-white/10"
              : "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40"
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Uploading...
            </>
          ) : (
            "Choose Image"
          )}
        </label>
      </div>
    </div>
  );
}
