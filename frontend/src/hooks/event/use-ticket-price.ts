import { useState } from 'react';

export type TicketType = "free" | "paid";

interface UseTicketPriceReturn {
  ticketType: TicketType;
  priceAmount: string;
  handleTicketTypeChange: (type: TicketType) => void;
  handlePriceAmountChange: (amount: string) => void;
}

/**
 * Custom hook to manage ticket price state and transformations
 * Handles the conversion between "free"/"paid" selection and actual price string
 */
export function useTicketPrice(
  initialPrice: string,
  updateTicketPrice: (price: string) => void
): UseTicketPriceReturn {
  // Determine initial ticket type based on price
  const [ticketType, setTicketType] = useState<TicketType>(() => {
    if (initialPrice && initialPrice.toLowerCase() !== "free") {
      return "paid";
    }
    return "free";
  });

  // Store the price amount when paid
  const [priceAmount, setPriceAmount] = useState(() => {
    if (initialPrice && initialPrice.toLowerCase() !== "free") {
      return initialPrice;
    }
    return "";
  });

  const handleTicketTypeChange = (type: TicketType) => {
    setTicketType(type);
    const price = type === "free" ? "Free" : priceAmount || "";
    if (type === "free") setPriceAmount("");
    updateTicketPrice(price);
  };

  const handlePriceAmountChange = (amount: string) => {
    setPriceAmount(amount);
    updateTicketPrice(amount);
  };

  return {
    ticketType,
    priceAmount,
    handleTicketTypeChange,
    handlePriceAmountChange,
  };
}
