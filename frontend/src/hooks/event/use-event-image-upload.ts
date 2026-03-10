import { useState } from "react";
import { EventFormData } from "@/types/event";

interface UseEventImageUploadProps {
  updateField: <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K],
  ) => void;
}

export function useEventImageUpload({ updateField }: UseEventImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const { uploadEventImageAction } = await import("@/actions/eventActions");
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const result = await uploadEventImageAction(formDataUpload);

      if (result.success) {
        if (result.data?.url) {
          updateField("coverImage", result.data.url);
        } else {
          throw new Error("Missing URL in successful response");
        }
      } else {
        console.error("Failed to upload image:", result.error);
        alert(result.error || "Failed to upload image");
      }
    } catch (err) {
      console.error("Failed to read file:", err);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoverImageRemove = (
    e: React.MouseEvent,
    fileInputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    e.stopPropagation();
    updateField("coverImage", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    isUploading,
    handleFileUpload,
    handleCoverImageRemove,
  };
}
