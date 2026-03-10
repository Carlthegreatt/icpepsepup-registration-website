"use client";

import { Eye, XCircle } from "lucide-react";
import { Guest } from "@/types/guest";
import { EventData } from "@/types/event";

interface GuestAnswersModalProps {
  guest: Guest;
  event: EventData;
  onClose: () => void;
}

export function GuestAnswersModal({ guest, event, onClose }: GuestAnswersModalProps) {
  // Create a map of answer keys (a1, a2, a3) to question text
  const getQuestionText = (answerKey: string): string => {
    const match = answerKey.match(/\d+$/);
    if (match && event.questions && Array.isArray(event.questions)) {
      const index = parseInt(match[0]) - 1; // Convert 1-based to 0-based index
      if (index >= 0 && index < event.questions.length) {
        return event.questions[index].text;
      }
    }
    return answerKey;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-gradient-to-br from-[#0a1f14] via-[#0a1520] to-[#120c08] border border-white/10 rounded-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50 pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-start justify-between p-6 md:p-8 border-b border-white/10">
          <div className="flex-1 pr-4">
            <h3 className="font-urbanist text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
              Form Answers
            </h3>
            <p className="font-urbanist text-sm text-white/60">
              {guest.users?.first_name || 'N/A'} {guest.users?.last_name || ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <XCircle size={20} className="text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
          {Object.keys(guest.form_answers).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(guest.form_answers).map(
                ([answerKey, answer], index) => {
                  const questionText = getQuestionText(answerKey);
                  return (
                    <div
                      key={index}
                      className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 border border-primary/30 flex items-center justify-center text-white text-sm font-bold shadow-[0_0_15px_rgba(0,128,128,0.3)]">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-urbanist text-sm font-medium text-white/60 mb-2">
                            {questionText}
                          </p>
                          {/* Check if answer is a URL (file upload) */}
                          {String(answer).startsWith('http') ? (
                            <a
                              href={String(answer)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-urbanist text-base text-primary hover:text-primary/80 underline leading-relaxed inline-flex items-center gap-2"
                            >
                              View Uploaded File
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            </a>
                          ) : (
                            <p className="font-urbanist text-base text-white leading-relaxed">
                              {String(answer)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-white/30" />
              </div>
              <p className="font-urbanist text-white/50 text-sm">
                No form answers available
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative p-6 md:p-8 border-t border-white/10 bg-black/20">
          <button
            onClick={onClose}
            className="w-full font-urbanist px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl text-white text-sm font-bold uppercase tracking-wide transition-all shadow-[0_0_20px_rgba(0,128,128,0.3)] hover:shadow-[0_0_30px_rgba(0,128,128,0.4)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
