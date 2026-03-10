import React, { useState } from 'react';
import { ScanLine } from 'lucide-react';
import { QRScannerModal } from './QRScannerModal';

interface QuickActionsProps {
  eventSlug: string;
}

export function QuickActions({ eventSlug }: QuickActionsProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <div className="relative group">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="p-3 bg-green-500/20 hover:bg-green-500/30 rounded-xl border border-green-500/30 hover:border-green-500/50 transition-colors text-green-400"
            aria-label="Check In Guests"
          >
            <ScanLine size={22} />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2.5 py-1 bg-white/10 backdrop-blur-sm text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
            Check In Guests
          </div>
        </div>
      </div>

      <QRScannerModal 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        eventSlug={eventSlug}
      />
    </>
  );
}
