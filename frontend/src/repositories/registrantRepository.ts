import { createClient } from "@/lib/supabase/server";
import { Guest } from "@/types/guest";

export async function getRegistrantByUserAndEvent(userId: string, eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registrants")
    .select("registrant_id")
    .eq("users_id", userId)
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch registrant: ${error.message}`);
  }

  return data;
}

export async function createRegistrant(registrantData: {
  event_id: string;
  users_id: string;
  terms_approval: boolean;
  form_answers: Record<string, string>;
  is_registered: boolean;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registrants")
    .insert(registrantData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create registrant: ${error.message}`);
  }

  return data;
}

export async function updateGuestStatus(guestId: string, isRegistered: boolean) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registrants")
    .update({ is_registered: isRegistered })
    .eq("registrant_id", guestId)
    .select();

  if (error) throw new Error(`Failed to update guest status: ${error.message}`);
  return data;
}

export async function getRegistrantStatusEmailAndEvent(guestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registrants")
    .select(`
      registrant_id,
      is_registered,
      users:users!users_id (
        email
      ),
      event:events!event_id (
        event_name
      )
    `)
    .eq("registrant_id", guestId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch registrant details: ${error.message}`);
  }

  return data as
    | {
        registrant_id: string;
        is_registered: boolean;
        users: { email: string } | null;
        event: { event_name: string | null } | null;
      }
    | null;
}

export async function deleteGuest(guestId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("registrants")
    .delete()
    .eq("registrant_id", guestId);

  if (error) throw new Error(`Failed to delete guest: ${error.message}`);
}

export async function getRegistrantsByEvent(eventId: string): Promise<Guest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registrants")
    .select(`
      registrant_id,
      event_id,
      users_id,
      terms_approval,
      form_answers,
      is_registered,
      qr_url,
      users!users_id (
        first_name,
        last_name,
        email
      )
    `)
    .eq("event_id", eventId);

  if (error) {
    throw new Error(`Failed to fetch registrants: ${error.message}`);
  }

  return (data || []) as unknown as Guest[];
}

export async function getRegistrantById(registrantId: string): Promise<Guest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registrants")
    .select(`
      registrant_id,
      event_id,
      users_id,
      terms_approval,
      form_answers,
      is_registered,
      qr_url,
      users!users_id (
        first_name,
        last_name,
        email
      )
    `)
    .eq("registrant_id", registrantId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch registrant: ${error.message}`);
  }

  return data as unknown as Guest;
}

export async function getRegistrantCountByEventSlug(eventSlug: string): Promise<number> {
  const supabase = await createClient();
  const { getEventIdAndApprovalBySlug } = await import("@/repositories/eventRepository");
  
  const eventData = await getEventIdAndApprovalBySlug(eventSlug);
  if (!eventData) {
    return 0;
  }

  const { count, error } = await supabase
    .from("registrants")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventData.event_id)
    .eq("is_registered", true);

  if (error) {
    throw new Error(`Failed to fetch registrant count: ${error.message}`);
  }

  return count ?? 0;
}
