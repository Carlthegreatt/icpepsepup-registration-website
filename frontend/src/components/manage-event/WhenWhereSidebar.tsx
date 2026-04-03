import React from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';
import { EventData } from '@/types/event';

interface WhenWhereSidebarProps {
  event: EventData;
}

export function WhenWhereSidebar({ event }: WhenWhereSidebarProps) {
  // Parse the date to extract month and day
  const eventDate = new Date(event.startDate);
  const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = eventDate.getDate();
  const fullDate = eventDate.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format time to include AM/PM
  const formatTime = (time: string) => {
    // If time already includes AM/PM, return as is
    if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) {
      return time;
    }
    
    // Parse time in HH:MM format
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#2a210f]/50 via-[#1a140a]/45 to-[#241b0d]/50 backdrop-blur-md rounded-xl p-4 md:p-6 border border-amber-700/30">
        <h3 className="font-urbanist text-base md:text-lg font-bold text-white mb-4">
          When & Where
        </h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="text-center bg-[#241b0d]/40 rounded-lg p-3 min-w-[60px] border border-amber-700/20">
              <div className="text-xs text-white/60 uppercase">{month}</div>
              <div className="text-2xl font-bold text-white">{day}</div>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium mb-1">{fullDate}</p>
              <p className="text-white/60 text-sm">
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </p>
            </div>
          </div>

          {event.location ? (
            <div className="flex gap-3 items-start p-4 bg-[#241b0d]/35 border border-amber-700/25 rounded-lg">
              <MapPin size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm mb-1">Location</p>
                <p className="text-white/60 text-xs">
                  {event.location}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 items-start p-4 bg-amber-500/10 border border-amber-500/25 rounded-lg">
              <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm mb-1">Location Missing</p>
                <p className="text-white/60 text-xs">
                  Please enter the location of the event before it starts.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
