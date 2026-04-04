import React from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({
  title,
  message,
  actionLabel = "Go to Home",
  onAction,
}: ErrorStateProps) {
  return (
    <div className="min-h-screen w-full bg-[#0a0a05] text-[#f5f5f5] flex flex-col items-center justify-center p-4">
      <div className="relative overflow-hidden bg-[rgba(25,25,10,0.8)] backdrop-blur-md border border-yellow-900/50 rounded-[24px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-center max-w-md w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
        {/* Error Icon */}
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
          {title}
        </h2>

        {message && (
          <p className="text-yellow-100/60 mb-8 text-sm leading-relaxed">
            {message}
          </p>
        )}

        {onAction && (
          <button
            onClick={onAction}
            className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold py-3.5 rounded-xl transition-all duration-300 text-sm active:scale-[0.98]"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
