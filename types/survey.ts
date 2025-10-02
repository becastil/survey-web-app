// Core Survey Types for Keenan Healthcare Benefits Survey 2025

export interface SurveyResponse {
  id: string;
  organizationId: string;
  userId: string;
  status: 'draft' | 'in_progress' | 'completed' | 'submitted';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  data: SurveyData;
}

export interface SurveyData {
  generalInformation: GeneralInformation;
  medicalPlans: MedicalPlan[];
  dentalPlans: DentalPlan[];
  visionPlans: VisionPlan[];
  basicLifeDisability: BasicLifeDisability;
  retirement: Retirement;
  timeOff: TimeOff;
  benefitsStrategy: BenefitsStrategy;
  voluntaryBenefits: VoluntaryBenefits;
  bestPractices: BestPractices;
}

// General Information Section
export interface GeneralInformation {
  organizationName: string;
  contactPerson: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  fiscalYearEnd: string;
  employeeCount: number;
  eligibleEmployees: number;
  averageAge: number;
  unionStatus: 'union' | 'non-union' | 'mixed';
  industryType: string;
  currentBroker?: string;
  renewalDate?: string;
}

// Medical Plans
export interface MedicalPlan {
  planId: string;
  planName: string;
  carrier: string;
  planType: 'HMO' | 'PPO' | 'EPO' | 'POS' | 'HDHP';
  networkType?: string;
  effectiveDate: string;
  enrolledEmployees: number;
  enrolledDependents: number;

  // Rate Structure
  rateTiers: RateTier[];
  contributionStructure: ContributionStructure;

  // Plan Design
  planDesign: MedicalPlanDesign;

  // Utilization & Claims
  utilization?: Utilization;

  // Additional Features
  wellnessProgram?: boolean;
  telehealthIncluded?: boolean;
  hsaCompatible?: boolean;
  prescriptionDrugCoverage?: PrescriptionDrugCoverage;
}

export interface RateTier {
  tier: 'employee_only' | 'employee_spouse' | 'employee_child' | 'family';
  monthlyPremium: number;
  employeeContribution: number;
  employerContribution: number;
  enrollmentCount: number;
}

export interface ContributionStructure {
  type: 'flat_dollar' | 'percentage' | 'graduated';
  employeeOnlyAmount?: number;
  dependentAmount?: number;
  percentageEmployee?: number;
  percentageDependent?: number;
  graduatedSchedule?: GraduatedSchedule[];
}

export interface GraduatedSchedule {
  salaryMin: number;
  salaryMax: number;
  employerContribution: number;
}

export interface MedicalPlanDesign {
  deductible: {
    individual: number;
    family: number;
    inNetwork?: number;
    outOfNetwork?: number;
  };
  outOfPocketMax: {
    individual: number;
    family: number;
    inNetwork?: number;
    outOfNetwork?: number;
  };
  coinsurance: {
    inNetwork: number;
    outOfNetwork?: number;
  };
  copays: {
    primaryCare: number;
    specialist: number;
    urgentCare: number;
    emergencyRoom: number;
  };
  preventiveCare: {
    covered: boolean;
    noDeductible?: boolean;
  };
}

export interface Utilization {
  annualClaimsTotal: number;
  averageClaimPerEmployee: number;
  largeClaimThreshold: number;
  largeClaimCount: number;
  chronicConditionPercentage: number;
  preventiveCareUtilization: number;
}

export interface PrescriptionDrugCoverage {
  included: boolean;
  separateDeductible?: boolean;
  deductibleAmount?: number;
  tierStructure?: {
    tier1Generic: number;
    tier2Preferred: number;
    tier3NonPreferred: number;
    tier4Specialty?: number;
  };
  mailOrderAvailable?: boolean;
}

// Dental Plans
export interface DentalPlan {
  planId: string;
  planName: string;
  carrier: string;
  planType: 'DHMO' | 'DPPO' | 'Indemnity';
  effectiveDate: string;
  enrolledEmployees: number;
  enrolledDependents: number;

  rateTiers: RateTier[];
  contributionStructure: ContributionStructure;

  planDesign: DentalPlanDesign;
}

export interface DentalPlanDesign {
  annualMaximum: number;
  deductible: {
    individual: number;
    family: number;
  };
  coverage: {
    preventive: number; // percentage
    basic: number;
    major: number;
    orthodontia?: number;
  };
  orthodontiaMaximum?: number;
  waitingPeriods?: {
    basic?: number; // months
    major?: number;
    orthodontia?: number;
  };
}

// Vision Plans
export interface VisionPlan {
  planId: string;
  planName: string;
  carrier: string;
  effectiveDate: string;
  enrolledEmployees: number;
  enrolledDependents: number;

  rateTiers: RateTier[];
  contributionStructure: ContributionStructure;

  planDesign: VisionPlanDesign;
}

export interface VisionPlanDesign {
  examFrequency: '12_months' | '24_months';
  examCopay: number;
  materialsAllowance: number;
  lensesFrequency: '12_months' | '24_months';
  framesAllowance: number;
  framesFrequency: '12_months' | '24_months';
  contactsAllowance?: number;
  contactsFrequency?: '12_months' | '24_months';
  retailDiscounts?: boolean;
}

// Basic Life & Disability
export interface BasicLifeDisability {
  basicLife: {
    offered: boolean;
    carrier?: string;
    coverage?: {
      type: 'flat' | 'multiple_salary' | 'graduated';
      amount?: number;
      multiple?: number;
      schedule?: Array<{ salaryRange: string; amount: number }>;
    };
    employerPaid: boolean;
    adAndDIncluded?: boolean;
  };

  supplementalLife: {
    offered: boolean;
    carrier?: string;
    employeeCoverage?: {
      available: boolean;
      maximum: number;
      guaranteed?: number;
    };
    spouseCoverage?: {
      available: boolean;
      maximum: number;
    };
    childCoverage?: {
      available: boolean;
      amount: number;
    };
  };

  shortTermDisability: {
    offered: boolean;
    carrier?: string;
    weeklyBenefit?: number;
    eliminationPeriod?: number;
    benefitDuration?: number;
    employerPaid?: boolean;
  };

  longTermDisability: {
    offered: boolean;
    carrier?: string;
    monthlyBenefit?: number;
    eliminationPeriod?: number;
    benefitDuration?: string;
    employerPaid?: boolean;
  };
}

// Retirement
export interface Retirement {
  plan401k: {
    offered: boolean;
    provider?: string;
    employeeContribution?: {
      allowed: boolean;
      maxPercentage?: number;
    };
    employerMatch?: {
      provided: boolean;
      formula?: string;
      vestingSchedule?: string;
    };
    rothOption?: boolean;
    autoEnrollment?: {
      enabled: boolean;
      defaultRate?: number;
    };
  };

  plan403b: {
    offered: boolean;
    provider?: string;
    employeeContribution?: {
      allowed: boolean;
      maxPercentage?: number;
    };
    employerContribution?: {
      provided: boolean;
      percentage?: number;
    };
  };

  pensionPlan: {
    offered: boolean;
    type?: 'defined_benefit' | 'defined_contribution' | 'hybrid';
    vestingSchedule?: string;
    calculationFormula?: string;
  };

  other?: {
    type: string;
    description: string;
  };
}

// Time Off
export interface TimeOff {
  paidTimeOff: {
    offered: boolean;
    structure?: 'accrual' | 'front_loaded' | 'unlimited';
    accrualRates?: Array<{
      yearsOfService: string;
      annualDays: number;
    }>;
    carryoverAllowed?: boolean;
    carryoverMax?: number;
  };

  sickLeave: {
    offered: boolean;
    structure?: 'accrual' | 'front_loaded';
    annualDays?: number;
    carryoverAllowed?: boolean;
  };

  holidays: {
    count: number;
    floatingHolidays?: number;
  };

  parentalLeave: {
    offered: boolean;
    maternityWeeks?: number;
    paternityWeeks?: number;
    adoptionWeeks?: number;
    paid?: boolean;
  };

  bereavement: {
    offered: boolean;
    days?: number;
  };

  juryDuty: {
    offered: boolean;
    paid?: boolean;
  };
}

// Benefits Strategy
export interface BenefitsStrategy {
  objectives: string[];
  challenges: string[];
  priorities: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    notes?: string;
  }>;

  employeeDemographics: {
    generationBreakdown?: {
      genZ?: number;
      millennial?: number;
      genX?: number;
      boomer?: number;
    };
    averageAge?: number;
    averageTenure?: number;
  };

  communicationStrategy: {
    methods: string[];
    frequency: string;
    openEnrollmentDuration?: number;
    technologyPlatforms?: string[];
  };

  benchmarking: {
    interestedInBenchmarking: boolean;
    comparableOrganizations?: string[];
    specificMetrics?: string[];
  };
}

// Voluntary Benefits
export interface VoluntaryBenefits {
  criticalIllness: {
    offered: boolean;
    carrier?: string;
    enrollment?: number;
  };

  accident: {
    offered: boolean;
    carrier?: string;
    enrollment?: number;
  };

  hospital: {
    offered: boolean;
    carrier?: string;
    enrollment?: number;
  };

  legalServices: {
    offered: boolean;
    provider?: string;
    enrollment?: number;
  };

  identityTheft: {
    offered: boolean;
    provider?: string;
    enrollment?: number;
  };

  petInsurance: {
    offered: boolean;
    provider?: string;
    enrollment?: number;
  };

  other?: Array<{
    type: string;
    provider: string;
    enrollment?: number;
  }>;
}

// Best Practices
export interface BestPractices {
  wellnessProgram: {
    offered: boolean;
    components?: string[];
    incentivesProvided?: boolean;
    incentiveTypes?: string[];
    participationRate?: number;
  };

  eap: {
    offered: boolean;
    provider?: string;
    sessionsPerYear?: number;
    utilizationRate?: number;
  };

  financialWellness: {
    offered: boolean;
    services?: string[];
    provider?: string;
  };

  benefitsEducation: {
    methods: string[];
    frequency: string;
    technologyUsed?: string[];
  };

  dataAnalytics: {
    trackMetrics: boolean;
    metricsTracked?: string[];
    reportingFrequency?: string;
  };

  diversityInclusion: {
    hasDIInitiatives: boolean;
    benefitsConsideredInDI?: boolean;
    specificPrograms?: string[];
  };
}
