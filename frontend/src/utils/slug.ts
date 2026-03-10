/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns URL-friendly slug with timestamp for uniqueness
 */
export function generateSlug(text: string): string {
  const baseSlug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  
  // Add timestamp for uniqueness
  const timestamp = Date.now();
  
  return baseSlug ? `${baseSlug}-${timestamp}` : `event-${timestamp}`;
}

/**
 * Validate if a string is a valid slug format
 * @param slug - The slug to validate
 * @returns true if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
}
