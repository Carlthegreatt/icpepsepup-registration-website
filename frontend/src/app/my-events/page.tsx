"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  Ticket,
} from "lucide-react";
import BokehBackground from "@/components/create-event/bokeh-background";
import Squares from "@/components/create-event/squares-background";
import { logoutAction } from "@/actions/authActions";
import { getMyEventsAction } from "@/actions/registrantActions";
import { useUserStore } from "@/store/useUserStore";
import { getLastViewedEventSlug } from "@/utils/last-viewed-event";

type MyEvent = {
  registrant_id: string;
  is_registered: boolean | null;
  is_going: boolean | null;
  qr_data: string | null;
  created_at: string | null;
  event: {
    event_id: string;
    slug: string | null;
    event_name: string | null;
    start_date: string | null;
    end_date: string | null;
    cover_image: string | null;
    location: string | null;
  } | null;
};

function formatEventDate(dateStr: string | null): string {
  if (!dateStr) return "Date TBD";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function EventCardSkeleton() {
  return (
    <div className="animate-pulse bg-white/5 rounded-xl overflow-hidden border border-yellow-900/20">
      <div className="h-40 bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
        <div className="pt-1">
          <div className="h-6 bg-white/5 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
}

export default function MyEventsPage() {
  const router = useRouter();
  const { userId, loading: roleLoading, initialize } = useUserStore();
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (roleLoading) return;
    if (!userId) {
      router.replace("/");
      return;
    }

    async function load() {
      setLoading(true);
      const result = await getMyEventsAction();
      if (result.success && result.data) {
        setEvents(result.data as MyEvent[]);
      }
      setLoading(false);
    }

    load();
  }, [userId, roleLoading, router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutAction();
      useUserStore.getState().clearUser();
      const lastSlug = getLastViewedEventSlug();
      router.replace(lastSlug ? `/event/${lastSlug}` : "/");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1a1405] via-[#0a0a05] to-[#141005] text-white relative overflow-x-hidden font-urbanist">
      {/* Note: Check your BokehBackground and Squares components to ensure they also accept/use yellow hues if applicable */}
      <BokehBackground />
      <Squares direction="diagonal" speed={0.3} />

      <div className="relative z-10">
        <header className="flex items-center justify-between px-4 md:px-8 py-5 border-b border-yellow-900/30 bg-[#0a0a05]/50 backdrop-blur-sm">
          <div>
            <h1 className="text-2xl font-bold text-white">My Events</h1>
            <p className="text-yellow-100/50 text-sm mt-0.5">
              Events you&apos;ve registered for
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-900/40 bg-yellow-950/20 text-yellow-500 hover:bg-yellow-900/30 hover:text-yellow-400 hover:border-yellow-500/60 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </header>

        <main className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/5 border border-yellow-500/20 flex items-center justify-center mb-4">
                <Ticket className="w-8 h-8 text-yellow-500/40" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                No events yet
              </h2>
              <p className="text-yellow-100/50 text-sm mb-6 max-w-xs">
                You haven&apos;t registered for any events. Browse available
                events to get started.
              </p>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-5 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm font-bold transition-all active:scale-[0.98]"
              >
                Go to Home
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((reg) => {
                const ev = reg.event;
                if (!ev?.slug) return null;
                const isApproved = reg.is_registered === true;

                return (
                  <button
                    key={reg.registrant_id}
                    type="button"
                    onClick={() => router.push(`/event/${ev.slug}`)}
                    className="group text-left bg-[rgba(25,25,10,0.6)] backdrop-blur-md rounded-xl overflow-hidden border border-yellow-900/30 hover:border-yellow-500/50 transition-all duration-300 hover:bg-[rgba(35,35,15,0.7)] hover:shadow-[0_0_20px_rgba(250,204,21,0.05)]"
                  >
                    <div className="relative h-40 bg-gradient-to-br from-[#1a1a0a] to-[#0a0a05] overflow-hidden">
                      {ev.cover_image ? (
                        <Image
                          src={ev.cover_image}
                          alt={ev.event_name || "Event"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Calendar className="w-12 h-12 text-yellow-500/10" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        {isApproved ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-medium backdrop-blur-sm">
                            <CheckCircle className="w-3 h-3" /> Approved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-xs font-medium backdrop-blur-sm">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-yellow-400 transition-colors">
                        {ev.event_name || "Untitled Event"}
                      </h3>
                      <div className="flex items-center gap-1.5 text-yellow-100/60 text-xs">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{formatEventDate(ev.start_date)}</span>
                      </div>
                      {ev.location && (
                        <div className="flex items-center gap-1.5 text-yellow-100/60 text-xs">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      )}
                      {isApproved && reg.qr_data && (
                        <div className="flex items-center gap-1.5 text-emerald-400/80 text-xs pt-1 font-medium">
                          <Ticket className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Ticket ready</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
