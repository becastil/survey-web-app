# Healthcare Data Visualization Module

## Overview

The Healthcare Data Visualization module is a comprehensive tool for analyzing and visualizing healthcare survey data. Built with Plotly.js and Framer Motion, it provides interactive charts and real-time data processing capabilities specifically tailored for healthcare organizations.

## Architecture

### Component Structure

```
components/
├── healthcare/
│   └── HealthcareDashboard.tsx    # Main orchestrator component
├── upload/
│   └── EnhancedFileUploadZone.tsx # File upload with validation
└── analytics/
    └── CSVDataVisualizer.tsx      # Legacy CSV visualizer

lib/
└── parsers/
    └── healthcareDataParser.ts    # Multi-format parsing engine
```

### Data Flow

```mermaid
graph LR
    A[File Upload] --> B[Format Detection]
    B --> C[Data Parsing]
    C --> D[Field Mapping]
    D --> E[Validation]
    E --> F[Transformation]
    F --> G[Visualization]
```

## Components

### HealthcareDashboard

The main component that orchestrates the entire visualization workflow.

**Props:**
- None (self-contained)

**Features:**
- File upload integration
- Data processing pipeline
- Chart generation
- Interactive filtering
- Export capabilities

**Usage:**
```tsx
import { HealthcareDashboard } from '@/components/healthcare/HealthcareDashboard';

export default function AnalyticsPage() {
  return <HealthcareDashboard />;
}
```

### EnhancedFileUploadZone

Advanced file upload component with drag & drop support.

**Props:**
```typescript
interface EnhancedFileUploadZoneProps {
  onFilesProcessed: (files: UploadedFile[]) => void;
  acceptedFormats?: string[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
}
```

**Features:**
- Multi-file upload
- Progress tracking
- Validation feedback
- Format detection
- Error handling

### HealthcareDataParser

Utility class for parsing various file formats and transforming data.

**Methods:**
```typescript
class HealthcareDataParser {
  static async parseFile(file: File): Promise<ParsedData>
  static transformToHealthcareSurvey(data: any[], headers: string[]): HealthcareSurveyData[]
  static validateDataQuality(data: HealthcareSurveyData[]): ValidationResult
}
```

## Data Schema

### HealthcareSurveyData

```typescript
interface HealthcareSurveyData {
  organizationName: string;
  region: string;
  subRegion?: string;
  employeeCount: number;
  unionPopulation?: boolean;
  medicalPlans?: MedicalPlan[];
  benefitBudgetIncrease?: number;
  demographicData?: DemographicData;
}

interface MedicalPlan {
  planType: 'HMO' | 'PPO' | 'EPO' | 'HDHP' | 'POS' | 'Other';
  carrier: string;
  enrollment: number;
  premiumCost: number;
  employerContribution: number;
  deductible: number;
  outOfPocketMax: number;
}

interface DemographicData {
  averageAge?: number;
  genderDistribution?: {
    male?: number;
    female?: number;
    other?: number;
  };
  coverageTiers?: {
    employeeOnly?: number;
    employeeSpouse?: number;
    employeeChildren?: number;
    family?: number;
  };
}
```

## Chart Types

### 1. Regional Distribution Bar Chart

Shows organization count by geographic region.

**Configuration:**
```javascript
{
  type: 'bar',
  x: regions,
  y: counts,
  marker: { color: dynamicColors },
  hovertemplate: '<b>%{x}</b><br>Organizations: %{y}'
}
```

### 2. Plan Type Pie Chart

Displays distribution of medical plan types.

**Configuration:**
```javascript
{
  type: 'pie',
  labels: planTypes,
  values: planCounts,
  hole: 0.4, // Donut chart
  marker: { colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'] }
}
```

### 3. Cost Analysis Scatter Plot

Correlates employee count with budget increases.

**Configuration:**
```javascript
{
  type: 'scatter',
  mode: 'markers',
  x: employeeCounts,
  y: budgetIncreases,
  marker: {
    size: scaledSizes,
    color: unionStatus ? '#EF4444' : '#3B82F6',
    opacity: 0.6
  }
}
```

### 4. Trend Analysis Line Chart

Shows budget trends over time.

**Configuration:**
```javascript
{
  type: 'scatter',
  mode: 'lines+markers',
  line: { shape: 'spline', width: 3 },
  fill: 'tonexty',
  fillcolor: 'rgba(139, 92, 246, 0.1)'
}
```

### 5. Demographics Box Plot

Analyzes employee count distribution.

**Configuration:**
```javascript
{
  type: 'box',
  y: employeeCounts,
  boxmean: 'sd',
  marker: { color: '#10B981' }
}
```

## Field Mapping

The parser automatically maps common healthcare survey fields:

### Automatic Field Detection

```typescript
const FIELD_MAPPINGS = {
  organizationName: [
    'Organization Name',
    'Company Name',
    'Employer Name'
  ],
  region: [
    'Region',
    'Location',
    'Geographic Region'
  ],
  employeeCount: [
    'Employee Count',
    'Total Employees',
    'Number of Employees'
  ],
  // ... more mappings
};
```

### Custom Field Mapping

You can extend field mappings for specific use cases:

```typescript
// Add custom mappings
FIELD_MAPPINGS.customField = [
  'Your Custom Header',
  'Alternative Header'
];
```

## Validation Rules

### Data Quality Checks

1. **Required Fields**
   - Organization Name
   - Region
   - Employee Count

2. **Format Validation**
   - Dates: ISO 8601 or MM/DD/YYYY
   - Numbers: Positive integers for counts
   - Percentages: 0-100 range

3. **Business Rules**
   - Employee count > 0
   - Budget increase between -50% and 100%
   - Deductible < Out-of-pocket maximum

### Validation Feedback

```typescript
interface ValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  stats: {
    totalRecords: number;
    validRecords: number;
    missingFields: Record<string, number>;
    dataCompleteness: number;
  };
}
```

## Performance Optimization

### Large Dataset Handling

- **Chunked Processing**: Process data in batches of 1000 records
- **Web Workers**: Offload parsing to background threads
- **Virtual Scrolling**: Render only visible data
- **Lazy Loading**: Load charts on demand

### Caching Strategy

```typescript
// Cache parsed data for 15 minutes
const CACHE_DURATION = 15 * 60 * 1000;
const dataCache = new Map<string, CachedData>();

interface CachedData {
  data: any[];
  timestamp: number;
}
```

## Animation System

### Framer Motion Integration

All components use Framer Motion for smooth animations:

```typescript
// Container animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Item animation
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};
```

### Chart Entry Animations

Plotly charts animate on mount:

```javascript
layout: {
  transition: {
    duration: 500,
    easing: 'cubic-in-out'
  }
}
```

## Error Handling

### File Upload Errors

```typescript
try {
  const parsed = await HealthcareDataParser.parseFile(file);
} catch (error) {
  if (error.code === 'FILE_TOO_LARGE') {
    // Handle large file
  } else if (error.code === 'INVALID_FORMAT') {
    // Handle format error
  }
}
```

### Data Validation Errors

```typescript
const validation = HealthcareDataParser.validateDataQuality(data);
if (!validation.isValid) {
  // Display validation issues
  validation.issues.forEach(issue => {
    console.error(`Validation Error: ${issue}`);
  });
}
```

## Testing

### Unit Tests

```typescript
// Test file parsing
describe('HealthcareDataParser', () => {
  it('should parse CSV files correctly', async () => {
    const file = new File(['col1,col2\nval1,val2'], 'test.csv');
    const result = await HealthcareDataParser.parseFile(file);
    expect(result.headers).toEqual(['col1', 'col2']);
  });
});
```

### Integration Tests

```typescript
// Test complete workflow
describe('HealthcareDashboard', () => {
  it('should process and visualize uploaded files', async () => {
    render(<HealthcareDashboard />);
    const file = createMockHealthcareFile();
    await uploadFile(file);
    expect(screen.getByText('Regional Distribution')).toBeInTheDocument();
  });
});
```

## Accessibility

### WCAG 2.1 Compliance

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Contrast**: Minimum 4.5:1 ratio for text
- **Focus Indicators**: Visible focus states

### ARIA Implementation

```tsx
<div
  role="region"
  aria-label="Healthcare data visualization"
  aria-live="polite"
  aria-busy={isLoading}
>
  {/* Chart content */}
</div>
```

## Security Considerations

### Data Handling

- **Client-Side Processing**: All data processing happens in the browser
- **No Server Upload**: Files are not sent to any server
- **Memory Management**: Clear data from memory after use
- **Sanitization**: All user inputs are sanitized

### PHI Protection

```typescript
// Detect and flag PHI fields
const PHI_PATTERNS = {
  ssn: /\d{3}-\d{2}-\d{4}/,
  mrn: /MRN\d{6,}/,
  dob: /\d{2}\/\d{2}\/\d{4}/
};

function detectPHI(data: any[]): boolean {
  // Check for PHI patterns
  return Object.values(PHI_PATTERNS).some(pattern =>
    JSON.stringify(data).match(pattern)
  );
}
```

## Future Enhancements

### Planned Features

1. **Real-time Collaboration**
   - Multiple users viewing same dashboard
   - Shared filters and selections
   - Comments on charts

2. **Advanced Analytics**
   - Machine learning predictions
   - Anomaly detection
   - Clustering analysis

3. **Enhanced Export**
   - PowerBI integration
   - Tableau export
   - API endpoints

4. **Mobile App**
   - Native iOS/Android apps
   - Offline capability
   - Push notifications

### Contribution Guidelines

To contribute to this module:

1. Follow the existing code patterns
2. Add tests for new features
3. Update documentation
4. Submit PR with clear description

---

Last Updated: 2025-08-22
Version: 2.0.0