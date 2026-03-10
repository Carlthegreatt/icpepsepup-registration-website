import type { ParsedCsv } from "@/components/ui/CsvUploader";
import type { Guest } from "@/types/guest";

export const buildGuestCsv = (guests: Guest[]): ParsedCsv | null => {
  if (!guests || guests.length === 0) return null;
  const headers = [
    "registrant_id",
    "event_id",
    "email",
    "first_name",
    "last_name",
    "name",
    "terms_approval",
    "is_registered",
  ];
  const rows = guests.map((guest) => ({
    registrant_id: guest.registrant_id,
    event_id: guest.event_id,
    email: guest.users?.email || "",
    first_name: guest.users?.first_name || "",
    last_name: guest.users?.last_name || "",
    name: `${guest.users?.first_name || ""} ${guest.users?.last_name || ""}`.trim(),
    terms_approval: guest.terms_approval ? "true" : "false",
    is_registered: guest.is_registered ? "true" : "false",
  }));
  return { headers, rows, rowCount: rows.length };
};
