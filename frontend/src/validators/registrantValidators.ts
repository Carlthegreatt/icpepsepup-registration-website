import { z } from "zod";

export const CreateRegistrantSchema = z.object({
  event_id: z.string().min(1, "Event ID cannot be empty"),
  user_id: z.string().min(1, "User ID cannot be empty"),
  terms_approval: z.boolean().optional(),
  form_answers: z.record(z.string(), z.string()),
});

export type CreateRegistrantInput = z.infer<typeof CreateRegistrantSchema>;

export const UpdateGuestStatusSchema = z.object({
  guestId: z.string().min(1),
  isRegistered: z.boolean(),
});

export const DeleteGuestSchema = z.object({
  guestId: z.string().min(1),
});

// Implement other registrant-related validation schemas here, such as UpdateRegistrantSchema, etc, if there is
