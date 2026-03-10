import { useState, useCallback } from 'react';
import { CreateEventSchema } from '@/validators/eventValidators';
import { EventFormData } from '@/types/event';
import { z } from 'zod';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function useEventValidation() {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((
    field: keyof EventFormData,
    value: EventFormData[keyof EventFormData],
    formData: EventFormData
  ) => {
    try {
      // Validate entire form to check cross-field validations
      CreateEventSchema.parse({ ...formData, [field]: value });
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        // Clear related errors for cross-field validation
        if (field === "startDate" || field === "startTime") {
          delete newErrors["endDate"];
          delete newErrors["endTime"];
        }
        return newErrors;
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const fieldError = err.issues.find((e: any) =>
          e.path.includes(field as string)
        );
        if (fieldError) {
          setValidationErrors((prev) => ({
            ...prev,
            [field]: fieldError.message,
          }));
        }
      }
    }
  }, []);

  const validateForm = useCallback((formData: EventFormData): ValidationResult => {
    try {
      CreateEventSchema.parse(formData);
      setValidationErrors({});
      return { isValid: true, errors: {} };
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach((error: any) => {
          const field = error.path[0];
          if (field && typeof field === "string") {
            errors[field] = error.message;
          }
        });
        setValidationErrors(errors);
        return { isValid: false, errors };
      }
      return { isValid: false, errors: {} };
    }
  }, []);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  return {
    validationErrors,
    validateField,
    validateForm,
    clearValidationErrors,
  };
}
