import { useState, useMemo } from "react";
import { Guest } from "@/types/guest";

export function useGuestFilter(guests: Guest[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredGuests = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    
    return guests.filter((guest) => {
      if (!guest.users) return false;

      const matchesSearch = !searchQuery || 
        guest.users.first_name?.toLowerCase().includes(lowerQuery) ||
        guest.users.last_name?.toLowerCase().includes(lowerQuery) ||
        guest.users.email?.toLowerCase().includes(lowerQuery);

      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "registered" ? guest.is_registered : !guest.is_registered);

      return matchesSearch && matchesStatus;
    });
  }, [guests, searchQuery, statusFilter]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredGuests,
  };
}
