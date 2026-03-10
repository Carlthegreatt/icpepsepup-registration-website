/**
 * Utility functions for file downloads
 */

export function downloadCSV(csvData: string, filename: string): void {
  const blob = new Blob([csvData], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function downloadFile(blob: Blob, filename: string, mimeType: string): void {
  const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
