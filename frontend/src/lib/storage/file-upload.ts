import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Upload a file to Supabase Storage and return the public URL
 * @param supabase - The Supabase client instance
 * @param file - The file to upload
 * @param eventSlug - The event slug to organize files
 * @returns The public URL of the uploaded file
 */
export async function uploadRegistrationFile(
  supabase: SupabaseClient,
  file: File,
  eventSlug: string,
): Promise<string> {
  // Create a unique filename with timestamp
  const timestamp = Date.now();
  const fileExt = file.name.split(".").pop();
  const fileName = `${eventSlug}/${timestamp}-${file.name}`;

  // Upload to the 'registration-files' bucket
  const { data, error } = await supabase.storage
    .from("registration-files")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("File upload error:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from("registration-files")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Upload an event cover image to Supabase Storage and return the public URL
 * @param supabase - The Supabase client instance
 * @param file - The file to upload
 * @returns The public URL of the uploaded image
 */
export async function uploadEventCoverImage(
  supabase: SupabaseClient,
  file: File,
): Promise<string> {
  const timestamp = Date.now();
  // Sanitize the filename to prevent URL issues
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${timestamp}-${safeName}`;

  // Upload to the 'event_cover' bucket
  const { data, error } = await supabase.storage
    .from("event_cover")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Event image upload error:", error);
    throw new Error(`Failed to upload event image: ${error.message}`);
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from("event_cover")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
