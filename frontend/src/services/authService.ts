import { findUserByEmail, getUserProfile } from "@/repositories/userRepository";
import { 
  getAuthUser, 
  getUserWithMetadata,
  signInWithPassword,
  signUpUser,
  signOutUser
} from "@/repositories/authRepository";

// Check if email exists
export async function checkEmailExists(email: string): Promise<boolean> {
  if (!email) {
    throw new Error("Email is required");
  }

  const data = await findUserByEmail(email);
  return !!data;
}

// Get user role
export async function getUserRole() {
  const user = await getAuthUser();
  if (!user) {
    return { role: null, userId: null };
  }

  let isAdmin = false;

  const authUser = await getUserWithMetadata(user.id);
  if (authUser) {
    const appRole = (authUser.app_metadata?.role as string) ?? null;
    const jwtRole = authUser.role ?? null;
    isAdmin = appRole === "admin" || jwtRole === "admin";
  }

  if (!isAdmin) {
    const profile = await getUserProfile(user.id);
    isAdmin = (profile?.role as string) === "admin";
  }

  return {
    role: isAdmin ? "admin" : "user",
    userId: user.id,
  };
}

// Check if user can manage event - Admin or Organizer
export async function canManageEvent(slug: string): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) return false;

  const authUser = await getUserWithMetadata(user.id);
  if (authUser) {
    const appRole = (authUser.app_metadata?.role as string) ?? null;
    const jwtRole = authUser.role ?? null;
    if (appRole === "admin" || jwtRole === "admin") return true;
  }

  try {
    const { getOrganizerIdBySlug } = await import("@/repositories/eventRepository");
    const event = await getOrganizerIdBySlug(slug);
    return event?.organizer_id === user.id;
  } catch {
    return false;
  }
}

// Login User
export async function loginUser(email: string, password: string) {
  await signInWithPassword(email, password);
  return { success: true };
}

// Register User
export async function registerUser(firstName: string, lastName: string, email: string, password: string) {
  const data = await signUpUser(email, password, firstName, lastName);
  return data;
}

// Logout User
export async function logoutUser() {
  await signOutUser();
  return { success: true };
}
