import { useState, useEffect, useCallback } from "react";
import { EventData } from "@/types/event";
import { getEventAction } from "@/actions/eventActions";

interface UseEventReturn {
  event: EventData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch and manage a single event by slug
 * @param slug - The event slug to fetch
 * @returns Event data, loading state, and error state
 */
export function useEvent(slug: string): UseEventReturn {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const loadEvent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getEventAction(slug);

      if (!res.success || !res.data || !res.data.event) {
        setEvent(null);
        setError(res.error || "Event not found");
        return;
      }

      setEvent(res.data.event);
    } catch (err) {
      setError("Failed to load event");
      console.error("Error loading event:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      loadEvent();
    }
  }, [slug, loadEvent, refetchTrigger]);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  return { event, loading, error, refetch };
}
