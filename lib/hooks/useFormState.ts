import { useState } from 'react';

/**
 * Custom hook for managing form state with generic typing
 * Reduces boilerplate in forms throughout the app
 */
export function useFormState<T extends Record<string, any>>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);

  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFields = (updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(initialState);
  };

  return {
    formData,
    setFormData,
    updateField,
    updateFields,
    resetForm,
  };
}
