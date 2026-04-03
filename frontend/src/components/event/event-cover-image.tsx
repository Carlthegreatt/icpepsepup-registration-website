import React from 'react';
import Image from 'next/image';
import { Ticket } from 'lucide-react';

interface EventCoverImageProps {
  src: string;
  alt: string;
}

export function EventCoverImage({ src, alt }: EventCoverImageProps) {
  if (!src) {
    // Placeholder if no image
    return (
      <div className="w-full aspect-square rounded-2xl overflow-hidden relative bg-gradient-to-br from-amber-500/20 via-black/40 to-orange-500/20 backdrop-blur-md border border-white/10">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
              <Ticket className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/40 text-xs uppercase tracking-wider">No Cover Image</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-square rounded-2xl overflow-hidden relative group">
      {/* Image Container */}
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
        <Image 
          src={src} 
          alt={alt}
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 opacity-40 mix-blend-overlay pointer-events-none" />
      
      {/* Border */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 ring-inset pointer-events-none" />
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_30px_rgba(245,158,11,0.25)] pointer-events-none" />
    </div>
  );
}
