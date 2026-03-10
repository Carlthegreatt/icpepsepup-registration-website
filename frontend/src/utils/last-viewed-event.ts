const STORAGE_KEY = "lastViewedEventSlug";

export function getLastViewedEventSlug(): string | null {
  if (typeof window === "undefined") return null;
  const slug = localStorage.getItem(STORAGE_KEY);
  return slug && slug.length > 0 ? slug : null;
}

export function setLastViewedEventSlug(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, slug);
  } catch {
    // ignore
  }
}
