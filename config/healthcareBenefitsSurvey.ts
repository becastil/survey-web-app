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
      id: "introduction",
      title: "Introduction",
      icon: "building",
      pages: [
        {
          id: "introduction-placeholder",
          title: "Overview",
          elements: [
            {
              type: "html",
              name: "introduction_placeholder",
              html: "<div class=\"text-gray-500 text-sm\">0 - no data is configured in this section yet.</div>"
            }
          ]
        }
      ]
    },
    {
      id: "definitions",
      title: "Definitions",
      icon: "building",
      pages: [
        {
          id: "definitions-placeholder",
          title: "Key Terms",
          elements: [
            {
              type: "html",
              name: "definitions_placeholder",
              html: "<div class=\"text-gray-500 text-sm\">0 - no data is configured in this section yet.</div>"
            }
          ]
        }
      ]
    },
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
                  isRequired: true,
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
                  isRequired: true,
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
                      min: 0,
                      isRequired: true,
                      validators: [
                        { type: "numeric", minValue: 0 }
                      ]
                    },
                    {
                      type: "text",
                      name: "union_employee_percentage",
                      title: "Percentage of Union Employees",
                      inputType: "number",
                      min: 0,
                      max: 100,
                      suffix: "%",
                      isRequired: true,
                      validators: [
                        { type: "numeric", minValue: 0, maxValue: 100 }
                      ]
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
      id: "medical-plan-1",
      title: "Medical Plan 1",
      icon: "hospital",
      pages: [
        {
          id: "medical-plan-collection",
          title: "Medical Plan Details",
          elements: [
            {
              type: "paneldynamic",
              name: "medical_plans",
              title: "Medical Plans",
              description: "Provide details for each medical plan offered (up to 5).",
              minPanelCount: 1,
              maxPanelCount: 5,
              panelAddText: "Add another medical plan",
              panelRemoveText: "Remove this medical plan",
              templateTitle: "Medical Plan #{panelIndex}",
              renderMode: "list",
              templateElements: [
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
                      min: 0,
                      isRequired: true,
                      validators: [
                        { type: "numeric", minValue: 0 }
                      ]
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
                      isRequired: true,
                      choices: ["Yes", "No"]
                    }
                  ]
                },
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
                      allowEmptyRows: false,
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
                          isRequired: true,
                          validators: [
                            { type: "numeric", minValue: 0 }
                          ],
                          totalType: "sum",
                          totalDisplayStyle: "decimal"
                        },
                        {
                          name: "total_rate",
                          title: "Total Rate (COBRA -2%)",
                          cellType: "text",
                          inputType: "number",
                          isRequired: true,
                          validators: [
                            { type: "numeric", minValue: 0 }
                          ],
                          displayStyle: "currency"
                        },
                        {
                          name: "ee_contribution",
                          title: "Employee Contribution",
                          cellType: "text",
                          inputType: "number",
                          isRequired: true,
                          validators: [
                            { type: "numeric", minValue: 0 }
                          ],
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
                      isRequired: true,
                      choices: ["Yes", "No"],
                      defaultValue: "No"
                    }
                  ]
                },
                {
                  type: "panel",
                  name: "network_tiers",
                  title: "Network Tier Structure",
                  elements: [
                    {
                      type: "radiogroup",
                      name: "custom_tier1",
                      title: "Does your organization have a custom Tier 1 network at own facilities?",
                      isRequired: true,
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
                      placeholder: "Enter $0 if no deductible",
                      isAllRowRequired: true
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
                      cellType: "text",
                      isAllRowRequired: true
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
                      placeholder: "$XX or XX%",
                      isAllRowRequired: true
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
                      placeholder: "$XX or XX%",
                      isAllRowRequired: true
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
                      isRequired: true,
                      choices: ["Yes", "No"],
                      defaultValue: "No"
                    },
                    {
                      type: "text",
                      name: "rx_deductible_amount",
                      title: "Pharmacy Deductible Amount (Individual)",
                      visibleIf: "{separate_rx_deductible} = 'Yes'",
                      inputType: "number",
                      prefix: "$",
                      isRequired: true,
                      validators: [
                        { type: "numeric", minValue: 0 }
                      ]
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
                      placeholder: "$XX or XX%",
                      isAllRowRequired: true
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
      id: "medical-plan-2",
      title: "Medical Plan 2",
      icon: "hospital",
      pages: [
        {
          id: "medical-plan-2-placeholder",
          title: "Coming Soon",
          elements: [
            {
              type: "html",
              name: "medical_plan_2_placeholder",
              html: "<div class=\"text-gray-500 text-sm\">0 - no data is configured in this section yet.</div>"
            }
          ]
        }
      ]
    },
    {
      id: "medical-plan-3",
      title: "Medical Plan 3",
      icon: "hospital",
      pages: [
        {
          id: "medical-plan-3-placeholder",
          title: "Coming Soon",
          elements: [
            {
              type: "html",
              name: "medical_plan_3_placeholder",
              html: "<div class=\"text-gray-500 text-sm\">0 - no data is configured in this section yet.</div>"
            }
          ]
        }
      ]
    },
    {
      id: "medical-plan-4",
      title: "Medical Plan 4",
      icon: "hospital",
      pages: [
        {
          id: "medical-plan-4-placeholder",
          title: "Coming Soon",
          elements: [
            {
              type: "html",
              name: "medical_plan_4_placeholder",
              html: "<div class=\"text-gray-500 text-sm\">0 - no data is configured in this section yet.</div>"
            }
          ]
        }
      ]
    },
    {
      id: "medical-plan-5",
      title: "Medical Plan 5",
      icon: "hospital",
      pages: [
        {
          id: "medical-plan-5-placeholder",
          title: "Coming Soon",
          elements: [
            {
              type: "html",
              name: "medical_plan_5_placeholder",
              html: "<div class=\"text-gray-500 text-sm\">0 - no data is configured in this section yet.</div>"
            }
          ]
        }
      ]
    },
    {
      id: "dental-plan-1",
      title: "Dental Plan 1",
      icon: "tooth",
      pages: [
        {
          id: "dental-plan-collection",
          title: "Dental Plan Details",
          elements: [
            {
              type: "paneldynamic",
              name: "dental_plans",
              title: "Dental Benefit Plans",
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
                      min: 0,
                      isRequired: true,
                      validators: [
                        { type: "numeric", minValue: 0 }
                      ]
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
                      placeholder: "Enter %",
                      isAllRowRequired: true
                    },
                    {
                      type: "text",
                      name: "annual_max",
                      title: "Annual Maximum Benefit",
                      inputType: "number",
                      prefix: "$",
                      placeholder: "Per person",
                      isRequired: true,
                      validators: [
                        { type: "numeric", minValue: 0 }
                      ]
                    },
                    {
                      type: "text",
                      name: "ortho_lifetime_max",
                      title: "Orthodontia Lifetime Maximum",
                      inputType: "number",
                      prefix: "$",
                      visibleIf: "{dental_benefits.orthodontia.in_network} notempty or {dental_benefits.orthodontia.out_network} notempty",
                      isRequired: true,
                      validators: [
                        { type: "numeric", minValue: 0 }
                      ]
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
      id: "dental-plan-2",
      title: "Dental Plan 2",
      icon: "tooth",
      pages: [
        {
          id: "dental-plan-2-placeholder",
          title: "Coming Soon",
          elements: [
            {
              type: "html",
              name: "dental_plan_2_placeholder",
              html: "<div class=\"text-gray-500 text-sm\">0 - no data is configured in this section yet.</div>"
            }
          ]
        }
      ]
    },
    {
      id: "dental-plan-3",
      title: "Dental Plan 3",
      icon: "tooth",
      pages: [
        {
          id: "dental-plan-3-placeholder",
          title: "Coming Soon",
          elements: [
            {
              type: "html",
              name: "dental_plan_3_placeholder",
              html: "<div class=\"text-gray-500 text-sm\">0 - no data is configured in this section yet.</div>"
            }
          ]
        }
      ]
    },
    {
      id: "dental-plan-4",
      title: "Dental Plan 4",
      icon: "tooth",
      pages: [
        {
          id: "dental-plan-4-placeholder",
          title: "Coming Soon",
          elements: [
            {
              type: "html",
              name: "dental_plan_4_placeholder",
              html: "<div class=\"text-gray-500 text-sm\">0 - no data is configured in this section yet.</div>"
            }
          ]
        }
      ]
    },
    {
      id: "dental-plan-5",
      title: "Dental Plan 5",
      icon: "tooth",
      pages: [
        {
          id: "dental-plan-5-placeholder",
          title: "Coming Soon",
          elements: [
            {
              type: "html",
              name: "dental_plan_5_placeholder",
              html: "<div class=\"text-gray-500 text-sm\">0 - no data is configured in this section yet.</div>"
            }
          ]
        }
      ]
    },
    {
      id: "vision-plan-1",
      title: "Vision Plan 1",
      icon: "eye",
      pages: [
        {
          id: "vision-plan-collection",
          title: "Vision Plan Information",
          elements: [
            {
              type: "paneldynamic",
              name: "vision_plans",
              title: "Vision Benefit Plans",
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
                      isRequired: true,
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
                      cellChoices: ["Every 12 months", "Every 24 months", "Not covered"],
                      isAllRowRequired: true
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
                          prefix: "$",
                          isRequired: true,
                          validators: [
                            { type: "numeric", minValue: 0 }
                          ]
                        },
                        {
                          type: "text",
                          name: "materials_copay",
                          title: "Materials Copay",
                          inputType: "number",
                          prefix: "$",
                          isRequired: true,
                          validators: [
                            { type: "numeric", minValue: 0 }
                          ]
                        },
                        {
                          type: "text",
                          name: "frames_allowance",
                          title: "Frames Allowance",
                          inputType: "number",
                          prefix: "$",
                          isRequired: true,
                          validators: [
                            { type: "numeric", minValue: 0 }
                          ]
                        },
                        {
                          type: "text",
                          name: "contacts_allowance",
                          title: "Contact Lenses Allowance",
                          inputType: "number",
                          prefix: "$",
                          isRequired: true,
                          validators: [
                            { type: "numeric", minValue: 0 }
                          ]
                        }
                      ]
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
      id: "vision-plan-2",
      title: "Vision Plan 2",
      icon: "eye",
      pages: [
        {
          id: "vision-plan-2-placeholder",
          title: "Coming Soon",
          elements: [
            {
              type: "html",
              name: "vision_plan_2_placeholder",
              html: "<div class=\"text-gray-500 text-sm\">0 - no data is configured in this section yet.</div>"
            }
          ]
        }
      ]
    },
    {
      id: "basic-life-disability",
      title: "Basic Life and Disability",
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
                  cellType: "text",
                  isAllRowRequired: true
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
                  isRequired: true,
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
                  cellType: "text",
                  isAllRowRequired: true
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
                  cellType: "text",
                  isAllRowRequired: true
                },
                {
                  type: "radiogroup",
                  name: "ltd_buyup",
                  title: "Offer employee-paid buy-up LTD?",
                  isRequired: true,
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
      title: "Retirement",
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
                  isRequired: true,
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
                      isRequired: true,
                      choices: ["Fixed match", "Graduated by tenure", "Flat contribution", "None"]
                    },
                    {
                      type: "text",
                      name: "match_percentage",
                      title: "Employer Match (%)",
                      visibleIf: "{employer_match_type} contains 'match'",
                      inputType: "number",
                      suffix: "%",
                      isRequired: true,
                      validators: [
                        { type: "numeric", minValue: 0, maxValue: 100 }
                      ]
                    },
                    {
                      type: "text",
                      name: "vesting_schedule",
                      title: "Vesting Schedule",
                      placeholder: "e.g., 100% after 2 years",
                      isRequired: true
                    },
                    {
                      type: "radiogroup",
                      name: "auto_enrollment",
                      title: "Auto-enrollment?",
                      isRequired: true,
                      choices: ["Yes", "No"]
                    },
                    {
                      type: "text",
                      name: "participation_rate",
                      title: "Current Participation Rate",
                      inputType: "number",
                      suffix: "%",
                      isRequired: true,
                      validators: [
                        { type: "numeric", minValue: 0, maxValue: 100 }
                      ]
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
      title: "Time Off",
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
                  isRequired: true,
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
                      suffix: "hours/year",
                      isRequired: true,
                      validators: [
                        { type: "numeric", minValue: 0 }
                      ]
                    },
                    {
                      type: "text",
                      name: "pto_max_hours",
                      title: "Maximum Hours (Tenured)",
                      inputType: "number",
                      suffix: "hours/year",
                      isRequired: true,
                      validators: [
                        { type: "numeric", minValue: 0 }
                      ]
                    },
                    {
                      type: "text",
                      name: "pto_accrual_cap",
                      title: "Accrual Cap",
                      inputType: "number",
                      suffix: "hours",
                      isRequired: true,
                      validators: [
                        { type: "numeric", minValue: 0 }
                      ]
                    }
                  ]
                },
                {
                  type: "text",
                  name: "holidays_count",
                  title: "Number of Holidays",
                  inputType: "number",
                  suffix: "days/year",
                  isRequired: true,
                  validators: [
                    { type: "numeric", minValue: 0 }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "benefits-strategy",
      title: "Benefits and Strategy",
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
                    { type: "answercount", minCount: 3, maxCount: 3 }
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
                  cellType: "radiogroup",
                  isAllRowRequired: true
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
                  isRequired: true,
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
                  ],
                  hasNone: true,
                  noneText: "None/Not applicable"
                },
                {
                  type: "radiogroup",
                  name: "rebate_retention",
                  title: "Do you receive 100% of pharmacy rebates?",
                  isRequired: true,
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
              cellType: "radiogroup",
              isAllRowRequired: true
            }
          ]
        }
      ]
    }
  ]
};
