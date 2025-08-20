/**
 * Custom hook for form validation with Zod schemas
 */

import { useState, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';
import { sanitizeJson } from '@/lib/utils/sanitize';

interface UseFormValidationOptions<T> {
  schema: ZodSchema<T>;
  onSubmit: (data: T) => void | Promise<void>;
  sanitize?: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation<T extends Record<string, unknown>>({
  schema,
  onSubmit,
  sanitize = true,
}: UseFormValidationOptions<T>) {
  const [values, setValues] = useState<Partial<T>>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setValue = useCallback((field: keyof T, value: unknown) => {
    setValues((prev) => ({
      ...prev,
      [field]: sanitize ? sanitizeJson(value) : value,
    }));
    
    // Clear error when field is modified
    if (errors[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [sanitize, errors]);

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  }, []);

  const validateField = useCallback(async (field: keyof T) => {
    try {
      // Validate single field
      const fieldSchema = schema.pick({ [field]: true } as any);
      await fieldSchema.parseAsync({ [field]: values[field] });
      
      // Clear error if validation passes
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldError = error.errors.find((e) => e.path[0] === field);
        if (fieldError) {
          setErrors((prev) => ({
            ...prev,
            [field]: fieldError.message,
          }));
        }
      }
      return false;
    }
  }, [schema, values]);

  const validate = useCallback(async (): Promise<boolean> => {
    try {
      // Sanitize values if enabled
      const dataToValidate = sanitize ? sanitizeJson(values) : values;
      
      // Validate all fields
      await schema.parseAsync(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: ValidationErrors = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [schema, values, sanitize]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(values).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    const isValid = await validate();
    
    if (isValid) {
      try {
        const sanitizedData = sanitize ? sanitizeJson(values) : values;
        await onSubmit(sanitizedData as T);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  }, [values, validate, onSubmit, sanitize]);

  const reset = useCallback(() => {
    setValues({});
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, []);

  const getFieldProps = useCallback((field: keyof T) => ({
    value: values[field] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValue(field, e.target.value);
    },
    onBlur: () => {
      setFieldTouched(field);
      validateField(field);
    },
    error: touched[field as string] ? errors[field as string] : undefined,
  }), [values, errors, touched, setValue, setFieldTouched, validateField]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    validateField,
    validate,
    handleSubmit,
    reset,
    getFieldProps,
    isValid: Object.keys(errors).length === 0,
  };
}