"use client";

import { useState, useEffect } from "react";
import { Share2, Check, Copy } from "lucide-react";

interface EventShareCardProps {
  eventSlug: string;
  eventTitle: string;
  className?: string;
}

export function EventShareCard({
  eventSlug,
  eventTitle,
  className = "",
}: EventShareCardProps) {
  const [eventUrl, setEventUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEventUrl(`${window.location.origin}/event/${eventSlug}`);
    }
  }, [eventSlug]);

  const copyLink = async () => {
    if (!eventUrl) return;
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const input = document.createElement("input");
      input.value = eventUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!eventUrl) {
      copyLink();
      return;
    }
    if (typeof navigator !== "undefined" && "share" in navigator && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: eventTitle,
          url: eventUrl,
          text: `Check out this event: ${eventTitle}`,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          copyLink();
        }
      }
    } else {
      copyLink();
    }
  };

  return (
    <div
      className={
        "flex justify-between bg-black/40 backdrop-blur-md rounded-xl p-5 border border-white/10 " +
        className
      }
    >
      <div className="flex items-center gap-2 ">
        <Share2 size={18} className="text-white/80 flex-shrink-0" />
        <h3 className="font-urbanist text-sm font-bold text-white">
          Share this event
        </h3>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={copyLink}
          disabled={!eventUrl}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? (
            <>
              <Check size={16} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy link
            </>
          )}
        </button>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            type="button"
            onClick={handleShare}
            disabled={!eventUrl}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 size={16} />
            Share
          </button>
        )}
      </div>
    </div>
  );
}
