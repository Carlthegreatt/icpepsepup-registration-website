import React from 'react';
import { MapPin } from 'lucide-react';

interface EventLocationProps {
  location: string;
}

export function EventLocation({ location }: EventLocationProps) {
  const handleLocationClick = () => {
    if (location) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  return (
    <div className="flex items-start gap-3 mb-6 pb-6 border-b border-white/10">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <MapPin className="text-amber-400" size={18} />
        </div>
      </div>
      <div className="flex-1 min-w-0 pt-2">
        {location ? (
          <button
            onClick={handleLocationClick}
            className="text-white/90 text-sm break-words hover:text-amber-300 transition-colors text-left underline decoration-amber-500/30 hover:decoration-amber-400"
          >
            {location}
          </button>
        ) : (
          <p className="text-white/90 text-sm break-words">
            Register to See Address
          </p>
        )}
      </div>
    </div>
  );
}
