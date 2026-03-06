"use server";

import { revalidatePath } from "next/cache";
import {
  CreateRegistrantSchema,
  CreateRegistrantInput,
  UpdateGuestStatusSchema,
  DeleteGuestSchema 
} from "@/validators/registrantValidators";
import {
  registerForEvent,
  updateGuestStatus,
  deleteGuest 
} from "@/services/registrantService";
import { canManageEvent } from "@/services/authService";
import { logger } from "@/utils/logger";
import {
  withActionErrorHandler,
  UnauthorizedError,
} from "@/lib/utils/actionError";

export const createRegistrantAction = withActionErrorHandler(
  async (data: CreateRegistrantInput) => {
    const validatedData = CreateRegistrantSchema.parse(data);
    const result = await registerForEvent(validatedData);
    
    revalidatePath(`/event/${validatedData.event_id}`);
    revalidatePath(`/event/${validatedData.event_id}/manage`);
    
    return { result };
  },
);

export const updateGuestStatusAction = withActionErrorHandler(
  async (data: any, slug: string) => {
    const validatedData = UpdateGuestStatusSchema.parse(data);

    if (!(await canManageEvent(slug))) {
      logger.warn(
        `Unauthorized guest update attempt by user for guest ${validatedData.guestId}`,
      );
      throw new UnauthorizedError("Unauthorized");
    }

    await updateGuestStatus(validatedData.guestId, validatedData.isRegistered);
    revalidatePath(`/event/${slug}/manage`);
    revalidatePath(`/event/${slug}`);
    logger.info(`Successfully updated guest ${validatedData.guestId} status`);
  },
);

export const deleteGuestAction = withActionErrorHandler(
  async (data: any, slug: string) => {
    const validatedData = DeleteGuestSchema.parse(data);

    if (!(await canManageEvent(slug))) {
      logger.warn(
        `Unauthorized guest deletion attempt by user for guest ${validatedData.guestId}`,
      );
      throw new UnauthorizedError("Unauthorized");
    }

    await deleteGuest(validatedData.guestId);
    revalidatePath(`/event/${slug}/manage`);
    logger.info(`Successfully deleted guest ${validatedData.guestId}`);
  },
);

export const exportGuestsAction = withActionErrorHandler(
  async (slug: string) => {
    if (!(await canManageEvent(slug))) {
      logger.warn(`Unauthorized guest export attempt for event ${slug}`);
      throw new UnauthorizedError("Unauthorized");
    }

    const { exportGuestsToCSV } = await import("@/services/guestService");
    const result = await exportGuestsToCSV(slug);

    if (result.success) {
      logger.info(`Successfully exported guests for event ${slug}`);
    } else {
      throw new Error(result.error || "Failed to export guests");
    }

    return result;
  },
);

export const checkUserRegistrationAction = withActionErrorHandler(
  async (eventSlug: string) => {
    const { getRegistrantByUserAndEvent } = await import("@/repositories/registrantRepository");
    const { getEventIdAndApprovalBySlug } = await import("@/repositories/eventRepository");
    const { createClient } = await import("@/lib/supabase/server");
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { isRegistered: false, registrationStatus: null as "approved" | "pending" | null };
    }

    const eventData = await getEventIdAndApprovalBySlug(eventSlug);
    if (!eventData) {
      throw new Error("Event not found");
    }

    const registrant = await getRegistrantByUserAndEvent(user.id, eventData.event_id);
    
    if (!registrant) {
      return { isRegistered: false, registrationStatus: null as "approved" | "pending" | null };
    }

    const { data: registrantDetails } = await supabase
      .from("registrants")
      .select("is_registered, qr_url")
      .eq("registrant_id", registrant.registrant_id)
      .single();

    return { 
      isRegistered: true, 
      registrationStatus: (registrantDetails?.is_registered ? "approved" : "pending") as "approved" | "pending",
      qrUrl: (registrantDetails?.qr_url as string | null) ?? null,
    };
  },
);
