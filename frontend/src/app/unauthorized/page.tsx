"use client";

import { ErrorState } from "@/components/ui/error-state";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <ErrorState
      title="Unauthorized"
      message="You do not have permission to access this page. Please ensure you are logged in with the correct account."
      actionLabel="Go to Login"
      onAction={() => router.push("/?login=true")}
    />
  );
}
