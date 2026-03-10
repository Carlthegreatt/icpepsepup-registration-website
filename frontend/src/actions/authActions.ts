"use server";

import { CheckEmailSchema } from "@/validators/authValidators";
import { checkEmailExists, getUserRole } from "@/services/authService";
import { logger } from "@/utils/logger";
import { withActionErrorHandler } from "@/lib/utils/actionError";

// check email action
export const checkEmailAction = withActionErrorHandler(
  async (data: { email: string }) => {
    // Validate email - Zod
    const validatedData = CheckEmailSchema.parse(data);

    // Check if exists
    const exists = await checkEmailExists(validatedData.email);
    logger.info(`Checked email existence for ${validatedData.email}`);

    return { exists };
  },
);

// get user role action
export const getUserRoleAction = withActionErrorHandler(async () => {
  const data = await getUserRole();
  logger.info(`Fetched user role: ${data.role}`);
  return data;
});

// login action
export const loginAction = withActionErrorHandler(
  async (prevState: AuthResult | null, formData: FormData) => {
    const email = (formData.get("email") as string)?.trim() ?? "";
    const password = (formData.get("password") as string) ?? "";

    const { loginUser } = await import("@/services/authService");
    const { LoginSchema } = await import("@/validators/authValidators");

    LoginSchema.parse({ email, password });
    await loginUser(email, password);

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/", "layout");

    logger.info(`User logged in with email: ${email}`);
  },
);

// register action
export const registerAction = withActionErrorHandler(
  async (prevState: AuthResult | null, formData: FormData) => {
    const firstName = (formData.get("firstName") as string)?.trim() ?? "";
    const lastName = (formData.get("lastName") as string)?.trim() ?? "";
    const email = (formData.get("email") as string)?.trim() ?? "";
    const password = (formData.get("password") as string) ?? "";

    const { registerUser } = await import("@/services/authService");
    const { RegisterSchema } = await import("@/validators/authValidators");

    RegisterSchema.parse({ firstName, lastName, email, password });
    const data = await registerUser(firstName, lastName, email, password);

    if (data?.user) {
      const { revalidatePath } = await import("next/cache");
      const { redirect } = await import("next/navigation");

      revalidatePath("/", "layout");
      logger.info(`New user registered with email: ${email}`);
      const next = (formData.get("next") as string)?.trim();
      if (next && next.startsWith("/") && !next.startsWith("//")) {
        redirect(next);
      }
      redirect("/?registered=1");
    } else {
      throw new Error("Something went wrong. Please try again.");
    }
  },
);

// auth result type
export type AuthResult = { error?: string; success?: boolean };

// logout action
export const logoutAction = withActionErrorHandler(async () => {
  const { logoutUser } = await import("@/services/authService");
  await logoutUser();

  // It's important to revalidate so layout knows the user is logged out
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/", "layout");

  logger.info("User logged out successfully");
});
