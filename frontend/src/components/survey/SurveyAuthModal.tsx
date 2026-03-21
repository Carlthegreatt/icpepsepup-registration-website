"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogIn, ArrowLeft } from "lucide-react";
import { createPortal } from "react-dom";

interface SurveyAuthModalProps {
  eventSlug: string;
}

export function SurveyAuthModal({ eventSlug }: SurveyAuthModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleLogin = () => {
    // Redirect to login with a next parameter so they come back to the survey
    const nextUrl = encodeURIComponent(
      pathname || `/event/${eventSlug}/survey`,
    );
    router.push(`/auth/login?next=${nextUrl}`);
  };

  const handleBack = () => {
    router.push(`/event/${eventSlug}`);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f1d24] border border-white/10 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-6 h-6 text-cyan-400" />
          </div>

          <h2 className="font-urbanist text-2xl font-bold text-white">
            Authentication Required
          </h2>

          <p className="text-white/70 font-urbanist text-sm sm:text-base">
            You must be logged in to answer the survey. This helps us ensure
            only authentic attendees provide feedback.
          </p>

          <div className="pt-6 space-y-3">
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-cyan-500/25"
            >
              <LogIn className="w-4 h-4" />
              Sign in to continue
            </button>

            <button
              onClick={handleBack}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white/90 rounded-xl font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to event page
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
