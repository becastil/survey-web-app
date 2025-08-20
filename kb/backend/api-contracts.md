# API Contracts

## Overview

This document defines the REST API contracts for the Healthcare Survey Dashboard. All endpoints follow RESTful conventions and return JSON responses.

## Base Configuration

### Base URL
- Development: `http://localhost:3000/api`
- Production: `https://survey-app.vercel.app/api`

### Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Common Headers
```
Content-Type: application/json
Accept: application/json
X-Request-ID: <uuid>
```

### Rate Limiting
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Response Format

### Success Response
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}
```

### Error Response
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
    requestId: string;
  };
}
```

### Error Codes
| Code | HTTP Status | Description |
|------|------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request:**
```typescript
{
  email: string;        // Valid email, max 255 chars
  password: string;     // Min 8 chars, 1 uppercase, 1 number
  firstName: string;    // 1-50 chars
  lastName: string;     // 1-50 chars
  organization?: string; // Optional, max 100 chars
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: 'user';
      createdAt: string;
    };
    token: string;
    expiresIn: number;
  }
}
```

**Validation:**
```typescript
const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  organization: z.string().max(100).optional(),
});
```

### POST /api/auth/login
Authenticate user and receive access token.

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
  }
}
```

### POST /api/auth/refresh
Refresh access token using refresh token.

**Request:**
```typescript
{
  refreshToken: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    token: string;
    expiresIn: number;
  }
}
```

### POST /api/auth/logout
Invalidate current session.

**Request:**
```typescript
{
  refreshToken?: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    message: "Logged out successfully"
  }
}
```

## Survey Management Endpoints

### GET /api/surveys
List all surveys with pagination and filtering.

**Query Parameters:**
```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  status?: 'draft' | 'active' | 'completed';
  search?: string;      // Search in title/description
  sortBy?: 'createdAt' | 'updatedAt' | 'responseCount';
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**
```typescript
{
  success: true;
  data: Survey[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  }
}
```

### GET /api/surveys/:id
Get a single survey by ID.

**Response:**
```typescript
{
  success: true;
  data: {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'active' | 'completed';
    questions: Question[];
    settings: {
      allowAnonymous: boolean;
      multipleSubmissions: boolean;
      requireAuth: boolean;
      startDate?: string;
      endDate?: string;
    };
    metadata: {
      responseCount: number;
      averageCompletionTime: number;
      lastResponseAt?: string;
    };
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }
}
```

### POST /api/surveys
Create a new survey.

**Request:**
```typescript
{
  title: string;           // 3-200 chars
  description?: string;    // Max 1000 chars
  questions: Array<{
    text: string;          // 1-500 chars
    type: 'text' | 'multiple_choice' | 'checkbox' | 'rating' | 'date';
    required: boolean;
    options?: string[];    // Required for multiple_choice/checkbox
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
    };
  }>;
  settings?: {
    allowAnonymous?: boolean;
    multipleSubmissions?: boolean;
    requireAuth?: boolean;
    startDate?: string;
    endDate?: string;
  };
}
```

**Response:**
```typescript
{
  success: true;
  data: Survey;
}
```

**Validation:**
```typescript
const createSurveySchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  questions: z.array(questionSchema).min(1).max(100),
  settings: surveySettingsSchema.optional(),
});
```

### PUT /api/surveys/:id
Update an existing survey.

**Request:**
```typescript
{
  title?: string;
  description?: string;
  status?: 'draft' | 'active' | 'completed';
  questions?: Question[];
  settings?: SurveySettings;
}
```

**Response:**
```typescript
{
  success: true;
  data: Survey;
}
```

**Business Rules:**
- Cannot edit active surveys with responses
- Cannot change survey type after creation
- Draft surveys can be edited freely

### DELETE /api/surveys/:id
Delete a survey (soft delete).

**Response:**
```typescript
{
  success: true;
  data: {
    message: "Survey deleted successfully"
  }
}
```

**Business Rules:**
- Only draft surveys can be permanently deleted
- Active/completed surveys are soft deleted
- Responses are retained for 90 days

### POST /api/surveys/:id/publish
Publish a draft survey.

**Request:**
```typescript
{
  scheduledAt?: string;  // ISO date for scheduled publishing
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    id: string;
    status: 'active';
    publishedAt: string;
  }
}
```

## Response Collection Endpoints

### POST /api/surveys/:id/responses
Submit a survey response.

**Request:**
```typescript
{
  answers: Array<{
    questionId: string;
    value: string | string[] | number;
  }>;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    completionTime?: number;  // seconds
  };
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    id: string;
    surveyId: string;
    respondentId?: string;
    submittedAt: string;
    confirmationCode: string;
  }
}
```

**Validation:**
- All required questions must be answered
- Answer types must match question types
- Options must be valid for multiple choice
- Ratings must be within defined range

### GET /api/surveys/:id/responses
Get survey responses with pagination.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  includePartial?: boolean;
}
```

**Response:**
```typescript
{
  success: true;
  data: Response[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  }
}
```

### GET /api/responses/:id
Get a single response by ID.

**Response:**
```typescript
{
  success: true;
  data: {
    id: string;
    surveyId: string;
    respondent: {
      id?: string;
      email?: string;
      name?: string;
    };
    answers: Answer[];
    metadata: {
      completionTime: number;
      ipAddress?: string;
      userAgent?: string;
    };
    submittedAt: string;
  }
}
```

## Analytics Endpoints

### GET /api/surveys/:id/analytics
Get survey analytics and statistics.

**Query Parameters:**
```typescript
{
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    summary: {
      totalResponses: number;
      completionRate: number;
      averageCompletionTime: number;
      uniqueRespondents: number;
    };
    questions: Array<{
      id: string;
      text: string;
      type: string;
      responseRate: number;
      distribution: {
        labels: string[];
        values: number[];
        percentages: number[];
      };
      statistics?: {
        mean?: number;
        median?: number;
        mode?: string;
        standardDeviation?: number;
      };
    }>;
    trends: {
      labels: string[];
      responses: number[];
      completions: number[];
    };
  }
}
```

### GET /api/analytics/dashboard
Get dashboard metrics for all surveys.

**Response:**
```typescript
{
  success: true;
  data: {
    surveys: {
      total: number;
      active: number;
      draft: number;
      completed: number;
    };
    responses: {
      total: number;
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
    engagement: {
      averageCompletionRate: number;
      averageCompletionTime: number;
      peakResponseHour: number;
      topSurveys: Array<{
        id: string;
        title: string;
        responseCount: number;
      }>;
    };
  }
}
```

### POST /api/analytics/export
Export analytics data.

**Request:**
```typescript
{
  surveyId?: string;
  format: 'csv' | 'excel' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  includeRawData?: boolean;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    downloadUrl: string;
    expiresAt: string;
    fileSize: number;
  }
}
```

## User Management Endpoints

### GET /api/users/profile
Get current user profile.

**Response:**
```typescript
{
  success: true;
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user';
    organization?: string;
    preferences: {
      theme: 'light' | 'dark' | 'system';
      emailNotifications: boolean;
      timezone: string;
    };
    stats: {
      surveysCreated: number;
      totalResponses: number;
      lastActive: string;
    };
    createdAt: string;
    updatedAt: string;
  }
}
```

### PUT /api/users/profile
Update user profile.

**Request:**
```typescript
{
  firstName?: string;
  lastName?: string;
  organization?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    emailNotifications?: boolean;
    timezone?: string;
  };
}
```

**Response:**
```typescript
{
  success: true;
  data: User;
}
```

### PUT /api/users/password
Change user password.

**Request:**
```typescript
{
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    message: "Password updated successfully"
  }
}
```

## WebSocket Events

### Connection
```typescript
ws://localhost:3000/ws
```

### Events

**survey.updated**
```typescript
{
  type: 'survey.updated';
  data: {
    surveyId: string;
    changes: Partial<Survey>;
    updatedBy: string;
    timestamp: string;
  };
}
```

**response.received**
```typescript
{
  type: 'response.received';
  data: {
    surveyId: string;
    responseId: string;
    respondentId?: string;
    timestamp: string;
  };
}
```

**analytics.updated**
```typescript
{
  type: 'analytics.updated';
  data: {
    surveyId: string;
    metrics: {
      responseCount: number;
      completionRate: number;
    };
    timestamp: string;
  };
}
```

## Error Handling Examples

### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "password": "Password must be at least 8 characters"
      }
    },
    "timestamp": "2025-08-20T10:30:00Z",
    "requestId": "req_123abc"
  }
}
```

### Authentication Error
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "timestamp": "2025-08-20T10:30:00Z",
    "requestId": "req_456def"
  }
}
```

### Rate Limit Error
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetAt": "2025-08-20T10:35:00Z"
    },
    "timestamp": "2025-08-20T10:30:00Z",
    "requestId": "req_789ghi"
  }
}
```

## Testing the API

### cURL Examples

**Login:**
```bash
curl -X POST https://api.example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123"}'
```

**Create Survey:**
```bash
curl -X POST https://api.example.com/surveys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Customer Satisfaction",
    "questions": [{
      "text": "How satisfied are you?",
      "type": "rating",
      "required": true
    }]
  }'
```

**Get Analytics:**
```bash
curl -X GET "https://api.example.com/surveys/123/analytics?startDate=2025-01-01" \
  -H "Authorization: Bearer <token>"
```

## API Versioning

The API uses URL path versioning. The current version is v1.

Future versions will be available at:
- `/api/v2/...`
- `/api/v3/...`

Deprecation notices will be provided 90 days before removing old versions.