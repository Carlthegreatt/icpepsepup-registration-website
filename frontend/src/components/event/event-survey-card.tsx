import Link from "next/link";
import { ClipboardList, ArrowRight } from "lucide-react";

interface EventSurveyCardProps {
  eventSlug: string;
  className?: string;
}

export function EventSurveyCard({
  eventSlug,
  className = "",
}: EventSurveyCardProps) {
  return (
    <div
      className={
        "flex flex-col sm:flex-row sm:items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-5 border border-white/10 gap-4 sm:gap-2 " +
        className
      }
    >
      <div className="flex items-center gap-2">
        <ClipboardList size={18} className="text-white/80 flex-shrink-0" />
        <h3 className="font-urbanist text-sm font-bold text-white">
          Answer the survey
        </h3>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/event/${eventSlug}/survey`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 hover:scale-105 transition-transform duration-200 text-white text-sm font-medium transition-colors"
        >
          Go to Survey
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
