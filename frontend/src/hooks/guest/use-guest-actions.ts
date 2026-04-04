import { useCallback, useTransition } from "react";
import { Guest } from "@/types/guest";
import {
  updateGuestStatusAction,
  deleteGuestAction,
  updateGuestIsGoingAction,
  updateGuestCheckInAction,
} from "@/actions/registrantActions";
import { downloadCSV } from "@/utils/fileDownload";
import { useNotification } from "@/hooks/use-notification";

type NameOrderOption = "first-name-first" | "last-name-first";
type MiddleNameOption = "full" | "initial" | "none";

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
        result = await updateGuestIsGoingAction(
          { guestId, isGoing: false },
          slug,
        );
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

  const handleExport = useCallback(
    (
      guestsToExport: Guest[],
      selectedColumns?: string[],
      nameFormatOptions?: {
        order?: NameOrderOption;
        middleName?: MiddleNameOption;
        includeSuffix?: boolean;
      },
    ) => {
      if (guestsToExport.length === 0) {
        showError("No guests to export");
        return;
      }

      const effectiveNameFormat = {
        order: nameFormatOptions?.order ?? "first-name-first",
        middleName: nameFormatOptions?.middleName ?? "full",
        includeSuffix: nameFormatOptions?.includeSuffix ?? true,
      };

      const allQuestionKeys = Array.from(
        new Set(
          guestsToExport.flatMap((guest) =>
            guest.form_answers ? Object.keys(guest.form_answers) : [],
          ),
        ),
      );

      const getStatusLabel = (guest: Guest) => {
        if (!guest.is_registered) return "Pending";
        if (guest.is_going === false) return "Not Going";
        return "Registered";
      };

      const getGoingLabel = (guest: Guest) => {
        if (!guest.is_registered) return "-";
        if (guest.is_going === true) return "Going";
        if (guest.is_going === false) return "Not Going";
        return "-";
      };

      const formatRegisteredAt = (value?: string | null) => {
        if (!value) return "";
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleString("en-PH", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
      };

      const escapeCell = (value: unknown) =>
        `"${String(value ?? "").replace(/"/g, '""')}"`;

      const normalizeKey = (value: string) =>
        value.toLowerCase().replace(/[^a-z0-9]/g, "");

      const getFormAnswerValue = (guest: Guest, candidateKeys: string[]) => {
        const normalizedCandidates = candidateKeys.map(normalizeKey);
        const formEntries = Object.entries(guest.form_answers || {});
        const matched = formEntries.find(([key]) =>
          normalizedCandidates.includes(normalizeKey(key)),
        );
        return typeof matched?.[1] === "string" ? matched[1].trim() : "";
      };

      const formatMiddleName = (middleName: string) => {
        if (!middleName) return "";
        if (effectiveNameFormat.middleName === "none") return "";
        if (effectiveNameFormat.middleName === "initial") {
          const initial = middleName.trim().charAt(0).toUpperCase();
          return initial ? `${initial}.` : "";
        }
        return middleName.trim();
      };

      const formatGuestName = (guest: Guest) => {
        const firstName =
          getFormAnswerValue(guest, [
            "First Name",
            "FirstName",
            "Given Name",
            "GivenName",
          ]) || guest.users?.first_name || "";
        const middleNameRaw = getFormAnswerValue(guest, [
          "Middle Name",
          "MiddleName",
          "Middle Initial",
          "MiddleInitial",
          "MI",
          "M.I.",
        ]);
        const lastName =
          getFormAnswerValue(guest, [
            "Last Name",
            "LastName",
            "Surname",
            "Family Name",
            "FamilyName",
          ]) || guest.users?.last_name || "";
        const suffixRaw = getFormAnswerValue(guest, [
          "Suffix",
          "Name Suffix",
          "NameSuffix",
        ]);

        const middleName = formatMiddleName(middleNameRaw);
        const suffix = effectiveNameFormat.includeSuffix ? suffixRaw : "";

        if (effectiveNameFormat.order === "last-name-first") {
          const trailing = [firstName, middleName, suffix]
            .map((value) => value.trim())
            .filter(Boolean)
            .join(" ");

          if (lastName && trailing) {
            return `${lastName}, ${trailing}`;
          }

          const fallbackLastFirst = [lastName, firstName, middleName, suffix]
            .map((value) => value.trim())
            .filter(Boolean)
            .join(" ");
          return fallbackLastFirst || guest.users?.email || guest.registrant_id;
        }

        const fallbackFirstLast = [firstName, middleName, lastName, suffix]
          .map((value) => value.trim())
          .filter(Boolean)
          .join(" ");
        return fallbackFirstLast || guest.users?.email || guest.registrant_id;
      };

      const baseColumnDefs = [
        {
          key: "name",
          header: "Name",
          getValue: (guest: Guest) => formatGuestName(guest),
        },
        {
          key: "email",
          header: "Email",
          getValue: (guest: Guest) => guest.users?.email || "",
        },
        {
          key: "status",
          header: "Status",
          getValue: (guest: Guest) => getStatusLabel(guest),
        },
        {
          key: "going",
          header: "Going",
          getValue: (guest: Guest) => getGoingLabel(guest),
        },
        {
          key: "registeredAt",
          header: "Registered At",
          getValue: (guest: Guest) => formatRegisteredAt(guest.created_at),
        },
        {
          key: "checkedIn",
          header: "Checked In",
          getValue: (guest: Guest) => (guest.check_in ? "Yes" : "No"),
        },
        {
          key: "termsAccepted",
          header: "Terms Accepted",
          getValue: (guest: Guest) => (guest.terms_approval ? "Yes" : "No"),
        },
      ];

      const questionColumnDefs = allQuestionKeys.map((question) => ({
        key: `question:${question}`,
        header: question,
        getValue: (guest: Guest) => guest.form_answers?.[question] ?? "",
      }));

      const allColumnDefs = [...baseColumnDefs, ...questionColumnDefs];
      const selectedKeySet = new Set(
        selectedColumns && selectedColumns.length > 0
          ? selectedColumns
          : allColumnDefs.map((column) => column.key),
      );
      const activeColumnDefs = allColumnDefs.filter((column) =>
        selectedKeySet.has(column.key),
      );

      if (activeColumnDefs.length === 0) {
        showError("Please select at least one column to export");
        return;
      }

      const headers = activeColumnDefs.map((column) => column.header);
      const rows = guestsToExport.map((guest) =>
        activeColumnDefs.map((column) => column.getValue(guest)),
      );

      const csvData = [
        headers.join(","),
        ...rows.map((row) => row.map(escapeCell).join(",")),
      ].join("\n");

      downloadCSV(csvData, `event-guests-${slug}.csv`);
      showSuccess(
        `Exported ${guestsToExport.length} guest${
          guestsToExport.length > 1 ? "s" : ""
        }`,
      );
    },
    [slug, showSuccess, showError],
  );

  const handleBulkStatusChange = useCallback(
    async (
      guests: Guest[],
      newStatus: "registered" | "pending" | "not-going",
    ) => {
      if (guests.length === 0) return;

      startTransition(async () => {
        const results = await Promise.all(
          guests.map((g) =>
            updateGuestStatusDirect(g.registrant_id, newStatus),
          ),
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

  const handleCheckIn = useCallback(
    (guestId: string, checkedIn: boolean) => {
      startTransition(async () => {
        const result = await updateGuestCheckInAction(
          { guestId, checkedIn },
          slug,
        );

        if (result.success) {
          onRefresh();
          showSuccess(checkedIn ? "Guest checked in" : "Check-in removed");
        } else {
          showError(result.error || "Failed to update check-in status");
        }
      });
    },
    [slug, onRefresh, showSuccess, showError],
  );

  const handleGoingChange = useCallback(
    (guestId: string, isGoing: boolean) => {
      startTransition(async () => {
        const result = await updateGuestIsGoingAction(
          { guestId, isGoing },
          slug,
        );

        if (result.success) {
          onRefresh();
          showSuccess(
            isGoing
              ? "Guest status updated to Going"
              : "Guest status updated to Not Going",
          );
        } else {
          showError(result.error || "Failed to update going status");
        }
      });
    },
    [slug, onRefresh, showSuccess, showError],
  );

  return {
    isPending,
    handleDeleteGuest,
    handleStatusChange,
    handleExport,
    handleBulkStatusChange,
    updateGuestStatusDirect,
    handleCheckIn,
    handleGoingChange,
  };
}
