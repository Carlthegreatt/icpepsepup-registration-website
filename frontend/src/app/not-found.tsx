"use client";

import { ErrorState } from "@/components/ui/error-state";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <ErrorState
      title="404 - Page Not Found"
      message="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
      actionLabel="Return Home"
      onAction={() => router.push("/")}
    />
  );
}
