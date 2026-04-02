"use client";

import { useState, useEffect, ReactNode } from "react";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

type Props = {
  items: TabItem[];
  initialId?: string;
  onChange?: (id: string) => void;
  // Optional: determine if a tab is disabled
  isDisabled?: (id: string) => boolean;
  // Optional: tooltip/title for disabled tabs
  getDisabledTitle?: (id: string) => string | undefined;
};

export default function Tabs({
  items,
  initialId,
  onChange,
  isDisabled,
  getDisabledTitle,
}: Props) {
  const fallbackFirst = () => {
    const firstEnabled = items.find((it) => !(isDisabled?.(it.id) ?? false));
    return firstEnabled?.id || items[0]?.id;
  };
  const [active, setActive] = useState<string>(initialId || fallbackFirst());
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);

  useEffect(() => {
    // Only initialize once from initialId if provided and active not set
    if (initialId && !active) {
      const disabled = isDisabled?.(initialId) ?? false;
      setActive(disabled ? fallbackFirst() : initialId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activate = (id: string) => {
    if (isDisabled?.(id)) {
      const msg = getDisabledTitle?.(id) || "This tab is currently disabled";
      setBlockedMsg(msg);
      // auto-clear after a few seconds
      setTimeout(
        () => setBlockedMsg((current) => (current === msg ? null : current)),
        4000,
      );
      return;
    }
    setActive(id);
    onChange?.(id);
  };

  return (
    <div className="w-full">
      <div
        role="tablist"
        aria-label="Main sections"
        className="flex flex-wrap gap-2.5 mb-5 border-b border-yellow-900/30 pb-4"
      >
        {items.map((t) => {
          const selected = t.id === active;
          const disabled = isDisabled?.(t.id) ?? false;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              onClick={() => activate(t.id)}
              aria-disabled={disabled}
              title={
                disabled
                  ? getDisabledTitle?.(t.id) || "This tab is currently disabled"
                  : undefined
              }
              className={`
                  px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border backdrop-blur-md
                  ${
                    selected
                      ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.15)]"
                      : disabled
                        ? "opacity-40 cursor-not-allowed bg-[rgba(15,15,5,0.4)] border-yellow-900/30 text-yellow-700"
                        : "bg-[rgba(25,25,10,0.6)] border-yellow-900/50 text-yellow-100/50 hover:bg-[rgba(35,35,15,0.8)] hover:text-yellow-50 hover:border-yellow-700/50 active:scale-[0.98]"
                  }
                `}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {blockedMsg && (
        <div
          role="status"
          className="mb-4 text-xs font-medium px-4 py-3 rounded-lg border bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.1)]"
        >
          {blockedMsg}
        </div>
      )}

      {items.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={t.id}
          hidden={t.id !== active}
          className="focus:outline-none animate-in fade-in duration-300"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
