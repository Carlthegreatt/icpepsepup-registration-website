import { useCallback, useTransition } from "react";
import { Guest } from "@/types/guest";
import {
  updateGuestStatusAction,
  deleteGuestAction,
  exportGuestsAction,
  updateGuestIsGoingAction,
} from "@/actions/registrantActions";
import { downloadCSV } from "@/utils/fileDownload";
import { useNotification } from "@/hooks/use-notification";

/**
 * Hook for handling guest actions
 * Coordinates between UI, actions, and services
 */
export function useGuestActions(slug: string, onRefresh: () => void) {
  const [isPending, startTransition] = useTransition();
  const { showSuccess, showError, showConfirm } = useNotification();

  const updateGuestStatusDirect = useCallback(
    async (
      guestId: string,
      newStatus: "registered" | "pending" | "not-going",
    ): Promise<{
      success: boolean;
      error?: string;
      patch?: {
        qr_data?: string | null;
        is_going?: boolean | null;
      };
    }> => {
      let result;
      if (newStatus === "not-going") {
        result = await updateGuestIsGoingAction({ guestId, isGoing: false }, slug);
      } else {
        const isRegistered = newStatus === "registered";
        result = await updateGuestStatusAction({ guestId, isRegistered }, slug);
      }

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Failed to update status",
        };
      }

      const updatedGuest =
        result.data &&
        typeof result.data === "object" &&
        "guest" in result.data &&
        result.data.guest &&
        typeof result.data.guest === "object"
          ? (result.data.guest as {
              qr_data?: string | null;
              is_going?: boolean | null;
            })
          : undefined;

      return {
        success: true,
        patch: {
          qr_data: updatedGuest?.qr_data,
          is_going: updatedGuest?.is_going,
        },
      };
    },
    [slug],
  );

  const handleDeleteGuest = useCallback(
    (guestId: string) => {
      if (!showConfirm("Are you sure you want to remove this guest?")) return;

      startTransition(async () => {
        const result = await deleteGuestAction({ guestId }, slug);

        if (result.success) {
          onRefresh();
          showSuccess("Guest removed successfully");
        } else {
          showError(result.error || "Failed to delete guest");
        }
      });
    },
    [slug, onRefresh, showConfirm, showSuccess, showError],
  );

  const handleStatusChange = useCallback(
    (
      guestId: string,
      newStatus: "registered" | "pending" | "not-going",
      onGuestStatusUpdated?: (
        guestId: string,
        status: "registered" | "pending" | "not-going",
        patch?: {
          qr_data?: string | null;
          is_going?: boolean | null;
        },
      ) => void,
    ) => {
      startTransition(async () => {
        const result = await updateGuestStatusDirect(guestId, newStatus);
        if (result.success) {
          onGuestStatusUpdated?.(guestId, newStatus, result.patch);
          showSuccess("Status updated successfully");
        } else {
          showError(result.error || "Failed to update status");
        }
      });
    },
    [updateGuestStatusDirect, showSuccess, showError],
  );

  const handleExport = useCallback(async () => {
    const result = await exportGuestsAction(slug);
    const csvData =
      result.success &&
      result.data &&
      typeof result.data === "object" &&
      "csvData" in result.data &&
      typeof result.data.csvData === "string"
        ? result.data.csvData
        : null;

    if (csvData) {
      downloadCSV(csvData, `event-guests-${slug}.csv`);
      showSuccess("Guest list exported successfully");
    } else {
      showError(result.error || "Failed to export guests");
    }
  }, [slug, showSuccess, showError]);

  const handleBulkStatusChange = useCallback(
    async (
      guests: Guest[],
      newStatus: "registered" | "pending" | "not-going",
    ) => {
      if (guests.length === 0) return;

      startTransition(async () => {
        const results = await Promise.all(
          guests.map((g) => updateGuestStatusDirect(g.registrant_id, newStatus)),
        );

        const failed = results.filter((r) => !r.success).length;
        if (failed === 0) {
          onRefresh();
          showSuccess(
            `${guests.length} guest${
              guests.length > 1 ? "s" : ""
            } updated successfully`,
          );
        } else {
          onRefresh();
          showError(`${failed} update${failed > 1 ? "s" : ""} failed`);
        }
      });
    },
    [updateGuestStatusDirect, onRefresh, showSuccess, showError],
  );

  return {
    isPending,
    handleDeleteGuest,
    handleStatusChange,
    handleExport,
    handleBulkStatusChange,
    updateGuestStatusDirect,
  };
}
