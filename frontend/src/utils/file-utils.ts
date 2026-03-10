/**
 * Read a file as a base64 data URL
 * @param file The file to read
 * @returns Promise that resolves with the base64 data URL string
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Parse datetime-local input value into separate date and time strings
 * @param value The datetime-local input value (format: YYYY-MM-DDTHH:MM)
 * @returns Object with date and time strings, or null if invalid
 */
export function parseDateTimeInput(value: string): { date: string; time: string } | null {
  if (!value) return null;
  const [date, time] = value.split("T");
  if (!date || !time) return null;
  return { date, time };
}
