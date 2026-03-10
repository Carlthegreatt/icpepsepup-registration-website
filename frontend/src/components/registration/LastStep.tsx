import { useRouter } from "next/navigation";
import { useState } from "react";

interface LastStepProps {
  eventSlug?: string;
  onSubmit?: () => Promise<void>;
}

export function LastStep({ eventSlug, onSubmit }: LastStepProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit();
      } catch (error) {
        console.error("Submission error:", error);
        setIsSubmitting(false);
      }
    } else {
      handleReturn();
    }
  };

  const handleReturn = () => {
    if (eventSlug) {
      router.refresh();
      router.push(`/event/${eventSlug}?refresh=${Date.now()}`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 slide-in-from-right-4">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#f5f5f5] tracking-tight mb-4 sm:mb-6 leading-tight">
          Review and Submit
        </h2>

        <div className="max-w-md mx-auto">
          <p className="text-[rgba(197,213,213,0.9)] text-sm sm:text-base leading-relaxed">
            You're almost done! Click the button below to complete your registration.
          </p>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 pt-4 border-t border-[rgba(139,197,197,0.15)] space-y-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[rgba(35,60,60,0.6)] hover:bg-[rgba(35,60,60,0.7)] text-[#95b5b5] font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Registration"}
        </button>
        <button
          type="button"
          onClick={handleReturn}
          className="w-full text-[rgba(200,230,230,0.75)] hover:text-[#8de5e5] text-[11px] sm:text-sm transition-colors"
        >
          Back to Event Page
        </button>
      </div>
    </div>
  );
}
