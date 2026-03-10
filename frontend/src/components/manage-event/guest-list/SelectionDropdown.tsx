interface SelectionDropdownProps {
  onSelectAll: () => void;
  onSelectRegistered: () => void;
  onSelectPending: () => void;
  onDeselectAll: () => void;
}

export function SelectionDropdown({
  onSelectAll,
  onSelectRegistered,
  onSelectPending,
  onDeselectAll,
}: SelectionDropdownProps) {
  return (
    <div className="absolute top-full left-0 mt-1 bg-[#0a1520] border border-white/10 rounded-lg shadow-xl z-50 min-w-[160px]">
      <button
        onClick={onSelectAll}
        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors first:rounded-t-lg"
      >
        Select All
      </button>
      <button
        onClick={onSelectRegistered}
        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
      >
        Select Registered
      </button>
      <button
        onClick={onSelectPending}
        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors last:rounded-b-lg"
      >
        Select Pending
      </button>
      <div className="border-t border-white/10"></div>
      <button
        onClick={onDeselectAll}
        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors rounded-b-lg"
      >
        Deselect All
      </button>
    </div>
  );
}
