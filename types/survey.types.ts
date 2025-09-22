// Healthcare Benefits Survey - Modern Web Implementation
// This is a cleaner, more user-friendly version of the Keenan survey

// ===========================
// 1. Survey Configuration & Schema
// ===========================

// types/survey.types.ts
export interface SurveyConfiguration {
  id: string;
  title: string;
  description: string;
  version: string;
  sections: SurveySection[];
  theme: SurveyTheme;
}

export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  pages: SurveyPage[];
  isRepeatable?: boolean;
  maxInstances?: number;
  conditionalVisibility?: ConditionalRule;
}

export interface SurveyPage {
  id: string;
  title: string;
  elements: SurveyElement[];
}

export interface ConditionalRule {
  expression: string;
  dependsOn: string[];
}

export interface SurveyTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: string;
  spacing: string;
}

export type SurveyElement = Record<string, any>;
