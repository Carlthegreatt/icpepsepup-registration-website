import { Eye, Trash2, QrCode } from "lucide-react";
import { Guest } from "@/types/guest";

interface GuestTableRowProps {
  guest: Guest;
  isSelected: boolean;
  isPending: boolean;
  onSelectGuest: (guestId: string, checked: boolean) => void;
  onStatusChange: (guestId: string, newStatus: string) => void;
  onViewAnswers: (guest: Guest) => void;
  onGenerateQR: (guest: Guest) => void;
  onDelete: (guestId: string) => void;
}

export function GuestTableRow({
  guest,
  isSelected,
  isPending,
  onSelectGuest,
  onStatusChange,
  onViewAnswers,
  onGenerateQR,
  onDelete,
}: GuestTableRowProps) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="py-4 px-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectGuest(guest.registrant_id, e.target.checked)}
          className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
        />
      </td>
      <td className="font-urbanist text-white text-sm py-4 px-2">
        <div>
          <p className="font-medium">
            {guest.users?.first_name || 'N/A'} {guest.users?.last_name || ''}
          </p>
          <p className="text-xs text-white/60 md:hidden">
            {guest.users?.email || 'No email'}
          </p>
        </div>
      </td>
      <td className="font-urbanist text-white/80 text-sm py-4 px-2 hidden md:table-cell">
        {guest.users?.email || 'No email'}
      </td>
      <td className="font-urbanist text-white/80 text-sm py-4 px-2 hidden lg:table-cell">
        {guest.terms_approval ? (
          <span className="text-green-400">Yes</span>
        ) : (
          <span className="text-red-400">No</span>
        )}
      </td>
      <td className="py-4 px-2">
        <select
          value={guest.is_registered ? "registered" : "pending"}
          onChange={(e) => onStatusChange(guest.registrant_id, e.target.value)}
          disabled={isPending}
          className={`font-urbanist px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
            guest.is_registered
              ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"
          }`}
        >
          <option value="registered" className="bg-[#0a1520] text-green-400">
            Registered
          </option>
          <option value="pending" className="bg-[#0a1520] text-yellow-400">
            Pending
          </option>
        </select>
      </td>
      <td className="py-4 px-2 hidden lg:table-cell">
        <div className="flex justify-center">
          <button
            onClick={() => onGenerateQR(guest)}
            disabled={isPending || !guest.is_registered}
            className="p-1.5 hover:bg-purple-500/20 rounded text-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={guest.is_registered ? "Generate QR Code Ticket" : "Cannot generate QR for pending guests"}
          >
            <QrCode size={16} />
          </button>
        </div>
      </td>
      <td className="py-4 px-2">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onViewAnswers(guest)}
            disabled={isPending}
            className="p-1.5 hover:bg-cyan-500/20 rounded text-cyan-400 transition-colors disabled:opacity-50"
            title="View Answers"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onDelete(guest.registrant_id)}
            disabled={isPending}
            className="p-1.5 hover:bg-red-500/20 rounded text-red-400 transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
