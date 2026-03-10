import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createEventAction } from '@/actions/eventActions';
import { EventFormData } from '@/types/event';
import { ValidationResult } from './use-event-validation';

const FIELD_NAME_MAP: Record<string, string> = {
  title: "Event Name",
  startDate: "Start Date",
  startTime: "Start Time",
  endDate: "End Date",
  endTime: "End Time",
  description: "Description",
  capacity: "Capacity",
  ticketPrice: "Ticket Price",
  location: "Location",
};

export function useEventSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const buildErrorMessage = useCallback((errors: Record<string, string>): string => {
    const fieldNames = Object.keys(errors)
      .map((field) => FIELD_NAME_MAP[field] || field)
      .join(", ");
    return `Please fix the following fields: ${fieldNames}`;
  }, []);

  const submitEvent = useCallback(async (
    formData: EventFormData,
    validationResult: ValidationResult
  ) => {
    setError("");

    if (!validationResult.isValid) {
      setError(buildErrorMessage(validationResult.errors));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createEventAction(formData);
      if (!result.success) throw new Error(result.error);
      router.push(result.slug ? `/event/${result.slug}` : "/dashboard");
    } catch (err) {
      console.error("Create event error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create event. Please try again."
      );
      setIsSubmitting(false);
    }
  }, [router, buildErrorMessage]);

  return {
    isSubmitting,
    error,
    submitEvent,
    setError,
  };
}
