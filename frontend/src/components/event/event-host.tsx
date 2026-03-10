import React from "react";

interface EventHostProps {
  hostName?: string;
  hostEmail?: string;
  className?: string;
}

export function EventHost({ hostName, hostEmail, className = "" }: EventHostProps) {
  const safeName =
    hostName && hostName.trim().length > 0 ? hostName : "Event Organizer";
  const initial = safeName.charAt(0).toUpperCase();

  return (
    <div className={className}>
      <h3 className="font-montserrat text-sm font-bold mb-4 text-white">
        Hosted By
      </h3>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-base font-bold">
          {initial}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{safeName}</p>
          {hostEmail && (
            <p className="text-white/60 text-xs">{hostEmail}</p>
          )}
        </div>
      </div>
    </div>
  );
}
