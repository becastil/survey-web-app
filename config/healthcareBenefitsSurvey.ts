// Healthcare Benefits Survey - Modern Web Implementation
// This file defines the full SurveyJS configuration used by the application.

import { SurveyConfiguration } from "../types/survey.types";

const yesNoChoices = ["Yes", "No"];
const yesNoWithNaChoices = [
  { value: "Yes", text: "Yes" },
  { value: "No", text: "No" },
  { value: "Not Applicable", text: "Not Applicable" }
];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const objectiveRatingChoices = [
  { value: "not_objective", text: "Not an Objective" },
  { value: "minor", text: "Minor Objective" },
  { value: "moderate", text: "Moderate Objective" },
  { value: "major", text: "Major Objective" }
];

const considerationChoices = [
  { value: "in_place", text: "Already in Place" },
  { value: "will_consider", text: "Will Consider" },
  { value: "not_planned", text: "Not Planned" }
];

const surchargeStatusChoices = [
  { value: "in_place", text: "In Place" },
  { value: "will_consider", text: "Will Consider" },
  { value: "no", text: "No" }
];

const rxStrategyChoices = [
  { value: "in_place", text: "In Place" },
  { value: "will_implement", text: "Will Implement" },
  { value: "considering", text: "Considering" },
  { value: "not_planned", text: "Not Planned" }
];

const voluntaryBenefitStatusChoices = [
  { value: "offered", text: "Offered" },
  { value: "considering", text: "Considering" },
  { value: "not_offered", text: "Not Offered" },
  { value: "no_interest", text: "No Interest / Not Applicable" }
];

const providerTypes = [
  { value: "specialty_hospital", text: "Specialty Hospitals" },
  { value: "general_hospital", text: "General Hospitals" },
  { value: "clinics", text: "Clinics" },
  { value: "behavioral_health", text: "Behavioral Health Facilities" },
  { value: "physician_groups", text: "Physician Groups" }
];

const stopLossDeductibleChoices = [
  "$50,000",
  "$75,000",
  "$100,000",
  "$150,000",
  "$200,000",
  "$250,000",
  "$300,000",
  "$400,000",
  "$500,000",
  "$750,000",
  "$1,000,000",
  "Other"
];

const benefitWaitingPeriodChoices = [
  "Date of Hire",
  "First of Month Following Date of Hire",
  "30 Days",
  "First of Month After 30 Days",
  "60 Days",
  "First of Month After 60 Days",
  "90 Days",
  "First of Month After 90 Days",
  "Other"
];

const payPeriodsPerYearChoices = [
  { value: "12", text: "12 (Monthly)" },
  { value: "24", text: "24 (Semi-Monthly)" },
  { value: "26", text: "26 (Bi-Weekly)" },
  { value: "52", text: "52 (Weekly)" },
  { value: "Other", text: "Other" }
];

const carrierChoices = [
  "Aetna",
  "Anthem Blue Cross",
  "Blue Shield of California",
  "Cigna",
  "Health Net",
  "Kaiser Permanente",
  "UnitedHealthcare",
  "Other"
];

const planTypeChoices = [
  "EPO",
  "HMO",
  "PPO",
  "POS",
  "HDHP",
  "HSA-Compatible PPO",
  "Indemnity",
  "Reference-Based Pricing",
  "Other"
];

const dentalPlanTypes = ["DPPO", "DHMO", "Indemnity", "Managed Fee-for-Service", "Other"];
const visionPlanTypes = ["Vision", "Vision Plus Medical", "Other"];

const contributionStructureChoices = [
  { value: "flat", text: "Flat employer contribution" },
  { value: "graduated", text: "Graduated by service tenure" }
];

const autoEnrollmentChoices = [
  { value: "yes", text: "Yes" },
  { value: "no", text: "No" },
  { value: "planned", text: "Planned" }
];

const attractionImportanceChoices = [
  { value: "very", text: "Very important" },
  { value: "somewhat", text: "Somewhat important" },
  { value: "not", text: "Not important" }
];

const benefitFormulaChoices = [
  "Final average pay x service",
  "Career average pay",
  "Cash balance formula",
  "Points-based formula",
  "Other"
];

const rateStructureChoices = [
  {
    value: "structure1",
    text: "Employee Only / Employee +1 / Employee +2 or More / Employee +3 or More"
  },
  {
    value: "structure2",
    text: "Employee Only / Employee +Spouse or DP / Employee +Child(ren) / Employee +Family"
  }
];

const supplyLimitChoices = [
  "30-day",
  "60-day",
  "90-day",
  "120-day",
  "Other"
];

const frequencyChoices = [6, 12, 24, 36].map((value) => ({
  value,
  text: `Every ${value} months`
}));

const coverageTypeChoices = [
  { value: "flat", text: "Flat Amount" },
  { value: "salary_multiple", text: "Multiple of Salary" },
  { value: "other", text: "Other" }
];

const salaryMultipleChoices = [
  "0.5x",
  "1x",
  "1.5x",
  "2x",
  "2.5x",
  "3x",
  "Other"
];

const employeeClassDescriptions = {
  management: "Management Employees",
  nonManagement: "Non-Management Employees"
};

const medicalPlanTemplates = {
  type: "paneldynamic",
  name: "medical_plans",
  title: "Medical Plans",
  description: "Provide details for each medical plan offered (up to 4 plans).",
  minPanelCount: 1,
  maxPanelCount: 4,
  panelAddText: "Add another medical plan",
  panelRemoveText: "Remove this medical plan",
  templateTitle: "Medical Plan #{panelIndex}",
  renderMode: "list",
  templateElements: [
    {
      type: "panel",
      name: "medical_plan_information",
      title: "Plan Information",
      elements: [
        {
          type: "dropdown",
          name: "plan_type",
          title: "Plan Type",
          choices: planTypeChoices,
          hasOther: true,
          isRequired: true,
          description: "Select the plan design that most closely aligns with this offering."
        },
        {
          type: "text",
          name: "plan_name",
          title: "Health Plan Name",
          isRequired: true,
          placeholder: "e.g., Blue Shield Access+ EPO"
        },
        {
          type: "dropdown",
          name: "carrier_network",
          title: "Carrier / Network",
          choices: carrierChoices,
          hasOther: true,
          otherPlaceholder: "Enter carrier or network",
          isRequired: true
        },
        {
          type: "text",
          name: "tpa_name",
          title: "Third Party Administrator (TPA)",
          description: "If no TPA is used, leave blank.",
          placeholder: "Enter TPA name or leave blank"
        },
        {
          type: "dropdown",
          name: "network_breadth",
          title: "Network Type",
          choices: ["Full", "Narrow", "Tiered", "Hybrid"],
          isRequired: true
        },
        {
          type: "dropdown",
          name: "funding_mechanism",
          title: "Funding Mechanism",
          choices: ["Fully Insured", "Self-Funded", "Level-Funded", "Captive", "Other"],
          hasOther: true,
          isRequired: true
        },
        {
          type: "text",
          name: "total_rate_tiers",
          title: "Total Number of Rate Tiers",
          inputType: "number",
          min: 1,
          description: "Enter the total number of premium/contribution tiers available for this plan.",
          validators: [{ type: "numeric", minValue: 1 }]
        },
        {
          type: "text",
          name: "eligible_employees_enrolled",
          title: "Eligible Employees Enrolled",
          inputType: "number",
          min: 0,
          isRequired: true,
          validators: [{ type: "numeric", minValue: 0 }]
        },
        {
          type: "radiogroup",
          name: "applies_to_union",
          title: "Does this plan apply to union populations?",
          choices: yesNoChoices,
          isRequired: true
        },
        {
          type: "radiogroup",
          name: "union_contribution_variations",
          title: "If union populations are covered, do contributions vary by bargaining unit?",
          choices: yesNoChoices,
          visibleIf: "{applies_to_union} = 'Yes'",
          isRequired: true
        }
      ]
    },
    {
      type: "panel",
      name: "medical_rates_contributions",
      title: "Rates & Contributions (Monthly)",
      elements: [
        {
          type: "radiogroup",
          name: "separate_wellness_rates",
          title: "Separate wellness vs. non-wellness rates?",
          choices: yesNoChoices,
          isRequired: true
        },
        {
          type: "radiogroup",
          name: "rate_structure_type",
          title: "Select rate structure",
          choices: rateStructureChoices,
          isRequired: true
        },
        {
          type: "matrixdynamic",
          name: "standard_rates",
          title: "Standard 2025 Rates and Employee Contributions",
          visibleIf: "{separate_wellness_rates} = 'No'",
          rowCount: 4,
          allowAddRows: false,
          addRowLocation: "none",
          columns: [
            {
              name: "coverage_tier",
              title: "Coverage Tier",
              cellType: "expression",
              expression: "getTierName({rowIndex}, {rate_structure_type})"
            },
            {
              name: "enrolled",
              title: "# Enrolled",
              cellType: "text",
              inputType: "number",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              name: "rate",
              title: "2025 Rate (Monthly)",
              cellType: "text",
              inputType: "number",
              description: "Enter the COBRA rate minus 2% if applicable.",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              name: "employee_contribution",
              title: "Employee Contribution (Monthly)",
              cellType: "text",
              inputType: "number",
              validators: [{ type: "numeric", minValue: 0 }]
            }
          ]
        },
        {
          type: "matrixdynamic",
          name: "wellness_rates_matrix",
          title: "Wellness vs. Non-Wellness Rates",
          visibleIf: "{separate_wellness_rates} = 'Yes'",
          rowCount: 4,
          allowAddRows: false,
          addRowLocation: "none",
          columns: [
            {
              name: "coverage_tier",
              title: "Coverage Tier",
              cellType: "expression",
              expression: "getTierName({rowIndex}, {rate_structure_type})"
            },
            {
              name: "enrolled",
              title: "# Enrolled",
              cellType: "text",
              inputType: "number",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              name: "rate_with_wellness",
              title: "Rate - With Wellness",
              description: "Monthly premium with wellness participation.",
              cellType: "text",
              inputType: "number",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              name: "contribution_with_wellness",
              title: "Employee Contribution - With Wellness",
              cellType: "text",
              inputType: "number",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              name: "rate_without_wellness",
              title: "Rate - Without Wellness",
              cellType: "text",
              inputType: "number",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              name: "contribution_without_wellness",
              title: "Employee Contribution - Without Wellness",
              cellType: "text",
              inputType: "number",
              validators: [{ type: "numeric", minValue: 0 }]
            }
          ]
        },
        {
          type: "panel",
          name: "part_time_contribution_panel",
          title: "Part-Time Contribution Variations",
          elements: [
            {
              type: "radiogroup",
              name: "part_time_contributions_greater",
              title: "Are part-time contributions greater than full-time contributions?",
              choices: yesNoChoices,
              defaultValue: "No"
            },
            {
              type: "paneldynamic",
              name: "part_time_contribution_details",
              visibleIf: "{part_time_contributions_greater} = 'Yes'",
              title: "Provide details for each part-time category",
              minPanelCount: 1,
              maxPanelCount: 4,
              panelAddText: "Add part-time category",
              panelRemoveText: "Remove category",
              templateElements: [
                {
                  type: "text",
                  name: "category_label",
                  title: "Part-Time Category",
                  placeholder: "e.g., 20-24 hours/week"
                },
                {
                  type: "matrixdynamic",
                  name: "category_contributions",
                  title: "Contribution by Coverage Tier",
                  rowCount: 4,
                  allowAddRows: false,
                  addRowLocation: "none",
                  columns: [
                    {
                      name: "coverage_tier",
                      title: "Tier",
                      cellType: "expression",
                      expression: "getTierName({rowIndex}, {rate_structure_type})"
                    },
                    {
                      name: "contribution_amount",
                      title: "Part-Time Employee Contribution",
                      cellType: "text",
                      inputType: "number",
                      validators: [{ type: "numeric", minValue: 0 }]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: "radiogroup",
          name: "bundled_with_dental_or_vision",
          title: "Are medical and dental or vision plans bundled?",
          choices: yesNoChoices,
          description: "If yes, describe bundled products in the Notes section."
        },
        {
          type: "text",
          name: "medical_pharmacy_budget_increase",
          title: "2025 Medical / Pharmacy Budget Increase (%)",
          inputType: "number",
          suffix: "%",
          description: "Enter the final budget increase (after benefit changes).",
          validators: [{ type: "numeric" }]
        }
      ]
    },
    {
      type: "panel",
      name: "medical_plan_design",
      title: "Plan Design",
      elements: [
        {
          type: "dropdown",
          name: "hra_hsa_offering",
          title: "Offer HRA or HSA?",
          choices: [
            { value: "none", text: "No, neither" },
            { value: "hra", text: "Yes - HRA" },
            { value: "hsa", text: "Yes - HSA" },
            { value: "both", text: "Yes - Both" }
          ],
          isRequired: true
        },
        {
          type: "text",
          name: "employer_funded_hra_hsa_amount",
          title: "Employer-funded HRA/HSA Amount (Annual)",
          prefix: "$",
          inputType: "number",
          visibleIf: "{hra_hsa_offering} <> 'none'",
          validators: [{ type: "numeric", minValue: 0 }]
        },
        {
          type: "radiogroup",
          name: "custom_tier1_network",
          title: "Custom Tier 1 network/benefits at own facilities?",
          choices: yesNoChoices,
          isRequired: true
        },
        {
          type: "text",
          name: "deductible_individual",
          title: "Medical Deductible - Individual",
          prefix: "$",
          inputType: "number",
          validators: [{ type: "numeric", minValue: 0 }]
        },
        {
          type: "text",
          name: "deductible_family",
          title: "Medical Deductible - Family",
          prefix: "$",
          inputType: "number",
          validators: [{ type: "numeric", minValue: 0 }]
        },
        {
          type: "text",
          name: "oop_max_individual",
          title: "Out-of-Pocket Maximum - Individual",
          prefix: "$",
          inputType: "number",
          validators: [{ type: "numeric", minValue: 0 }]
        },
        {
          type: "text",
          name: "oop_max_family",
          title: "Out-of-Pocket Maximum - Family",
          prefix: "$",
          inputType: "number",
          validators: [{ type: "numeric", minValue: 0 }]
        },
        {
          type: "radiogroup",
          name: "rx_oop_combined",
          title: "Is the Rx OOP combined with Medical OOP?",
          choices: yesNoChoices,
          isRequired: true
        },
        {
          type: "text",
          name: "rx_oop_individual",
          title: "Rx Out-of-Pocket Max - Individual",
          prefix: "$",
          inputType: "number",
          visibleIf: "{rx_oop_combined} = 'No'",
          validators: [{ type: "numeric", minValue: 0 }]
        },
        {
          type: "text",
          name: "rx_oop_family",
          title: "Rx Out-of-Pocket Max - Family",
          prefix: "$",
          inputType: "number",
          visibleIf: "{rx_oop_combined} = 'No'",
          validators: [{ type: "numeric", minValue: 0 }]
        },
        {
          type: "panel",
          name: "physician_visit_copays",
          title: "Physician Visit Copays/Coinsurance (Employee Pays)",
          description: "If copay only, enter $ amount (e.g., $30). If coinsurance, enter percentage (e.g., 20%). If both, enter $ + %.",
          elements: [
            {
              type: "text",
              name: "primary_care_visit",
              title: "Primary Care Visit"
            },
            {
              type: "text",
              name: "specialty_care_visit",
              title: "Specialty Care Visit"
            },
            {
              type: "text",
              name: "telemedicine_visit",
              title: "Telemedicine Visit"
            }
          ]
        },
        {
          type: "panel",
          name: "hospital_services",
          title: "Hospital Services (Employee Pays)",
          elements: [
            {
              type: "text",
              name: "inpatient_services",
              title: "Inpatient"
            },
            {
              type: "text",
              name: "outpatient_services",
              title: "Outpatient"
            },
            {
              type: "radiogroup",
              name: "own_hospital_tier_exception",
              title: "Cover Tier 2 providers at Tier 1 level when own hospital unavailable?",
              choices: yesNoChoices,
              description: "Select Yes if services at other in-network facilities are covered at Tier 1 benefits when your own hospital cannot provide the service."
            },
            {
              type: "text",
              name: "own_hospital_tier_exception_details",
              title: "If yes, provide details",
              visibleIf: "{own_hospital_tier_exception} = 'Yes'"
            }
          ]
        },
        {
          type: "panel",
          name: "emergency_services",
          title: "Emergency Services",
          elements: [
            {
              type: "text",
              name: "emergency_department_visit",
              title: "Emergency Department Visit"
            },
            {
              type: "text",
              name: "urgent_care_visit",
              title: "Urgent Care Visit"
            }
          ]
        },
        {
          type: "panel",
          name: "prescription_drug_coverage",
          title: "Prescription Drug Coverage",
          elements: [
            {
              type: "radiogroup",
              name: "separate_rx_deductible",
              title: "Separate Rx deductible?",
              choices: yesNoChoices,
              isRequired: true
            },
            {
              type: "text",
              name: "rx_deductible_individual",
              title: "Rx Deductible - Individual",
              prefix: "$",
              inputType: "number",
              visibleIf: "{separate_rx_deductible} = 'Yes'",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              type: "text",
              name: "rx_deductible_family",
              title: "Rx Deductible - Family",
              prefix: "$",
              inputType: "number",
              visibleIf: "{separate_rx_deductible} = 'Yes'",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              type: "dropdown",
              name: "rx_deductible_waived_generics",
              title: "Deductible waived for generics?",
              choices: ["Yes", "No", "Not Applicable"],
              isRequired: true
            },
            {
              type: "matrix",
              name: "rx_copays",
              title: "Rx Copays / Coinsurance (Employee Pays)",
              description: "Enter dollar amounts, percentages, or a combination (e.g., $10 or 20% or $10 + 20%).",
              columns: [
                { value: "retail", text: "Retail" },
                { value: "mail", text: "Mail Order" }
              ],
              rows: [
                { value: "generic", text: "Generic" },
                { value: "brand_formulary", text: "Brand Formulary" },
                { value: "brand_nonformulary", text: "Brand Non-Formulary" },
                { value: "specialty", text: "Specialty / 4th Tier" }
              ],
              cellType: "text"
            },
            {
              type: "text",
              name: "coinsurance_max_per_rx",
              title: "Coinsurance Maximum (per prescription)",
              prefix: "$",
              inputType: "number",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              type: "text",
              name: "mail_order_copay_description",
              title: "Mail Order Copay",
              description: "If expressed as multiple of retail copay, note it here (e.g., 2x retail)."
            },
            {
              type: "dropdown",
              name: "mail_order_supply_limit",
              title: "Mail Order Supply Limit",
              choices: supplyLimitChoices,
              hasOther: true
            }
          ]
        },
        {
          type: "panel",
          name: "other_plan_features",
          title: "Other Plan Features",
          elements: [
            {
              type: "dropdown",
              name: "aca_grandfathered_plan",
              title: "ACA Grandfathered Plan?",
              choices: yesNoChoices,
              isRequired: true
            },
            {
              type: "dropdown",
              name: "own_hospital_pricing",
              title: "Own-hospital pricing for self-funded plans",
              description: "If self-funded, how are services at own facilities priced?",
              choices: [
                "PPO network rate",
                "Medicare rate",
                "Reference-based pricing",
                "Discounted charge",
                "Not applicable"
              ],
              hasOther: true
            },
            {
              type: "radiogroup",
              name: "mandatory_services_own_hospital",
              title: "Mandatory services at own hospital?",
              choices: yesNoChoices
            },
            {
              type: "comment",
              name: "medical_plan_notes",
              title: "Notes – Medical Plan",
              description: "Use this space for plan names, contribution nuances, bundled offerings, or other clarifications.",
              rows: 5
            }
          ]
        }
      ]
    }
  ]
};

const dentalPlanTemplates = {
  type: "paneldynamic",
  name: "dental_plans",
  title: "Dental Plans",
  description: "Provide information for each dental plan (up to 4).",
  minPanelCount: 1,
  maxPanelCount: 4,
  panelAddText: "Add another dental plan",
  panelRemoveText: "Remove this dental plan",
  templateTitle: "Dental Plan #{panelIndex}",
  renderMode: "list",
  templateElements: [
    {
      type: "panel",
      name: "dental_plan_information",
      title: "Plan Information",
      elements: [
        {
          type: "dropdown",
          name: "plan_type",
          title: "Plan Type",
          choices: dentalPlanTypes,
          hasOther: true,
          isRequired: true
        },
        {
          type: "text",
          name: "plan_name",
          title: "Dental Plan Name",
          isRequired: true
        },
        {
          type: "dropdown",
          name: "carrier_network",
          title: "Carrier / Network",
          choices: carrierChoices,
          hasOther: true,
          otherPlaceholder: "Enter carrier/network"
        },
        {
          type: "dropdown",
          name: "funding_mechanism",
          title: "Funding Mechanism",
          choices: ["Fully Insured", "Self-Funded", "Level-Funded"],
          hasOther: true,
          isRequired: true
        },
        {
          type: "text",
          name: "eligible_employees_enrolled",
          title: "Eligible Employees Enrolled",
          inputType: "number",
          min: 0,
          isRequired: true,
          validators: [{ type: "numeric", minValue: 0 }]
        },
        {
          type: "text",
          name: "total_rate_tiers",
          title: "Total Number of Rate Tiers",
          inputType: "number",
          min: 1,
          validators: [{ type: "numeric", minValue: 1 }]
        }
      ]
    },
    {
      type: "panel",
      name: "dental_rates_contributions",
      title: "Rates & Contributions (Monthly)",
      elements: [
        {
          type: "radiogroup",
          name: "rate_structure_type",
          title: "Select rate structure",
          choices: rateStructureChoices,
          isRequired: true
        },
        {
          type: "matrixdynamic",
          name: "rate_tiers",
          title: "2025 Rates and Contributions",
          rowCount: 4,
          allowAddRows: false,
          addRowLocation: "none",
          columns: [
            {
              name: "coverage_tier",
              title: "Coverage Tier",
              cellType: "expression",
              expression: "getTierName({rowIndex}, {rate_structure_type})"
            },
            {
              name: "enrolled",
              title: "# Enrolled",
              cellType: "text",
              inputType: "number",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              name: "rate",
              title: "2025 Rate (Monthly)",
              cellType: "text",
              inputType: "number",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              name: "employee_contribution",
              title: "Employee Contribution (Monthly)",
              cellType: "text",
              inputType: "number",
              validators: [{ type: "numeric", minValue: 0 }]
            }
          ]
        },
        {
          type: "text",
          name: "dental_budget_increase",
          title: "2025 Dental Budget Increase (%)",
          inputType: "number",
          suffix: "%",
          validators: [{ type: "numeric" }]
        }
      ]
    },
    {
      type: "panel",
      name: "dental_plan_design",
      title: "Plan Design",
      elements: [
        {
          type: "matrix",
          name: "deductibles",
          title: "Annual Deductible (per person)",
          columns: [
            { value: "in_network", text: "In-Network" },
            { value: "out_network", text: "Out-of-Network" }
          ],
          rows: [
            { value: "individual", text: "Individual" },
            { value: "family", text: "Family" }
          ],
          cellType: "text",
          description: "Enter $0 if no deductible applies."
        },
        {
          type: "matrix",
          name: "max_annual_benefit",
          title: "Maximum Annual Benefit (excluding orthodontia)",
          columns: [
            { value: "in_network", text: "In-Network" },
            { value: "out_network", text: "Out-of-Network" }
          ],
          rows: [
            { value: "per_person", text: "Per Person" }
          ],
          cellType: "text"
        },
        {
          type: "matrix",
          name: "coverage_percentages",
          title: "Plan Pays %",
          columns: [
            { value: "in_network", text: "In-Network" },
            { value: "out_network", text: "Out-of-Network" }
          ],
          rows: [
            { value: "preventive", text: "Preventive / Diagnostic" },
            { value: "basic", text: "Basic Services" },
            { value: "major", text: "Major / Prosthodontic" }
          ],
          cellType: "text",
          description: "Enter percentage values (e.g., 100%)."
        },
        {
          type: "dropdown",
          name: "orthodontia_included",
          title: "Includes orthodontia benefit?",
          choices: yesNoChoices,
          isRequired: true
        },
        {
          type: "panel",
          name: "orthodontia_details",
          title: "Orthodontia Coverage Details",
          visibleIf: "{orthodontia_included} = 'Yes'",
          elements: [
            {
              type: "text",
              name: "adult_orthodontia",
              title: "Adult Orthodontia Coverage",
              description: "Example: 50% coverage up to $1,500 lifetime."
            },
            {
              type: "text",
              name: "child_orthodontia",
              title: "Child Orthodontia Coverage",
              description: "Example: 50% coverage up to $1,500 lifetime."
            },
            {
              type: "matrix",
              name: "orthodontia_lifetime_max",
              title: "Maximum Lifetime Ortho Benefit",
              columns: [
                { value: "in_network", text: "In-Network" },
                { value: "out_network", text: "Out-of-Network" }
              ],
              rows: [
                { value: "per_person", text: "Per Person" }
              ],
              cellType: "text",
              description: "Enter $ amount or leave blank if not applicable."
            }
          ]
        },
        {
          type: "comment",
          name: "dental_plan_notes",
          title: "Notes – Dental Plan",
          description: "Add any additional context or explanations for the dental plan.",
          rows: 4
        }
      ]
    }
  ]
};

const visionPlanTemplates = {
  type: "paneldynamic",
  name: "vision_plans",
  title: "Vision Plans",
  description: "Provide information for each vision plan (up to 2).",
  minPanelCount: 1,
  maxPanelCount: 2,
  panelAddText: "Add another vision plan",
  panelRemoveText: "Remove this vision plan",
  templateTitle: "Vision Plan #{panelIndex}",
  renderMode: "list",
  templateElements: [
    {
      type: "panel",
      name: "vision_plan_information",
      title: "Plan Information",
      elements: [
        {
          type: "dropdown",
          name: "plan_type",
          title: "Plan Type",
          choices: visionPlanTypes,
          hasOther: true,
          isRequired: true
        },
        {
          type: "text",
          name: "plan_name",
          title: "Vision Plan Name",
          isRequired: true
        },
        {
          type: "dropdown",
          name: "carrier_network",
          title: "Carrier / Network",
          choices: carrierChoices,
          hasOther: true,
          otherPlaceholder: "Enter carrier/network"
        },
        {
          type: "dropdown",
          name: "offered_as_standalone",
          title: "Offered as stand-alone?",
          choices: yesNoChoices,
          isRequired: true
        },
        {
          type: "dropdown",
          name: "contribution_basis",
          title: "Contribution Basis",
          choices: [
            "Employer Paid",
            "100% Voluntary (Employee Paid)",
            "Employer + Employee Contributory",
            "Other"
          ],
          hasOther: true,
          isRequired: true
        },
        {
          type: "dropdown",
          name: "funding_mechanism",
          title: "Funding Mechanism",
          choices: ["Fully Insured", "Self-Funded"],
          hasOther: true,
          isRequired: true
        },
        {
          type: "text",
          name: "eligible_employees_enrolled",
          title: "Eligible Employees Enrolled",
          inputType: "number",
          min: 0,
          isRequired: true,
          validators: [{ type: "numeric", minValue: 0 }]
        },
        {
          type: "text",
          name: "total_rate_tiers",
          title: "Total Number of Rate Tiers",
          inputType: "number",
          min: 1,
          validators: [{ type: "numeric", minValue: 1 }]
        }
      ]
    },
    {
      type: "panel",
      name: "vision_rates_contributions",
      title: "Rates & Contributions",
      elements: [
        {
          type: "radiogroup",
          name: "rate_structure_type",
          title: "Select rate structure",
          choices: rateStructureChoices,
          isRequired: true
        },
        {
          type: "matrixdynamic",
          name: "rate_tiers",
          title: "2025 Rates and Employee Contributions",
          rowCount: 4,
          allowAddRows: false,
          addRowLocation: "none",
          columns: [
            {
              name: "coverage_tier",
              title: "Coverage Tier",
              cellType: "expression",
              expression: "getTierName({rowIndex}, {rate_structure_type})"
            },
            {
              name: "enrolled",
              title: "# Enrolled",
              cellType: "text",
              inputType: "number",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              name: "rate",
              title: "2025 Rate (Monthly)",
              cellType: "text",
              inputType: "number",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              name: "employee_contribution",
              title: "Employee Contribution (Monthly)",
              cellType: "text",
              inputType: "number",
              validators: [{ type: "numeric", minValue: 0 }]
            }
          ]
        },
        {
          type: "text",
          name: "vision_budget_increase",
          title: "2025 Vision Budget Increase (%)",
          inputType: "number",
          suffix: "%",
          validators: [{ type: "numeric" }]
        }
      ]
    },
    {
      type: "panel",
      name: "vision_plan_design",
      title: "Plan Design",
      elements: [
        {
          type: "radiogroup",
          name: "combined_exam_materials_copay",
          title: "Exam & materials copay combined?",
          choices: yesNoChoices,
          isRequired: true
        },
        {
          type: "text",
          name: "combined_exam_materials_amount",
          title: "Combined Exam/Materials Copay",
          visibleIf: "{combined_exam_materials_copay} = 'Yes'",
          description: "Enter dollar amount for combined copay."
        },
        {
          type: "panel",
          name: "separate_copays_panel",
          visibleIf: "{combined_exam_materials_copay} = 'No'",
          title: "Separate Copays",
          elements: [
            {
              type: "text",
              name: "exam_copay",
              title: "Exam Copay"
            },
            {
              type: "text",
              name: "materials_copay",
              title: "Materials Copay"
            }
          ]
        },
        {
          type: "panel",
          name: "vision_allowances",
          title: "Vision Allowances (In-Network)",
          description: "If covered in full, enter 100%. If allowance, enter dollar amount.",
          elements: [
            { type: "text", name: "exam_allowance", title: "Exam" },
            { type: "text", name: "standard_lenses_allowance", title: "Standard Lenses" },
            { type: "text", name: "frames_allowance", title: "Frames" },
            { type: "text", name: "contacts_allowance", title: "Contacts" }
          ]
        },
        {
          type: "panel",
          name: "benefit_frequency",
          title: "Benefit Frequency (Months)",
          elements: [
            {
              type: "dropdown",
              name: "exam_frequency",
              title: "Exam",
              choices: frequencyChoices,
              hasOther: true
            },
            {
              type: "dropdown",
              name: "lens_frequency",
              title: "Lenses",
              choices: frequencyChoices,
              hasOther: true
            },
            {
              type: "dropdown",
              name: "frames_frequency",
              title: "Frames",
              choices: frequencyChoices,
              hasOther: true
            },
            {
              type: "dropdown",
              name: "contacts_frequency",
              title: "Contacts",
              choices: frequencyChoices,
              hasOther: true
            }
          ]
        },
        {
          type: "comment",
          name: "vision_plan_notes",
          title: "Notes – Vision Plan",
          rows: 4
        }
      ]
    }
  ]
};

export const healthcareBenefitsSurvey: SurveyConfiguration = {
  id: "keenan-benefits-2025",
  title: "Health Care Benefits Strategy Survey - 2025",
  description: "Comprehensive assessment of medical, dental, vision, life/disability, retirement, and strategy programs.",
  version: "2025.1.0",
  theme: {
    primaryColor: "#0066CC",
    secondaryColor: "#004990",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "8px",
    spacing: "comfortable"
  },
  sections: [
    {
      id: "general-information",
      title: "General Information",
      icon: "building",
      pages: [
        {
          id: "organization-basics",
          title: "Organization Details",
          elements: [
            {
              type: "panel",
              name: "organization_panel",
              title: "General Information",
              elements: [
                {
                  type: "text",
                  name: "organization_name",
                  title: "Organization Name",
                  isRequired: true,
                  placeholder: "e.g., Pomona Valley Hospital Medical Center"
                },
                {
                  type: "text",
                  name: "interviewee_name",
                  title: "Interviewee Name",
                  isRequired: true
                },
                {
                  type: "text",
                  name: "interviewee_title",
                  title: "Interviewee Title",
                  isRequired: true
                },
                {
                  type: "text",
                  name: "interviewer_name",
                  title: "Interviewer Name"
                },
                {
                  type: "text",
                  name: "interview_date",
                  title: "Interview Date",
                  inputType: "date",
                  description: "Use MM/DD/YYYY format if entering manually."
                },
                {
                  type: "dropdown",
                  name: "location_represented",
                  title: "Location Represented",
                  choices: [
                    "So Cal (except SD)",
                    "Los Angeles / Inland Empire",
                    "Orange County",
                    "San Diego County",
                    "Central Valley",
                    "Northern California",
                    "Out-of-State",
                    "Other"
                  ],
                  hasOther: true,
                  isRequired: true
                },
                {
                  type: "radiogroup",
                  name: "new_enrollment_packet_received",
                  title: "New enrollment packet received?",
                  choices: yesNoChoices
                },
                {
                  type: "dropdown",
                  name: "medical_plan_renewal_month",
                  title: "Medical Plan Renewal Month",
                  choices: months,
                  isRequired: true
                }
              ]
            }
          ]
        },
        {
          id: "employee-totals",
          title: "Employee Population",
          elements: [
            {
              type: "panel",
              name: "employee_counts_panel",
              title: "Benefit Eligible Populations",
              description: "Enter whole numbers. If a category does not apply, leave blank or enter 0.",
              elements: [
                {
                  type: "text",
                  name: "benefit_eligible_full_time",
                  title: "Benefit Eligible – Full-Time",
                  inputType: "number",
                  min: 0,
                  validators: [{ type: "numeric", minValue: 0 }]
                },
                {
                  type: "text",
                  name: "benefit_eligible_part_time",
                  title: "Benefit Eligible – Part-Time",
                  inputType: "number",
                  min: 0,
                  description: "If not applicable, leave blank.",
                  validators: [{ type: "numeric", minValue: 0 }]
                },
                {
                  type: "text",
                  name: "per_diem_not_benefit_eligible",
                  title: "Per Diems & Not Benefit Eligible",
                  inputType: "number",
                  min: 0,
                  validators: [{ type: "numeric", minValue: 0 }]
                },
                {
                  type: "expression",
                  name: "total_employees",
                  title: "Total Employees",
                  expression: "iif({benefit_eligible_full_time} notempty, {benefit_eligible_full_time}, 0) + iif({benefit_eligible_part_time} notempty, {benefit_eligible_part_time}, 0) + iif({per_diem_not_benefit_eligible} notempty, {per_diem_not_benefit_eligible}, 0)",
                  description: "Auto-calculated as totals are entered.",
                  displayStyle: "decimal",
                  startWithNewLine: false
                }
              ]
            },
            {
              type: "panel",
              name: "union_panel",
              title: "Union Representation",
              description: "If union population is present, provide either number or percent (both optional).",
              elements: [
                {
                  type: "radiogroup",
                  name: "union_population",
                  title: "Union population?",
                  choices: yesNoChoices,
                  isRequired: true
                },
                {
                  type: "text",
                  name: "union_employee_count",
                  title: "# of Union Employees",
                  inputType: "number",
                  min: 0,
                  visibleIf: "{union_population} = 'Yes'",
                  description: "If unknown, leave blank.",
                  validators: [{ type: "numeric", minValue: 0 }]
                },
                {
                  type: "text",
                  name: "union_employee_percent",
                  title: "% of Union Employees",
                  inputType: "number",
                  min: 0,
                  max: 100,
                  suffix: "%",
                  visibleIf: "{union_population} = 'Yes'",
                  description: "Indicate percentage if known. Leave blank if not applicable.",
                  validators: [{ type: "numeric", minValue: 0, maxValue: 100 }]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "medical-plans",
      title: "Medical Plan Details",
      icon: "hospital",
      pages: [
        {
          id: "medical-plans-overview",
          title: "Medical Plans",
          elements: [medicalPlanTemplates]
        }
      ]
    },
    {
      id: "dental-plans",
      title: "Dental Plan Details",
      icon: "tooth",
      pages: [
        {
          id: "dental-plans-overview",
          title: "Dental Plans",
          elements: [dentalPlanTemplates]
        }
      ]
    },
    {
      id: "vision-plans",
      title: "Vision Plan Details",
      icon: "eye",
      pages: [
        {
          id: "vision-plans-overview",
          title: "Vision Plans",
          elements: [visionPlanTemplates]
        }
      ]
    },
    {
      id: "life-disability",
      title: "Basic Life & Disability",
      icon: "shield",
      pages: [
        {
          id: "basic-life",
          title: "Basic Life Insurance",
          elements: [
            {
              type: "panel",
              name: "basic_life_management",
              title: employeeClassDescriptions.management,
              elements: [
                {
                  type: "dropdown",
                  name: "basic_life_management_coverage_type",
                  title: "Coverage Type",
                  choices: coverageTypeChoices,
                  hasOther: true
                },
                {
                  type: "text",
                  name: "basic_life_management_flat_amount",
                  title: "Coverage – Flat Amount",
                  prefix: "$",
                  inputType: "number",
                  visibleIf: "{basic_life_management_coverage_type} = 'flat'",
                  validators: [{ type: "numeric", minValue: 0 }]
                },
                {
                  type: "dropdown",
                  name: "basic_life_management_salary_multiple",
                  title: "Coverage – Multiple of Salary",
                  choices: salaryMultipleChoices,
                  hasOther: true,
                  visibleIf: "{basic_life_management_coverage_type} = 'salary_multiple'"
                },
                {
                  type: "text",
                  name: "basic_life_management_maximum",
                  title: "Maximum Coverage (Cap)",
                  prefix: "$",
                  inputType: "number",
                  visibleIf: "{basic_life_management_coverage_type} <> ''",
                  validators: [{ type: "numeric", minValue: 0 }]
                }
              ]
            },
            {
              type: "panel",
              name: "basic_life_non_management",
              title: employeeClassDescriptions.nonManagement,
              elements: [
                {
                  type: "dropdown",
                  name: "basic_life_non_management_coverage_type",
                  title: "Coverage Type",
                  choices: coverageTypeChoices,
                  hasOther: true
                },
                {
                  type: "text",
                  name: "basic_life_non_management_flat_amount",
                  title: "Coverage – Flat Amount",
                  prefix: "$",
                  inputType: "number",
                  visibleIf: "{basic_life_non_management_coverage_type} = 'flat'",
                  validators: [{ type: "numeric", minValue: 0 }]
                },
                {
                  type: "dropdown",
                  name: "basic_life_non_management_salary_multiple",
                  title: "Coverage – Multiple of Salary",
                  choices: salaryMultipleChoices,
                  hasOther: true,
                  visibleIf: "{basic_life_non_management_coverage_type} = 'salary_multiple'"
                },
                {
                  type: "text",
                  name: "basic_life_non_management_maximum",
                  title: "Maximum Coverage (Cap)",
                  prefix: "$",
                  inputType: "number",
                  visibleIf: "{basic_life_non_management_coverage_type} <> ''",
                  validators: [{ type: "numeric", minValue: 0 }]
                }
              ]
            }
          ]
        },
        {
          id: "short-term-disability",
          title: "Short-Term Disability",
          elements: [
            {
              type: "dropdown",
              name: "sdi_only_option",
              title: "Short-Term Disability Approach",
              choices: [
                { value: "sdi_only", text: "Yes – use state disability insurance (SDI) only" },
                { value: "std_plan", text: "No – employer-sponsored STD plan" },
                { value: "blended", text: "Combination of SDI and employer plan" }
              ],
              description: "Select the option that best describes your program."
            },
            {
              type: "dropdown",
              name: "sdi_funding_option",
              title: "SDI funding option",
              choices: [
                "Employer paid",
                "Employee paid",
                "Shared cost",
                "Not applicable"
              ],
              visibleIf: "{sdi_only_option} = 'sdi_only' or {sdi_only_option} = 'blended'"
            },
            {
              type: "panel",
              name: "std_plan_details",
              title: "STD Plan Design (Employer Paid – Full-Time Employees)",
              visibleIf: "{sdi_only_option} <> 'sdi_only'",
              elements: [
                {
                  type: "matrixdropdown",
                  name: "std_plan_design",
                  title: "Plan parameters",
                  columns: [
                    {
                      name: "management",
                      title: employeeClassDescriptions.management,
                      cellType: "text"
                    },
                    {
                      name: "non_management",
                      title: employeeClassDescriptions.nonManagement,
                      cellType: "text"
                    }
                  ],
                  rows: [
                    {
                      value: "elimination_period_days",
                      text: "Elimination period (days)"
                    },
                    {
                      value: "benefit_percent",
                      text: "Benefit % of salary"
                    },
                    {
                      value: "weekly_benefit_max",
                      text: "Weekly benefit maximum ($)"
                    }
                  ],
                  detailPanelMode: "underRow",
                  description: "Enter numeric values or describe if varies by union/tenure."
                }
              ]
            },
            {
              type: "matrix",
              name: "std_buy_up_offered",
              title: "STD Buy-Up (Employee Paid)",
              columns: yesNoChoices,
              rows: [
                { value: "management", text: employeeClassDescriptions.management },
                { value: "non_management", text: employeeClassDescriptions.nonManagement }
              ],
              description: "Select Yes if employees can purchase additional STD coverage."
            }
          ]
        },
        {
          id: "long-term-disability",
          title: "Long-Term Disability",
          elements: [
            {
              type: "panel",
              name: "ltd_plan_details",
              title: "LTD Plan Design (Employer Paid – Full-Time Employees)",
              elements: [
                {
                  type: "matrixdropdown",
                  name: "ltd_plan_design",
                  title: "Plan parameters",
                  columns: [
                    {
                      name: "management",
                      title: employeeClassDescriptions.management,
                      cellType: "text"
                    },
                    {
                      name: "non_management",
                      title: employeeClassDescriptions.nonManagement,
                      cellType: "text"
                    }
                  ],
                  rows: [
                    { value: "elimination_period_days", text: "Elimination period (days)" },
                    { value: "benefit_percent", text: "Benefit % of salary" },
                    { value: "monthly_benefit_max", text: "Monthly benefit maximum ($)" }
                  ],
                  description: "Enter values (e.g., 180 days, 60%, $6,000)."
                }
              ]
            },
            {
              type: "matrix",
              name: "ltd_buy_up_offered",
              title: "LTD Buy-Up (Employee Paid)",
              columns: yesNoChoices,
              rows: [
                { value: "management", text: employeeClassDescriptions.management },
                { value: "non_management", text: employeeClassDescriptions.nonManagement }
              ]
            },
            {
              type: "comment",
              name: "life_disability_notes",
              title: "Notes – Life & Disability",
              description: "Add clarification on SDI integration, elimination periods, or other nuances.",
              rows: 5
            }
          ]
        }
      ]
    },
    {
      id: "retirement",
      title: "Retirement Plans",
      icon: "piggy-bank",
      pages: [
        {
          id: "defined-contribution",
          title: "Defined Contribution Plans",
          elements: [
            {
              type: "radiogroup",
              name: "offer_defined_contribution",
              title: "Offer Defined Contribution / Deferred Compensation plan?",
              choices: yesNoChoices,
              isRequired: true
            },
            {
              type: "paneldynamic",
              name: "defined_contribution_plans",
              title: "Defined Contribution / Deferred Compensation Plans",
              visibleIf: "{offer_defined_contribution} = 'Yes'",
              minPanelCount: 1,
              maxPanelCount: 4,
              panelAddText: "Add another DC plan",
              panelRemoveText: "Remove this plan",
              templateTitle: "Plan #{panelIndex}",
              renderMode: "progressTop",
              templateElements: [
                {
                  type: "panel",
                  name: "dc_plan_overview",
                  title: "Plan Overview",
                  elements: [
                    {
                      type: "dropdown",
                      name: "plan_type",
                      title: "Plan Type",
                      choices: [
                        "401(k)",
                        "401(a)",
                        "403(b)",
                        "457(b)",
                        "457(f)",
                        "401(h)",
                        "Other"
                      ],
                      hasOther: true,
                      isRequired: true
                    },
                    {
                      type: "text",
                      name: "plan_name",
                      title: "Plan Name",
                      placeholder: "Optional"
                    },
                    {
                      type: "dropdown",
                      name: "employer_contribution_structure",
                      title: "Employer contribution structure",
                      choices: contributionStructureChoices,
                      isRequired: true
                    }
                  ]
                },
                {
                  type: "panel",
                  name: "dc_employer_contributions",
                  title: "Employer Contribution Details",
                  elements: [
                    {
                      type: "panel",
                      name: "flat_contribution_panel",
                      visibleIf: "{employer_contribution_structure} = 'flat'",
                      elements: [
                        {
                          type: "text",
                          name: "flat_match_percent",
                          title: "Employer match (% of employee contribution)",
                          suffix: "%",
                          inputType: "number",
                          validators: [{ type: "numeric", minValue: 0, maxValue: 100 }]
                        },
                        {
                          type: "text",
                          name: "flat_max_percent_of_salary",
                          title: "Maximum employer contribution (% of salary)",
                          suffix: "%",
                          inputType: "number",
                          validators: [{ type: "numeric", minValue: 0, maxValue: 100 }]
                        },
                        {
                          type: "text",
                          name: "flat_max_other",
                          title: "Maximum employer contribution (other criteria)",
                          description: "If flat contribution is a dollar amount or other metric."
                        }
                      ]
                    },
                    {
                      type: "panel",
                      name: "graduated_contribution_panel",
                      visibleIf: "{employer_contribution_structure} = 'graduated'",
                      elements: [
                        {
                          type: "text",
                          name: "new_hire_match_percent",
                          title: "New hire match (% of contribution)",
                          suffix: "%",
                          inputType: "number",
                          validators: [{ type: "numeric", minValue: 0, maxValue: 100 }]
                        },
                        {
                          type: "text",
                          name: "new_hire_max_percent_of_salary",
                          title: "New hire max contribution (% of salary)",
                          suffix: "%",
                          inputType: "number",
                          validators: [{ type: "numeric", minValue: 0, maxValue: 100 }]
                        },
                        {
                          type: "text",
                          name: "new_hire_other_cap",
                          title: "New hire max contribution (other criteria)"
                        },
                        {
                          type: "text",
                          name: "max_tenure_match_percent",
                          title: "Max tenure match (% of contribution)",
                          suffix: "%",
                          inputType: "number",
                          validators: [{ type: "numeric", minValue: 0, maxValue: 100 }]
                        },
                        {
                          type: "text",
                          name: "max_tenure_max_percent_of_salary",
                          title: "Max tenure contribution (% of salary)",
                          suffix: "%",
                          inputType: "number",
                          validators: [{ type: "numeric", minValue: 0, maxValue: 100 }]
                        },
                        {
                          type: "text",
                          name: "max_tenure_other_cap",
                          title: "Max tenure contribution (other criteria)"
                        }
                      ]
                    }
                  ]
                },
                {
                  type: "panel",
                  name: "dc_vesting_panel",
                  title: "Vesting Schedule",
                  elements: [
                    {
                      type: "text",
                      name: "initial_vesting_period_months",
                      title: "Initial vesting period (months)",
                      inputType: "number",
                      validators: [{ type: "numeric", minValue: 0 }]
                    },
                    {
                      type: "text",
                      name: "initial_vesting_other",
                      title: "Initial vesting period (other description)",
                      description: "Example: 2 years, 1,000 hours."
                    },
                    {
                      type: "text",
                      name: "initial_vesting_percent",
                      title: "Initial vesting %",
                      suffix: "%",
                      inputType: "number",
                      validators: [{ type: "numeric", minValue: 0, maxValue: 100 }]
                    },
                    {
                      type: "text",
                      name: "years_to_fully_vest",
                      title: "Years to fully vest",
                      inputType: "number",
                      validators: [{ type: "numeric", minValue: 0 }]
                    }
                  ]
                },
                {
                  type: "panel",
                  name: "dc_participation_panel",
                  title: "Participation",
                  elements: [
                    {
                      type: "dropdown",
                      name: "auto_enrollment",
                      title: "Auto-enrollment",
                      choices: autoEnrollmentChoices
                    },
                    {
                      type: "text",
                      name: "participation_rate",
                      title: "Participation rate",
                      suffix: "%",
                      inputType: "number",
                      validators: [{ type: "numeric", minValue: 0, maxValue: 100 }]
                    }
                  ]
                },
                {
                  type: "comment",
                  name: "dc_plan_notes",
                  title: "Notes for this plan",
                  rows: 3
                }
              ]
            }
          ]
        },
        {
          id: "pension",
          title: "Defined Benefit (Pension) Plan",
          elements: [
            {
              type: "radiogroup",
              name: "offer_defined_benefit",
              title: "Offer defined benefit pension plan?",
              choices: yesNoChoices,
              isRequired: true
            },
            {
              type: "panel",
              name: "pension_details",
              title: "Pension Plan Details",
              visibleIf: "{offer_defined_benefit} = 'Yes'",
              elements: [
                {
                  type: "dropdown",
                  name: "pension_eligible_groups",
                  title: "Eligible groups for pension",
                  choices: [
                    "All employees",
                    "Management only",
                    "Union employees",
                    "Legacy/closed group",
                    "Specific departments",
                    "Other"
                  ],
                  hasOther: true
                },
                {
                  type: "text",
                  name: "pension_eligible_groups_description",
                  title: "If specific, describe",
                  visibleIf: "{pension_eligible_groups} = 'Specific departments' or {pension_eligible_groups} = 'Other'"
                },
                {
                  type: "dropdown",
                  name: "retirement_attraction_importance",
                  title: "Importance of retirement plan for attraction/retention",
                  choices: attractionImportanceChoices
                },
                {
                  type: "dropdown",
                  name: "pension_benefit_formula",
                  title: "Benefit formula basis",
                  choices: benefitFormulaChoices,
                  hasOther: true
                },
                {
                  type: "text",
                  name: "pension_years_to_full_vest",
                  title: "Years to fully vest",
                  inputType: "number",
                  validators: [{ type: "numeric", minValue: 0 }]
                },
                {
                  type: "dropdown",
                  name: "pension_enhancements_planned",
                  title: "Enhancements planned for 2026 and beyond?",
                  choices: yesNoChoices,
                  hasOther: true
                },
                {
                  type: "comment",
                  name: "retirement_notes",
                  title: "Notes – Retirement",
                  rows: 5
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "time-off",
      title: "Time Off Policies",
      icon: "calendar",
      pages: [
        {
          id: "pto-structure",
          title: "Paid Time Off Structure",
          elements: [
            {
              type: "dropdown",
              name: "pto_integration",
              title: "Paid Time Off integration",
              choices: [
                { value: "integrated", text: "Fully Integrated PTO" },
                { value: "partial", text: "Partially Integrated PTO" },
                { value: "separate", text: "Separate vacation and sick banks" }
              ],
              isRequired: true
            },
            {
              type: "panel",
              name: "integrated_pto_panel",
              title: "Integrated PTO",
              visibleIf: "{pto_integration} = 'integrated' or {pto_integration} = 'partial'",
              description: "Provide annual PTO amounts in hours (1 day = 8 hours).",
              elements: [
                {
                  type: "text",
                  name: "pto_hours_starting",
                  title: "PTO hours – Starting (new hires)",
                  inputType: "number",
                  validators: [{ type: "numeric", minValue: 0 }]
                },
                {
                  type: "text",
                  name: "pto_hours_max",
                  title: "PTO hours – Maximum (max tenure)",
                  inputType: "number",
                  validators: [{ type: "numeric", minValue: 0 }]
                },
                {
                  type: "text",
                  name: "pto_accrual_cap",
                  title: "PTO accrual cap (hours)",
                  inputType: "number",
                  validators: [{ type: "numeric", minValue: 0 }]
                }
              ]
            },
            {
              type: "panel",
              name: "separate_vacation_panel",
              title: "Vacation Bank",
              visibleIf: "{pto_integration} = 'separate'",
              elements: [
                {
                  type: "text",
                  name: "vacation_hours_starting",
                  title: "Vacation hours – Starting",
                  inputType: "number",
                  validators: [{ type: "numeric", minValue: 0 }]
                },
                {
                  type: "text",
                  name: "vacation_hours_max",
                  title: "Vacation hours – Maximum",
                  inputType: "number",
                  validators: [{ type: "numeric", minValue: 0 }]
                },
                {
                  type: "text",
                  name: "vacation_accrual_cap",
                  title: "Vacation accrual cap (hours)",
                  inputType: "number",
                  validators: [{ type: "numeric", minValue: 0 }]
                }
              ]
            },
            {
              type: "panel",
              name: "separate_sick_panel",
              title: "Sick Bank",
              visibleIf: "{pto_integration} = 'separate'",
              elements: [
                {
                  type: "text",
                  name: "sick_hours_starting",
                  title: "Sick hours – Starting",
                  inputType: "number",
                  validators: [{ type: "numeric", minValue: 0 }]
                },
                {
                  type: "text",
                  name: "sick_hours_max",
                  title: "Sick hours – Maximum",
                  inputType: "number",
                  validators: [{ type: "numeric", minValue: 0 }]
                },
                {
                  type: "text",
                  name: "sick_accrual_cap",
                  title: "Sick accrual cap (hours)",
                  inputType: "number",
                  validators: [{ type: "numeric", minValue: 0 }]
                }
              ]
            }
          ]
        },
        {
          id: "holidays-flex",
          title: "Holidays & Flexible Days",
          elements: [
            {
              type: "text",
              name: "paid_holidays_days",
              title: "Paid holidays (days)",
              inputType: "number",
              description: "Enter total number of paid holidays provided each year.",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              type: "radiogroup",
              name: "flexible_days_offered",
              title: "Flexible personal days offered?",
              choices: yesNoChoices,
              defaultValue: "No"
            },
            {
              type: "text",
              name: "flexible_days_count",
              title: "# of flexible days",
              inputType: "number",
              visibleIf: "{flexible_days_offered} = 'Yes'",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              type: "comment",
              name: "time_off_notes",
              title: "Notes – Time Off",
              rows: 4
            }
          ]
        }
      ]
    },
    {
      id: "benefits-strategy",
      title: "Benefits Strategy",
      icon: "strategy",
      pages: [
        {
          id: "strategy-objectives",
          title: "Objectives & Strategy",
          elements: [
            {
              type: "matrixdropdown",
              name: "benefit_program_objectives",
              title: "Key benefit program objectives (2025-2026)",
              description: "Indicate the priority level for each objective.",
              columns: [
                { name: "priority", title: "Priority", cellType: "dropdown", choices: objectiveRatingChoices }
              ],
              rows: [
                { value: "increase_competitiveness", text: "Increase competitiveness" },
                { value: "improve_workforce_health", text: "Improve workforce health" },
                { value: "increase_domestic_services", text: "Increase use of domestic services" },
                { value: "retention_satisfaction", text: "Retention / employee satisfaction" },
                { value: "retirement", text: "Retirement readiness" },
                { value: "culture", text: "Culture" },
                { value: "career_opportunity", text: "Career opportunity" },
                { value: "worktime_flexibility", text: "Worktime / flexibility" },
                { value: "time_off", text: "Time off" },
                { value: "other_benefits", text: "Other benefits" }
              ]
            }
          ]
        },
        {
          id: "eligibility-plan-changes",
          title: "Eligibility & Plan Changes",
          elements: [
            {
              type: "radiogroup",
              name: "consider_medical_eligibility_changes",
              title: "Considering significant changes to medical eligibility?",
              choices: yesNoChoices
            },
            {
              type: "matrixdropdown",
              name: "medical_eligibility_changes",
              title: "Eligibility change levers",
              visibleIf: "{consider_medical_eligibility_changes} = 'Yes'",
              columns: [
                { name: "status", title: "Status", cellType: "dropdown", choices: considerationChoices }
              ],
              rows: [
                { value: "spousal_surcharge", text: "Spousal surcharge / elimination" },
                { value: "coverage_elsewhere_incentive", text: "Incentives for dependents to seek other coverage" },
                { value: "dependent_audit", text: "Dependent eligibility audit" }
              ]
            },
            {
              type: "radiogroup",
              name: "consider_medical_plan_option_changes",
              title: "Considering significant changes to medical plan options?",
              choices: yesNoChoices
            },
            {
              type: "matrixdropdown",
              name: "medical_plan_option_changes",
              title: "Plan option changes",
              visibleIf: "{consider_medical_plan_option_changes} = 'Yes'",
              columns: [
                { name: "status", title: "Status", cellType: "dropdown", choices: considerationChoices }
              ],
              rows: [
                { value: "offer_hsa_plan", text: "Offer high deductible HSA/HRA compatible plan" },
                { value: "narrow_network", text: "Offer narrower network" },
                { value: "fertility_carve_out", text: "Fertility benefit carve-out" },
                { value: "fully_insured_to_self_funded", text: "Change from fully insured to self-funded" }
              ]
            },
            {
              type: "radiogroup",
              name: "consider_medical_cost_sharing_changes",
              title: "Considering significant changes to medical cost sharing?",
              choices: yesNoChoices
            },
            {
              type: "matrixdropdown",
              name: "medical_cost_sharing_changes",
              title: "Cost sharing levers",
              visibleIf: "{consider_medical_cost_sharing_changes} = 'Yes'",
              columns: [
                { name: "status", title: "Status", cellType: "dropdown", choices: considerationChoices }
              ],
              rows: [
                { value: "increase_employee_contribution", text: "Increase employee contribution" },
                { value: "increase_dependent_contribution", text: "Increase dependent contribution" },
                { value: "increase_member_cost_share", text: "Increase copay / coinsurance" }
              ]
            },
            {
              type: "matrixdropdown",
              name: "new_surcharges",
              title: "New surcharges / exclusions",
              columns: [
                { name: "status", title: "Status", cellType: "dropdown", choices: surchargeStatusChoices },
                {
                  name: "amount",
                  title: "Monthly surcharge amount",
                  cellType: "text",
                  inputType: "number",
                  prefix: "$",
                  visibleIf: "{row.status} = 'in_place' or {row.status} = 'will_consider'",
                  isRequired: true,
                  validators: [{ type: "numeric", minValue: 0 }]
                }
              ],
              rows: [
                { value: "tobacco_surcharge", text: "Tobacco use surcharge" },
                { value: "spousal_surcharge", text: "Spousal surcharge" },
                { value: "working_spouse_exclusion", text: "Working spouse exclusion" }
              ]
            }
          ]
        },
        {
          id: "domestic-steerage",
          title: "Domestic Steerage & Networks",
          elements: [
            {
              type: "matrix",
              name: "domestic_steerage_incentives",
              title: "Benefit incentives to use own facilities",
              columns: yesNoChoices,
              rows: [
                { value: "hospital", text: "Own hospital" },
                { value: "associated_physicians", text: "Associated physicians" },
                { value: "in_house_pharmacy", text: "In-house pharmacy" }
              ]
            },
            {
              type: "radiogroup",
              name: "any_self_funded_plans",
              title: "Do you offer any self-funded medical plans?",
              choices: yesNoChoices
            },
            {
              type: "radiogroup",
              name: "direct_contracts",
              title: "Direct contract discount arrangements with providers?",
              choices: yesNoChoices,
              visibleIf: "{any_self_funded_plans} = 'Yes'"
            },
            {
              type: "checkbox",
              name: "direct_contract_provider_types",
              title: "If yes, which providers?",
              choices: providerTypes,
              visibleIf: "{any_self_funded_plans} = 'Yes' and {direct_contracts} = 'Yes'"
            }
          ]
        },
        {
          id: "communications-stoploss",
          title: "Communications & Stop Loss",
          elements: [
            {
              type: "checkbox",
              name: "effective_open_enrollment_techniques",
              title: "Most effective Open Enrollment communication techniques (select up to 3)",
              maxSelectedChoices: 3,
              choices: [
                { value: "onsite_fair", text: "Onsite benefits fair" },
                { value: "virtual_fair", text: "Virtual benefits fair / meetings" },
                { value: "written_mail", text: "Written communication / mail" },
                { value: "online_resources", text: "Online resources / self-service website" },
                { value: "electronic_notifications", text: "Electronic notifications (email, text, push)" },
                { value: "benefit_counselors", text: "Benefit counselors (1:1 support)" },
                { value: "hr_meetings", text: "HR / employee meetings" },
                { value: "call_center", text: "Call center" },
                { value: "ai_decision_support", text: "AI decision support tools" }
              ]
            },
            {
              type: "radiogroup",
              name: "using_decision_support",
              title: "Using technology to support member decisions?",
              choices: yesNoChoices
            },
            {
              type: "text",
              name: "decision_support_vendor",
              title: "Decision support vendor",
              placeholder: "e.g., ALEX, MyChoice, Nayya",
              visibleIf: "{using_decision_support} = 'Yes'"
            },
            {
              type: "panel",
              name: "stop_loss_panel",
              title: "Stop Loss (Self-Funded Plans)",
              visibleIf: "{any_self_funded_plans} = 'Yes'",
              elements: [
                {
                  type: "radiogroup",
                  name: "specific_stop_loss",
                  title: "Purchase specific stop loss insurance?",
                  choices: yesNoChoices
                },
                {
                  type: "dropdown",
                  name: "specific_stop_loss_deductible",
                  title: "Specific stop loss deductible / attachment point",
                  choices: stopLossDeductibleChoices,
                  hasOther: true,
                  visibleIf: "{specific_stop_loss} = 'Yes'"
                },
                {
                  type: "radiogroup",
                  name: "aggregate_stop_loss",
                  title: "Purchase aggregate stop loss?",
                  choices: yesNoChoices
                },
                {
                  type: "radiogroup",
                  name: "stop_loss_captive",
                  title: "Participate in a stop loss captive?",
                  choices: yesNoChoices
                },
                {
                  type: "checkbox",
                  name: "stop_loss_cost_management",
                  title: "Stop loss cost management strategies",
                  choices: [
                    { value: "lower_domestic_reimbursement", text: "Lower domestic reimbursement at own hospital" },
                    { value: "increase_specific_deductible", text: "Increase specific deductible" },
                    { value: "aggregating_specific", text: "Aggregating specific deductible" },
                    { value: "experience_refund", text: "Experience refund" },
                    { value: "no_laser", text: "No-laser contract" }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: "prescription-strategy",
          title: "Prescription Drug Strategy",
          elements: [
            {
              type: "matrixdropdown",
              name: "rx_cost_management_strategies",
              title: "Prescription drug cost management strategies (2025-2026)",
              columns: [
                { name: "status", title: "Status", cellType: "dropdown", choices: rxStrategyChoices }
              ],
              rows: [
                { value: "increase_copays", text: "Increase copays / coinsurance" },
                { value: "educate_physicians", text: "Educate prescribing physicians on alternatives" },
                { value: "pbm_coalition", text: "Participate in PBM purchasing coalition" },
                { value: "tighter_formulary", text: "Utilize a tighter drug formulary" },
                { value: "pbm_clinical_programs", text: "Utilize PBM clinical management programs" },
                { value: "manufacturer_copay_programs", text: "Utilize manufacturer discount copay programs" },
                { value: "opioid_management", text: "Utilize opioid management program" },
                { value: "fraud_waste_abuse", text: "Utilize fraud, waste & abuse program" },
                { value: "exclusive_specialty_pharmacy", text: "Utilize exclusive specialty pharmacy" },
                { value: "specialty_step_therapy", text: "Utilize specialty step therapy modules" },
                { value: "third_party_pa", text: "Utilize third party for specialty drug prior authorization" },
                { value: "pbm_auditor", text: "Utilize auditor to ensure PBM contract compliance" }
              ]
            },
            {
              type: "matrix",
              name: "advanced_pharmacy_strategies",
              title: "Advanced pharmacy strategies",
              columns: yesNoChoices,
              rows: [
                { value: "gene_therapy", text: "Gene therapy coverage strategy" },
                { value: "weight_management_glp1", text: "Weight management / GLP-1 coverage strategy" }
              ]
            },
            {
              type: "radiogroup",
              name: "pharmacy_rebates_100",
              title: "Receive 100% of pharmacy rebates from PBM?",
              choices: yesNoChoices
            },
            {
              type: "radiogroup",
              name: "pharmacy_rebates_audited",
              title: "If yes, are rebates audited by a third party?",
              choices: yesNoChoices,
              visibleIf: "{pharmacy_rebates_100} = 'Yes'"
            }
          ]
        },
        {
          id: "population-health",
          title: "Population Health Management",
          elements: [
            {
              type: "html",
              name: "population_health_helper",
              html: "<div class=\"text-gray-600 text-sm\">Population health management programs include wellness, prevention, and condition management activities designed to promote health, reduce risks, and manage chronic conditions.</div>"
            },
            {
              type: "matrixdropdown",
              name: "population_health_programs",
              title: "Program components",
              columns: [
                { name: "status", title: "Status", cellType: "dropdown", choices: [
                  { value: "in_place", text: "In Place" },
                  { value: "planned", text: "Planned" },
                  { value: "considering", text: "Considering" },
                  { value: "not_implementing", text: "Not Implementing" }
                ] }
              ],
              rows: [
                { value: "online_wellness_platform", text: "Online wellness services platform" },
                { value: "health_risk_assessment", text: "Health risk assessment" },
                { value: "biometric_screening", text: "Biometric screening" },
                { value: "wellness_coaching", text: "Wellness coaching" },
                { value: "condition_management", text: "Condition management coaching" },
                { value: "wellness_activities", text: "Wellness activities / challenges" },
                { value: "preventive_screenings", text: "Preventive healthcare screenings" },
                { value: "mobility_injury_prevention", text: "Mobility assessment / injury prevention" },
                { value: "diabetes_prevention", text: "Diabetes prevention program" },
                { value: "mobile_technology_integration", text: "Mobile technology integration" },
                { value: "wellness_coordinator", text: "Onsite wellness program coordinator" },
                { value: "mental_wellbeing", text: "Mental well-being program / EAP" },
                { value: "family_support_programs", text: "Family support programs" }
              ]
            },
            {
              type: "matrixdropdown",
              name: "population_health_rewards",
              title: "Wellness incentives / rewards",
              columns: [
                { name: "status", title: "Status", cellType: "dropdown", choices: [
                  { value: "in_place", text: "In Place" },
                  { value: "planned", text: "Planned" },
                  { value: "considering", text: "Considering" },
                  { value: "no", text: "No" }
                ] }
              ],
              rows: [
                { value: "gift_cards", text: "Gift cards" },
                { value: "rewards_cash_store", text: "Rewards cash store" },
                { value: "lower_premium", text: "Lower medical premium" },
                { value: "other_rewards", text: "Other reward(s)" }
              ]
            },
            {
              type: "comment",
              name: "population_health_other_rewards_description",
              title: "If other rewards, describe",
              rows: 3
            }
          ]
        },
        {
          id: "policy-issues",
          title: "Policy Issues – Benefits Eligibility",
          elements: [
            {
              type: "dropdown",
              name: "eligibility_waiting_period",
              title: "Eligibility waiting period",
              choices: benefitWaitingPeriodChoices,
              hasOther: true
            },
            {
              type: "radiogroup",
              name: "medical_waive_credit_offered",
              title: "Offer medical waive credit?",
              choices: yesNoChoices
            },
            {
              type: "radiogroup",
              name: "waive_credit_requires_proof",
              title: "If yes, proof of other coverage required?",
              choices: yesNoChoices,
              visibleIf: "{medical_waive_credit_offered} = 'Yes'"
            },
            {
              type: "text",
              name: "waive_credit_amount",
              title: "Waive credit amount (monthly)",
              prefix: "$",
              inputType: "number",
              visibleIf: "{medical_waive_credit_offered} = 'Yes'",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              type: "text",
              name: "waive_credit_employee_count",
              title: "Employees receiving waive credit",
              inputType: "number",
              visibleIf: "{medical_waive_credit_offered} = 'Yes'",
              validators: [{ type: "numeric", minValue: 0 }]
            },
            {
              type: "panel",
              name: "full_time_definition",
              title: "Full-Time definition for medical eligibility",
              elements: [
                {
                  type: "text",
                  name: "full_time_hours_per_pay_period",
                  title: "Hours per pay period",
                  inputType: "number",
                  description: "If using hours, enter number (e.g., 40).",
                  validators: [{ type: "numeric", minValue: 0 }]
                },
                {
                  type: "text",
                  name: "full_time_fte_percent",
                  title: "FTE %",
                  suffix: "%",
                  inputType: "number",
                  description: "If using FTE%, enter value (e.g., 75%).",
                  validators: [{ type: "numeric", minValue: 0, maxValue: 100 }]
                }
              ]
            },
            {
              type: "panel",
              name: "part_time_definition",
              title: "Part-Time eligibility threshold",
              elements: [
                {
                  type: "text",
                  name: "part_time_hours_per_pay_period",
                  title: "Hours per pay period",
                  inputType: "number",
                  validators: [{ type: "numeric", minValue: 0 }]
                },
                {
                  type: "text",
                  name: "part_time_fte_percent",
                  title: "FTE %",
                  suffix: "%",
                  inputType: "number",
                  validators: [{ type: "numeric", minValue: 0, maxValue: 100 }]
                }
              ]
            },
            {
              type: "dropdown",
              name: "pay_periods_per_year",
              title: "Number of pay periods per year",
              choices: payPeriodsPerYearChoices,
              hasOther: true
            },
            {
              type: "radiogroup",
              name: "dependent_audit_recent",
              title: "Dependent eligibility audit (DAV) performed in past 3 years?",
              choices: yesNoChoices
            },
            {
              type: "comment",
              name: "benefits_strategy_notes",
              title: "Notes – Benefits Strategy",
              rows: 5
            }
          ]
        }
      ]
    },
    {
      id: "voluntary-benefits",
      title: "Voluntary & Supplemental Benefits",
      icon: "building",
      pages: [
        {
          id: "voluntary-programs",
          title: "Voluntary Benefits (Employee Paid)",
          elements: [
            {
              type: "matrixdropdown",
              name: "voluntary_benefits_programs",
              title: "Employee-paid voluntary benefits",
              columns: [
                { name: "status", title: "Status", cellType: "dropdown", choices: voluntaryBenefitStatusChoices }
              ],
              rows: [
                { value: "universal_life", text: "Universal / whole life insurance" },
                { value: "ltc_rider", text: "Long term care rider" },
                { value: "voluntary_disability", text: "Disability (voluntary supplemental)" },
                { value: "critical_illness", text: "Critical illness insurance" },
                { value: "cancer", text: "Cancer insurance" },
                { value: "pet", text: "Pet insurance" },
                { value: "legal_plan", text: "Legal plan" },
                { value: "identity_theft", text: "Identity theft protection" },
                { value: "accident", text: "Accident insurance" },
                { value: "hospital_indemnity", text: "Hospital indemnity" },
                { value: "home_insurance", text: "Home insurance" },
                { value: "auto_insurance", text: "Auto insurance" },
                { value: "daycare_eldercare", text: "Daycare / elder care assistance" },
                { value: "medicare_education", text: "Medicare educational program" },
                { value: "student_loan_assistance", text: "Student loan assistance" }
              ]
            }
          ]
        },
        {
          id: "supplemental-programs",
          title: "Supplemental / Fringe Benefits (Employer Funded)",
          elements: [
            {
              type: "matrixdropdown",
              name: "supplemental_benefits_programs",
              title: "Employer-funded supplemental programs",
              columns: [
                { name: "status", title: "Status", cellType: "dropdown", choices: voluntaryBenefitStatusChoices }
              ],
              rows: [
                { value: "tuition_reimbursement", text: "Tuition reimbursement" },
                { value: "student_loan_financing", text: "Student loan financing (employer contributions)" },
                { value: "childcare_reimbursement", text: "Childcare reimbursement" },
                { value: "childcare_program", text: "Childcare program" },
                { value: "eldercare_program", text: "Eldercare program" },
                { value: "commuter_benefit", text: "Commuter benefit" },
                { value: "fertility_benefits", text: "Fertility benefits (IVF)" },
                { value: "adoption_assistance", text: "Adoption assistance" },
                { value: "employee_meals", text: "Employee meals / cafeteria funds" },
                { value: "financial_wellness", text: "Financial wellness / planning assistance" },
                { value: "employee_advocate", text: "Employee advocate / care navigation" },
                { value: "concierge_services", text: "Concierge services" },
                { value: "gym_memberships", text: "Gym memberships / discounts" },
                { value: "early_retiree_medical", text: "Early retiree medical program" }
              ]
            },
            {
              type: "comment",
              name: "voluntary_benefits_notes",
              title: "Notes – Voluntary & Supplemental Benefits",
              rows: 4
            }
          ]
        }
      ]
    }
  ]
};
