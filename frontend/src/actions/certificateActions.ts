"use server";

import { CertificateConfig } from "@/types/event";
import { canManageEvent } from "@/services/authService";
import { revalidatePath } from "next/cache";
import { logger } from "@/utils/logger";
import {
  withActionErrorHandler,
  UnauthorizedError,
} from "@/lib/utils/actionError";
import { createClient } from "@/lib/supabase/server";

export const saveCertificateConfigAction = withActionErrorHandler(
  async (slug: string, config: CertificateConfig) => {
    if (!(await canManageEvent(slug))) {
      logger.warn(
        `Unauthorized certificate config update attempt for slug: ${slug}`,
      );
      throw new UnauthorizedError(
        "Unauthorized. You must be the event organizer.",
      );
    }

    const supabase = await createClient();

    // Save to database
    const { error } = await supabase
      .from("events")
      .update({ certificate_config: config })
      .eq("slug", slug);

    if (error) {
      throw new Error(
        `Failed to save certificate configuration: ${error.message}`,
      );
    }

    revalidatePath(`/admin/events/${slug}/manage`);
    logger.info(`Successfully saved certificate config for event: ${slug}`);

    return { success: true };
  },
);
