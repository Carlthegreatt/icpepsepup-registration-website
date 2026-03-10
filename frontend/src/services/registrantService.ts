import { getEventIdAndApprovalBySlug } from "@/repositories/eventRepository";
import { getRegistrantByUserAndEvent, createRegistrant } from "@/repositories/registrantRepository";
import { getAuthUser } from "@/repositories/authRepository";
import {
  sendRegisteredConfirmationEmail,
  sendRsvpPendingEmail,
} from "@/services/rsvpEmailService";
import { logger } from "@/utils/logger";

export async function registerForEvent({
  event_id,
  user_id,
  terms_approval,
  form_answers,
}: {
  event_id: string;
  user_id: string;
  terms_approval?: boolean;
  form_answers: Record<string, string>;
}) {
  if (!event_id || !user_id) {
    throw new Error("Missing required fields");
  }

  const authUser = await getAuthUser();
  if (!authUser) {
    throw new Error("You must be logged in to register");
  }

  if (authUser.id !== user_id) {
    throw new Error("Unauthorized registration request");
  }

  const eventData = await getEventIdAndApprovalBySlug(event_id);
  if (!eventData) {
    throw new Error("Event not found");
  }

  const is_registered = !eventData.require_approval;

  const existingRegistrant = await getRegistrantByUserAndEvent(authUser.id, eventData.event_id);
  if (existingRegistrant) {
    throw new Error("You have already registered for this event");
  }

  const data = await createRegistrant({
    event_id: eventData.event_id,
    users_id: authUser.id,
    terms_approval: terms_approval || true,
    form_answers,
    is_registered,
  });

  if (authUser.email) {
    try {
      const eventName = eventData.event_name || event_id;
      if (is_registered) {
        await sendRegisteredConfirmationEmail(authUser.email, eventName);
        logger.info(`Registered confirmation email sent to ${authUser.email}`);
      } else {
        await sendRsvpPendingEmail(authUser.email, eventName);
        logger.info(`RSVP pending email sent to ${authUser.email}`);
      }
    } catch (error) {
      logger.error("Failed to send RSVP email", {
        email: authUser.email,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    success: true,
    registrant: data,
    message: is_registered ? "Registration successful" : "Registration pending approval",
  };
}


export async function updateGuestStatus(guestId: string, isRegistered: boolean) {
  const {
    getRegistrantStatusEmailAndEvent,
    updateGuestStatus,
  } = await import("@/repositories/registrantRepository");

  const registrant = await getRegistrantStatusEmailAndEvent(guestId);
  if (!registrant) {
    throw new Error("Registrant not found");
  }

  const wasPending = !registrant.is_registered;
  const nowRegistered = isRegistered === true;

  const result = await updateGuestStatus(guestId, isRegistered);

  if (wasPending && nowRegistered && registrant.users?.email) {
    try {
      const eventName = registrant.event?.event_name?.trim() || "our event";
      await sendRegisteredConfirmationEmail(registrant.users.email, eventName);
      logger.info(`Registered confirmation email sent to ${registrant.users.email}`);
    } catch (error) {
      logger.error("Failed to send registered confirmation email", {
        guestId,
        email: registrant.users.email,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return result;
}

export async function deleteGuest(guestId: string) {
  const { deleteGuest } = await import("@/repositories/registrantRepository");
  return await deleteGuest(guestId);
}

export async function getEventRegistrants(eventId: string) {
  const { getRegistrantsByEvent } = await import("@/repositories/registrantRepository");
  return await getRegistrantsByEvent(eventId);
}
