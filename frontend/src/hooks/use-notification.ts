import { useCallback } from "react";

/**
 * Hook for displaying user notifications
 * TODO: Replace with proper toast notification library (e.g., react-hot-toast, sonner)
 */
export function useNotification() {
  const showSuccess = useCallback((message: string) => {
    // TODO: Replace with toast notification
    alert(message);
  }, []);

  const showError = useCallback((message: string) => {
    // TODO: Replace with toast notification
    alert(message);
  }, []);

  const showConfirm = useCallback((message: string): boolean => {
    // TODO: Replace with proper modal confirmation
    return confirm(message);
  }, []);

  return {
    showSuccess,
    showError,
    showConfirm,
  };
}
