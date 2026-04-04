import React from 'react';

interface EventDateTimeProps {
  startDate: string;
  startTime: string;
  endTime: string;
}

export function EventDateTime({ startDate, startTime, endTime }: EventDateTimeProps) {
  const date = new Date(startDate);
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  const fullDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Format time to include AM/PM
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="flex-shrink-0 text-center">
        <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wide">
            {month}
          </span>
          <span className="text-base font-bold text-white">
            {day}
          </span>
        </div>
      </div>
      <div>
        <p className="text-white font-semibold text-sm mb-0.5">
          {fullDate}
        </p>
        <p className="text-white/60 text-sm">
          {formatTime(startTime)} - {formatTime(endTime)}
        </p>
      </div>
    </div>
  );
}
