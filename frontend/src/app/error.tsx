"use client";

import { ErrorState } from "@/components/ui/error-state";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Something went wrong!"
      message={
        error.message ||
        "An unexpected error occurred while processing your request."
      }
      actionLabel="Try Again"
      onAction={() => reset()}
    />
  );
}
