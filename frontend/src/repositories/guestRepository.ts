import { createClient } from "@/lib/supabase/server";

export async function getGuestCountByEvent(eventSlug: string, statuses: string[]) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("guests")
    .select("*", { count: "exact", head: true })
    .eq("event_slug", eventSlug)
    .in("status", statuses);

  if (error) {
    throw new Error(`Failed to fetch guest count: ${error.message}`);
  }

  return count ?? 0;
}

// Implement other guest-related repository functions here, such as createGuest, updateGuest, deleteGuest, listGuestsByEvent, etc, if there is
