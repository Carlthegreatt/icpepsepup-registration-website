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
          <p className="text-yellow-100/60 text-sm sm:text-base leading-relaxed">
            {
              "You're almost done! Click the button below to complete your registration."
            }
          </p>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 pt-4 border-t border-yellow-900/20 space-y-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold py-3.5 rounded-xl transition-all duration-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isSubmitting ? "Submitting..." : "Submit Registration"}
        </button>
        <button
          type="button"
          onClick={handleReturn}
          className="w-full text-yellow-100/50 hover:text-yellow-400 text-[11px] sm:text-sm font-semibold transition-colors underline-offset-4 hover:underline"
        >
          Back to Event Page
        </button>
      </div>
    </div>
  );
}
