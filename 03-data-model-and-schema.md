# Data Model & Schema

This model balances flexibility (SurveyJS JSON per version) with analytics-friendly structures for responses.

## Entities

- `profiles` — application profile mapped to `auth.users`.
- `orgs` — organizations/workspaces.
- `org_memberships` — many-to-many user↔org with role.
- `clients` — client/customer/entity to survey; scoped to an org.
- `surveys` — logical survey container (e.g., "Annual Assessment").
- `survey_versions` — immutable SurveyJS JSON snapshots; published flag.
- `response_sets` — a single respondent session/context per client per version.
- `response_items` — normalized answers keyed by question path.
- `comments` — threaded notes attached to response sets.
- `attachments` — files in Storage associated to response sets.
- `audit_logs` — immutable audit events.

## SQL (Supabase Migrations)

```sql
-- profiles, linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- orgs and memberships
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create type public.org_role as enum ('owner','admin','editor','viewer');

create table if not exists public.org_memberships (
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'viewer',
  primary key (org_id, user_id)
);

-- clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists clients_org_id_idx on public.clients(org_id);

-- surveys and versions
create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  key text not null,
  title text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (org_id, key)
);

create table if not exists public.survey_versions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  version int not null,
  schema jsonb not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (survey_id, version)
);
create index if not exists survey_versions_published_idx on public.survey_versions(survey_id, published_at);

-- responses
create type public.response_status as enum ('draft','in_review','submitted','locked');

create table if not exists public.response_sets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  survey_version_id uuid not null references public.survey_versions(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  status public.response_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  locked_at timestamptz
);
create index if not exists response_sets_org_idx on public.response_sets(org_id);
create index if not exists response_sets_client_idx on public.response_sets(client_id);

create table if not exists public.response_items (
  id bigserial primary key,
  response_set_id uuid not null references public.response_sets(id) on delete cascade,
  question_path text not null,
  value jsonb not null,
  created_at timestamptz not null default now(),
  unique (response_set_id, question_path)
);
create index if not exists response_items_gin on public.response_items using gin (value);

-- comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  response_set_id uuid not null references public.response_sets(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now()
);

-- attachments metadata (files live in Storage)
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  response_set_id uuid not null references public.response_sets(id) on delete cascade,
  storage_path text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

-- audit logs
create table if not exists public.audit_logs (
  id bigserial primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  entity text not null,
  entity_id text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

## Row-Level Security (RLS)

Enable RLS and grant access via membership roles.

```sql
alter table public.orgs enable row level security;
alter table public.org_memberships enable row level security;
alter table public.clients enable row level security;
alter table public.surveys enable row level security;
alter table public.survey_versions enable row level security;
alter table public.response_sets enable row level security;
alter table public.response_items enable row level security;
alter table public.comments enable row level security;
alter table public.attachments enable row level security;

-- helper: is org member
create or replace function public.is_org_member(org uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.org_memberships m
    where m.org_id = org and m.user_id = auth.uid()
  );
$$;

-- helper: has role at least (owner>admin>editor>viewer)
create or replace function public.has_org_role(org uuid, min_role public.org_role)
returns boolean language plpgsql stable as $$
declare r public.org_role;
begin
  select role into r from public.org_memberships where org_id = org and user_id = auth.uid();
  if r is null then return false; end if;
  return array_position(array['viewer','editor','admin','owner']::public.org_role[], r)
       >= array_position(array['viewer','editor','admin','owner']::public.org_role[], min_role);
end;
$$;

-- policies
create policy "orgs readable by members" on public.orgs for select using (public.is_org_member(id));
create policy "orgs manageable by owners" on public.orgs for all using (public.has_org_role(id,'owner')) with check (public.has_org_role(id,'owner'));

create policy "memberships by self or owner" on public.org_memberships for select using (user_id = auth.uid() or public.has_org_role(org_id,'owner'));

create policy "clients member access" on public.clients for select using (public.is_org_member(org_id));
create policy "clients editor manage" on public.clients for insert with check (public.has_org_role(org_id,'editor'));
create policy "clients editor update" on public.clients for update using (public.has_org_role(org_id,'editor')) with check (public.has_org_role(org_id,'editor'));

create policy "surveys member read" on public.surveys for select using (public.is_org_member(org_id));
create policy "surveys editor manage" on public.surveys for all using (public.has_org_role(org_id,'editor')) with check (public.has_org_role(org_id,'editor'));

create policy "survey_versions read" on public.survey_versions for select using (
  exists(select 1 from public.surveys s where s.id = survey_versions.survey_id and public.is_org_member(s.org_id))
);

create policy "responses member read" on public.response_sets for select using (public.is_org_member(org_id));
create policy "responses editor insert" on public.response_sets for insert with check (public.has_org_role(org_id,'editor'));
create policy "responses author or editor update" on public.response_sets for update using (
  created_by = auth.uid() or public.has_org_role(org_id,'editor')
) with check (
  created_by = auth.uid() or public.has_org_role(org_id,'editor')
);

create policy "response_items member read" on public.response_items for select using (
  exists(select 1 from public.response_sets rs where rs.id = response_items.response_set_id and public.is_org_member(rs.org_id))
);
create policy "response_items edit" on public.response_items for all using (
  exists(select 1 from public.response_sets rs where rs.id = response_items.response_set_id and (rs.created_by = auth.uid() or public.has_org_role(rs.org_id,'editor')))
) with check (
  exists(select 1 from public.response_sets rs where rs.id = response_items.response_set_id and (rs.created_by = auth.uid() or public.has_org_role(rs.org_id,'editor')))
);
```

## JSON Structures

- Survey schema (`survey_versions.schema`): SurveyJS JSON object for a version.
- Response item value: `jsonb` to support arrays, matrices, and rich answers.

### Example: General Information Form Schema

```json
{
  "title": "General Information Survey",
  "description": "Organization and employee information collection form",
  "pages": [
    {
      "name": "basic_info",
      "title": "Basic Information",
      "elements": [
        {
          "type": "text",
          "name": "organization_name",
          "title": "Organization Name",
          "isRequired": true
        },
        {
          "type": "text",
          "name": "interviewee_name",
          "title": "Interviewee Name",
          "isRequired": true
        },
        {
          "type": "text",
          "name": "interviewee_title",
          "title": "Interviewee Title"
        },
        {
          "type": "text",
          "name": "interviewer_name",
          "title": "Interviewer Name",
          "isRequired": true
        },
        {
          "type": "text",
          "name": "interview_date",
          "title": "Interview Date",
          "inputType": "date",
          "isRequired": true
        }
      ]
    },
    {
      "name": "administrative",
      "title": "Administrative Information",
      "elements": [
        {
          "type": "dropdown",
          "name": "location_represented",
          "title": "Location Represented",
          "isRequired": true,
          "choices": [
            "So Cal (except SD)",
            "San Francisco Bay Area",
            "Rural",
            "Sacramento/Central Valley",
            "San Diego"
          ]
        },
        {
          "type": "dropdown",
          "name": "new_enrollment_packet",
          "title": "New Enrollment Packet Received",
          "isRequired": true,
          "choices": ["Yes", "No"]
        },
        {
          "type": "dropdown",
          "name": "medical_plan_renewal_month",
          "title": "Medical Plan Renewal Month",
          "isRequired": true,
          "choices": [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ]
        }
      ]
    },
    {
      "name": "employee_counts",
      "title": "Employee Information",
      "elements": [
        {
          "type": "text",
          "name": "fulltime_benefit_eligible",
          "title": "Full-Time Benefit Eligible",
          "inputType": "number",
          "min": 0,
          "isRequired": true
        },
        {
          "type": "text",
          "name": "parttime_benefit_eligible", 
          "title": "Part-Time Benefit Eligible",
          "inputType": "number",
          "min": 0,
          "isRequired": true
        },
        {
          "type": "text",
          "name": "perdiem_non_benefit_eligible",
          "title": "Per Diem/Non-Benefit Eligible",
          "inputType": "number",
          "min": 0,
          "isRequired": true
        },
        {
          "type": "expression",
          "name": "total_employees",
          "title": "Total Employees",
          "expression": "{fulltime_benefit_eligible} + {parttime_benefit_eligible} + {perdiem_non_benefit_eligible}",
          "displayStyle": "decimal",
          "readOnly": true
        }
      ]
    },
    {
      "name": "union_information",
      "title": "Union Information",
      "elements": [
        {
          "type": "dropdown",
          "name": "union_population",
          "title": "Union Population",
          "isRequired": true,
          "choices": ["Yes", "No"]
        },
        {
          "type": "text",
          "name": "union_employee_count",
          "title": "Number of Union Employees",
          "inputType": "number",
          "min": 0,
          "visibleIf": "{union_population} = 'Yes'"
        },
        {
          "type": "text",
          "name": "union_employee_percentage",
          "title": "Percentage of Union Employees",
          "inputType": "number",
          "min": 0,
          "max": 100,
          "suffix": "%",
          "visibleIf": "{union_population} = 'Yes'"
        }
      ]
    }
  ],
  "calculatedValues": [
    {
      "name": "total_calc",
      "expression": "{fulltime_benefit_eligible} + {parttime_benefit_eligible} + {perdiem_non_benefit_eligible}"
    }
  ],
  "triggers": [
    {
      "type": "setvalue",
      "expression": "{union_population} != 'Yes'",
      "setToName": "union_employee_count",
      "setValue": ""
    },
    {
      "type": "setvalue", 
      "expression": "{union_population} != 'Yes'",
      "setToName": "union_employee_percentage",
      "setValue": ""
    }
  ]
}
```

### Medical Plan Block Schema (Repeatable)

```json
{
  "title": "Medical Plan {index}",
  "description": "Medical plan information with rates and coverage details",
  "pages": [
    {
      "name": "plan_info_general",
      "title": "Plan Information - General",
      "elements": [
        {
          "type": "dropdown",
          "name": "plan_type",
          "title": "Plan Type",
          "isRequired": true,
          "choices": ["EPO", "HDHP", "HMO", "POS", "PPO"]
        },
        {
          "type": "text",
          "name": "health_plan_name",
          "title": "Health Plan Name",
          "isRequired": true
        },
        {
          "type": "dropdown",
          "name": "carrier_network",
          "title": "Carrier/Network",
          "isRequired": true,
          "choices": ["TBD - Populate from system"]
        },
        {
          "type": "text",
          "name": "tpa",
          "title": "TPA"
        },
        {
          "type": "dropdown",
          "name": "network_breadth",
          "title": "Network Breadth",
          "choices": ["TBD - Populate from system"]
        },
        {
          "type": "text",
          "name": "eligible_employees_enrolled",
          "title": "Number of Eligible Employees Enrolled"
        },
        {
          "type": "dropdown",
          "name": "funding_mechanism",
          "title": "Funding Mechanism",
          "isRequired": true,
          "choices": ["Self-Funded", "Fully Insured"]
        },
        {
          "type": "text",
          "name": "total_rate_tiers",
          "title": "Total Number of Rate Tiers"
        }
      ]
    },
    {
      "name": "plan_info_union",
      "title": "Plan Information - Union",
      "elements": [
        {
          "type": "dropdown",
          "name": "applies_to_union_groups",
          "title": "Does this plan apply to union groups?",
          "isRequired": true,
          "choices": ["Yes", "No"]
        },
        {
          "type": "dropdown",
          "name": "contributions_vary_by_union",
          "title": "Do full-time employee contributions for this plan vary by bargaining unit or for union vs. non-union classifications?",
          "choices": ["Yes", "No"],
          "visibleIf": "{applies_to_union_groups} = 'Yes'"
        }
      ]
    },
    {
      "name": "rates_contributions",
      "title": "Rates & Contributions (Monthly)",
      "elements": [
        {
          "type": "dropdown",
          "name": "separate_wellness_rates",
          "title": "Does this plan have separate wellness/non-wellness rates?",
          "isRequired": true,
          "choices": ["Yes", "No"]
        },
        {
          "type": "html",
          "name": "rate_structure_instructions",
          "html": "<h4>Choose ONE Rate Structure to Populate Full-Time Rates</h4><p>Note: All rate table cells are free form entries - leave blank if not applicable</p>"
        },
        {
          "type": "matrixdynamic",
          "name": "rate_structure_1",
          "title": "Rate Structure 1",
          "cellType": "text",
          "columns": [
            { "name": "enrolled_count", "title": "# Enrolled", "cellType": "text" },
            { "name": "total_rate_cobra_minus_2", "title": "Total 2025 Rate/Month (COBRA -2%)", "cellType": "text" },
            { "name": "ft_contribution_no_wellness", "title": "FT Employee Contribution (w/o Wellness)/Month", "cellType": "text" },
            { "name": "ft_contribution_with_wellness", "title": "FT Employee Contribution (w/ Wellness)/Month", "cellType": "text" }
          ],
          "rows": [
            { "value": "employee_only", "text": "Employee Only" },
            { "value": "employee_plus_1", "text": "Employee + 1" },
            { "value": "employee_plus_2_more", "text": "Employee + 2 or More" },
            { "value": "employee_plus_3_more", "text": "Employee + 3 or More (if applicable)" }
          ]
        },
        {
          "type": "matrixdynamic",
          "name": "rate_structure_2",
          "title": "Rate Structure 2",
          "cellType": "text",
          "columns": [
            { "name": "enrolled_count", "title": "# Enrolled", "cellType": "text" },
            { "name": "total_rate_cobra_minus_2", "title": "Total 2025 Rate/Month (COBRA -2%)", "cellType": "text" },
            { "name": "ft_contribution_no_wellness", "title": "FT Employee Contribution (w/o Wellness)/Month", "cellType": "text" },
            { "name": "ft_contribution_with_wellness", "title": "FT Employee Contribution (w/ Wellness)/Month", "cellType": "text" }
          ],
          "rows": [
            { "value": "employee_only", "text": "Employee Only" },
            { "value": "employee_spouse_dp", "text": "Employee + Spouse/Domestic Partner" },
            { "value": "employee_children", "text": "Employee + Children" },
            { "value": "employee_family", "text": "Employee + Family" }
          ]
        },
        {
          "type": "dropdown",
          "name": "parttime_greater_than_fulltime",
          "title": "Are part-time contributions greater than full-time contributions?",
          "choices": ["Yes", "No"]
        },
        {
          "type": "text",
          "name": "parttime_ee_only_contribution",
          "title": "Employee Only Part-Time Contribution (less than 25 hours per week)",
          "placeholder": "Leave blank if not applicable"
        },
        {
          "type": "dropdown",
          "name": "plans_bundled",
          "title": "Are medical and dental or vision plans bundled?",
          "choices": ["Yes", "No"]
        },
        {
          "type": "text",
          "name": "budget_increase_percentage",
          "title": "What is your medical & pharmacy's final budget increase after benefit changes?",
          "placeholder": "Enter percentage"
        }
      ]
    },
    {
      "name": "plan_design_coverage",
      "title": "Plan Design & Coverage",
      "elements": [
        {
          "type": "dropdown",
          "name": "hra_hsa_offered",
          "title": "Do you offer an HRA or HSA?",
          "choices": ["Yes, HRA is offered", "Yes, HSA is offered", "No, neither HRA nor HSA are offered"]
        },
        {
          "type": "text",
          "name": "employer_funded_amount",
          "title": "Employer Funded HRA/HSA Amount",
          "placeholder": "Annual dollar amount, leave blank if N/A"
        },
        {
          "type": "dropdown",
          "name": "custom_tier_1_facilities",
          "title": "Does your organization have a custom Tier 1 network/benefits at its own hospital/facilities?",
          "choices": ["Yes", "No"]
        },
        {
          "type": "matrix",
          "name": "deductible_structure",
          "title": "Deductibles by Network Tier",
          "columns": [
            { "value": "own_hospital_tier1", "text": "Own Hospital/Physicians (Tier 1)" },
            { "value": "in_network_tier2", "text": "In-Network (Tier 2)" },
            { "value": "out_of_network", "text": "Out-of-Network" }
          ],
          "rows": [
            { "value": "individual", "text": "Individual Deductible" },
            { "value": "family", "text": "Family Deductible" }
          ],
          "cellType": "text"
        },
        {
          "type": "dropdown",
          "name": "pharmacy_oop_combined",
          "title": "Is Pharmacy OOP Maximum combined with Medical?",
          "choices": ["Yes", "No"]
        },
        {
          "type": "matrix",
          "name": "out_of_pocket_maximum",
          "title": "Out-of-Pocket Maximum",
          "columns": [
            { "value": "own_hospital_tier1", "text": "Own Hospital/Physicians (Tier 1)" },
            { "value": "in_network_tier2", "text": "In-Network (Tier 2)" },
            { "value": "out_of_network", "text": "Out-of-Network" }
          ],
          "rows": [
            { "value": "medical_individual", "text": "Medical Individual OOP Max" },
            { "value": "medical_family", "text": "Medical Family OOP Max" },
            { "value": "pharmacy_individual", "text": "Pharmacy Individual OOP Max" },
            { "value": "pharmacy_family", "text": "Pharmacy Family OOP Max" }
          ],
          "cellType": "text"
        },
        {
          "type": "matrix",
          "name": "physician_services",
          "title": "Physician Services (What Employee Pays)",
          "columns": [
            { "value": "own_hospital_tier1", "text": "Own Hospital/Physicians (Tier 1)" },
            { "value": "in_network_tier2", "text": "In-Network (Tier 2)" },
            { "value": "out_of_network", "text": "Out-of-Network" }
          ],
          "rows": [
            { "value": "primary_care", "text": "Primary Care Visit" },
            { "value": "specialty", "text": "Specialty Visit" },
            { "value": "telemedicine", "text": "Telemedicine Visit" }
          ],
          "cellType": "text"
        },
        {
          "type": "matrix",
          "name": "hospital_services",
          "title": "Hospital Services (What Employee Pays)",
          "columns": [
            { "value": "own_hospital_tier1", "text": "Own Hospital/Physicians (Tier 1)" },
            { "value": "in_network_tier2", "text": "In-Network (Tier 2)" },
            { "value": "out_of_network", "text": "Out-of-Network" }
          ],
          "rows": [
            { "value": "inpatient", "text": "Inpatient" },
            { "value": "outpatient", "text": "Outpatient" }
          ],
          "cellType": "text"
        },
        {
          "type": "dropdown",
          "name": "tier2_at_tier1_benefit",
          "title": "Do you cover In-Network/Tier 2 providers at your Own Hospital/Tier 1 benefit level if services are not available at own hospital?",
          "choices": ["Yes", "No"]
        },
        {
          "type": "matrix",
          "name": "emergency_services",
          "title": "Emergency Services (What Employee Pays)",
          "columns": [
            { "value": "own_hospital_tier1", "text": "Own Hospital/Physicians (Tier 1)" },
            { "value": "in_network_tier2", "text": "In-Network (Tier 2)" },
            { "value": "out_of_network", "text": "Out-of-Network" }
          ],
          "rows": [
            { "value": "emergency_department", "text": "Emergency Department Visit" },
            { "value": "urgent_care", "text": "Urgent Care Visit" }
          ],
          "cellType": "text"
        },
        {
          "type": "dropdown",
          "name": "separate_rx_deductible",
          "title": "Do you have a separate pharmacy deductible?",
          "choices": ["Yes", "No"]
        },
        {
          "type": "text",
          "name": "pharmacy_deductible_individual",
          "title": "Pharmacy Deductible Individual Amount"
        },
        {
          "type": "dropdown",
          "name": "deductible_waived_generic",
          "title": "Deductible Waived for Generic?",
          "choices": ["Yes", "No/Not Applicable"]
        },
        {
          "type": "matrix",
          "name": "pharmacy_benefits",
          "title": "Pharmacy Benefits (Member Cost Share)",
          "columns": [
            { "value": "own_hospital_tier1", "text": "Own Hospital/Physicians (Tier 1)" },
            { "value": "in_network_tier2", "text": "In-Network (Tier 2)" },
            { "value": "out_of_network", "text": "Out-of-Network" }
          ],
          "rows": [
            { "value": "generic", "text": "Generic" },
            { "value": "brand_formulary", "text": "Brand Formulary" },
            { "value": "non_formulary", "text": "Non-Formulary" },
            { "value": "fourth_tier_specialty", "text": "4th Tier/Specialty" }
          ],
          "cellType": "text"
        },
        {
          "type": "text",
          "name": "coinsurance_max_per_script",
          "title": "Coinsurance Maximum ($ per script)"
        },
        {
          "type": "text",
          "name": "mail_order_copay",
          "title": "Mail Order Copay"
        },
        {
          "type": "text",
          "name": "mail_order_supply",
          "title": "Mail Order Supply (days)"
        },
        {
          "type": "dropdown",
          "name": "aca_grandfathered",
          "title": "Is the plan grandfathered under ACA?",
          "choices": ["Yes", "No"]
        },
        {
          "type": "dropdown",
          "name": "self_funded_pricing",
          "title": "For Self-Funded Only: Employee services received at own hospital are priced at:",
          "choices": ["Billed Charges", "PPO Network Rate", "Other Discount", "Percentage of Medicare"]
        },
        {
          "type": "dropdown",
          "name": "required_own_hospital_services",
          "title": "Do you require certain services to be performed at your own hospital?",
          "choices": ["Yes", "No"]
        },
        {
          "type": "comment",
          "name": "notes",
          "title": "Notes"
        }
      ]
    }
  ],
  "triggers": [
    {
      "type": "setvalue",
      "expression": "{pharmacy_oop_combined} = 'Yes'",
      "setToName": "out_of_pocket_maximum.pharmacy_individual",
      "setValue": ""
    },
    {
      "type": "setvalue",
      "expression": "{pharmacy_oop_combined} = 'Yes'",
      "setToName": "out_of_pocket_maximum.pharmacy_family",
      "setValue": ""
    }
  ]
}
```

### Dental Plan Block Schema (Repeatable)

```json
{
  "title": "Dental Plan {index}",
  "description": "Dental plan information with rates and coverage details",
  "pages": [
    {
      "name": "dental_plan_info",
      "title": "Plan Information",
      "elements": [
        {
          "type": "dropdown",
          "name": "dental_plan_type",
          "title": "Plan Type",
          "isRequired": true,
          "choices": ["DPPO", "DHMO"]
        },
        {
          "type": "text",
          "name": "dental_plan_name",
          "title": "Dental Plan Name",
          "isRequired": true
        },
        {
          "type": "dropdown",
          "name": "dental_carrier_network",
          "title": "Carrier/Network",
          "isRequired": true,
          "choices": ["TBD - Populate from system"]
        },
        {
          "type": "text",
          "name": "dental_eligible_employees_enrolled",
          "title": "Number of Eligible Employees Enrolled"
        },
        {
          "type": "dropdown",
          "name": "dental_funding_mechanism",
          "title": "Funding Mechanism",
          "isRequired": true,
          "choices": ["Self-Funded", "Fully Insured"]
        },
        {
          "type": "text",
          "name": "dental_total_rate_tiers",
          "title": "Total Number of Rate Tiers"
        }
      ]
    },
    {
      "name": "dental_rates_contributions",
      "title": "Rates & Contributions (Monthly)",
      "elements": [
        {
          "type": "matrixdynamic",
          "name": "dental_rate_structure_1",
          "title": "Rate Structure 1",
          "cellType": "text",
          "columns": [
            { "name": "enrolled_count", "title": "# Enrolled", "cellType": "text" },
            { "name": "total_rate_cobra_minus_2", "title": "Total Rate/Month (COBRA -2%)", "cellType": "text" },
            { "name": "ft_employee_contribution", "title": "FT Employee Contribution/Month", "cellType": "text" }
          ],
          "rows": [
            { "value": "employee_only", "text": "Employee Only" },
            { "value": "employee_plus_1", "text": "Employee + 1" },
            { "value": "employee_plus_2_more", "text": "Employee + 2 or More" },
            { "value": "employee_plus_3_more", "text": "Employee + 3 or More (if applicable)" }
          ]
        },
        {
          "type": "matrixdynamic",
          "name": "dental_rate_structure_2",
          "title": "Rate Structure 2",
          "cellType": "text",
          "columns": [
            { "name": "enrolled_count", "title": "# Enrolled", "cellType": "text" },
            { "name": "total_rate_cobra_minus_2", "title": "Total Rate/Month (COBRA -2%)", "cellType": "text" },
            { "name": "ft_employee_contribution", "title": "FT Employee Contribution/Month", "cellType": "text" }
          ],
          "rows": [
            { "value": "employee_only", "text": "Employee Only" },
            { "value": "employee_spouse_dp", "text": "Employee + Spouse/Domestic Partner" },
            { "value": "employee_children", "text": "Employee + Children" },
            { "value": "employee_family", "text": "Employee + Family" }
          ]
        },
        {
          "type": "text",
          "name": "dental_final_budget_increase",
          "title": "What is the dental final budget increase after benefit changes?",
          "placeholder": "Enter percentage"
        }
      ]
    },
    {
      "name": "dental_plan_design",
      "title": "Plan Design - In/Out of Network Benefits",
      "elements": [
        {
          "type": "matrix",
          "name": "dental_benefits_table",
          "title": "In/Out of Network Benefits",
          "columns": [
            { "value": "in_network", "text": "In-Network" },
            { "value": "out_of_network", "text": "Out-of-Network" }
          ],
          "rows": [
            { "value": "annual_deductible_per_person", "text": "Annual Deductible (per person)" },
            { "value": "maximum_annual_benefit", "text": "Maximum Annual Benefit (excludes orthodontia)" },
            { "value": "diagnostic_preventative", "text": "Diagnostic & Preventative (Plan Pays %)" },
            { "value": "basic_services", "text": "Basic Services (Plan Pays %)" },
            { "value": "major_prosthodontic", "text": "Major/Prosthodontic Services (Plan Pays %)" }
          ],
          "cellType": "text"
        },
        {
          "type": "dropdown",
          "name": "orthodontic_benefit_included",
          "title": "Does the plan include orthodontic benefit?",
          "choices": ["Yes", "No"]
        },
        {
          "type": "matrix",
          "name": "orthodontic_percentages",
          "title": "Orthodontic Coverage Percentages",
          "columns": [
            { "value": "percentage", "text": "Percentage" }
          ],
          "rows": [
            { "value": "adults", "text": "Adults" },
            { "value": "children", "text": "Children" }
          ],
          "cellType": "text",
          "visibleIf": "{orthodontic_benefit_included} = 'Yes'"
        },
        {
          "type": "text",
          "name": "orthodontic_lifetime_maximum",
          "title": "Maximum Lifetime Ortho Benefit",
          "visibleIf": "{orthodontic_benefit_included} = 'Yes'"
        }
      ]
    }
  ],
  "triggers": [
    {
      "type": "setvalue",
      "expression": "{orthodontic_benefit_included} != 'Yes'",
      "setToName": "orthodontic_percentages",
      "setValue": ""
    },
    {
      "type": "setvalue",
      "expression": "{orthodontic_benefit_included} != 'Yes'",
      "setToName": "orthodontic_lifetime_maximum",
      "setValue": ""
    }
  ]
}
```

### Vision Plan Block Schema (Repeatable)

```json
{
  "title": "Vision Plan {index}",
  "description": "Vision plan information with rates and coverage details",
  "pages": [
    {
      "name": "vision_plan_info",
      "title": "Plan Information",
      "elements": [
        {
          "type": "dropdown",
          "name": "vision_plan_type",
          "title": "Plan Type",
          "isRequired": true,
          "choices": ["TBD - Populate from system"]
        },
        {
          "type": "text",
          "name": "vision_plan_name",
          "title": "Vision Plan Name",
          "isRequired": true
        },
        {
          "type": "dropdown",
          "name": "vision_carrier_network",
          "title": "Carrier/Network",
          "isRequired": true,
          "choices": ["TBD - Populate from system"]
        },
        {
          "type": "dropdown",
          "name": "vision_offered_as",
          "title": "Offered As",
          "isRequired": true,
          "choices": ["Stand-alone plan", "Bundled with medical"]
        },
        {
          "type": "text",
          "name": "vision_eligible_employees_enrolled",
          "title": "Number of Eligible Employees Enrolled"
        },
        {
          "type": "dropdown",
          "name": "vision_funding_mechanism",
          "title": "Funding Mechanism",
          "isRequired": true,
          "choices": ["Self-Funded", "Fully Insured"]
        },
        {
          "type": "text",
          "name": "vision_total_rate_tiers",
          "title": "Total Number of Rate Tiers"
        }
      ]
    },
    {
      "name": "vision_rates_contributions",
      "title": "Rates & Contributions (Monthly)",
      "elements": [
        {
          "type": "matrixdynamic",
          "name": "vision_rate_structure_1",
          "title": "Rate Structure 1",
          "cellType": "text",
          "columns": [
            { "name": "enrolled_count", "title": "# Enrolled", "cellType": "text" },
            { "name": "total_rate_cobra_minus_2", "title": "Total Rate/Month (COBRA -2%)", "cellType": "text" },
            { "name": "ft_employee_contribution", "title": "FT Employee Contribution/Month", "cellType": "text" }
          ],
          "rows": [
            { "value": "employee_only", "text": "Employee Only" },
            { "value": "employee_plus_1", "text": "Employee + 1" },
            { "value": "employee_plus_2_more", "text": "Employee + 2 or More" },
            { "value": "employee_plus_3_more", "text": "Employee + 3 or More (if applicable)" }
          ]
        },
        {
          "type": "matrixdynamic",
          "name": "vision_rate_structure_2",
          "title": "Rate Structure 2",
          "cellType": "text",
          "columns": [
            { "name": "enrolled_count", "title": "# Enrolled", "cellType": "text" },
            { "name": "total_rate_cobra_minus_2", "title": "Total Rate/Month (COBRA -2%)", "cellType": "text" },
            { "name": "ft_employee_contribution", "title": "FT Employee Contribution/Month", "cellType": "text" }
          ],
          "rows": [
            { "value": "employee_only", "text": "Employee Only" },
            { "value": "employee_spouse_dp", "text": "Employee + Spouse/Domestic Partner" },
            { "value": "employee_children", "text": "Employee + Children" },
            { "value": "employee_family", "text": "Employee + Family" }
          ]
        },
        {
          "type": "text",
          "name": "vision_final_budget_increase",
          "title": "What is your 2025 vision final budget increase after benefit changes?",
          "placeholder": "Enter percentage"
        }
      ]
    },
    {
      "name": "vision_plan_design",
      "title": "Plan Design - In-Network Benefits",
      "elements": [
        {
          "type": "text",
          "name": "exam_materials_copay_combined",
          "title": "Exam and Materials Copay Combined",
          "placeholder": "Leave blank if not applicable"
        },
        {
          "type": "text",
          "name": "exam_materials_copay",
          "title": "Exam/Materials Copay",
          "placeholder": "Leave blank if not applicable"
        },
        {
          "type": "text",
          "name": "exam_copay",
          "title": "Exam Copay",
          "placeholder": "Leave blank if not applicable"
        },
        {
          "type": "text",
          "name": "materials_copay",
          "title": "Materials Copay",
          "placeholder": "Leave blank if not applicable"
        },
        {
          "type": "text",
          "name": "allowance_amount_percentage",
          "title": "Up to what dollar amount or percentage",
          "placeholder": "Can enter $ or %"
        },
        {
          "type": "text",
          "name": "exam_standard_lenses",
          "title": "Exam & Standard Lenses",
          "placeholder": "e.g., 100% covered in full after copay"
        },
        {
          "type": "text",
          "name": "frames_allowance",
          "title": "Frames",
          "placeholder": "e.g., Up to $130"
        },
        {
          "type": "text",
          "name": "contacts_allowance",
          "title": "Contacts",
          "placeholder": "e.g., Up to $105"
        },
        {
          "type": "dropdown",
          "name": "exam_frequency",
          "title": "Exam Frequency (in months)",
          "choices": ["12 months", "24 months"]
        },
        {
          "type": "dropdown",
          "name": "lenses_frequency",
          "title": "Lenses Frequency (in months)",
          "choices": ["12 months", "24 months"]
        },
        {
          "type": "dropdown",
          "name": "frames_frequency",
          "title": "Frames Frequency (in months)",
          "choices": ["12 months", "24 months"]
        },
        {
          "type": "dropdown",
          "name": "contacts_frequency",
          "title": "Contacts Frequency (in months)",
          "choices": ["12 months", "24 months"]
        }
      ]
    }
  ]
}
```

### Basic Life and Disability Schema

```json
{
  "title": "Basic Life and Disability",
  "description": "Basic life insurance and disability benefits information",
  "pages": [
    {
      "name": "basic_life_insurance",
      "title": "Basic Life Insurance",
      "elements": [
        {
          "type": "matrix",
          "name": "life_insurance_coverage",
          "title": "Basic Life Insurance Coverage",
          "columns": [
            { "value": "management", "text": "Management" },
            { "value": "non_management", "text": "Non-Management" }
          ],
          "rows": [
            { "value": "coverage_type", "text": "Coverage Type" },
            { "value": "coverage_flat_amount", "text": "Coverage Flat Amount" },
            { "value": "coverage_multiple_salary", "text": "Coverage Multiple of Salary" },
            { "value": "maximum_coverage", "text": "Maximum Coverage (up to)" }
          ],
          "cellType": "text"
        },
        {
          "type": "html",
          "name": "life_insurance_instructions",
          "html": "<p><strong>Instructions:</strong></p><ul><li><strong>Coverage Type:</strong> Select 'Flat Amount' or 'Multiple of Salary'</li><li><strong>Coverage Flat Amount:</strong> Enter dollar amount (leave blank if N/A)</li><li><strong>Coverage Multiple of Salary:</strong> Select 1X, 2X, 3X, 4X, 5X, or Other (leave blank if N/A)</li><li><strong>Maximum Coverage:</strong> Enter dollar amount (leave blank if N/A)</li></ul>"
        },
        {
          "type": "dropdown",
          "name": "management_coverage_type",
          "title": "Management - Coverage Type",
          "choices": ["Flat Amount", "Multiple of Salary"]
        },
        {
          "type": "text",
          "name": "management_flat_amount",
          "title": "Management - Coverage Flat Amount",
          "placeholder": "Leave blank if N/A"
        },
        {
          "type": "dropdown",
          "name": "management_multiple_salary",
          "title": "Management - Coverage Multiple of Salary",
          "choices": ["1X", "2X", "3X", "4X", "5X", "Other"],
          "placeholder": "Leave blank if N/A"
        },
        {
          "type": "text",
          "name": "management_maximum_coverage",
          "title": "Management - Maximum Coverage (up to)",
          "placeholder": "Leave blank if N/A"
        },
        {
          "type": "dropdown",
          "name": "non_management_coverage_type",
          "title": "Non-Management - Coverage Type",
          "choices": ["Flat Amount", "Multiple of Salary"]
        },
        {
          "type": "text",
          "name": "non_management_flat_amount",
          "title": "Non-Management - Coverage Flat Amount",
          "placeholder": "Leave blank if N/A"
        },
        {
          "type": "dropdown",
          "name": "non_management_multiple_salary",
          "title": "Non-Management - Coverage Multiple of Salary",
          "choices": ["1X", "2X", "3X", "4X", "5X", "Other"],
          "placeholder": "Leave blank if N/A"
        },
        {
          "type": "text",
          "name": "non_management_maximum_coverage",
          "title": "Non-Management - Maximum Coverage (up to)",
          "placeholder": "Leave blank if N/A"
        }
      ]
    },
    {
      "name": "short_term_disability",
      "title": "Short-Term Disability (STD)",
      "elements": [
        {
          "type": "dropdown",
          "name": "offers_std_only",
          "title": "Offers STD only?",
          "isRequired": true,
          "choices": ["Yes", "No"]
        },
        {
          "type": "dropdown",
          "name": "std_funding_option",
          "title": "STD Funding Option",
          "isRequired": true,
          "choices": ["State Disability", "Self-Funded Voluntary Plan", "STD Opt-Out"]
        }
      ]
    },
    {
      "name": "std_plan_design",
      "title": "Short-Term Disability Plan Design (Employer Paid - Full Time Employees)",
      "elements": [
        {
          "type": "matrix",
          "name": "std_plan_design_table",
          "title": "STD Plan Design",
          "columns": [
            { "value": "management", "text": "Management" },
            { "value": "non_management", "text": "Non-Management" }
          ],
          "rows": [
            { "value": "elimination_period_days", "text": "Elimination Period (in days)" },
            { "value": "percentage_salary_coverage", "text": "Percentage of Salary Coverage" },
            { "value": "weekly_benefit_maximum", "text": "Weekly Benefit Maximum ($)" }
          ],
          "cellType": "text"
        },
        {
          "type": "html",
          "name": "std_instructions",
          "html": "<p><strong>Instructions:</strong></p><ul><li><strong>Elimination Period:</strong> Enter number of days or select from dropdown</li><li><strong>Percentage of Salary Coverage:</strong> Enter percentage (e.g., 60%)</li><li><strong>Weekly Benefit Maximum:</strong> Enter dollar amount</li></ul>"
        }
      ]
    },
    {
      "name": "std_buy_up",
      "title": "STD Buy-Up (Employee Paid)",
      "elements": [
        {
          "type": "dropdown",
          "name": "std_buy_up_offered",
          "title": "Do you offer an employee paid buy-up STD plan?",
          "choices": ["Yes", "No"]
        }
      ]
    },
    {
      "name": "ltd_plan_design",
      "title": "Long-Term Disability Plan Design (Employer Paid - Full Time Employees)",
      "elements": [
        {
          "type": "matrix",
          "name": "ltd_plan_design_table",
          "title": "LTD Plan Design",
          "columns": [
            { "value": "management", "text": "Management" },
            { "value": "non_management", "text": "Non-Management" }
          ],
          "rows": [
            { "value": "elimination_period_days", "text": "Elimination Period (in days)" },
            { "value": "percentage_salary_coverage", "text": "Percentage of Salary Coverage" },
            { "value": "monthly_benefit_maximum", "text": "Monthly Benefit Maximum ($)" }
          ],
          "cellType": "text"
        },
        {
          "type": "html",
          "name": "ltd_instructions",
          "html": "<p><strong>Instructions:</strong></p><ul><li><strong>Elimination Period:</strong> Enter number of days or select from dropdown</li><li><strong>Percentage of Salary Coverage:</strong> Enter percentage (e.g., 60%)</li><li><strong>Monthly Benefit Maximum:</strong> Enter dollar amount</li></ul>"
        }
      ]
    },
    {
      "name": "ltd_buy_up",
      "title": "LTD Buy-Up (Employee Paid)",
      "elements": [
        {
          "type": "matrix",
          "name": "ltd_buy_up_table",
          "title": "LTD Buy-Up Options",
          "columns": [
            { "value": "management", "text": "Management" },
            { "value": "non_management", "text": "Non-Management" }
          ],
          "rows": [
            { "value": "buy_up_offered", "text": "Do you offer an employee paid buy-up LTD plan?" }
          ],
          "cellType": "dropdown",
          "choices": ["Yes", "No"]
        }
      ]
    }
  ]
}
```

### Simple Example Schema

```json
{
  "title": "Annual Assessment",
  "pages": [
    { "name": "intro", "elements": [ { "type": "text", "name": "contact.name", "title": "Contact name" } ] },
    { "name": "ops", "elements": [ { "type": "radiogroup", "name": "ops.size", "choices": ["S","M","L"] } ] }
  ]
}
```

