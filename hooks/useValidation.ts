import { useState, useEffect, useCallback } from 'react';
import { debounce } from '@/lib/utils';
import type { SurveyData, MedicalPlan, DentalPlan, RateTier } from '@/types/survey';

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'range' | 'logic';
  severity: 'error' | 'warning';
}

interface UseValidationOptions {
  data: Partial<SurveyData>;
  enabled?: boolean;
  realTime?: boolean;
  debounceMs?: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  fieldErrors: Record<string, ValidationError[]>;
}

export function useValidation({
  data,
  enabled = true,
  realTime = true,
  debounceMs = 500
}: UseValidationOptions) {
  const [result, setResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
    fieldErrors: {}
  });

  const [isValidating, setIsValidating] = useState(false);

  const validateData = useCallback((surveyData: Partial<SurveyData>): ValidationResult => {
    const errors: ValidationError[] = [];

    // General Information Validations
    if (surveyData.generalInformation) {
      const gi = surveyData.generalInformation;

      if (!gi.organizationName?.trim()) {
        errors.push({
          field: 'generalInformation.organizationName',
          message: 'Organization name is required',
          type: 'required',
          severity: 'error'
        });
      }

      if (!gi.email?.trim()) {
        errors.push({
          field: 'generalInformation.email',
          message: 'Email is required',
          type: 'required',
          severity: 'error'
        });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gi.email)) {
        errors.push({
          field: 'generalInformation.email',
          message: 'Please enter a valid email address',
          type: 'format',
          severity: 'error'
        });
      }

      if (!gi.contactPerson?.trim()) {
        errors.push({
          field: 'generalInformation.contactPerson',
          message: 'Contact person is required',
          type: 'required',
          severity: 'error'
        });
      }

      if (gi.phone && !/^\+?[\d\s\-()]+$/.test(gi.phone)) {
        errors.push({
          field: 'generalInformation.phone',
          message: 'Please enter a valid phone number',
          type: 'format',
          severity: 'warning'
        });
      }

      if (gi.employeeCount !== undefined) {
        if (gi.employeeCount < 0) {
          errors.push({
            field: 'generalInformation.employeeCount',
            message: 'Employee count must be a positive number',
            type: 'range',
            severity: 'error'
          });
        } else if (gi.employeeCount === 0) {
          errors.push({
            field: 'generalInformation.employeeCount',
            message: 'Employee count should be greater than zero',
            type: 'range',
            severity: 'warning'
          });
        }
      }

      if (gi.eligibleEmployees !== undefined && gi.employeeCount !== undefined) {
        if (gi.eligibleEmployees > gi.employeeCount) {
          errors.push({
            field: 'generalInformation.eligibleEmployees',
            message: 'Eligible employees cannot exceed total employee count',
            type: 'logic',
            severity: 'error'
          });
        }
      }

      if (gi.averageAge !== undefined && (gi.averageAge < 18 || gi.averageAge > 100)) {
        errors.push({
          field: 'generalInformation.averageAge',
          message: 'Average age must be between 18 and 100',
          type: 'range',
          severity: 'warning'
        });
      }
    }

    // Medical Plans Validations
    if (surveyData.medicalPlans) {
      surveyData.medicalPlans.forEach((plan: MedicalPlan, index: number) => {
        if (!plan.planName?.trim()) {
          errors.push({
            field: `medicalPlans[${index}].planName`,
            message: 'Plan name is required',
            type: 'required',
            severity: 'error'
          });
        }

        if (!plan.carrier?.trim()) {
          errors.push({
            field: `medicalPlans[${index}].carrier`,
            message: 'Carrier name is required',
            type: 'required',
            severity: 'error'
          });
        }

        if (!plan.planType) {
          errors.push({
            field: `medicalPlans[${index}].planType`,
            message: 'Plan type is required',
            type: 'required',
            severity: 'error'
          });
        }

        if (plan.enrolledEmployees !== undefined && plan.enrolledEmployees < 0) {
          errors.push({
            field: `medicalPlans[${index}].enrolledEmployees`,
            message: 'Enrolled employees must be non-negative',
            type: 'range',
            severity: 'error'
          });
        }

        // Rate Tier Validations
        if (plan.rateTiers) {
          plan.rateTiers.forEach((tier: RateTier, tierIndex: number) => {
            if (tier.monthlyPremium <= 0) {
              errors.push({
                field: `medicalPlans[${index}].rateTiers[${tierIndex}].monthlyPremium`,
                message: 'Monthly premium must be greater than zero',
                type: 'range',
                severity: 'error'
              });
            }

            const total = tier.employerContribution + tier.employeeContribution;
            const diff = Math.abs(total - tier.monthlyPremium);

            if (diff > 0.01) {
              errors.push({
                field: `medicalPlans[${index}].rateTiers[${tierIndex}]`,
                message: `Employer + Employee contribution (${total.toFixed(2)}) must equal monthly premium (${tier.monthlyPremium.toFixed(2)})`,
                type: 'logic',
                severity: 'error'
              });
            }

            if (tier.employerContribution < 0 || tier.employeeContribution < 0) {
              errors.push({
                field: `medicalPlans[${index}].rateTiers[${tierIndex}]`,
                message: 'Contributions cannot be negative',
                type: 'range',
                severity: 'error'
              });
            }
          });
        }

        // Plan Design Validations
        if (plan.planDesign) {
          const pd = plan.planDesign;

          if (pd.deductible) {
            if (pd.deductible.individual < 0 || pd.deductible.family < 0) {
              errors.push({
                field: `medicalPlans[${index}].planDesign.deductible`,
                message: 'Deductibles cannot be negative',
                type: 'range',
                severity: 'error'
              });
            }

            if (pd.deductible.family < pd.deductible.individual) {
              errors.push({
                field: `medicalPlans[${index}].planDesign.deductible`,
                message: 'Family deductible should be greater than or equal to individual deductible',
                type: 'logic',
                severity: 'warning'
              });
            }
          }

          if (pd.outOfPocketMax) {
            if (pd.outOfPocketMax.family < pd.outOfPocketMax.individual) {
              errors.push({
                field: `medicalPlans[${index}].planDesign.outOfPocketMax`,
                message: 'Family out-of-pocket maximum should be >= individual maximum',
                type: 'logic',
                severity: 'warning'
              });
            }
          }

          if (pd.coinsurance) {
            if (pd.coinsurance.inNetwork < 0 || pd.coinsurance.inNetwork > 100) {
              errors.push({
                field: `medicalPlans[${index}].planDesign.coinsurance.inNetwork`,
                message: 'Coinsurance percentage must be between 0 and 100',
                type: 'range',
                severity: 'error'
              });
            }
          }
        }
      });
    }

    // Dental Plans Validations
    if (surveyData.dentalPlans) {
      surveyData.dentalPlans.forEach((plan: DentalPlan, index: number) => {
        if (!plan.planName?.trim()) {
          errors.push({
            field: `dentalPlans[${index}].planName`,
            message: 'Plan name is required',
            type: 'required',
            severity: 'error'
          });
        }

        if (!plan.carrier?.trim()) {
          errors.push({
            field: `dentalPlans[${index}].carrier`,
            message: 'Carrier name is required',
            type: 'required',
            severity: 'error'
          });
        }

        if (plan.planDesign?.coverage) {
          const { preventive, basic, major, orthodontia } = plan.planDesign.coverage;

          [preventive, basic, major, orthodontia].forEach((percentage, idx) => {
            if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
              const coverageType = ['preventive', 'basic', 'major', 'orthodontia'][idx];
              errors.push({
                field: `dentalPlans[${index}].planDesign.coverage.${coverageType}`,
                message: 'Coverage percentage must be between 0 and 100',
                type: 'range',
                severity: 'error'
              });
            }
          });
        }
      });
    }

    // Retirement Validations
    if (surveyData.retirement) {
      const ret = surveyData.retirement;

      if (ret.plan401k?.offered && ret.plan401k.employerMatch?.provided) {
        if (!ret.plan401k.employerMatch.formula?.trim()) {
          errors.push({
            field: 'retirement.plan401k.employerMatch.formula',
            message: 'Employer match formula is required when match is provided',
            type: 'required',
            severity: 'error'
          });
        }
      }
    }

    // Group errors by field
    const fieldErrors: Record<string, ValidationError[]> = {};
    errors.forEach(error => {
      if (!fieldErrors[error.field]) {
        fieldErrors[error.field] = [];
      }
      fieldErrors[error.field].push(error);
    });

    const validationErrors = errors.filter(e => e.severity === 'error');
    const validationWarnings = errors.filter(e => e.severity === 'warning');

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings,
      fieldErrors
    };
  }, []);

  const debouncedValidate = useCallback(
    debounce((surveyData: Partial<SurveyData>) => {
      setIsValidating(true);
      const validationResult = validateData(surveyData);
      setResult(validationResult);
      setIsValidating(false);
    }, debounceMs),
    [validateData, debounceMs]
  );

  useEffect(() => {
    if (!enabled) return;

    if (realTime) {
      debouncedValidate(data);
    }

    return () => {
      debouncedValidate.cancel();
    };
  }, [data, enabled, realTime, debouncedValidate]);

  const validateNow = useCallback(() => {
    setIsValidating(true);
    const validationResult = validateData(data);
    setResult(validationResult);
    setIsValidating(false);
    return validationResult;
  }, [data, validateData]);

  const getFieldError = useCallback(
    (fieldPath: string): ValidationError | null => {
      return result.fieldErrors[fieldPath]?.[0] || null;
    },
    [result.fieldErrors]
  );

  const hasFieldError = useCallback(
    (fieldPath: string): boolean => {
      return !!result.fieldErrors[fieldPath]?.some(e => e.severity === 'error');
    },
    [result.fieldErrors]
  );

  const hasFieldWarning = useCallback(
    (fieldPath: string): boolean => {
      return !!result.fieldErrors[fieldPath]?.some(e => e.severity === 'warning');
    },
    [result.fieldErrors]
  );

  return {
    ...result,
    isValidating,
    validateNow,
    getFieldError,
    hasFieldError,
    hasFieldWarning
  };
}
