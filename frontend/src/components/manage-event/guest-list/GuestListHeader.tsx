import { Download, ScanLine } from "lucide-react";

interface GuestListHeaderProps {
  guestCount: number;
  onExport: () => void;
  onCheckIn: () => void;
}

export function GuestListHeader({ guestCount, onExport, onCheckIn }: GuestListHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <h2 className="font-urbanist text-lg md:text-xl font-bold text-white">
        Guest List
      </h2>
      <div className="flex gap-2">
        <div className="relative group">
          <button
            onClick={onCheckIn}
            className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-colors text-green-400"
            aria-label="Check In Guests"
          >
            <ScanLine size={16} />
          </button>
          <div className="absolute right-0 top-full mt-2 px-2.5 py-1 bg-white/10 backdrop-blur-sm text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 z-10">
            Check In Guests
          </div>
        </div>
        <button
          onClick={onExport}
          disabled={guestCount === 0}
          className="font-urbanist px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Download size={16} />
          Export
        </button>
      </div>
    </div>
  );
}
