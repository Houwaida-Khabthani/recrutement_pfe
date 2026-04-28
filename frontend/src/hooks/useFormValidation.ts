import { useState } from 'react';

export function useFormValidation<T extends Record<string, string> = Record<string, string>>() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setFieldError = (field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const resetErrors = () => setErrors({});
  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    setErrors,
    setFieldError,
    clearFieldError,
    resetErrors,
    hasErrors,
  };
}
