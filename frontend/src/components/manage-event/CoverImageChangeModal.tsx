"use client";

import React, { useState, useRef, useTransition } from "react";
import { X, Image as ImageIcon, Upload } from "lucide-react";
import { updateEventDetailsAction } from "@/actions/eventActions";

interface CoverImageChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage?: string;
  slug: string;
}

// Thin wrapper so cover image changes also route through the
// shared server action without modifying it.
async function updateEventCoverImage(slug: string, imageData: string) {
  // We use the new Server Action
  return await updateEventDetailsAction({ slug, coverImage: imageData });
}

export function CoverImageChangeModal({
  isOpen,
  onClose,
  currentImage,
  slug,
}: CoverImageChangeModalProps) {
  const [selectedImage, setSelectedImage] = useState<string>(
    currentImage || "",
  );
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setSelectedImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        // Call the server action to update database directly
        const result = await updateEventCoverImage(slug, selectedImage);

        if (!result || (result && !result.success)) {
          throw new Error("Failed to save via Server Action");
        }

        alert("Cover image updated successfully!");
        onClose();

        // Trigger a page reload to show the updated image
        window.location.reload();
      } catch (error) {
        console.error("Error updating cover image:", error);
        alert("Failed to update cover image");
      }
    });
  };

  const handleCancel = () => {
    setSelectedImage(currentImage || "");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#0a1f14] to-[#120c08] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-urbanist text-xl md:text-2xl font-bold text-white">
            Change Cover Photo
          </h2>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div
            onClick={handleClick}
            className="aspect-[16/9] w-full rounded-xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-cyan-500/50 transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isPending}
            />

            {selectedImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt="Cover Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-bold text-lg">
                    Click to change
                  </p>
                </div>
                {!isPending && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors z-10"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                )}
              </>
            ) : (
              <div className="text-center p-8 relative z-10">
                <div className="bg-white/5 p-4 rounded-full mb-4 mx-auto w-fit group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-8 h-8 text-white/50 group-hover:text-cyan-500 transition-colors" />
                </div>
                <p className="text-lg font-bold text-white mb-2">
                  Upload Cover Image
                </p>
                <p className="text-sm text-white/60 mb-3">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-white/40">
                  Recommended: 1920x1080px (16:9 ratio)
                </p>
              </div>
            )}
          </div>

          {selectedImage && (
            <p className="text-sm text-white/60 mt-4 text-center">
              Click the image to upload a different photo
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="font-urbanist px-6 py-2.5 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || !selectedImage}
            className="font-urbanist px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="animate-spin">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Upload size={16} />
                Save Cover Photo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
