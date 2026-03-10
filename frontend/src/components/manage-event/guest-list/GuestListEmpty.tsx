import { Users } from "lucide-react";

interface GuestListEmptyProps {
  hasGuests: boolean;
}

export function GuestListEmpty({ hasGuests }: GuestListEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
      <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
        <Users size={24} className="text-white/40 md:w-8 md:h-8" />
      </div>
      <h3 className="font-urbanist text-sm md:text-base font-medium text-white mb-2">
        {!hasGuests ? "No Guests Yet" : "No Matching Guests"}
      </h3>
      <p className="font-urbanist text-white/60 text-xs md:text-sm max-w-md mb-4 px-4">
        {!hasGuests
          ? "Share the event or invite people to get started!"
          : "Try adjusting your search or filters"}
      </p>
    </div>
  );
}
