"use server";

import { z } from "zod";
import { getUserInfo } from "@/services/userService";
import { logger } from "@/utils/logger";

const UserIdSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export async function getUserInfoAction(data: unknown) {
  try {
    // Validate input
    const validatedData = UserIdSchema.parse(data);
    
    // Get user info from service layer
    const userInfo = await getUserInfo(validatedData.userId);
    
    if (!userInfo) {
      logger.warn("User not found", { userId: validatedData.userId });
      return { success: false, error: "User not found" };
    }
    
    logger.info("Successfully fetched user info", { userId: validatedData.userId });
    return { success: true, data: userInfo };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ");
      logger.error("User info validation failed", { errors: error.issues });
      return { success: false, error: `Validation error: ${errorMessage}` };
    }
    
    const errorMessage = error instanceof Error ? error.message : "Failed to get user info";
    logger.error("Failed to get user info", error);
    return { success: false, error: errorMessage };
  }
}
