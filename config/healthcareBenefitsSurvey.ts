// Healthcare Benefits Survey - Modern Web Implementation
// This is a cleaner, more user-friendly version of the Keenan survey

// ===========================
// 2. Main Survey Configuration
// ===========================

import { SurveyConfiguration } from "../types/survey.types";

export const healthcareBenefitsSurvey: SurveyConfiguration = {
  id: "keenan-benefits-2025",
  title: "Health Care Benefits Strategy Survey - 2025",
  description: "Comprehensive healthcare benefits assessment and strategy planning",
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
      id: "general-info",
      title: "General Information",
      icon: "building",
      pages: [
        {
          id: "organization-details",
          title: "Organization Information",
          elements: [
            {
              type: "panel",
              name: "org_info_panel",
              title: "Organization Details",
              elements: [
                {
                  type: "text",
                  name: "organization_name",
                  title: "Organization Name",
                  isRequired: true,
                  validators: [
                    { type: "text", minLength: 2, maxLength: 200 }
                  ],
                  placeholder: "Enter your organization's legal name"
                },
                {
                  type: "dropdown",
                  name: "location_represented",
                  title: "Location Represented",
                  isRequired: true,
                  choices: [
                    { value: "socal", text: "Southern California (except San Diego)" },
                    { value: "bayarea", text: "San Francisco Bay Area" },
                    { value: "rural", text: "Rural California" },
                    { value: "central", text: "Sacramento/Central Valley" },
                    { value: "sandiego", text: "San Diego" }
                  ],
                  hasOther: true,
                  otherText: "Other location"
                },
                {
                  type: "dropdown",
                  name: "renewal_month",
                  title: "Medical Plan Renewal Month",
                  isRequired: true,
                  choices: ["January", "February", "March", "April", "May", "June", 
                           "July", "August", "September", "October", "November", "December"]
                }
              ]
            },
            {
              type: "panel",
              name: "contact_panel",
              title: "Interview Information",
              elements: [
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
                  title: "Interviewer Name",
                  isRequired: true
                },
                {
                  type: "text",
                  name: "interview_date",
                  title: "Interview Date",
                  inputType: "date",
                  isRequired: true,
                  max: "today"
                }
              ]
            }
          ]
        },
        {
          id: "employee-counts",
          title: "Employee Information",
          elements: [
            {
              type: "panel",
              name: "employee_counts_panel",
              title: "Employee Counts",
              elements: [
                {
                  type: "text",
                  name: "fulltime_benefit_eligible",
                  title: "Full-Time Benefit Eligible",
                  inputType: "number",
                  min: 0,
                  isRequired: true,
                  validators: [
                    { type: "numeric", minValue: 0 }
                  ]
                },
                {
                  type: "text",
                  name: "parttime_benefit_eligible",
                  title: "Part-Time Benefit Eligible",
                  inputType: "number",
                  min: 0,
                  validators: [
                    { type: "numeric", minValue: 0 }
                  ]
                },
                {
                  type: "text",
                  name: "perdiem_non_benefit_eligible",
                  title: "Per Diem/Non-Benefit Eligible",
                  inputType: "number",
                  min: 0,
                  validators: [
                    { type: "numeric", minValue: 0 }
                  ]
                },
                {
                  type: "expression",
                  name: "total_employees",
                  title: "Total Employees",
                  expression: "{fulltime_benefit_eligible} + {parttime_benefit_eligible} + {perdiem_non_benefit_eligible}",
                  displayStyle: "decimal",
                  readOnly: true,
                  startWithNewLine: false
                }
              ]
            },
            {
              type: "panel",
              name: "union_panel",
              title: "Union Information",
              elements: [
                {
                  type: "radiogroup",
                  name: "union_population",
                  title: "Does your organization have union employees?",
                  isRequired: true,
                  choices: ["Yes", "No"]
                },
                {
                  type: "panel",
                  name: "union_details",
                  title: "Union Details",
                  visibleIf: "{union_population} = 'Yes'",
                  elements: [
                    {
                      type: "text",
                      name: "union_employee_count",
                      title: "Number of Union Employees",
                      inputType: "number",
                      min: 0
                    },
                    {
                      type: "text",
                      name: "union_employee_percentage",
                      title: "Percentage of Union Employees",
                      inputType: "number",
                      min: 0,
                      max: 100,
                      suffix: "%"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "medical-plans",
      title: "Medical Plans (Including Pharmacy)",
      icon: "hospital",
      isRepeatable: true,
      maxInstances: 5,
      pages: [
        {
          id: "plan-info",
          title: "Plan Information",
          elements: [
            {
              type: "panel",
              name: "plan_basics",
              title: "Plan Basics",
              elements: [
                {
                  type: "dropdown",
                  name: "plan_type",
                  title: "Plan Type",
                  isRequired: true,
                  choices: ["EPO", "HDHP", "HMO", "POS", "PPO"],
                  choicesOrder: "asc"
                },
                {
                  type: "text",
                  name: "health_plan_name",
                  title: "Health Plan Name",
                  isRequired: true,
                  placeholder: "e.g., Blue Shield EPO"
                },
                {
                  type: "dropdown",
                  name: "funding_mechanism",
                  title: "Funding Mechanism",
                  isRequired: true,
                  choices: ["Self-Funded", "Fully Insured"]
                },
                {
                  type: "text",
                  name: "eligible_employees_enrolled",
                  title: "Number of Eligible Employees Enrolled",
                  inputType: "number",
                  min: 0
                }
              ]
            },
            {
              type: "panel",
              name: "union_application",
              title: "Union Application",
              elements: [
                {
                  type: "radiogroup",
                  name: "applies_to_union",
                  title: "Does this plan apply to union groups?",
                  isRequired: true,
                  choices: ["Yes", "No"]
                },
                {
                  type: "radiogroup",
                  name: "union_contribution_varies",
                  title: "Do full-time employee contributions vary by union classification?",
                  visibleIf: "{applies_to_union} = 'Yes'",
                  choices: ["Yes", "No"]
                }
              ]
            }
          ]
        },
        {
          id: "rates-contributions",
          title: "Rates & Contributions",
          elements: [
            {
              type: "panel",
              name: "rate_structure",
              title: "Monthly Rate Structure",
              elements: [
                {
                  type: "radiogroup",
                  name: "rate_structure_type",
                  title: "Select Rate Structure Type",
                  isRequired: true,
                  choices: [
                    { value: "structure1", text: "Employee Only / +1 / +2 or more / +3 or more" },
                    { value: "structure2", text: "Employee Only / +Spouse/DP / +Children / +Family" }
                  ]
                },
                {
                  type: "matrixdynamic",
                  name: "rate_tiers",
                  title: "2025 Rates and Contributions (Monthly)",
                  visibleIf: "{rate_structure_type} notempty",
                  columns: [
                    {
                      name: "tier",
                      title: "Coverage Tier",
                      cellType: "expression",
                      expression: "getTierName({rowIndex}, {rate_structure_type})"
                    },
                    {
                      name: "enrolled_count",
                      title: "# Enrolled",
                      cellType: "text",
                      inputType: "number",
                      totalType: "sum",
                      totalDisplayStyle: "decimal"
                    },
                    {
                      name: "total_rate",
                      title: "Total Rate (COBRA -2%)",
                      cellType: "text",
                      inputType: "number",
                      displayStyle: "currency"
                    },
                    {
                      name: "ee_contribution",
                      title: "Employee Contribution",
                      cellType: "text",
                      inputType: "number",
                      displayStyle: "currency"
                    }
                  ],
                  rowCount: 4,
                  addRowLocation: "none"
                },
                {
                  type: "radiogroup",
                  name: "wellness_rates",
                  title: "Does this plan have separate wellness/non-wellness rates?",
                  choices: ["Yes", "No"],
                  defaultValue: "No"
                }
              ]
            }
          ]
        },
        {
          id: "plan-design",
          title: "Plan Design & Coverage",
          elements: [
            {
              type: "panel",
              name: "network_tiers",
              title: "Network Tier Structure",
              elements: [
                {
                  type: "radiogroup",
                  name: "custom_tier1",
                  title: "Does your organization have a custom Tier 1 network at own facilities?",
                  choices: ["Yes", "No"],
                  defaultValue: "No"
                },
                {
                  type: "matrix",
                  name: "deductibles",
                  title: "Annual Deductibles",
                  columns: [
                    { value: "tier1", text: "Own Hospital (Tier 1)", visibleIf: "{custom_tier1} = 'Yes'" },
                    { value: "in_network", text: "In-Network" },
                    { value: "out_network", text: "Out-of-Network" }
                  ],
                  rows: [
                    { value: "individual", text: "Individual" },
                    { value: "family", text: "Family" }
                  ],
                  cellType: "text",
                  placeholder: "Enter $0 if no deductible"
                },
                {
                  type: "matrix",
                  name: "out_of_pocket_max",
                  title: "Out-of-Pocket Maximum",
                  columns: [
                    { value: "tier1", text: "Own Hospital (Tier 1)", visibleIf: "{custom_tier1} = 'Yes'" },
                    { value: "in_network", text: "In-Network" },
                    { value: "out_network", text: "Out-of-Network" }
                  ],
                  rows: [
                    { value: "individual", text: "Individual" },
                    { value: "family", text: "Family" }
                  ],
                  cellType: "text"
                }
              ]
            },
            {
              type: "panel",
              name: "services_costs",
              title: "Service Costs (What Employee Pays)",
              elements: [
                {
                  type: "matrix",
                  name: "physician_services",
                  title: "Physician Services",
                  columns: [
                    { value: "tier1", text: "Own Hospital", visibleIf: "{custom_tier1} = 'Yes'" },
                    { value: "in_network", text: "In-Network" },
                    { value: "out_network", text: "Out-of-Network" }
                  ],
                  rows: [
                    { value: "primary_care", text: "Primary Care Visit" },
                    { value: "specialist", text: "Specialist Visit" },
                    { value: "telemedicine", text: "Telemedicine Visit" }
                  ],
                  cellType: "text",
                  placeholder: "$XX or XX%"
                },
                {
                  type: "matrix",
                  name: "hospital_services",
                  title: "Hospital Services",
                  columns: [
                    { value: "tier1", text: "Own Hospital", visibleIf: "{custom_tier1} = 'Yes'" },
                    { value: "in_network", text: "In-Network" },
                    { value: "out_network", text: "Out-of-Network" }
                  ],
                  rows: [
                    { value: "inpatient", text: "Inpatient" },
                    { value: "outpatient", text: "Outpatient" },
                    { value: "emergency", text: "Emergency Department" },
                    { value: "urgent_care", text: "Urgent Care" }
                  ],
                  cellType: "text",
                  placeholder: "$XX or XX%"
                }
              ]
            },
            {
              type: "panel",
              name: "pharmacy_benefits",
              title: "Pharmacy Benefits",
              elements: [
                {
                  type: "radiogroup",
                  name: "separate_rx_deductible",
                  title: "Separate pharmacy deductible?",
                  choices: ["Yes", "No"],
                  defaultValue: "No"
                },
                {
                  type: "text",
                  name: "rx_deductible_amount",
                  title: "Pharmacy Deductible Amount (Individual)",
                  visibleIf: "{separate_rx_deductible} = 'Yes'",
                  inputType: "number",
                  prefix: "$"
                },
                {
                  type: "matrix",
                  name: "pharmacy_copays",
                  title: "Pharmacy Copays/Coinsurance",
                  columns: [
                    { value: "retail", text: "Retail (30-day)" },
                    { value: "mail", text: "Mail Order (90-day)" }
                  ],
                  rows: [
                    { value: "generic", text: "Generic" },
                    { value: "brand_preferred", text: "Brand Preferred" },
                    { value: "brand_nonpreferred", text: "Brand Non-Preferred" },
                    { value: "specialty", text: "Specialty" }
                  ],
                  cellType: "text",
                  placeholder: "$XX or XX%"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "dental-plans",
      title: "Dental Benefits",
      icon: "tooth",
      isRepeatable: true,
      maxInstances: 4,
      pages: [
        {
          id: "dental-plan-info",
          title: "Dental Plan Information",
          elements: [
            {
              type: "panel",
              name: "dental_basics",
              title: "Plan Details",
              elements: [
                {
                  type: "dropdown",
                  name: "dental_plan_type",
                  title: "Plan Type",
                  isRequired: true,
                  choices: ["DPPO", "DHMO", "Indemnity"]
                },
                {
                  type: "text",
                  name: "dental_plan_name",
                  title: "Dental Plan Name",
                  isRequired: true
                },
                {
                  type: "dropdown",
                  name: "dental_funding",
                  title: "Funding Mechanism",
                  isRequired: true,
                  choices: ["Self-Funded", "Fully Insured"]
                },
                {
                  type: "text",
                  name: "dental_enrolled",
                  title: "Number of Employees Enrolled",
                  inputType: "number",
                  min: 0
                }
              ]
            },
            {
              type: "panel",
              name: "dental_design",
              title: "Plan Design",
              elements: [
                {
                  type: "matrix",
                  name: "dental_benefits",
                  title: "Benefit Coverage (Plan Pays %)",
                  columns: [
                    { value: "in_network", text: "In-Network" },
                    { value: "out_network", text: "Out-of-Network" }
                  ],
                  rows: [
                    { value: "preventive", text: "Preventive & Diagnostic" },
                    { value: "basic", text: "Basic Services" },
                    { value: "major", text: "Major Services" },
                    { value: "orthodontia", text: "Orthodontia" }
                  ],
                  cellType: "text",
                  placeholder: "Enter %"
                },
                {
                  type: "text",
                  name: "annual_max",
                  title: "Annual Maximum Benefit",
                  inputType: "number",
                  prefix: "$",
                  placeholder: "Per person"
                },
                {
                  type: "text",
                  name: "ortho_lifetime_max",
                  title: "Orthodontia Lifetime Maximum",
                  inputType: "number",
                  prefix: "$",
                  visibleIf: "{dental_benefits.orthodontia.in_network} notempty or {dental_benefits.orthodontia.out_network} notempty"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "vision-plans",
      title: "Vision Benefits",
      icon: "eye",
      isRepeatable: true,
      maxInstances: 2,
      pages: [
        {
          id: "vision-plan-info",
          title: "Vision Plan Information",
          elements: [
            {
              type: "panel",
              name: "vision_basics",
              title: "Plan Details",
              elements: [
                {
                  type: "text",
                  name: "vision_plan_name",
                  title: "Vision Plan Name",
                  isRequired: true
                },
                {
                  type: "dropdown",
                  name: "vision_offered_as",
                  title: "Offered As",
                  isRequired: true,
                  choices: ["Stand-alone plan", "Bundled with medical"]
                },
                {
                  type: "dropdown",
                  name: "vision_contribution",
                  title: "Employee Contribution",
                  choices: ["100% Employer Paid", "100% Employee Paid", "Cost Shared"]
                }
              ]
            },
            {
              type: "panel",
              name: "vision_benefits",
              title: "Benefit Coverage",
              elements: [
                {
                  type: "matrix",
                  name: "vision_frequency",
                  title: "Benefit Frequency",
                  columns: [
                    { value: "frequency", text: "Coverage Frequency" }
                  ],
                  rows: [
                    { value: "exam", text: "Eye Exam" },
                    { value: "lenses", text: "Lenses" },
                    { value: "frames", text: "Frames" },
                    { value: "contacts", text: "Contact Lenses" }
                  ],
                  cellType: "dropdown",
                  cellChoices: ["Every 12 months", "Every 24 months", "Not covered"]
                },
                {
                  type: "panel",
                  name: "vision_copays",
                  title: "Copays and Allowances",
                  elements: [
                    {
                      type: "text",
                      name: "exam_copay",
                      title: "Exam Copay",
                      inputType: "number",
                      prefix: "$"
                    },
                    {
                      type: "text",
                      name: "materials_copay",
                      title: "Materials Copay",
                      inputType: "number",
                      prefix: "$"
                    },
                    {
                      type: "text",
                      name: "frames_allowance",
                      title: "Frames Allowance",
                      inputType: "number",
                      prefix: "$"
                    },
                    {
                      type: "text",
                      name: "contacts_allowance",
                      title: "Contact Lenses Allowance",
                      inputType: "number",
                      prefix: "$"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "life-disability",
      title: "Life & Disability Benefits",
      icon: "shield",
      pages: [
        {
          id: "life-insurance",
          title: "Life Insurance",
          elements: [
            {
              type: "panel",
              name: "basic_life",
              title: "Basic Life Insurance (Employer Paid)",
              elements: [
                {
                  type: "matrix",
                  name: "life_coverage",
                  title: "Coverage Structure",
                  columns: [
                    { value: "management", text: "Management" },
                    { value: "non_management", text: "Non-Management" }
                  ],
                  rows: [
                    { value: "coverage_type", text: "Coverage Type" },
                    { value: "flat_amount", text: "Flat Amount ($)" },
                    { value: "salary_multiple", text: "Multiple of Salary" },
                    { value: "maximum", text: "Maximum Coverage ($)" }
                  ],
                  cellType: "text"
                }
              ]
            }
          ]
        },
        {
          id: "disability",
          title: "Disability Insurance",
          elements: [
            {
              type: "panel",
              name: "std_plan",
              title: "Short-Term Disability (STD)",
              elements: [
                {
                  type: "dropdown",
                  name: "std_offering",
                  title: "STD Offering",
                  choices: [
                    "State Disability Insurance only",
                    "Self-Funded Voluntary Plan",
                    "Fully Insured STD",
                    "Not offered"
                  ]
                },
                {
                  type: "matrix",
                  name: "std_benefits",
                  title: "STD Plan Design",
                  visibleIf: "{std_offering} != 'Not offered'",
                  columns: [
                    { value: "management", text: "Management" },
                    { value: "non_management", text: "Non-Management" }
                  ],
                  rows: [
                    { value: "elimination_days", text: "Elimination Period (days)" },
                    { value: "salary_percentage", text: "% of Salary Coverage" },
                    { value: "weekly_max", text: "Weekly Maximum ($)" }
                  ],
                  cellType: "text"
                }
              ]
            },
            {
              type: "panel",
              name: "ltd_plan",
              title: "Long-Term Disability (LTD)",
              elements: [
                {
                  type: "matrix",
                  name: "ltd_benefits",
                  title: "LTD Plan Design",
                  columns: [
                    { value: "management", text: "Management" },
                    { value: "non_management", text: "Non-Management" }
                  ],
                  rows: [
                    { value: "elimination_days", text: "Elimination Period (days)" },
                    { value: "salary_percentage", text: "% of Salary Coverage" },
                    { value: "monthly_max", text: "Monthly Maximum ($)" }
                  ],
                  cellType: "text"
                },
                {
                  type: "radiogroup",
                  name: "ltd_buyup",
                  title: "Offer employee-paid buy-up LTD?",
                  choices: ["Yes", "No"]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "retirement",
      title: "Retirement Benefits",
      icon: "piggy-bank",
      pages: [
        {
          id: "defined-contribution",
          title: "Defined Contribution Plans",
          elements: [
            {
              type: "panel",
              name: "dc_plan",
              title: "401(k) / 403(b) Plan",
              elements: [
                {
                  type: "dropdown",
                  name: "dc_plan_type",
                  title: "Plan Type",
                  choices: ["401(k)", "403(b)", "457", "None"]
                },
                {
                  type: "panel",
                  name: "dc_details",
                  visibleIf: "{dc_plan_type} != 'None'",
                  elements: [
                    {
                      type: "radiogroup",
                      name: "employer_match_type",
                      title: "Employer Contribution Type",
                      choices: ["Fixed match", "Graduated by tenure", "Flat contribution", "None"]
                    },
                    {
                      type: "text",
                      name: "match_percentage",
                      title: "Employer Match (%)",
                      visibleIf: "{employer_match_type} contains 'match'",
                      inputType: "number",
                      suffix: "%"
                    },
                    {
                      type: "text",
                      name: "vesting_schedule",
                      title: "Vesting Schedule",
                      placeholder: "e.g., 100% after 2 years"
                    },
                    {
                      type: "radiogroup",
                      name: "auto_enrollment",
                      title: "Auto-enrollment?",
                      choices: ["Yes", "No"]
                    },
                    {
                      type: "text",
                      name: "participation_rate",
                      title: "Current Participation Rate",
                      inputType: "number",
                      suffix: "%"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "time-off",
      title: "Time Off Benefits",
      icon: "calendar",
      pages: [
        {
          id: "pto-policy",
          title: "Paid Time Off",
          elements: [
            {
              type: "panel",
              name: "pto_structure",
              title: "PTO Structure",
              elements: [
                {
                  type: "dropdown",
                  name: "pto_type",
                  title: "PTO Integration",
                  choices: [
                    "Fully Integrated (Single PTO bank)",
                    "Separate (Vacation, Sick, etc.)",
                    "Unlimited PTO"
                  ]
                },
                {
                  type: "panel",
                  name: "integrated_pto",
                  visibleIf: "{pto_type} = 'Fully Integrated (Single PTO bank)'",
                  elements: [
                    {
                      type: "text",
                      name: "pto_new_hire_hours",
                      title: "Starting Hours (New Hires)",
                      inputType: "number",
                      suffix: "hours/year"
                    },
                    {
                      type: "text",
                      name: "pto_max_hours",
                      title: "Maximum Hours (Tenured)",
                      inputType: "number",
                      suffix: "hours/year"
                    },
                    {
                      type: "text",
                      name: "pto_accrual_cap",
                      title: "Accrual Cap",
                      inputType: "number",
                      suffix: "hours"
                    }
                  ]
                },
                {
                  type: "text",
                  name: "holidays_count",
                  title: "Number of Holidays",
                  inputType: "number",
                  suffix: "days/year"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "benefits-strategy",
      title: "Benefits Strategy & Planning",
      icon: "strategy",
      pages: [
        {
          id: "workforce-strategy",
          title: "Workforce Strategy",
          elements: [
            {
              type: "panel",
              name: "critical_issues",
              title: "Critical Workforce Issues",
              elements: [
                {
                  type: "checkbox",
                  name: "workforce_issues",
                  title: "Select the top 3 most critical issues facing your workforce",
                  isRequired: true,
                  validators: [
                    { type: "answercount", minCount: 1, maxCount: 3 }
                  ],
                  choices: [
                    "Cost of benefits",
                    "Cost of wages",
                    "Attracting new talent",
                    "Retention/turnover",
                    "Mental wellbeing",
                    "Employee morale/burnout",
                    "Performance management",
                    "Remote workforce management",
                    "Career opportunity/mentorship"
                  ]
                }
              ]
            }
          ]
        },
        {
          id: "cost-management",
          title: "Cost Management Strategies",
          elements: [
            {
              type: "panel",
              name: "cost_strategies",
              title: "2025-2026 Cost Management Plans",
              elements: [
                {
                  type: "matrix",
                  name: "cost_management_strategies",
                  title: "Planned Strategies",
                  columns: [
                    { value: "in_place", text: "In Place" },
                    { value: "will_consider", text: "Will Consider" },
                    { value: "not_considering", text: "Not Considering" }
                  ],
                  rows: [
                    { value: "increase_ee_contribution", text: "Increase employee contributions" },
                    { value: "increase_deductibles", text: "Increase deductibles/OOP max" },
                    { value: "spousal_surcharge", text: "Spousal surcharge" },
                    { value: "wellness_incentives", text: "Wellness incentives" },
                    { value: "narrow_networks", text: "Implement narrow networks" },
                    { value: "reference_pricing", text: "Reference-based pricing" },
                    { value: "pbm_change", text: "Change PBM strategy" }
                  ],
                  cellType: "radiogroup"
                }
              ]
            }
          ]
        },
        {
          id: "pharmacy-management",
          title: "Pharmacy Management",
          elements: [
            {
              type: "panel",
              name: "pharmacy_strategies",
              title: "Pharmacy Cost Management",
              elements: [
                {
                  type: "checkbox",
                  name: "rx_strategies",
                  title: "Select all pharmacy management strategies in use or planned",
                  choices: [
                    "Tighter formulary management",
                    "Mandatory generic programs",
                    "Prior authorization expansion",
                    "Specialty pharmacy carve-out",
                    "Copay assistance programs",
                    "Mail order requirements",
                    "PBM transparency initiatives",
                    "340B program participation",
                    "GLP-1 coverage strategy",
                    "Biosimilar adoption"
                  ]
                },
                {
                  type: "radiogroup",
                  name: "rebate_retention",
                  title: "Do you receive 100% of pharmacy rebates?",
                  choices: ["Yes", "No", "Unknown"]
                }
              ]
            }
          ]
        },
        {
          id: "wellness-programs",
          title: "Population Health & Wellness",
          elements: [
            {
              type: "matrix",
              name: "wellness_programs",
              title: "Wellness Program Implementation",
              columns: [
                { value: "in_place", text: "In Place" },
                { value: "planned", text: "Planned" },
                { value: "not_planned", text: "Not Planned" }
              ],
              rows: [
                { value: "health_risk_assessment", text: "Health Risk Assessment" },
                { value: "biometric_screening", text: "Biometric Screening" },
                { value: "wellness_coaching", text: "Wellness Coaching" },
                { value: "disease_management", text: "Disease Management" },
                { value: "mental_health_programs", text: "Mental Health Programs" },
                { value: "telemedicine", text: "Telemedicine/Virtual Care" },
                { value: "onsite_clinic", text: "On-site/Near-site Clinic" },
                { value: "diabetes_prevention", text: "Diabetes Prevention Program" },
                { value: "weight_management", text: "Weight Management Program" }
              ],
              cellType: "radiogroup"
            }
          ]
        }
      ]
    }
  ]
};
