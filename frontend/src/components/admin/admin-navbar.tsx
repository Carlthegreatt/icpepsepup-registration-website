import { LogOut, Calendar, BarChart3, Plus, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { logoutAction } from "@/actions/authActions";
import { useUserStore } from "@/store/useUserStore";
import { LogoutModal } from "./logout-modal";
import { getLastViewedEventSlug } from "@/utils/last-viewed-event";

interface AdminNavbarProps {
  activeTab: string;
}

export function AdminNavbar({ activeTab }: AdminNavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    {
      id: "dashboard" as const,
      label: "Dashboard",
      icon: BarChart3,
      path: "/admin/dashboard",
    },
    {
      id: "events" as const,
      label: "Events",
      icon: Calendar,
      path: "/admin/events",
    },
  ];

  const handleTabChange = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const handleCreateEvent = () => {
    router.push("/create-event");
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAction();
      useUserStore.getState().clearUser();
      const lastSlug = getLastViewedEventSlug();
      router.push(lastSlug ? `/event/${lastSlug}` : "/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  return (
    <>
      <nav className="h-16 px-6 md:px-10 lg:px-16 flex items-center justify-between z-40 fixed top-0 left-0 right-0 backdrop-blur-md bg-black/40 border-b border-yellow-900/20 shadow-lg shadow-black/40">
        {/* Left Side - Logo (Compact) */}
        <div className="flex items-center gap-8 md:gap-12">
          {/* Burger Menu Button (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 rounded-md text-yellow-100/50 hover:text-yellow-400 hover:bg-yellow-500/5 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Logo - Simplified */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-600/20 p-1.5 border border-yellow-500/30 flex-shrink-0 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
              <Image
                src="/images/logos/ICPEP-logo-1.png" // Update this path to your ICPEP SE logo when ready
                alt="ICPEP SE"
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
            <span className="text-[11px] font-bold text-yellow-500 uppercase tracking-[0.15em] hidden sm:inline font-urbanist">
              ICPEP SE Admin
            </span>
          </div>

          {/* Navigation Menu (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.path)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all duration-300 font-urbanist uppercase tracking-wider text-[11px] font-bold ${
                    isActive
                      ? "bg-yellow-500/10 text-yellow-400 shadow-sm shadow-yellow-500/10 border border-yellow-500/20"
                      : "text-yellow-100/40 hover:text-yellow-50 hover:bg-yellow-500/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Create Event Button - Premium Gold Theme */}
          <button
            onClick={handleCreateEvent}
            className="hidden md:flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-br from-yellow-500 via-amber-600 to-yellow-700 hover:from-yellow-400 hover:via-yellow-500 hover:to-amber-600 text-[#0a0a05] font-black font-urbanist shadow-[0_4px_15px_rgba(250,204,21,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_6px_25px_rgba(250,204,21,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-300 border border-yellow-400/30 group active:scale-95"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
            <span className="text-xs font-bold tracking-widest uppercase">
              Create Event
            </span>
          </button>

          {/* Logout Button - Muted Amber */}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-yellow-900/30 hover:border-yellow-500/50 text-yellow-100/40 hover:text-yellow-400 hover:bg-yellow-500/5 transition-all duration-300 font-urbanist"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">
              Logout
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed top-16 left-0 right-0 z-40 lg:hidden backdrop-blur-xl bg-[#0a0a05]/90 border-b border-yellow-900/30 shadow-2xl animate-in slide-in-from-top-2">
            <div className="px-4 py-6 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-urbanist uppercase tracking-widest text-xs font-bold ${
                      isActive
                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        : "text-yellow-100/40 hover:text-yellow-50 hover:bg-yellow-500/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={handleCreateEvent}
                className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-700 text-[#0a0a05] font-black font-urbanist shadow-lg transition-all active:scale-[0.98] mt-4 uppercase tracking-widest text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Event</span>
              </button>
            </div>
          </div>
        </>
      )}

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}
