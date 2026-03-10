import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LogoutModal({ isOpen, onClose, onConfirm, isLoading }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative z-50 w-full max-w-[425px] overflow-hidden rounded-2xl bg-[#0a1520] border border-white/10 shadow-2xl p-6 font-urbanist animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-red-500/10 shrink-0">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Confirm Logout</h2>
        </div>
        
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Are you sure you want to log out of your session? You will need to log in again to access the dashboard.
        </p>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl font-bold transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/5 border-2 border-transparent disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl font-bold transition-all duration-200 bg-red-500/10 text-red-400 hover:bg-red-500/20 border-2 border-red-500/20 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-red-400/30 border-t-red-400 animate-spin" />
                Logging out...
              </span>
            ) : (
              "Log Out"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
