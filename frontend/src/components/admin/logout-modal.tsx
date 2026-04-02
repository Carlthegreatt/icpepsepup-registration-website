import { LogOut } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-[400px] overflow-hidden rounded-2xl bg-[rgba(15,15,5,0.95)] border border-yellow-900/40 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 font-urbanist animate-in zoom-in-95 duration-300">
        {/* Glow Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 shrink-0 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
            <LogOut className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">
              Terminate Session
            </h2>
            <p className="text-[10px] text-yellow-500/60 font-bold uppercase tracking-widest">
              Security Protocol
            </p>
          </div>
        </div>

        <p className="text-yellow-100/60 text-sm mb-8 leading-relaxed font-medium">
          Are you sure you want to log out? You will need to re-authenticate to
          access the ICPEP SE administrative dashboard.
        </p>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl font-bold transition-all duration-300 text-yellow-100/40 hover:text-yellow-400 hover:bg-yellow-500/5 border border-transparent disabled:opacity-50 uppercase tracking-widest text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-8 py-2.5 rounded-xl font-black transition-all duration-300 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)] disabled:opacity-50 flex items-center justify-center min-w-[140px] uppercase tracking-widest text-xs active:scale-95"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-red-400/30 border-t-red-400 animate-spin" />
                Processing
              </span>
            ) : (
              "Confirm Logout"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
