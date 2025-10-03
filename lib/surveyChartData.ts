// Healthcare Benefits Survey 2022 - Dummy Data for POC
// Based on figures from the survey document

export interface PlanTypeData {
  name: string;
  value: number;
  percentage: number;
}

export interface RegionalData {
  region: string;
  employeeContribution: number;
  employerContribution: number;
}

export interface UnionData {
  category: string;
  percentage: number;
}

export interface DentalBenefitsData {
  benefit: string;
  percentage: number;
}

export interface VoluntaryBenefitsData {
  benefit: string;
  offered: number;
  notOffered: number;
}

export interface PTOData {
  program: string;
  percentage: number;
}

// Plan Type Distribution
export const planTypeData: PlanTypeData[] = [
  { name: 'HMO', value: 61, percentage: 61 },
  { name: 'EPO', value: 22, percentage: 22 },
  { name: 'PPO', value: 12, percentage: 12 },
  { name: 'HDHP', value: 4, percentage: 4 },
  { name: 'POS', value: 1, percentage: 1 },
];

// Regional Employee Contributions
export const regionalData: RegionalData[] = [
  { region: 'Northeast', employeeContribution: 28, employerContribution: 72 },
  { region: 'Midwest', employeeContribution: 25, employerContribution: 75 },
  { region: 'South', employeeContribution: 30, employerContribution: 70 },
  { region: 'West', employeeContribution: 27, employerContribution: 73 },
];

// Union Representation
export const unionData: UnionData[] = [
  { category: 'Union Represented', percentage: 35 },
  { category: 'Non-Union', percentage: 65 },
];

// Dental Benefits Participation
export const dentalBenefitsData: DentalBenefitsData[] = [
  { benefit: 'Full Coverage', percentage: 68 },
  { benefit: 'Basic Coverage', percentage: 25 },
  { benefit: 'No Coverage', percentage: 7 },
];

// Voluntary Benefits Offered
export const voluntaryBenefitsData: VoluntaryBenefitsData[] = [
  { benefit: 'Life Insurance', offered: 89, notOffered: 11 },
  { benefit: 'Disability', offered: 76, notOffered: 24 },
  { benefit: 'Critical Illness', offered: 52, notOffered: 48 },
  { benefit: 'Accident', offered: 48, notOffered: 52 },
  { benefit: 'Legal Services', offered: 31, notOffered: 69 },
];

// PTO Programs
export const ptoData: PTOData[] = [
  { program: 'Traditional Accrual', percentage: 54 },
  { program: 'PTO Bank', percentage: 38 },
  { program: 'Unlimited', percentage: 8 },
];

// Chart Colors
export const COLORS = {
  primary: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'],
  secondary: ['#82ca9d', '#8884d8', '#ffc658', '#ff7c7c', '#a4de6c'],
  gradient: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'],
};
