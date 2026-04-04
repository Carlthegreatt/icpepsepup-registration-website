"use client";

import { useState } from "react";
import { Guest } from "@/types/guest";
import { EventData } from "@/types/event";
import { useGuestSelection } from "@/hooks/guest/use-guest-selection";
import { useGuestFilter } from "@/hooks/guest/use-guest-filter";
import { useGuestActions } from "@/hooks/guest/use-guest-actions";
import { QRScannerModal } from "../QRScannerModal";
import { GuestAnswersModal } from "./GuestAnswersModal";
import { GuestListHeader } from "./GuestListHeader";
import { GuestListSearchFilter } from "./GuestListSearchFilter";
import { GuestTableHeader } from "./GuestTableHeader";
import { GuestTableRow } from "./GuestTableRow";
import { GuestListEmpty } from "./GuestListEmpty";
import { BulkActionConfirmModal } from "./BulkActionConfirmModal";
import { useNotification } from "@/hooks/use-notification";

interface GuestListSectionProps {
  guests: Guest[];
  slug: string;
  onRefresh: () => void;
  event: EventData;
  onGuestStatusUpdated: (
    guestId: string,
    status: "registered" | "pending" | "not-going",
    patch?: {
      qr_data?: string | null;
      is_going?: boolean | null;
    },
  ) => void;
}

export function GuestListSection({
  guests,
  slug,
  onRefresh,
  event,
  onGuestStatusUpdated,
}: GuestListSectionProps) {
  type StatusQueueItem = {
    guestId: string;
    name: string;
    status: "queued" | "updating" | "updated" | "error";
    error?: string;
  };

  type ExportColumnOption = {
    key: string;
    label: string;
    category: "base" | "question";
  };

  type NameOrderOption = "first-name-first" | "last-name-first";
  type MiddleNameOption = "full" | "initial" | "none";

  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [showAnswersModal, setShowAnswersModal] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<
    "registered" | "pending" | "not-going"
  >("registered");
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [showStatusQueueModal, setShowStatusQueueModal] = useState(false);
  const [statusQueueItems, setStatusQueueItems] = useState<StatusQueueItem[]>(
    [],
  );
  const [statusQueueError, setStatusQueueError] = useState<string | null>(null);
  const [isQueueUpdating, setIsQueueUpdating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportColumns, setExportColumns] = useState<ExportColumnOption[]>([]);
  const [selectedExportColumns, setSelectedExportColumns] = useState<string[]>(
    [],
  );
  const [nameOrder, setNameOrder] =
    useState<NameOrderOption>("first-name-first");
  const [middleNameOption, setMiddleNameOption] =
    useState<MiddleNameOption>("full");
  const [includeSuffixInName, setIncludeSuffixInName] = useState(true);

  const { showSuccess, showError } = useNotification();

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredGuests,
  } = useGuestFilter(guests);

  const {
    selectedGuestIds,
    showSelectMenu,
    handleSelectAll,
    handleSelectByStatus,
    handleSelectGuest,
    clearSelection,
    toggleSelectMenu,
  } = useGuestSelection();

  const {
    isPending,
    handleDeleteGuest,
    handleStatusChange,
    handleExport,
    updateGuestStatusDirect,
    handleCheckIn,
    handleGoingChange,
  } = useGuestActions(slug, onRefresh);

  const selectedGuests = guests.filter((g) =>
    selectedGuestIds.has(g.registrant_id),
  );

  const allSelected =
    filteredGuests.length > 0 &&
    filteredGuests.every((g: Guest) => selectedGuestIds.has(g.registrant_id));

  const someSelected = selectedGuestIds.size > 0 && !allSelected;
  const isBusy = isPending || isQueueUpdating;

  const getGuestDisplayName = (guest: Guest) => {
    const fullName =
      `${guest.users?.first_name || ""} ${guest.users?.last_name || ""}`.trim();
    if (fullName) return fullName;
    return guest.users?.email || guest.registrant_id;
  };

  const runQueuedStatusUpdate = async (
    targetGuests: Guest[],
    status: "registered" | "pending" | "not-going",
  ) => {
    if (targetGuests.length === 0) return;

    setShowStatusQueueModal(true);
    setStatusQueueError(null);
    setIsQueueUpdating(true);
    setStatusQueueItems(
      targetGuests.map((guest) => ({
        guestId: guest.registrant_id,
        name: getGuestDisplayName(guest),
        status: "queued",
      })),
    );

    targetGuests.forEach((guest) => {
      onGuestStatusUpdated(
        guest.registrant_id,
        status,
        status === "not-going" ? { is_going: false } : undefined,
      );
    });

    let failed = 0;
    try {
      for (const guest of targetGuests) {
        setStatusQueueItems((prev) =>
          prev.map((item) =>
            item.guestId === guest.registrant_id
              ? { ...item, status: "updating", error: undefined }
              : item,
          ),
        );

        const result = await updateGuestStatusDirect(
          guest.registrant_id,
          status,
        );
        if (result.success) {
          onGuestStatusUpdated(guest.registrant_id, status, result.patch);
          setStatusQueueItems((prev) =>
            prev.map((item) =>
              item.guestId === guest.registrant_id
                ? { ...item, status: "updated", error: undefined }
                : item,
            ),
          );
        } else {
          failed += 1;
          setStatusQueueItems((prev) =>
            prev.map((item) =>
              item.guestId === guest.registrant_id
                ? {
                    ...item,
                    status: "error",
                    error: result.error || "Failed to update status",
                  }
                : item,
            ),
          );
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unexpected status update error";
      setStatusQueueError(message);
      showError(message);
    } finally {
      setIsQueueUpdating(false);
      onRefresh();
    }

    if (failed === 0) {
      showSuccess(
        `${targetGuests.length} guest${
          targetGuests.length > 1 ? "s" : ""
        } updated successfully`,
      );
    } else {
      const message = `${failed} update${failed > 1 ? "s" : ""} failed`;
      setStatusQueueError(message);
      showError(message);
    }
  };

  const handleRowStatusChange = (
    guestId: string,
    status: "registered" | "pending" | "not-going",
  ) => {
    const shouldApplyToAllSelected =
      selectedGuestIds.size > 1 && selectedGuestIds.has(guestId);

    if (!shouldApplyToAllSelected) {
      handleStatusChange(guestId, status, onGuestStatusUpdated);
      return;
    }

    void runQueuedStatusUpdate(selectedGuests, status);
    clearSelection();
  };

  const openExportModal = () => {
    if (filteredGuests.length === 0) {
      showError("No guests to export");
      return;
    }

    const baseColumns: ExportColumnOption[] = [
      { key: "name", label: "Name", category: "base" },
      { key: "email", label: "Email", category: "base" },
      { key: "status", label: "Status", category: "base" },
      { key: "going", label: "Going", category: "base" },
      { key: "registeredAt", label: "Registered At", category: "base" },
      { key: "checkedIn", label: "Checked In", category: "base" },
      { key: "termsAccepted", label: "Terms Accepted", category: "base" },
    ];

    const questionKeys = Array.from(
      new Set(
        filteredGuests.flatMap((guest) =>
          guest.form_answers ? Object.keys(guest.form_answers) : [],
        ),
      ),
    );

    const questionColumns: ExportColumnOption[] = questionKeys.map(
      (question) => ({
        key: `question:${question}`,
        label: question,
        category: "question",
      }),
    );

    const nextColumns = [...baseColumns, ...questionColumns];
    setExportColumns(nextColumns);
    setSelectedExportColumns(nextColumns.map((column) => column.key));
    setNameOrder("first-name-first");
    setMiddleNameOption("full");
    setIncludeSuffixInName(true);
    setShowExportModal(true);
  };

  const toggleExportColumn = (columnKey: string) => {
    setSelectedExportColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey],
    );
  };

  const handleConfirmExport = () => {
    if (selectedExportColumns.length === 0) {
      showError("Please select at least one column");
      return;
    }

    handleExport(filteredGuests, selectedExportColumns, {
      order: nameOrder,
      middleName: middleNameOption,
      includeSuffix: includeSuffixInName,
    });
    setShowExportModal(false);
  };

  const isNameColumnSelected = selectedExportColumns.includes("name");

  return (
    <>
      <BulkActionConfirmModal
        isOpen={showBulkConfirm}
        count={selectedGuests.length}
        status={bulkStatus}
        isLoading={isBusy}
        onConfirm={() => {
          setShowBulkConfirm(false);
          void runQueuedStatusUpdate(selectedGuests, bulkStatus);
          clearSelection();
        }}
        onClose={() => !isBusy && setShowBulkConfirm(false)}
      />
      {showExportModal && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowExportModal(false)}
          />
          <div className="relative z-[230] w-full max-w-2xl overflow-hidden rounded-2xl bg-[#1a140a] border border-amber-700/30 shadow-2xl p-5 font-urbanist">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-white text-lg font-semibold">
                Export CSV Columns
              </h2>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/15 text-white/80 hover:text-white hover:bg-white/5"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-white/70 mb-3">
              Select the columns you want to include in the CSV export.
            </p>

            <div className="mb-3 rounded-xl border border-amber-700/30 bg-white/[0.02] p-3">
              <p className="text-xs text-yellow-300/90 uppercase tracking-wider font-semibold mb-2">
                Name Format
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/60 mb-1">
                    Order
                  </label>
                  <select
                    value={nameOrder}
                    onChange={(e) =>
                      setNameOrder(e.target.value as NameOrderOption)
                    }
                    disabled={!isNameColumnSelected}
                    className="w-full rounded-lg border border-white/15 bg-[#1a140a] px-2.5 py-2 text-xs text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="first-name-first">First Name First</option>
                    <option value="last-name-first">Last Name First</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/60 mb-1">
                    Middle Name
                  </label>
                  <select
                    value={middleNameOption}
                    onChange={(e) =>
                      setMiddleNameOption(e.target.value as MiddleNameOption)
                    }
                    disabled={!isNameColumnSelected}
                    className="w-full rounded-lg border border-white/15 bg-[#1a140a] px-2.5 py-2 text-xs text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="full">Full Middle Name</option>
                    <option value="initial">Middle Initial Only</option>
                    <option value="none">No Middle Name</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 px-2.5 py-2 rounded-lg border border-white/15 w-full text-xs text-white/80">
                    <input
                      type="checkbox"
                      checked={includeSuffixInName}
                      onChange={(e) => setIncludeSuffixInName(e.target.checked)}
                      disabled={!isNameColumnSelected}
                      className="h-4 w-4 rounded border-white/20 bg-transparent text-amber-500 focus:ring-amber-500/50 disabled:opacity-50"
                    />
                    Include Suffix
                  </label>
                </div>
              </div>

              {!isNameColumnSelected && (
                <p className="text-[10px] text-white/50 mt-2">
                  Enable the Name column to apply name formatting options.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedExportColumns(
                      exportColumns.map((column) => column.key),
                    )
                  }
                  className="px-2.5 py-1 rounded-md text-xs border border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedExportColumns([])}
                  className="px-2.5 py-1 rounded-md text-xs border border-white/15 text-white/70 hover:bg-white/5"
                >
                  Clear all
                </button>
              </div>
              <span className="text-xs text-white/60">
                {selectedExportColumns.length} / {exportColumns.length} selected
              </span>
            </div>

            <div className="max-h-72 overflow-auto border border-amber-700/30 rounded-xl p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {exportColumns.map((column) => {
                  const isChecked = selectedExportColumns.includes(column.key);
                  return (
                    <label
                      key={column.key}
                      className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? "border-amber-500/40 bg-amber-500/10"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleExportColumn(column.key)}
                          className="h-4 w-4 rounded border-white/20 bg-transparent text-amber-500 focus:ring-amber-500/50"
                        />
                        <span className="text-white/90 truncate">{column.label}</span>
                      </div>
                      {column.category === "question" && (
                        <span className="text-[10px] uppercase tracking-wider text-yellow-200/60">
                          Custom
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-lg text-xs border border-white/15 text-white/80 hover:text-white hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExport}
                disabled={selectedExportColumns.length === 0}
                className="px-4 py-2 rounded-lg text-xs bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}
      {showStatusQueueModal && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (!isQueueUpdating) setShowStatusQueueModal(false);
            }}
          />
          <div className="relative z-[230] w-full max-w-2xl overflow-hidden rounded-2xl bg-[#1a140a] border border-amber-700/30 shadow-2xl p-5 font-urbanist">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-white text-lg font-semibold">
                {isQueueUpdating
                  ? "Updating Guests..."
                  : "Status Update Summary"}
              </h2>
              <button
                type="button"
                onClick={() => setShowStatusQueueModal(false)}
                disabled={isQueueUpdating}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/15 text-white/80 hover:text-white hover:bg-white/5 disabled:opacity-50"
              >
                Close
              </button>
            </div>

            {statusQueueError && (
              <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs px-3 py-2">
                {statusQueueError}
              </div>
            )}

            <div className="text-xs text-white/70 mb-3">
              Updated:{" "}
              <span className="text-emerald-300">
                {
                  statusQueueItems.filter((item) => item.status === "updated")
                    .length
                }
              </span>
              {" | "}
              Failed:{" "}
              <span className="text-rose-300">
                {
                  statusQueueItems.filter((item) => item.status === "error")
                    .length
                }
              </span>
              {" | "}
              Remaining:{" "}
              <span className="text-cyan-300">
                {
                  statusQueueItems.filter(
                    (item) =>
                      item.status === "queued" || item.status === "updating",
                  ).length
                }
              </span>
            </div>

            <div className="max-h-72 overflow-auto border border-amber-700/30 rounded-xl">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[#2a210f] text-white/70">
                  <tr>
                    <th className="text-left px-3 py-2">Guest</th>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {statusQueueItems.map((item) => (
                    <tr key={item.guestId} className="border-t border-white/5">
                      <td className="px-3 py-2 text-white/85">{item.name}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded border ${
                            item.status === "updated"
                              ? "border-emerald-400/40 text-emerald-300"
                              : item.status === "error"
                                ? "border-rose-400/40 text-rose-300"
                                : item.status === "updating"
                                  ? "border-cyan-400/40 text-cyan-300"
                                  : "border-white/20 text-white/70"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-rose-300/90">
                        {item.error || ""}
                      </td>
                    </tr>
                  ))}
                  {isQueueUpdating && statusQueueItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 py-6 text-center text-white/50"
                      >
                        Preparing queue...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        eventSlug={slug}
        onCheckInSuccess={onRefresh}
      />

      {/* Answers Modal */}
      {showAnswersModal && selectedGuest && (
        <GuestAnswersModal
          guest={selectedGuest}
          event={event}
          onClose={() => {
            setShowAnswersModal(false);
            setSelectedGuest(null);
          }}
        />
      )}

      <div className="bg-gradient-to-br from-[#2a210f]/50 via-[#1a140a]/45 to-[#241b0d]/50 backdrop-blur-md rounded-xl border border-amber-700/30 overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-amber-700/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="font-semibold text-white">Attendee Guest List</h4>
              <p className="text-sm text-white/50 mt-0.5">
                Manage registrations, check-in status, and export
              </p>
            </div>
            <GuestListHeader
              guestCount={filteredGuests.length}
              onExport={openExportModal}
              onCheckIn={() => setIsScannerOpen(true)}
            />
          </div>

          {/* Search and Filter Bar */}
          <GuestListSearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>

        {/* Guest List Content */}
        <div className="p-4 md:p-6">
          {/* Bulk Action Bar */}
          {selectedGuestIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-white/5 border border-white/10 rounded-xl">
              <span className="font-urbanist text-sm text-white/70">
                {selectedGuestIds.size} selected
              </span>
              <select
                value={bulkStatus}
                onChange={(e) =>
                  setBulkStatus(
                    e.target.value as "registered" | "pending" | "not-going",
                  )
                }
                disabled={isBusy}
                className="font-urbanist px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 cursor-pointer"
              >
                <option
                  value="registered"
                  className="bg-[#1a140a] text-green-400"
                >
                  Set as Registered
                </option>
                <option
                  value="pending"
                  className="bg-[#1a140a] text-yellow-400"
                >
                  Set as Pending
                </option>
                <option value="not-going" className="bg-[#1a140a] text-red-400">
                  Set as Not Going
                </option>
              </select>
              <button
                onClick={() => setShowBulkConfirm(true)}
                disabled={isBusy}
                className="font-urbanist px-4 py-1.5 bg-amber-600/80 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
              >
                Apply
              </button>
              <button
                onClick={clearSelection}
                disabled={isBusy}
                className="font-urbanist px-3 py-1.5 text-white/40 hover:text-white/70 text-sm transition-colors disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          )}
          {filteredGuests.length === 0 ? (
            <GuestListEmpty hasGuests={guests.length > 0} />
          ) : (
            /* Guest Table */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <GuestTableHeader
                  allSelected={allSelected}
                  someSelected={someSelected}
                  onSelectAll={(checked) =>
                    handleSelectAll(filteredGuests, checked)
                  }
                  showSelectMenu={showSelectMenu}
                  onToggleSelectMenu={toggleSelectMenu}
                  onSelectByStatus={(status) =>
                    handleSelectByStatus(filteredGuests, status)
                  }
                  onDeselectAll={clearSelection}
                />
                <tbody>
                  {filteredGuests.map((guest: Guest) => (
                    <GuestTableRow
                      key={guest.registrant_id}
                      guest={guest}
                      isSelected={selectedGuestIds.has(guest.registrant_id)}
                      isPending={isBusy}
                      onSelectGuest={handleSelectGuest}
                      onStatusChange={handleRowStatusChange}
                      onCheckInChange={handleCheckIn}
                      onGoingChange={handleGoingChange}
                      onViewAnswers={(g) => {
                        setSelectedGuest(g);
                        setShowAnswersModal(true);
                      }}
                      onDelete={handleDeleteGuest}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
