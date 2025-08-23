# Data Schemas Specification
## AI-Powered Survey Benchmarking Dashboard

**Version:** 1.0  
**Date:** August 23, 2025  
**Author:** Mary (Business Analyst)  
**Purpose:** Define comprehensive data structures for CSV inputs, processing, and outputs

---

## 1. Input CSV Schemas

### 1.1 Survey Response Schema (Primary Input)
**File Pattern:** `survey_responses_[YYYY-MM-DD].csv`

| Column Name | Data Type | Required | Description | Example |
|------------|-----------|----------|-------------|---------|
| response_id | String | Yes | Unique identifier for response | "RESP-2025-001234" |
| organization_id | String | Yes | Unique org identifier | "ORG-HOSP-4521" |
| organization_name | String | Yes | Organization name | "Regional Medical Center" |
| industry | String | Yes | Primary industry classification | "Healthcare" |
| sub_industry | String | No | Detailed industry segment | "Acute Care Hospital" |
| employee_count | Integer | Yes | Total number of employees | 2500 |
| annual_revenue | Float | No | Annual revenue in millions | 450.5 |
| region | String | Yes | Geographic region | "Northeast" |
| state | String | Yes | State/Province code | "NY" |
| city | String | No | City name | "Rochester" |
| response_date | Date | Yes | Date of survey completion | "2025-08-15" |
| respondent_role | String | Yes | Role of person completing | "HR Director" |
| survey_version | String | Yes | Survey template version | "2025.1" |

### 1.2 Benefits Data Schema
**File Pattern:** `benefits_data_[YYYY-MM-DD].csv`

| Column Name | Data Type | Required | Description | Example |
|------------|-----------|----------|-------------|---------|
| organization_id | String | Yes | Links to survey response | "ORG-HOSP-4521" |
| benefit_category | String | Yes | High-level category | "Health Insurance" |
| benefit_type | String | Yes | Specific benefit type | "Medical" |
| benefit_name | String | Yes | Specific plan/benefit name | "PPO High Deductible" |
| employee_contribution_annual | Float | Yes | Employee annual cost | 3600.00 |
| employer_contribution_annual | Float | Yes | Employer annual cost | 12000.00 |
| deductible_individual | Float | No | Individual deductible | 3500.00 |
| deductible_family | Float | No | Family deductible | 7000.00 |
| out_of_pocket_max_individual | Float | No | Individual OOP maximum | 6000.00 |
| out_of_pocket_max_family | Float | No | Family OOP maximum | 12000.00 |
| coverage_percent | Float | No | Coverage percentage | 80.0 |
| waiting_period_days | Integer | No | Days before eligibility | 90 |
| participation_rate | Float | No | % employees enrolled | 87.5 |
| satisfaction_score | Float | No | Employee satisfaction (1-10) | 7.2 |

### 1.3 Compensation Data Schema
**File Pattern:** `compensation_data_[YYYY-MM-DD].csv`

| Column Name | Data Type | Required | Description | Example |
|------------|-----------|----------|-------------|---------|
| organization_id | String | Yes | Links to survey response | "ORG-HOSP-4521" |
| job_category | String | Yes | Job classification | "Registered Nurse" |
| job_level | String | Yes | Seniority level | "Senior" |
| base_salary_min | Float | Yes | Minimum base salary | 65000.00 |
| base_salary_median | Float | Yes | Median base salary | 75000.00 |
| base_salary_max | Float | Yes | Maximum base salary | 85000.00 |
| bonus_eligible | Boolean | Yes | Bonus eligibility | true |
| bonus_target_percent | Float | No | Target bonus percentage | 10.0 |
| equity_eligible | Boolean | No | Equity compensation eligible | false |
| total_comp_median | Float | Yes | Total compensation median | 82500.00 |
| headcount | Integer | Yes | Number in this category | 145 |

### 1.4 Time-Off & Perks Schema
**File Pattern:** `timeoff_perks_[YYYY-MM-DD].csv`

| Column Name | Data Type | Required | Description | Example |
|------------|-----------|----------|-------------|---------|
| organization_id | String | Yes | Links to survey response | "ORG-HOSP-4521" |
| benefit_type | String | Yes | Type of benefit | "PTO" |
| days_offered | Float | No | Days provided annually | 20.0 |
| accrual_rate | String | No | How benefit accrues | "1.67 days/month" |
| max_carryover | Float | No | Maximum days carried over | 5.0 |
| cash_out_allowed | Boolean | No | Can cash out unused | false |
| waiting_period_days | Integer | No | Days before eligibility | 0 |
| utilization_rate | Float | No | % actually used | 75.0 |
| monetary_value | Float | No | Estimated dollar value | 5000.00 |

---

## 2. Processing & Enrichment Schemas

### 2.1 Peer Group Assignment
**Internal Processing Table**

```json
{
  "organization_id": "ORG-HOSP-4521",
  "peer_groups": {
    "true_peers": {
      "group_id": "PEER-HC-NE-2500",
      "criteria": {
        "industry_match": "exact",
        "size_range": "2000-3000 employees",
        "region": "Northeast",
        "revenue_band": "$400M-$500M"
      },
      "member_count": 24,
      "confidence_score": 0.92
    },
    "aspirational_peers": {
      "group_id": "PEER-HC-NE-5000",
      "criteria": {
        "industry_match": "exact",
        "size_range": "3000-5000 employees",
        "region": "Northeast",
        "revenue_band": "$500M-$750M"
      },
      "member_count": 18,
      "confidence_score": 0.88
    },
    "talent_competitors": {
      "group_id": "TALENT-HC-NE-ALL",
      "criteria": {
        "geographic_radius": "50 miles",
        "industry": "Healthcare or Tech",
        "hiring_overlap": true
      },
      "member_count": 42,
      "confidence_score": 0.85
    }
  }
}
```

### 2.2 Benchmark Calculations
**Aggregated Metrics Table**

```json
{
  "metric_id": "BENCH-HEALTH-DEDUCT-2025Q3",
  "metric_name": "Health Insurance Deductible",
  "peer_group_id": "PEER-HC-NE-2500",
  "statistics": {
    "percentile_10": 1500.00,
    "percentile_25": 2000.00,
    "median": 2500.00,
    "percentile_75": 3000.00,
    "percentile_90": 3500.00,
    "mean": 2550.00,
    "std_dev": 725.00,
    "sample_size": 24
  },
  "your_value": 3500.00,
  "your_percentile": 90,
  "competitive_position": "bottom_quartile",
  "trend": {
    "direction": "increasing",
    "change_percent": 12.5,
    "change_period": "year_over_year"
  }
}
```

### 2.3 Natural Language Query Metadata
**Query Processing Schema**

```json
{
  "query_id": "QUERY-2025-08-23-001",
  "original_query": "How do our health benefits compare to similar hospitals?",
  "processed_query": {
    "intent": "comparison",
    "entities": {
      "benefit_type": ["health_insurance"],
      "comparison_group": "similar_hospitals",
      "metrics": ["deductible", "premium", "coverage"]
    },
    "context": {
      "organization_id": "ORG-HOSP-4521",
      "peer_group": "true_peers",
      "time_period": "current"
    }
  },
  "selected_visualizations": ["competitive_position_matrix", "radar_chart"],
  "confidence_score": 0.94
}
```

---

## 3. Output Schemas

### 3.1 Insight Generation Output
**Generated Narrative Schema**

```json
{
  "insight_id": "INSIGHT-2025-08-23-001",
  "query_id": "QUERY-2025-08-23-001",
  "insight_type": "competitive_gap",
  "priority": "high",
  "finding": {
    "headline": "Health Insurance Deductible 40% Above Market",
    "detail": "Your individual deductible of $3,500 places you in the 90th percentile among peer hospitals, meaning 90% of similar organizations offer lower deductibles.",
    "data_points": {
      "your_value": 3500.00,
      "peer_median": 2500.00,
      "difference_amount": 1000.00,
      "difference_percent": 40.0,
      "percentile_rank": 90
    }
  },
  "impact": {
    "risk_level": "high",
    "affected_employees": 2175,
    "retention_risk_score": 7.5,
    "financial_impact": {
      "annual_cost_to_employees": 2175000.00,
      "turnover_risk_cost": 1800000.00
    },
    "correlation": "Exit interviews show 67% mention 'better benefits' as leaving reason"
  },
  "recommendation": {
    "action": "Reduce deductible to peer median",
    "target_value": 2500.00,
    "implementation_cost": 1200000.00,
    "expected_roi": {
      "turnover_reduction_percent": 15,
      "cost_savings": 1800000.00,
      "net_benefit": 600000.00,
      "payback_months": 8
    },
    "priority_score": 9.2
  },
  "confidence": {
    "data_quality": 0.92,
    "sample_size": 24,
    "statistical_significance": true,
    "caveats": ["Regional cost variations not fully adjusted"]
  }
}
```

### 3.2 Visualization Data Output
**Chart-Ready Data Schema**

```json
{
  "visualization_id": "VIZ-RADAR-2025-08-23-001",
  "visualization_type": "radar_chart",
  "title": "Benefits Competitiveness Score",
  "data": {
    "dimensions": [
      {
        "label": "Health Insurance",
        "your_score": 35,
        "peer_median": 65,
        "industry_leader": 85
      },
      {
        "label": "Retirement (401k)",
        "your_score": 72,
        "peer_median": 70,
        "industry_leader": 90
      },
      {
        "label": "PTO",
        "your_score": 58,
        "peer_median": 60,
        "industry_leader": 75
      },
      {
        "label": "Professional Development",
        "your_score": 45,
        "peer_median": 50,
        "industry_leader": 80
      },
      {
        "label": "Wellness Programs",
        "your_score": 80,
        "peer_median": 55,
        "industry_leader": 85
      }
    ],
    "overall_score": 58,
    "peer_median_score": 60,
    "interpretation": "Below market in 3 of 5 key benefit areas"
  },
  "interactivity": {
    "hover_details": true,
    "click_to_drill": true,
    "exportable": true
  }
}
```

### 3.3 Export/Report Schema
**Benchmark Report Output**

```json
{
  "report_id": "REPORT-2025-Q3-BENEFITS",
  "generated_date": "2025-08-23",
  "organization_id": "ORG-HOSP-4521",
  "executive_summary": {
    "overall_competitiveness": "Below Market",
    "percentile_rank": 35,
    "key_strengths": ["Wellness Programs", "Retirement Match"],
    "critical_gaps": ["Health Insurance Costs", "Professional Development"],
    "recommended_actions": 3,
    "estimated_investment": 2500000.00,
    "expected_roi": 4200000.00
  },
  "detailed_findings": [
    {
      "category": "Health Benefits",
      "findings": [...],
      "recommendations": [...],
      "benchmarks": [...]
    }
  ],
  "peer_comparison_matrix": {...},
  "trend_analysis": {...},
  "action_plan": {
    "immediate": [...],
    "short_term": [...],
    "long_term": [...]
  }
}
```

---

## 4. Data Quality & Validation Rules

### 4.1 Input Validation Rules

**Required Field Validation:**
- All required fields must be non-null
- Organization ID must match across related files
- Dates must be in ISO format (YYYY-MM-DD)
- Numeric fields must be positive where logical

**Data Type Validation:**
```python
validation_rules = {
    "employee_count": {"type": "integer", "min": 1, "max": 1000000},
    "deductible_individual": {"type": "float", "min": 0, "max": 50000},
    "participation_rate": {"type": "float", "min": 0, "max": 100},
    "satisfaction_score": {"type": "float", "min": 1, "max": 10}
}
```

**Cross-Field Validation:**
- deductible_family >= deductible_individual
- out_of_pocket_max >= deductible
- base_salary_max >= base_salary_median >= base_salary_min
- total_comp_median >= base_salary_median

### 4.2 Data Completeness Scoring

```json
{
  "completeness_score": {
    "overall": 0.87,
    "by_category": {
      "basic_info": 1.00,
      "health_benefits": 0.92,
      "compensation": 0.85,
      "time_off": 0.78,
      "perks": 0.65
    },
    "missing_critical": ["retirement_vesting_schedule"],
    "missing_optional": ["tuition_reimbursement_amount", "gym_subsidy"]
  }
}
```

### 4.3 Anomaly Detection Rules

**Statistical Outliers:**
- Flag values > 3 standard deviations from peer mean
- Alert on year-over-year changes > 50%
- Identify impossible values (e.g., 500 days PTO)

**Logical Inconsistencies:**
- Total compensation less than base salary
- Participation rate > 100%
- Deductible > out-of-pocket maximum

---

## 5. Data Security & Privacy Schema

### 5.1 PII Handling
```json
{
  "pii_fields": {
    "direct_identifiers": [],
    "quasi_identifiers": ["organization_name", "city"],
    "sensitive_data": ["compensation_data", "satisfaction_scores"]
  },
  "anonymization_rules": {
    "small_cell_suppression": "n < 5",
    "aggregation_minimum": 3,
    "geographic_generalization": "state_level"
  }
}
```

### 5.2 Access Control Schema
```json
{
  "access_levels": {
    "public": ["industry_benchmarks"],
    "authenticated": ["peer_comparisons"],
    "premium": ["detailed_analytics", "competitor_data"],
    "admin": ["raw_data", "individual_responses"]
  }
}
```

---

## 6. API Response Schemas

### 6.1 REST API Endpoints

**GET /api/benchmarks**
```json
{
  "status": "success",
  "data": {
    "benchmarks": [...],
    "peer_group": "PEER-HC-NE-2500",
    "as_of_date": "2025-08-23",
    "next_update": "2025-09-01"
  },
  "metadata": {
    "response_time_ms": 245,
    "cache_hit": true,
    "version": "1.0"
  }
}
```

**POST /api/query**
```json
{
  "query": "How do our benefits compare?",
  "context": {
    "organization_id": "ORG-HOSP-4521",
    "comparison_group": "true_peers",
    "time_period": "current_quarter"
  },
  "options": {
    "include_narrative": true,
    "include_visualizations": true,
    "confidence_threshold": 0.8
  }
}
```

---

## 7. Change Data Capture Schema

### 7.1 Historical Tracking
```json
{
  "change_id": "CHANGE-2025-08-23-001",
  "organization_id": "ORG-HOSP-4521",
  "metric": "deductible_individual",
  "previous_value": 3000.00,
  "new_value": 3500.00,
  "change_date": "2025-08-23",
  "change_percent": 16.67,
  "peer_trend": "increasing",
  "competitive_impact": "negative",
  "version": 2
}
```

This comprehensive schema structure ensures data consistency, quality, and security while enabling powerful analytics and visualization capabilities.