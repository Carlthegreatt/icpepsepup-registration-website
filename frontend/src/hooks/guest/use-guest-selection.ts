import { useState, useCallback } from "react";
import { Guest } from "@/types/guest";

export function useGuestSelection() {
  const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set());
  const [showSelectMenu, setShowSelectMenu] = useState(false);

  const handleSelectAll = useCallback((guests: Guest[], checked: boolean) => {
    if (checked) {
      const allIds = new Set(guests.map(g => g.registrant_id));
      setSelectedGuestIds(allIds);
    } else {
      setSelectedGuestIds(new Set());
    }
  }, []);

  const handleSelectByStatus = useCallback((guests: Guest[], status: 'all' | 'registered' | 'pending') => {
    const guestsToSelect = status === 'all' 
      ? guests 
      : status === 'registered'
      ? guests.filter(g => g.is_registered)
      : guests.filter(g => !g.is_registered);
    
    setSelectedGuestIds(new Set(guestsToSelect.map(g => g.registrant_id)));
    setShowSelectMenu(false);
  }, []);

  const handleSelectGuest = useCallback((guestId: string, checked: boolean) => {
    setSelectedGuestIds(prev => {
      const newSelected = new Set(prev);
      if (checked) {
        newSelected.add(guestId);
      } else {
        newSelected.delete(guestId);
      }
      return newSelected;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedGuestIds(new Set());
    setShowSelectMenu(false);
  }, []);

  const toggleSelectMenu = useCallback(() => {
    setShowSelectMenu(prev => !prev);
  }, []);

  return {
    selectedGuestIds,
    showSelectMenu,
    handleSelectAll,
    handleSelectByStatus,
    handleSelectGuest,
    clearSelection,
    toggleSelectMenu,
  };
}
