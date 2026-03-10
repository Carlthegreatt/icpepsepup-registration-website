import { createClient } from "@/lib/supabase/server";

export async function findUserByEmail(email: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("users_id")
    .ilike("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to find user by email: ${error.message}`);
  }

  return data;
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("users_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get user profile: ${error.message}`);
  }

  return data;
}

// Implement other user-related repository functions here, such as createUser, updateUser, deleteUser, listUsers, etc, if there is
