# Healthcare Benefits Survey - Implementation Guide

This guide covers the complete implementation of the Keenan Healthcare Benefits Survey application, including all infrastructure components needed to support the survey functionality.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [Database Setup](#database-setup)
5. [API Endpoints](#api-endpoints)
6. [Components & Hooks](#components--hooks)
7. [Usage Examples](#usage-examples)
8. [Testing](#testing)
9. [Deployment](#deployment)

## 🎯 Overview

This implementation provides a complete survey management system with:

- **Comprehensive Type Definitions** - Strongly typed TypeScript interfaces for all survey data
- **Database Schema** - PostgreSQL/Supabase schema with RLS policies
- **REST API** - Full CRUD operations for surveys
- **Auto-save** - Automatic saving of survey progress with debouncing
- **Progress Tracking** - Real-time calculation of survey completion
- **Validation** - Real-time and on-demand validation with field-level feedback
- **Export/Import** - JSON, CSV, and Excel export capabilities
- **Security** - Row-level security and authentication

## 🏗️ Architecture

### Data Flow

```
User Input → React Components → Validation Hook → Auto-save Hook → API Routes → Supabase Database
```

### Key Technologies

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Survey Engine**: SurveyJS
- **Validation**: Custom validation engine with real-time feedback

## 🚀 Setup Instructions

### 1. Install Dependencies

All required dependencies are already in `package.json`. The implementation adds no new dependencies beyond what was already installed:

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Run the database schema creation script in your Supabase SQL editor:

```bash
# The schema file is located at: database/schema.sql
```

This will create:
- All tables (organizations, users, survey_responses, etc.)
- Indexes for performance
- Triggers for auto-updating timestamps and progress
- Row Level Security (RLS) policies
- Helper functions for progress calculation

## 💾 Database Setup

### Tables Created

1. **organizations** - Organization/company information
2. **users** - User accounts (extends Supabase auth.users)
3. **survey_responses** - Main survey data storage
4. **survey_snapshots** - Auto-save snapshots for recovery
5. **survey_validations** - Validation error tracking
6. **survey_exports** - Export history tracking

### Key Features

- **JSONB Storage**: Survey data stored as JSONB for flexibility
- **Auto-progress Calculation**: Triggers automatically calculate completion percentage
- **Auto-snapshots**: System creates snapshots at 10% progress milestones
- **RLS Policies**: Users can only access data from their organization

### Running the Schema

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Create a new query
4. Copy the contents of `database/schema.sql`
5. Execute the query

## 🔌 API Endpoints

### Survey CRUD Operations

#### `GET /api/surveys`
List all surveys for the user's organization.

**Query Parameters:**
- `status`: Filter by status (draft, in_progress, completed, submitted)
- `limit`: Results per page (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "surveys": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### `POST /api/surveys`
Create a new survey.

**Request Body:**
```json
{
  "data": {
    "generalInformation": {...},
    "medicalPlans": [...],
    ...
  }
}
```

#### `GET /api/surveys/[id]`
Get a specific survey by ID.

#### `PATCH /api/surveys/[id]`
Update a survey (partial update).

**Request Body:**
```json
{
  "data": {...},
  "status": "in_progress"
}
```

#### `DELETE /api/surveys/[id]`
Delete a survey (admin only).

### Validation

#### `POST /api/surveys/[id]/validate`
Validate survey data and return errors/warnings.

**Response:**
```json
{
  "valid": false,
  "errors": [
    {
      "field": "generalInformation.email",
      "message": "Valid email is required",
      "type": "format"
    }
  ],
  "errorCount": 1
}
```

### Export

#### `GET /api/surveys/[id]/export?format=json|csv|excel`
Export survey data in various formats.

### Import

#### `POST /api/surveys/import`
Import survey data from JSON.

**Request Body:**
```json
{
  "data": {...},
  "createNew": true
}
```

## 🧩 Components & Hooks

### Type Definitions

Located in `types/survey.ts`:

- `SurveyResponse` - Complete survey response with metadata
- `SurveyData` - All survey sections
- `GeneralInformation`, `MedicalPlan`, `DentalPlan`, etc. - Section-specific types
- All supporting types for nested data structures

### React Hooks

#### `useAutoSave`

Automatically saves survey data at configurable intervals.

```typescript
import { useAutoSave } from '@/hooks/useAutoSave';

const { isSaving, lastSaved, error, saveNow } = useAutoSave({
  surveyId: 'uuid',
  data: surveyData,
  enabled: true,
  interval: 5000, // 5 seconds
  onError: (error) => console.error(error)
});
```

**Features:**
- Debounced saving (configurable interval)
- Prevents duplicate saves
- Manual save trigger
- Before-unload protection
- Error handling

#### `useValidation`

Provides real-time validation with field-level feedback.

```typescript
import { useValidation } from '@/hooks/useValidation';

const {
  isValid,
  errors,
  warnings,
  fieldErrors,
  isValidating,
  validateNow,
  getFieldError,
  hasFieldError
} = useValidation({
  data: surveyData,
  enabled: true,
  realTime: true,
  debounceMs: 500
});
```

**Validation Types:**
- `required` - Missing required fields
- `format` - Invalid format (email, phone, etc.)
- `range` - Values outside acceptable range
- `logic` - Logical inconsistencies

**Severity Levels:**
- `error` - Must be fixed before submission
- `warning` - Should be reviewed but not blocking

### React Components

#### `SurveyProgress`

Displays overall and section-by-section progress.

```tsx
import { SurveyProgress } from '@/components/SurveyProgress';

<SurveyProgress data={surveyData} />
```

**Features:**
- Overall progress percentage
- Section-by-section breakdown
- Visual progress bars
- Completion status indicators

#### `ValidationFeedback`

Shows inline validation messages for fields.

```tsx
import { ValidationFeedback } from '@/components/ValidationFeedback';

<ValidationFeedback error={getFieldError('generalInformation.email')} />
```

#### `ValidationSummary`

Displays a summary of all validation errors and warnings.

```tsx
import { ValidationSummary } from '@/components/ValidationFeedback';

<ValidationSummary errors={errors} warnings={warnings} />
```

## 📖 Usage Examples

### Complete Survey Page Example

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useValidation } from '@/hooks/useValidation';
import { SurveyProgress } from '@/components/SurveyProgress';
import { ValidationSummary } from '@/components/ValidationFeedback';
import type { SurveyData } from '@/types/survey';

export default function SurveyPage({ surveyId }: { surveyId: string }) {
  const [surveyData, setSurveyData] = useState<Partial<SurveyData>>({});

  // Auto-save hook
  const { isSaving, lastSaved } = useAutoSave({
    surveyId,
    data: surveyData,
    enabled: true,
    interval: 5000
  });

  // Validation hook
  const { isValid, errors, warnings } = useValidation({
    data: surveyData,
    enabled: true,
    realTime: true
  });

  // Load survey data
  useEffect(() => {
    fetch(`/api/surveys/${surveyId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
      .then(res => res.json())
      .then(data => setSurveyData(data.data));
  }, [surveyId]);

  const handleSubmit = async () => {
    if (!isValid) {
      alert('Please fix all errors before submitting');
      return;
    }

    await fetch(`/api/surveys/${surveyId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        status: 'submitted',
        data: surveyData
      })
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Survey */}
        <div className="lg:col-span-3">
          <ValidationSummary errors={errors} warnings={warnings} />

          {/* Survey component here */}

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-slate-600">
              {isSaving ? 'Saving...' : lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : ''}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:bg-slate-300"
            >
              Submit Survey
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <SurveyProgress data={surveyData} />
        </div>
      </div>
    </div>
  );
}

function getToken() {
  return localStorage.getItem('supabase.auth.token') || '';
}
```

### Export Survey Data

```typescript
async function exportSurvey(surveyId: string, format: 'json' | 'csv' | 'excel') {
  const response = await fetch(`/api/surveys/${surveyId}/export?format=${format}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `survey-${surveyId}.${format}`;
  link.click();
  URL.revokeObjectURL(url);
}
```

### Import Survey Data

```typescript
async function importSurvey(data: Partial<SurveyData>) {
  const response = await fetch('/api/surveys/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      data,
      createNew: true
    })
  });

  return await response.json();
}
```

## 🧪 Testing

### Manual Testing Checklist

1. **Survey Creation**
   - [ ] Create new survey
   - [ ] Verify survey appears in list
   - [ ] Verify initial status is 'draft'

2. **Auto-save**
   - [ ] Make changes to survey
   - [ ] Wait 5 seconds
   - [ ] Verify "Saving..." indicator appears
   - [ ] Refresh page and verify changes persisted

3. **Validation**
   - [ ] Leave required fields empty
   - [ ] Enter invalid email format
   - [ ] Enter negative numbers
   - [ ] Verify error messages appear
   - [ ] Fix errors and verify they disappear

4. **Progress Tracking**
   - [ ] Fill out sections incrementally
   - [ ] Verify progress percentage updates
   - [ ] Complete all sections
   - [ ] Verify 100% completion

5. **Export/Import**
   - [ ] Export survey as JSON
   - [ ] Export survey as CSV
   - [ ] Import survey from JSON
   - [ ] Verify data integrity

## 🚀 Deployment

### Prerequisites

- Supabase project created and configured
- Database schema executed
- Environment variables set

### Deploy to Render (or other platforms)

1. **Set Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_APP_URL
   ```

2. **Build Command**
   ```bash
   npm run build
   ```

3. **Start Command**
   ```bash
   npm start
   ```

### Post-Deployment

1. Verify API endpoints are accessible
2. Test survey creation and saving
3. Verify RLS policies are working
4. Test export/import functionality

## 🔐 Security Considerations

1. **Row Level Security (RLS)**: All tables have RLS policies ensuring users only access their organization's data
2. **Authentication**: All API routes require valid authentication token
3. **Service Role Key**: Keep `SUPABASE_SERVICE_ROLE_KEY` secret and never expose to client
4. **Data Validation**: Server-side validation prevents malicious data entry
5. **CORS**: Configure appropriate CORS policies for production

## 📚 Additional Resources

- [SurveyJS Documentation](https://surveyjs.io/Documentation/Library)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🐛 Troubleshooting

### Auto-save not working
- Check browser console for errors
- Verify `surveyId` is valid
- Check network tab for failed requests
- Verify authentication token is valid

### Validation not showing
- Ensure `enabled` prop is true
- Check `realTime` prop is true for live validation
- Verify data structure matches type definitions

### Database connection issues
- Verify Supabase credentials in `.env.local`
- Check Supabase project status
- Verify RLS policies aren't blocking access

### Progress not updating
- Check that data is properly structured
- Verify triggers are installed in database
- Check for JavaScript errors in console

## 📝 Next Steps

To integrate this implementation with your existing survey:

1. **Update HealthcareSurvey Component** - Integrate auto-save and validation hooks
2. **Add Progress Sidebar** - Include SurveyProgress component
3. **Implement Export UI** - Add export buttons with format selection
4. **Add Validation UI** - Show ValidationSummary at top of form
5. **Connect to Database** - Initialize Supabase client and load/save data

The implementation is complete and ready to be integrated with your existing SurveyJS configuration!
