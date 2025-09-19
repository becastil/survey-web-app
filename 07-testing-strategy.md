# 07-testing-strategy.md

# Testing Strategy - Survey Web Application

## Overview

This document outlines the comprehensive testing strategy for the Survey Web Application, ensuring high quality, reliability, and maintainability throughout the development lifecycle. The strategy embraces a multi-layered testing approach that covers unit, integration, end-to-end, and specialized testing requirements.

## 1. Testing Philosophy and Principles

### 1.1 Core Testing Principles

**Quality First Approach**
- Testing is integrated throughout the development process, not an afterthought
- Defect prevention is prioritized over defect detection
- Continuous feedback loops between development and testing
- Automated testing as the foundation for rapid, reliable deployments

**Testing Pyramid Strategy**
```
       /\
      /  \     E2E Tests (10%)
     /    \    - User journeys
    /      \   - Cross-browser
   /        \  - Performance
  /__________\
 /            \ Integration Tests (20%)
/              \ - API testing
\              / - Database testing
 \____________/  - Service integration
/              \
\              / Unit Tests (70%)
 \____________/  - Component testing
                 - Function testing
                 - Logic testing
```

**Test-Driven Development (TDD)**
- Write tests before implementation (Red-Green-Refactor cycle)
- Test cases serve as living documentation
- Improved code design through testability requirements
- Higher confidence in refactoring and feature additions

**Shift-Left Testing**
- Early testing in the development lifecycle
- Static analysis and linting during development
- Pre-commit hooks for quality gates
- Continuous integration testing on every commit

### 1.2 Testing Standards and Conventions

**Test Organization**
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.stories.tsx
├── pages/
│   ├── api/
│   │   ├── surveys/
│   │   │   ├── index.ts
│   │   │   └── index.test.ts
├── utils/
│   ├── helpers.ts
│   └── helpers.test.ts
└── __tests__/
    ├── e2e/
    ├── integration/
    └── fixtures/
```

**Naming Conventions**
- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`
- Test utilities: `test-utils.ts`
- Fixtures: `fixtures/` directory

**Test Quality Standards**
- Minimum 80% code coverage for critical paths
- All new features require corresponding tests
- Tests must be deterministic and independent
- Clear, descriptive test names that explain behavior
- Arrange-Act-Assert (AAA) pattern

## 2. Unit Testing Strategy

### 2.1 Frontend Component Testing

**React Testing Library Setup**
```typescript
// test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

**Component Testing Examples**
```typescript
// components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    render(<Button loading>Loading...</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('applies correct variant styles', () => {
    render(<Button variant="primary">Primary Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });
});
```

**Custom Hook Testing**
```typescript
// hooks/useSurveyData.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSurveyData } from './useSurveyData';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useSurveyData', () => {
  it('fetches survey data successfully', async () => {
    const { result } = renderHook(() => useSurveyData('survey-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toMatchObject({
      id: 'survey-123',
      title: expect.any(String),
      questions: expect.any(Array),
    });
  });

  it('handles error states correctly', async () => {
    // Mock API error
    const { result } = renderHook(() => useSurveyData('invalid-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
```

### 2.2 Backend API Testing

**API Route Testing**
```typescript
// pages/api/surveys/index.test.ts
import { createMocks } from 'node-mocks-http';
import handler from './index';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

describe('/api/surveys', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/surveys returns user surveys', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-jwt-token',
      },
    });

    // Mock Supabase response
    const mockSupabase = createClient as jest.MockedFunction<typeof createClient>;
    mockSupabase.mockReturnValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [
              { id: '1', title: 'Test Survey', created_at: '2023-01-01' },
            ],
            error: null,
          }),
        }),
      }),
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      surveys: [
        { id: '1', title: 'Test Survey', created_at: '2023-01-01' },
      ],
    });
  });

  it('POST /api/surveys creates new survey', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-jwt-token',
      },
      body: {
        title: 'New Survey',
        description: 'Survey description',
        questions: [],
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toMatchObject({
      survey: {
        title: 'New Survey',
        description: 'Survey description',
      },
    });
  });

  it('returns 401 for unauthenticated requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Authentication required',
    });
  });
});
```

**Database Function Testing**
```typescript
// utils/database.test.ts
import { createClient } from '@supabase/supabase-js';
import { getSurveyById, createSurvey, updateSurvey } from './database';

jest.mock('@supabase/supabase-js');

const mockSupabase = createClient as jest.MockedFunction<typeof createClient>;

describe('Database Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSurveyById', () => {
    it('returns survey when found', async () => {
      mockSupabase.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: '1', title: 'Test Survey' },
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const result = await getSurveyById('1');

      expect(result).toEqual({ id: '1', title: 'Test Survey' });
    });

    it('throws error when survey not found', async () => {
      mockSupabase.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Row not found' },
              }),
            }),
          }),
        }),
      } as any);

      await expect(getSurveyById('invalid-id')).rejects.toThrow('Row not found');
    });
  });
});
```

### 2.3 Utility Function Testing

**Helper Function Testing**
```typescript
// utils/helpers.test.ts
import {
  formatDate,
  calculateCompletionRate,
  validateEmail,
  sanitizeInput,
  generateSurveySlug,
} from './helpers';

describe('Helper Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2023-01-15T10:30:00Z');
      expect(formatDate(date)).toBe('January 15, 2023');
    });

    it('handles invalid dates', () => {
      expect(formatDate(new Date('invalid'))).toBe('Invalid Date');
    });
  });

  describe('calculateCompletionRate', () => {
    it('calculates completion rate correctly', () => {
      expect(calculateCompletionRate(75, 100)).toBe(75);
      expect(calculateCompletionRate(0, 100)).toBe(0);
      expect(calculateCompletionRate(100, 100)).toBe(100);
    });

    it('handles division by zero', () => {
      expect(calculateCompletionRate(0, 0)).toBe(0);
    });

    it('rounds to two decimal places', () => {
      expect(calculateCompletionRate(1, 3)).toBe(33.33);
    });
  });

  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('removes dangerous HTML tags', () => {
      const input = '<script>alert("xss")</script><p>Safe content</p>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Safe content');
    });

    it('preserves safe HTML tags', () => {
      const input = '<p>Paragraph</p><strong>Bold</strong><em>Italic</em>';
      const result = sanitizeInput(input);
      expect(result).toContain('<p>Paragraph</p>');
      expect(result).toContain('<strong>Bold</strong>');
      expect(result).toContain('<em>Italic</em>');
    });
  });
});
```

## 3. Integration Testing Strategy

### 3.1 API Integration Testing

**Full API Flow Testing**
```typescript
// __tests__/integration/survey-workflow.integration.test.ts
import { createClient } from '@supabase/supabase-js';
import { testApiHandler } from 'next-test-api-route-handler';
import surveyHandler from '../../pages/api/surveys/index';
import responseHandler from '../../pages/api/surveys/[id]/responses';

describe('Survey Workflow Integration', () => {
  let supabaseClient: any;
  let testUser: any;
  let testSurvey: any;

  beforeAll(async () => {
    supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create test user
    const { data: user } = await supabaseClient.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpassword123',
      email_confirm: true,
    });
    testUser = user.user;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUser) {
      await supabaseClient.auth.admin.deleteUser(testUser.id);
    }
  });

  it('completes full survey creation and response workflow', async () => {
    // 1. Create survey
    await testApiHandler({
      handler: surveyHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${testUser.access_token}`,
          },
          body: JSON.stringify({
            title: 'Integration Test Survey',
            description: 'Test survey for integration testing',
            questions: [
              {
                type: 'text',
                title: 'What is your name?',
                required: true,
              },
              {
                type: 'choice',
                title: 'What is your favorite color?',
                options: ['Red', 'Blue', 'Green'],
                required: false,
              },
            ],
          }),
        });

        expect(res.status).toBe(201);
        const { survey } = await res.json();
        testSurvey = survey;
        expect(survey.title).toBe('Integration Test Survey');
        expect(survey.questions).toHaveLength(2);
      },
    });

    // 2. Submit response to survey
    await testApiHandler({
      handler: responseHandler,
      params: { id: testSurvey.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            responses: {
              [testSurvey.questions[0].id]: 'John Doe',
              [testSurvey.questions[1].id]: 'Blue',
            },
          }),
        });

        expect(res.status).toBe(201);
        const { response } = await res.json();
        expect(response.survey_id).toBe(testSurvey.id);
        expect(response.responses).toMatchObject({
          [testSurvey.questions[0].id]: 'John Doe',
          [testSurvey.questions[1].id]: 'Blue',
        });
      },
    });

    // 3. Verify response was saved
    const { data: responses } = await supabaseClient
      .from('survey_responses')
      .select('*')
      .eq('survey_id', testSurvey.id);

    expect(responses).toHaveLength(1);
    expect(responses[0].responses).toMatchObject({
      [testSurvey.questions[0].id]: 'John Doe',
      [testSurvey.questions[1].id]: 'Blue',
    });
  });
});
```

### 3.2 Database Integration Testing

**Supabase RLS Testing**
```typescript
// __tests__/integration/database-security.integration.test.ts
import { createClient } from '@supabase/supabase-js';

describe('Database Security Integration', () => {
  let adminClient: any;
  let userClient: any;
  let testUser1: any;
  let testUser2: any;

  beforeAll(async () => {
    adminClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create test users
    const { data: user1 } = await adminClient.auth.admin.createUser({
      email: 'user1@example.com',
      password: 'password123',
      email_confirm: true,
    });
    testUser1 = user1.user;

    const { data: user2 } = await adminClient.auth.admin.createUser({
      email: 'user2@example.com',
      password: 'password123',
      email_confirm: true,
    });
    testUser2 = user2.user;

    userClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  });

  it('enforces row-level security for surveys', async () => {
    // User1 creates a survey
    await userClient.auth.setSession({
      access_token: testUser1.access_token,
      refresh_token: testUser1.refresh_token,
    });

    const { data: survey, error: createError } = await userClient
      .from('surveys')
      .insert({
        title: 'Private Survey',
        created_by: testUser1.id,
      })
      .select()
      .single();

    expect(createError).toBeNull();
    expect(survey.title).toBe('Private Survey');

    // User2 should not be able to access User1's survey
    await userClient.auth.setSession({
      access_token: testUser2.access_token,
      refresh_token: testUser2.refresh_token,
    });

    const { data: inaccessibleSurvey, error: accessError } = await userClient
      .from('surveys')
      .select('*')
      .eq('id', survey.id)
      .single();

    expect(inaccessibleSurvey).toBeNull();
    expect(accessError?.message).toContain('Row not found');
  });

  it('allows survey sharing through collaborators table', async () => {
    // User1 creates a survey
    await userClient.auth.setSession({
      access_token: testUser1.access_token,
      refresh_token: testUser1.refresh_token,
    });

    const { data: survey } = await userClient
      .from('surveys')
      .insert({
        title: 'Shared Survey',
        created_by: testUser1.id,
      })
      .select()
      .single();

    // User1 shares survey with User2
    await userClient.from('survey_collaborators').insert({
      survey_id: survey.id,
      user_id: testUser2.id,
      role: 'editor',
    });

    // User2 should now be able to access the survey
    await userClient.auth.setSession({
      access_token: testUser2.access_token,
      refresh_token: testUser2.refresh_token,
    });

    const { data: accessibleSurvey, error } = await userClient
      .from('surveys')
      .select('*')
      .eq('id', survey.id)
      .single();

    expect(error).toBeNull();
    expect(accessibleSurvey.title).toBe('Shared Survey');
  });
});
```

### 3.3 Authentication Integration Testing

**Auth Flow Testing**
```typescript
// __tests__/integration/auth-flow.integration.test.ts
import { createClient } from '@supabase/supabase-js';
import { testApiHandler } from 'next-test-api-route-handler';
import authHandler from '../../pages/api/auth/callback';

describe('Authentication Flow Integration', () => {
  let supabaseClient: any;

  beforeAll(() => {
    supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  });

  it('handles complete sign-up flow', async () => {
    const testEmail = `test-${Date.now()}@example.com`;
    
    // 1. Sign up user
    const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
      email: testEmail,
      password: 'SecurePassword123!',
    });

    expect(signUpError).toBeNull();
    expect(signUpData.user?.email).toBe(testEmail);

    // 2. Simulate email confirmation (in test environment)
    if (signUpData.user) {
      const { error: confirmError } = await supabaseClient.auth.admin.updateUserById(
        signUpData.user.id,
        { email_confirm: true }
      );
      expect(confirmError).toBeNull();
    }

    // 3. Sign in user
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: testEmail,
      password: 'SecurePassword123!',
    });

    expect(signInError).toBeNull();
    expect(signInData.user?.email).toBe(testEmail);
    expect(signInData.session?.access_token).toBeDefined();

    // 4. Verify user can access protected routes
    await testApiHandler({
      handler: async (req, res) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const { data: { user } } = await supabaseClient.auth.getUser(token);
        
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        
        res.status(200).json({ user: { id: user.id, email: user.email } });
      },
      test: async ({ fetch }) => {
        const res = await fetch({
          headers: {
            authorization: `Bearer ${signInData.session?.access_token}`,
          },
        });

        expect(res.status).toBe(200);
        const { user } = await res.json();
        expect(user.email).toBe(testEmail);
      },
    });
  });

  it('handles OAuth sign-in flow', async () => {
    // Mock OAuth response
    const mockOAuthData = {
      access_token: 'mock-oauth-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'oauth-user-id',
        email: 'oauth@example.com',
        user_metadata: {
          full_name: 'OAuth User',
          provider: 'google',
        },
      },
    };

    // Test OAuth callback handling
    await testApiHandler({
      handler: authHandler,
      params: { code: 'mock-auth-code' },
      test: async ({ fetch }) => {
        // This would typically involve the OAuth provider's callback
        // In testing, we simulate the successful OAuth flow
        const res = await fetch({
          method: 'GET',
        });

        expect(res.status).toBe(302); // Redirect after successful auth
      },
    });
  });
});
```

## 4. End-to-End Testing Strategy

### 4.1 Playwright E2E Testing

**Playwright Configuration**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**User Journey Testing**
```typescript
// e2e/survey-creation.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Survey Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('creates a new survey successfully', async ({ page }) => {
    // Navigate to survey creation
    await page.click('[data-testid="create-survey-button"]');
    await expect(page).toHaveURL('/surveys/create');

    // Fill survey details
    await page.fill('[data-testid="survey-title"]', 'E2E Test Survey');
    await page.fill('[data-testid="survey-description"]', 'Test survey description');

    // Add first question
    await page.click('[data-testid="add-question-button"]');
    await page.selectOption('[data-testid="question-type-select"]', 'text');
    await page.fill('[data-testid="question-title"]', 'What is your name?');
    await page.check('[data-testid="question-required"]');

    // Add second question
    await page.click('[data-testid="add-question-button"]');
    await page.selectOption('[data-testid="question-type-select"]:nth-child(2)', 'choice');
    await page.fill('[data-testid="question-title"]:nth-child(2)', 'What is your favorite color?');
    
    // Add choice options
    await page.fill('[data-testid="choice-option-0"]', 'Red');
    await page.fill('[data-testid="choice-option-1"]', 'Blue');
    await page.click('[data-testid="add-choice-option"]');
    await page.fill('[data-testid="choice-option-2"]', 'Green');

    // Save survey
    await page.click('[data-testid="save-survey-button"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page).toHaveURL(/\/surveys\/[a-zA-Z0-9-]+$/);
  });

  test('previews survey before publishing', async ({ page }) => {
    // Create a basic survey first
    await page.goto('/surveys/create');
    await page.fill('[data-testid="survey-title"]', 'Preview Test Survey');
    await page.click('[data-testid="add-question-button"]');
    await page.fill('[data-testid="question-title"]', 'Test Question');

    // Open preview
    await page.click('[data-testid="preview-button"]');
    
    // Verify preview modal
    await expect(page.locator('[data-testid="preview-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-survey-title"]')).toHaveText('Preview Test Survey');
    await expect(page.locator('[data-testid="preview-question"]')).toHaveText('Test Question');

    // Test responsive preview
    await page.click('[data-testid="mobile-preview-button"]');
    await expect(page.locator('[data-testid="preview-container"]')).toHaveClass(/mobile-preview/);

    // Close preview
    await page.click('[data-testid="close-preview-button"]');
    await expect(page.locator('[data-testid="preview-modal"]')).not.toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/surveys/create');
    
    // Try to save without title
    await page.click('[data-testid="save-survey-button"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="title-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="title-error"]')).toHaveText('Survey title is required');
    
    // Add title but no questions
    await page.fill('[data-testid="survey-title"]', 'Test Survey');
    await page.click('[data-testid="save-survey-button"]');
    
    // Verify question validation
    await expect(page.locator('[data-testid="questions-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="questions-error"]')).toHaveText('At least one question is required');
  });
});
```

**Survey Response E2E Testing**
```typescript
// e2e/survey-response.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Survey Response Flow', () => {
  let surveyUrl: string;

  test.beforeAll(async ({ browser }) => {
    // Setup: Create a survey as admin user
    const page = await browser.newPage();
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Create test survey
    await page.goto('/surveys/create');
    await page.fill('[data-testid="survey-title"]', 'Response Test Survey');
    
    // Add questions
    await page.click('[data-testid="add-question-button"]');
    await page.fill('[data-testid="question-title"]', 'What is your name?');
    
    await page.click('[data-testid="add-question-button"]');
    await page.selectOption('[data-testid="question-type-select"]:nth-child(2)', 'choice');
    await page.fill('[data-testid="question-title"]:nth-child(2)', 'How satisfied are you?');
    await page.fill('[data-testid="choice-option-0"]', 'Very Satisfied');
    await page.fill('[data-testid="choice-option-1"]', 'Satisfied');
    await page.fill('[data-testid="choice-option-2"]', 'Neutral');

    await page.click('[data-testid="save-survey-button"]');
    await page.click('[data-testid="publish-survey-button"]');
    
    // Get public survey URL
    surveyUrl = await page.locator('[data-testid="public-survey-url"]').textContent();
    await page.close();
  });

  test('completes survey response as anonymous user', async ({ page }) => {
    await page.goto(surveyUrl);
    
    // Verify survey loads
    await expect(page.locator('[data-testid="survey-title"]')).toHaveText('Response Test Survey');
    
    // Fill first question
    await page.fill('[data-testid="text-input-0"]', 'John Doe');
    
    // Select choice for second question
    await page.click('[data-testid="choice-option-1"]'); // "Satisfied"
    
    // Submit survey
    await page.click('[data-testid="submit-survey-button"]');
    
    // Verify completion
    await expect(page.locator('[data-testid="thank-you-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="thank-you-message"]')).toHaveText(/thank you/i);
  });

  test('handles survey validation errors', async ({ page }) => {
    await page.goto(surveyUrl);
    
    // Try to submit without filling required fields
    await page.click('[data-testid="submit-survey-button"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="field-error-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="field-error-0"]')).toHaveText('This field is required');
  });

  test('saves and resumes survey progress', async ({ page }) => {
    await page.goto(surveyUrl);
    
    // Fill first question
    await page.fill('[data-testid="text-input-0"]', 'Jane Doe');
    
    // Save progress
    await page.click('[data-testid="save-progress-button"]');
    await expect(page.locator('[data-testid="progress-saved-message"]')).toBeVisible();
    
    // Reload page
    await page.reload();
    
    // Verify progress was saved
    await expect(page.locator('[data-testid="text-input-0"]')).toHaveValue('Jane Doe');
    
    // Complete survey
    await page.click('[data-testid="choice-option-0"]'); // "Very Satisfied"
    await page.click('[data-testid="submit-survey-button"]');
    
    // Verify completion
    await expect(page.locator('[data-testid="thank-you-message"]')).toBeVisible();
  });
});
```

### 4.2 Cross-Browser Testing

**Browser Compatibility Testing**
```typescript
// e2e/cross-browser.e2e.test.ts
import { test, expect } from '@playwright/test';

['chromium', 'firefox', 'webkit'].forEach((browserName) => {
  test.describe(`Cross-browser testing - ${browserName}`, () => {
    test(`survey creation works in ${browserName}`, async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Create survey
      await page.goto('/surveys/create');
      await page.fill('[data-testid="survey-title"]', `${browserName} Test Survey`);
      await page.click('[data-testid="add-question-button"]');
      await page.fill('[data-testid="question-title"]', 'Test Question');
      await page.click('[data-testid="save-survey-button"]');

      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    test(`survey response works in ${browserName}`, async ({ page }) => {
      // Assuming survey URL is available
      const surveyUrl = process.env.TEST_SURVEY_URL || '/survey/test-survey';
      
      await page.goto(surveyUrl);
      await page.fill('[data-testid="text-input-0"]', `Response from ${browserName}`);
      await page.click('[data-testid="submit-survey-button"]');
      
      await expect(page.locator('[data-testid="thank-you-message"]')).toBeVisible();
    });
  });
});
```

### 4.3 Performance Testing

**Core Web Vitals Testing**
```typescript
// e2e/performance.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test('measures Core Web Vitals', async ({ page }) => {
    // Navigate to page and wait for load
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Measure LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });

    expect(lcp).toBeLessThan(2500); // 2.5 seconds

    // Measure FID (First Input Delay) simulation
    const inputTime = Date.now();
    await page.click('[data-testid="create-survey-button"]');
    const responseTime = Date.now() - inputTime;
    
    expect(responseTime).toBeLessThan(100); // 100ms

    // Measure CLS (Cumulative Layout Shift)
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        
        // Resolve after a short time
        setTimeout(() => resolve(clsValue), 3000);
      });
    });

    expect(cls).toBeLessThan(0.1); // 0.1 CLS score
  });

  test('measures page load times', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/surveys');
    await page.waitForSelector('[data-testid="surveys-list"]');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });

  test('measures API response times', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Monitor network requests
    const apiCalls: number[] = [];
    
    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        const timing = response.timing();
        apiCalls.push(timing.responseEnd - timing.requestStart);
      }
    });

    // Trigger API calls
    await page.click('[data-testid="refresh-surveys"]');
    await page.waitForLoadState('networkidle');

    // Verify API response times
    expect(apiCalls.length).toBeGreaterThan(0);
    expect(Math.max(...apiCalls)).toBeLessThan(2000); // 2 seconds max
    expect(apiCalls.reduce((a, b) => a + b, 0) / apiCalls.length).toBeLessThan(500); // 500ms average
  });
});
```

## 5. Specialized Testing

### 5.1 Accessibility Testing

**Automated Accessibility Testing**
```typescript
// __tests__/accessibility/a11y.test.ts
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SurveyBuilder } from '../components/SurveyBuilder';
import { Dashboard } from '../components/Dashboard';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('Survey Builder has no accessibility violations', async () => {
    const { container } = render(<SurveyBuilder />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Dashboard has no accessibility violations', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('meets WCAG 2.1 AA standards', async () => {
    const { container } = render(<SurveyBuilder />);
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-management': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });
});
```

**E2E Accessibility Testing**
```typescript
// e2e/accessibility.e2e.test.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('E2E Accessibility Testing', () => {
  test('dashboard is accessible', async ({ page }) => {
    await page.goto('/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('survey creation form is accessible', async ({ page }) => {
    await page.goto('/surveys/create');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation works correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'create-survey-button');
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'search-input');
    
    // Test Enter activation
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('screen reader compatibility', async ({ page }) => {
    await page.goto('/surveys/create');
    
    // Check for proper ARIA labels
    await expect(page.locator('[data-testid="survey-title"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="question-list"]')).toHaveAttribute('role', 'list');
    
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    expect(headings.length).toBeGreaterThan(0);
  });
});
```

### 5.2 Security Testing

**Security Integration Testing**
```typescript
// __tests__/security/security.test.ts
import { testApiHandler } from 'next-test-api-route-handler';
import surveyHandler from '../../pages/api/surveys/index';

describe('Security Testing', () => {
  it('prevents SQL injection attacks', async () => {
    await testApiHandler({
      handler: surveyHandler,
      test: async ({ fetch }) => {
        const maliciousPayload = {
          title: "'; DROP TABLE surveys; --",
          description: 'Malicious survey',
        };

        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(maliciousPayload),
        });

        expect(res.status).toBe(400); // Should be rejected by validation
      },
    });
  });

  it('prevents XSS attacks', async () => {
    await testApiHandler({
      handler: surveyHandler,
      test: async ({ fetch }) => {
        const xssPayload = {
          title: '<script>alert("xss")</script>',
          description: 'XSS attempt',
        };

        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(xssPayload),
        });

        expect(res.status).toBe(400); // Should be rejected by sanitization
      },
    });
  });

  it('enforces rate limiting', async () => {
    const requests = Array.from({ length: 101 }, (_, i) => i); // 101 requests
    
    const responses = await Promise.all(
      requests.map(() =>
        testApiHandler({
          handler: surveyHandler,
          test: async ({ fetch }) => {
            return fetch({
              method: 'GET',
              headers: { 'X-Forwarded-For': '192.168.1.1' },
            });
          },
        })
      )
    );

    const tooManyRequests = responses.filter(res => res.status === 429);
    expect(tooManyRequests.length).toBeGreaterThan(0);
  });

  it('requires authentication for protected routes', async () => {
    await testApiHandler({
      handler: surveyHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Test Survey' }),
        });

        expect(res.status).toBe(401);
      },
    });
  });
});
```

### 5.3 Load Testing

**Load Testing with Artillery**
```yaml
# load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Normal load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "Survey creation and response"
    weight: 70
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ $randomEmail() }}"
            password: "password123"
          capture:
            - json: "$.access_token"
              as: "token"
      - post:
          url: "/api/surveys"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            title: "Load Test Survey {{ $randomString() }}"
            questions:
              - type: "text"
                title: "What is your name?"
                required: true
          capture:
            - json: "$.survey.id"
              as: "surveyId"
      - post:
          url: "/api/surveys/{{ surveyId }}/responses"
          json:
            responses:
              "question-1": "Load Test Response"

  - name: "Survey browsing"
    weight: 30
    flow:
      - get:
          url: "/api/surveys"
      - get:
          url: "/api/surveys/{{ $randomString() }}"
```

**Performance Testing**
```typescript
// __tests__/performance/load.test.ts
import { performance } from 'perf_hooks';
import { createClient } from '@supabase/supabase-js';

describe('Load Testing', () => {
  let supabaseClient: any;

  beforeAll(() => {
    supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  });

  it('handles concurrent survey creation', async () => {
    const concurrentUsers = 50;
    const surveysPerUser = 10;

    const createSurvey = async (userId: number) => {
      const startTime = performance.now();
      
      const promises = Array.from({ length: surveysPerUser }, (_, i) =>
        supabaseClient.from('surveys').insert({
          title: `Load Test Survey ${userId}-${i}`,
          created_by: `user-${userId}`,
        })
      );

      await Promise.all(promises);
      return performance.now() - startTime;
    };

    const results = await Promise.all(
      Array.from({ length: concurrentUsers }, (_, i) => createSurvey(i))
    );

    const averageTime = results.reduce((a, b) => a + b, 0) / results.length;
    const maxTime = Math.max(...results);

    expect(averageTime).toBeLessThan(5000); // 5 seconds average
    expect(maxTime).toBeLessThan(10000); // 10 seconds max
  });

  it('handles high-volume response submission', async () => {
    // Create test survey
    const { data: survey } = await supabaseClient
      .from('surveys')
      .insert({
        title: 'Load Test Survey',
        questions: [
          { type: 'text', title: 'Name', required: true },
          { type: 'choice', title: 'Color', options: ['Red', 'Blue', 'Green'] },
        ],
      })
      .select()
      .single();

    const concurrentResponses = 1000;
    const startTime = performance.now();

    const submitResponse = async (responseId: number) => {
      return supabaseClient.from('survey_responses').insert({
        survey_id: survey.id,
        responses: {
          'question-1': `Respondent ${responseId}`,
          'question-2': 'Blue',
        },
      });
    };

    const responses = await Promise.allSettled(
      Array.from({ length: concurrentResponses }, (_, i) => submitResponse(i))
    );

    const totalTime = performance.now() - startTime;
    const successfulResponses = responses.filter(r => r.status === 'fulfilled').length;

    expect(successfulResponses).toBeGreaterThan(concurrentResponses * 0.95); // 95% success rate
    expect(totalTime).toBeLessThan(30000); // 30 seconds total
  });
});
```

## 6. Testing Infrastructure

### 6.1 Continuous Integration Pipeline

**GitHub Actions Testing Workflow**
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run accessibility tests
        run: npm run test:a11y

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: auto
      
      - name: Run npm audit
        run: npm audit --audit-level high
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### 6.2 Test Data Management

**Test Database Setup**
```sql
-- test-setup.sql
-- Create test-specific functions and triggers
CREATE OR REPLACE FUNCTION create_test_user(
  email TEXT,
  password TEXT DEFAULT 'testpassword123'
) RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    email,
    crypt(password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
  ) RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create test data cleanup function
CREATE OR REPLACE FUNCTION cleanup_test_data() RETURNS VOID AS $$
BEGIN
  DELETE FROM survey_responses WHERE survey_id IN (
    SELECT id FROM surveys WHERE title LIKE '%Test%' OR title LIKE '%E2E%'
  );
  DELETE FROM surveys WHERE title LIKE '%Test%' OR title LIKE '%E2E%';
  DELETE FROM auth.users WHERE email LIKE '%test%' OR email LIKE '%example.com';
END;
$$ LANGUAGE plpgsql;
```

**Test Fixtures**
```typescript
// __tests__/fixtures/surveys.ts
export const mockSurvey = {
  id: 'test-survey-id',
  title: 'Test Survey',
  description: 'A survey for testing purposes',
  created_by: 'test-user-id',
  created_at: '2023-01-01T00:00:00Z',
  questions: [
    {
      id: 'question-1',
      type: 'text',
      title: 'What is your name?',
      required: true,
      order: 1,
    },
    {
      id: 'question-2',
      type: 'choice',
      title: 'What is your favorite color?',
      options: ['Red', 'Blue', 'Green'],
      required: false,
      order: 2,
    },
  ],
};

export const mockSurveyResponse = {
  id: 'test-response-id',
  survey_id: 'test-survey-id',
  responses: {
    'question-1': 'John Doe',
    'question-2': 'Blue',
  },
  created_at: '2023-01-01T12:00:00Z',
  ip_address: '192.168.1.1',
};

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'survey_creator',
  created_at: '2023-01-01T00:00:00Z',
};
```

### 6.3 Test Reporting and Metrics

**Test Coverage Configuration**
```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/pages/api/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],
};
```

**Quality Gate Scripts**
```typescript
// scripts/quality-gate.ts
import { execSync } from 'child_process';
import fs from 'fs';

interface QualityMetrics {
  testCoverage: number;
  e2eTestsPass: boolean;
  securityIssues: number;
  accessibilityIssues: number;
  performanceScore: number;
}

const runQualityGate = async (): Promise<void> => {
  console.log('Running quality gate checks...');

  // Run tests and collect metrics
  const metrics: QualityMetrics = {
    testCoverage: getTestCoverage(),
    e2eTestsPass: runE2ETests(),
    securityIssues: runSecurityScan(),
    accessibilityIssues: runAccessibilityScan(),
    performanceScore: runPerformanceTest(),
  };

  // Check if quality gate passes
  const qualityGatePassed = 
    metrics.testCoverage >= 80 &&
    metrics.e2eTestsPass &&
    metrics.securityIssues === 0 &&
    metrics.accessibilityIssues === 0 &&
    metrics.performanceScore >= 90;

  if (!qualityGatePassed) {
    console.error('Quality gate failed:', metrics);
    process.exit(1);
  }

  console.log('Quality gate passed:', metrics);
};

const getTestCoverage = (): number => {
  const coverageReport = JSON.parse(
    fs.readFileSync('./coverage/coverage-summary.json', 'utf8')
  );
  return coverageReport.total.lines.pct;
};

const runE2ETests = (): boolean => {
  try {
    execSync('npm run test:e2e', { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
};

const runSecurityScan = (): number => {
  try {
    execSync('npm audit --audit-level high', { stdio: 'pipe' });
    return 0;
  } catch (error: any) {
    const output = error.stdout?.toString() || '';
    const matches = output.match(/(\d+) high/);
    return matches ? parseInt(matches[1]) : 1;
  }
};

const runAccessibilityScan = (): number => {
  try {
    execSync('npm run test:a11y', { stdio: 'pipe' });
    return 0;
  } catch (error: any) {
    const output = error.stdout?.toString() || '';
    const matches = output.match(/(\d+) violations/);
    return matches ? parseInt(matches[1]) : 1;
  }
};

const runPerformanceTest = (): number => {
  // Placeholder for performance testing
  // Would integrate with Lighthouse CI or similar tool
  return 95;
};

runQualityGate().catch(console.error);
```

## Implementation Timeline

### Phase 1: Testing Foundation (Weeks 1-2)
- Set up testing framework and configuration
- Implement unit testing for core components
- Basic integration testing setup
- CI/CD pipeline integration

### Phase 2: Comprehensive Testing (Weeks 3-6)
- Complete unit test coverage for all components
- Full API integration testing
- E2E testing for critical user journeys
- Cross-browser testing setup

### Phase 3: Specialized Testing (Weeks 7-10)
- Accessibility testing implementation
- Security testing integration
- Performance and load testing
- Mobile testing optimization

### Phase 4: Testing Automation (Weeks 11-12)
- Advanced CI/CD testing workflows
- Automated quality gates
- Test reporting and metrics
- Documentation and training

This comprehensive testing strategy ensures the Survey Web Application meets high-quality standards, provides excellent user experience, and maintains reliability throughout its lifecycle.