import type { Guest } from "@/types/guest";

type GuestsTabProps = {
  guests: Guest[];
  filteredGuests: Guest[];
  totalCount: number;
};

export default function GuestsTab({ guests, filteredGuests, totalCount }: GuestsTabProps) {
  return (
    <div className="space-y-4" id="tutorial-guests-stack">
      <section className="rounded-lg border border-primary/20 bg-white p-4" id="tutorial-guest-summary">
        <h2 className="text-lg font-semibold text-primary">Recipients</h2>
        <p className="text-sm text-secondary">
          This list is pulled directly from the Guests tab for the current event. Update guests there, then return here to send.
        </p>
        <div className="text-xs text-secondary mt-2">Total recipients: {totalCount}</div>
      </section>
      <section className="rounded-lg border border-primary/20 bg-white overflow-hidden" id="tutorial-guest-table">
        {filteredGuests.length === 0 ? (
          <div className="p-6 text-sm text-secondary">
            {guests.length === 0
              ? "No guests yet. Add or import guests in the Guests tab to enable batch mail."
              : "No guests match the selected recipient filters."}
          </div>
        ) : (
          <div className="max-h-[380px] overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-white-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-primary">Name</th>
                  <th className="px-4 py-2 text-left font-semibold text-primary">Email</th>
                  <th className="px-4 py-2 text-left font-semibold text-primary">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <tr key={guest.registrant_id} className="border-t border-primary/10">
                    <td className="px-4 py-2 text-secondary">
                      {guest.users?.first_name || "N/A"} {guest.users?.last_name || ""}
                    </td>
                    <td className="px-4 py-2 text-secondary">{guest.users?.email || "No email"}</td>
                    <td className="px-4 py-2 text-secondary">
                      {guest.is_registered ? "Registered" : "Pending"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
