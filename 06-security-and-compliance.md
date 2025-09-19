# 06-security-and-compliance.md

# Security and Compliance Framework - Survey Web Application

## Overview

This document outlines the comprehensive security and compliance strategy for the Survey Web Application, ensuring data protection, user privacy, and regulatory compliance while maintaining system performance and user experience.

## 1. Security Architecture Overview

### 1.1 Defense in Depth Strategy

**Multi-Layer Security Approach**
- **Frontend Security**: Input validation, XSS protection, Content Security Policy
- **API Security**: Authentication, authorization, rate limiting, input sanitization
- **Database Security**: Row Level Security (RLS), encryption, access controls
- **Infrastructure Security**: Network security, monitoring, incident response
- **Application Security**: Secure coding practices, dependency management

**Security Principles**
- **Zero Trust Architecture**: Never trust, always verify
- **Principle of Least Privilege**: Minimal necessary access rights
- **Defense in Depth**: Multiple overlapping security layers
- **Security by Design**: Security integrated from development start
- **Continuous Monitoring**: Real-time threat detection and response

### 1.2 Threat Model

**Identified Threats**
1. **Data Breaches**: Unauthorized access to survey data and responses
2. **Account Takeover**: Compromised user accounts through credential attacks
3. **Injection Attacks**: SQL injection, XSS, CSRF attacks
4. **Denial of Service**: Service disruption through resource exhaustion
5. **Insider Threats**: Malicious or negligent actions by authorized users
6. **Supply Chain Attacks**: Compromised dependencies or third-party services

**Risk Assessment Matrix**
```
High Impact + High Probability:
- SQL Injection attacks
- XSS vulnerabilities
- Authentication bypass

High Impact + Medium Probability:
- Data exposure through misconfigured RLS
- Account takeover via credential stuffing
- Insider data exfiltration

Medium Impact + High Probability:
- DDoS attacks
- Dependency vulnerabilities
- Configuration errors
```

## 2. Authentication and Authorization

### 2.1 Supabase Authentication Strategy

**Authentication Methods**
```typescript
// Email/Password Authentication
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123!',
  options: {
    emailRedirectTo: 'https://app.surveys.com/auth/callback'
  }
});

// OAuth Providers
const providers = [
  'google',
  'microsoft',
  'apple',
  'github'
];

// Multi-Factor Authentication
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
  friendlyName: 'Survey App MFA'
});
```

**Password Policy Requirements**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, and special characters
- No common passwords or dictionary words
- No user information in password
- Password history tracking (last 12 passwords)
- Regular password rotation recommendations

**Session Management**
```typescript
// Secure session configuration
const sessionConfig = {
  maxAge: 24 * 60 * 60, // 24 hours
  refreshThreshold: 60, // Refresh if expires in 60 seconds
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  flowType: 'pkce' // PKCE for enhanced security
};
```

### 2.2 Multi-Factor Authentication (MFA)

**MFA Implementation**
```typescript
// TOTP (Time-based One-Time Password)
interface MFASetup {
  factorType: 'totp';
  qrCode: string;
  secret: string;
  uri: string;
}

// SMS-based MFA (fallback)
interface SMSMFASetup {
  factorType: 'phone';
  phoneNumber: string;
  verificationCode: string;
}

// Hardware Security Keys (future enhancement)
interface WebAuthnSetup {
  factorType: 'webauthn';
  challenge: string;
  publicKey: PublicKeyCredentialCreationOptions;
}
```

**MFA Enforcement Policies**
- Mandatory for admin users
- Optional but encouraged for regular users
- Required for sensitive operations (data export, user management)
- Grace period for new users (7 days)
- Recovery codes for backup access

### 2.3 Role-Based Access Control (RBAC)

**Role Hierarchy**
```sql
-- User roles with inheritance
CREATE TYPE user_role AS ENUM (
  'super_admin',      -- Full system access
  'org_admin',        -- Organization management
  'survey_creator',   -- Create and manage surveys
  'collaborator',     -- Edit specific surveys
  'analyst',          -- View data and analytics
  'respondent'        -- Complete surveys only
);

-- Permission system
CREATE TYPE permission AS ENUM (
  'users.manage',
  'surveys.create',
  'surveys.edit',
  'surveys.delete',
  'surveys.publish',
  'responses.view',
  'responses.export',
  'analytics.view',
  'settings.manage'
);
```

**Permission Matrix**
```typescript
interface RolePermissions {
  super_admin: Permission[];
  org_admin: Permission[];
  survey_creator: Permission[];
  collaborator: Permission[];
  analyst: Permission[];
  respondent: Permission[];
}

const rolePermissions: RolePermissions = {
  super_admin: ['*'], // All permissions
  org_admin: [
    'users.manage',
    'surveys.create',
    'surveys.edit',
    'surveys.delete',
    'responses.view',
    'responses.export',
    'analytics.view',
    'settings.manage'
  ],
  survey_creator: [
    'surveys.create',
    'surveys.edit',
    'surveys.publish',
    'responses.view',
    'analytics.view'
  ],
  collaborator: [
    'surveys.edit', // Limited to assigned surveys
    'responses.view'
  ],
  analyst: [
    'responses.view',
    'responses.export',
    'analytics.view'
  ],
  respondent: [] // No administrative permissions
};
```

## 3. Row Level Security (RLS) Implementation

### 3.1 Supabase RLS Policies

**Organization-Level Security**
```sql
-- Organizations table RLS
CREATE POLICY "Users can only access their organization"
ON organizations
FOR ALL
USING (
  id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Organization membership policy
CREATE POLICY "Users can view organization members"
ON user_organizations
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);
```

**Survey-Level Security**
```sql
-- Surveys table RLS
CREATE POLICY "Survey creators and collaborators can access surveys"
ON surveys
FOR ALL
USING (
  created_by = auth.uid() 
  OR id IN (
    SELECT survey_id 
    FROM survey_collaborators 
    WHERE user_id = auth.uid()
  )
  OR organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() 
    AND role IN ('org_admin', 'super_admin')
  )
);

-- Survey responses RLS
CREATE POLICY "Users can access responses for their surveys"
ON survey_responses
FOR ALL
USING (
  survey_id IN (
    SELECT id FROM surveys 
    WHERE created_by = auth.uid()
    OR id IN (
      SELECT survey_id 
      FROM survey_collaborators 
      WHERE user_id = auth.uid()
    )
  )
);
```

**Dynamic Permission Policies**
```sql
-- Function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
  required_permission permission,
  resource_id uuid DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  -- Check role-based permissions
  IF EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = auth.uid()
    AND rp.permission = required_permission
  ) THEN
    RETURN true;
  END IF;
  
  -- Check resource-specific permissions
  IF resource_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM resource_permissions
      WHERE user_id = auth.uid()
      AND resource_id = check_user_permission.resource_id
      AND permission = required_permission
    ) THEN
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.2 API Security Layer

**Middleware Security Stack**
```typescript
// Authentication middleware
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Permission middleware
export const requirePermission = (permission: Permission) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const hasPermission = await checkUserPermission(req.user.id, permission);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Rate limiting middleware
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
```

## 4. Data Protection and Encryption

### 4.1 Encryption Strategy

**Data at Rest**
```sql
-- Column-level encryption for sensitive data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypted storage for PII
CREATE TABLE encrypted_user_data (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  encrypted_phone pgp_sym_encrypt('phone_number', 'encryption_key'),
  encrypted_address pgp_sym_encrypt('address', 'encryption_key'),
  created_at timestamp with time zone DEFAULT now()
);

-- Transparent Data Encryption (TDE) at database level
-- Handled by Supabase infrastructure
```

**Data in Transit**
- TLS 1.3 for all client-server communication
- Certificate pinning for mobile applications
- HSTS headers for web applications
- Perfect Forward Secrecy (PFS)

**Key Management**
```typescript
// Environment-based key management
interface EncryptionConfig {
  dataEncryptionKey: string;
  jwtSecret: string;
  apiKeys: {
    supabase: {
      url: string;
      anonKey: string;
      serviceKey: string;
    };
  };
}

// Key rotation strategy
const rotateEncryptionKeys = async () => {
  // Generate new key
  const newKey = generateSecureKey();
  
  // Re-encrypt data with new key
  await reencryptSensitiveData(newKey);
  
  // Update key in secure storage
  await updateEncryptionKey(newKey);
  
  // Audit key rotation
  await logSecurityEvent('key_rotation', { timestamp: new Date() });
};
```

### 4.2 Data Masking and Anonymization

**PII Protection**
```typescript
// Data masking for non-production environments
interface DataMaskingRules {
  email: (email: string) => string;
  phone: (phone: string) => string;
  name: (name: string) => string;
}

const maskingRules: DataMaskingRules = {
  email: (email) => email.replace(/(.{2}).*@/, '$1***@'),
  phone: (phone) => phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
  name: (name) => name.charAt(0) + '***'
};

// Anonymization for analytics
const anonymizeResponseData = (responses: SurveyResponse[]) => {
  return responses.map(response => ({
    ...response,
    respondent_id: hashUserId(response.respondent_id),
    ip_address: null,
    user_agent: null,
    metadata: {
      timestamp: response.created_at,
      survey_id: response.survey_id
    }
  }));
};
```

## 5. Input Validation and Sanitization

### 5.1 Frontend Validation

**Form Validation with Zod**
```typescript
import { z } from 'zod';

// Survey creation schema
const surveySchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,!?]+$/, 'Invalid characters in title'),
  
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  
  questions: z.array(z.object({
    type: z.enum(['text', 'choice', 'rating', 'matrix']),
    title: z.string().min(1, 'Question title required'),
    required: z.boolean(),
    options: z.array(z.string()).optional()
  })).min(1, 'At least one question required')
});

// Sanitization function
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};
```

### 5.2 Backend Validation

**API Input Validation**
```typescript
// Middleware for request validation
export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
};

// SQL injection prevention
const executeQuery = async (query: string, params: any[]) => {
  // Use parameterized queries only
  const { data, error } = await supabase
    .from('table_name')
    .select()
    .eq('column', params[0]); // Parameterized query
  
  return { data, error };
};
```

## 6. Security Headers and CSP

### 6.1 Security Headers Configuration

**Next.js Security Headers**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];
```

**Content Security Policy**
```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https:;
  font-src 'self' https://fonts.gstatic.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
  block-all-mixed-content;
`;
```

### 6.2 CORS Configuration

**API CORS Setup**
```typescript
const corsOptions = {
  origin: [
    'https://surveys.yourdomain.com',
    'https://admin.surveys.yourdomain.com',
    // Development origins
    ...(process.env.NODE_ENV === 'development' ? [
      'http://localhost:3000',
      'http://localhost:3001'
    ] : [])
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Key'
  ],
  maxAge: 86400 // 24 hours
};
```

## 7. Compliance Framework

### 7.1 GDPR Compliance

**Data Processing Legal Basis**
```typescript
interface DataProcessingRecord {
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  dataCategories: string[];
  retention: string;
  recipients: string[];
}

const dataProcessingRecords: DataProcessingRecord[] = [
  {
    purpose: 'Survey response collection',
    legalBasis: 'consent',
    dataCategories: ['Survey responses', 'Basic contact information'],
    retention: '3 years from last activity',
    recipients: ['Survey creators', 'Designated analysts']
  },
  {
    purpose: 'Account management',
    legalBasis: 'contract',
    dataCategories: ['Email', 'Name', 'Organization'],
    retention: 'Duration of account + 1 year',
    recipients: ['Platform administrators']
  }
];
```

**GDPR Rights Implementation**
```typescript
// Right to Access
export const exportUserData = async (userId: string) => {
  const userData = await supabase
    .from('user_data_view')
    .select('*')
    .eq('user_id', userId);
  
  return {
    personal_data: userData.data,
    surveys_created: await getUserSurveys(userId),
    responses_given: await getUserResponses(userId),
    export_date: new Date().toISOString()
  };
};

// Right to Erasure
export const deleteUserData = async (userId: string) => {
  // Anonymize responses instead of deletion to preserve survey integrity
  await supabase
    .from('survey_responses')
    .update({ 
      respondent_id: null,
      anonymized_at: new Date().toISOString()
    })
    .eq('respondent_id', userId);
  
  // Delete account and personal data
  await supabase.auth.admin.deleteUser(userId);
  
  // Log deletion for compliance
  await logGDPRAction('data_deletion', userId);
};

// Consent Management
interface ConsentRecord {
  user_id: string;
  purpose: string;
  granted: boolean;
  timestamp: Date;
  ip_address: string;
  user_agent: string;
}
```

### 7.2 CCPA Compliance

**Consumer Rights Implementation**
```typescript
// Right to Know
export const provideCCPADataSummary = async (userId: string) => {
  return {
    categories_collected: [
      'Identifiers',
      'Commercial information',
      'Internet activity',
      'Professional information'
    ],
    sources: ['Directly from user', 'User device/browser'],
    business_purposes: [
      'Providing survey platform services',
      'Customer support',
      'Security and fraud prevention'
    ],
    third_parties: ['None - data not sold']
  };
};

// Opt-out of Sale
export const optOutOfSale = async (userId: string) => {
  await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      opt_out_sale: true,
      updated_at: new Date().toISOString()
    });
};
```

### 7.3 SOC 2 Type II Readiness

**Security Controls Framework**
```typescript
interface SecurityControl {
  id: string;
  category: 'CC' | 'A' | 'PI' | 'C' | 'P'; // Common Criteria, Availability, Processing Integrity, Confidentiality, Privacy
  description: string;
  implementation: string;
  evidence: string[];
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

const securityControls: SecurityControl[] = [
  {
    id: 'CC6.1',
    category: 'CC',
    description: 'Logical and physical access controls',
    implementation: 'Multi-factor authentication, role-based access control',
    evidence: ['Access logs', 'User provisioning records', 'MFA enrollment'],
    frequency: 'continuous'
  },
  {
    id: 'CC7.1',
    category: 'CC',
    description: 'System monitoring',
    implementation: 'Real-time monitoring, alerting, incident response',
    evidence: ['Monitoring dashboards', 'Incident reports', 'Response times'],
    frequency: 'continuous'
  }
];
```

## 8. Audit Logging and Monitoring

### 8.1 Comprehensive Audit Trail

**Audit Event Schema**
```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  resource_type text,
  resource_id uuid,
  action text NOT NULL,
  details jsonb,
  ip_address inet,
  user_agent text,
  session_id text,
  timestamp timestamp with time zone DEFAULT now(),
  outcome text CHECK (outcome IN ('success', 'failure', 'error'))
);

-- Create index for efficient querying
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs (user_id, timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs (resource_type, resource_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs (event_type, timestamp DESC);
```

**Audit Event Types**
```typescript
enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'auth.login.success',
  LOGIN_FAILURE = 'auth.login.failure',
  LOGOUT = 'auth.logout',
  MFA_ENABLED = 'auth.mfa.enabled',
  MFA_DISABLED = 'auth.mfa.disabled',
  
  // Survey management
  SURVEY_CREATED = 'survey.created',
  SURVEY_UPDATED = 'survey.updated',
  SURVEY_DELETED = 'survey.deleted',
  SURVEY_PUBLISHED = 'survey.published',
  SURVEY_SHARED = 'survey.shared',
  
  // Data access
  DATA_EXPORTED = 'data.exported',
  DATA_IMPORTED = 'data.imported',
  RESPONSES_VIEWED = 'responses.viewed',
  
  // Administrative actions
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  ROLE_ASSIGNED = 'role.assigned',
  PERMISSION_GRANTED = 'permission.granted',
  
  // Security events
  SECURITY_VIOLATION = 'security.violation',
  RATE_LIMIT_EXCEEDED = 'security.rate_limit',
  SUSPICIOUS_ACTIVITY = 'security.suspicious'
}

// Audit logging function
const logAuditEvent = async (event: {
  userId?: string;
  eventType: AuditEventType;
  resourceType?: string;
  resourceId?: string;
  action: string;
  details?: any;
  outcome: 'success' | 'failure' | 'error';
  request?: Request;
}) => {
  await supabase.from('audit_logs').insert({
    user_id: event.userId,
    event_type: event.eventType,
    resource_type: event.resourceType,
    resource_id: event.resourceId,
    action: event.action,
    details: event.details,
    ip_address: event.request?.ip,
    user_agent: event.request?.headers['user-agent'],
    outcome: event.outcome
  });
};
```

### 8.2 Security Monitoring and Alerting

**Real-time Security Monitoring**
```typescript
// Anomaly detection rules
interface SecurityRule {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'alert' | 'block';
}

const securityRules: SecurityRule[] = [
  {
    id: 'multiple_failed_logins',
    name: 'Multiple Failed Login Attempts',
    condition: 'login_failures > 5 in 10 minutes',
    severity: 'high',
    action: 'block'
  },
  {
    id: 'unusual_data_export',
    name: 'Large Data Export',
    condition: 'data_export_size > 100MB',
    severity: 'medium',
    action: 'alert'
  },
  {
    id: 'admin_action_after_hours',
    name: 'Administrative Action After Hours',
    condition: 'admin_action AND (hour < 6 OR hour > 22)',
    severity: 'medium',
    action: 'alert'
  }
];

// Security incident response
const handleSecurityIncident = async (incident: SecurityIncident) => {
  // Log incident
  await logAuditEvent({
    eventType: AuditEventType.SECURITY_VIOLATION,
    action: incident.type,
    details: incident,
    outcome: 'success'
  });
  
  // Trigger appropriate response
  switch (incident.severity) {
    case 'critical':
      await triggerEmergencyResponse(incident);
      break;
    case 'high':
      await notifySecurityTeam(incident);
      break;
    case 'medium':
      await logSecurityEvent(incident);
      break;
  }
};
```

## 9. Incident Response Plan

### 9.1 Security Incident Classification

**Incident Severity Levels**
- **Critical (P0)**: Data breach, complete system compromise, unauthorized admin access
- **High (P1)**: Partial system compromise, privilege escalation, significant data exposure
- **Medium (P2)**: Suspicious activity, failed attack attempts, minor vulnerabilities
- **Low (P3)**: Policy violations, minor configuration issues, user errors

**Response Time SLAs**
- Critical: Immediate response (< 15 minutes)
- High: Urgent response (< 1 hour)
- Medium: Standard response (< 4 hours)
- Low: Routine response (< 24 hours)

### 9.2 Incident Response Procedures

**Incident Response Team**
```typescript
interface IncidentResponseTeam {
  incidentCommander: string;
  securityLead: string;
  technicalLead: string;
  communicationsLead: string;
  legalCounsel: string;
}

const responseTeam: IncidentResponseTeam = {
  incidentCommander: 'security@company.com',
  securityLead: 'security-team@company.com',
  technicalLead: 'engineering@company.com',
  communicationsLead: 'communications@company.com',
  legalCounsel: 'legal@company.com'
};
```

**Response Workflow**
1. **Detection and Analysis**
   - Automated monitoring alerts
   - Manual incident reporting
   - Initial impact assessment
   - Incident classification

2. **Containment and Eradication**
   - Immediate threat containment
   - System isolation if necessary
   - Root cause identification
   - Threat elimination

3. **Recovery and Lessons Learned**
   - System restoration
   - Monitoring for recurring issues
   - Post-incident review
   - Process improvement

## 10. Security Testing and Validation

### 10.1 Automated Security Testing

**Static Application Security Testing (SAST)**
```yaml
# GitHub Actions security workflow
name: Security Testing
on: [push, pull_request]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: auto
          
      - name: Run Bandit (Python security linter)
        run: bandit -r . -f json -o bandit-report.json
        
      - name: Run npm audit
        run: npm audit --audit-level high
        
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**Dynamic Application Security Testing (DAST)**
```typescript
// API security testing with Jest
describe('API Security Tests', () => {
  test('SQL injection protection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await request(app)
      .post('/api/surveys')
      .send({ title: maliciousInput });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Validation failed');
  });
  
  test('XSS protection', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    const response = await request(app)
      .post('/api/surveys')
      .send({ title: xssPayload });
    
    expect(response.status).toBe(400);
  });
  
  test('Authentication required', async () => {
    const response = await request(app)
      .get('/api/admin/users');
    
    expect(response.status).toBe(401);
  });
});
```

### 10.2 Penetration Testing

**Testing Scope**
- Web application security assessment
- API security testing
- Authentication and authorization testing
- Database security evaluation
- Infrastructure security review

**Testing Schedule**
- Quarterly automated vulnerability scans
- Semi-annual penetration testing
- Annual comprehensive security assessment
- Ad-hoc testing for major releases

## 11. Environment Security

### 11.1 Development Environment Security

**Secure Development Practices**
```typescript
// Environment variable validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
});

// Validate environment on startup
const env = envSchema.parse(process.env);
```

**Secret Management**
```bash
# .env.example (template)
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/surveys_dev
NEXTAUTH_SECRET=your-secret-here-minimum-32-characters
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Production secrets management
# Vercel Environment Variables (encrypted)
# GitHub Secrets for CI/CD
# HashiCorp Vault for enterprise deployment
```

### 11.2 Production Security Configuration

**Vercel Security Settings**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "security": {
    "allowedDomains": ["surveys.yourdomain.com"],
    "headers": {
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block"
    }
  },
  "functions": {
    "app/api/**/*": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

**Supabase Security Configuration**
```sql
-- Database security settings
ALTER DATABASE postgres SET log_statement = 'all';
ALTER DATABASE postgres SET log_min_duration_statement = 1000;

-- Connection security
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';

-- Additional security parameters
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activities = on;
ALTER SYSTEM SET track_counts = on;
```

## 12. Compliance Monitoring and Reporting

### 12.1 Automated Compliance Checks

**Continuous Compliance Monitoring**
```typescript
interface ComplianceCheck {
  id: string;
  regulation: 'GDPR' | 'CCPA' | 'SOC2' | 'ISO27001';
  requirement: string;
  automatedCheck: boolean;
  frequency: string;
  lastCheck: Date;
  status: 'compliant' | 'non-compliant' | 'needs-review';
}

const complianceChecks: ComplianceCheck[] = [
  {
    id: 'gdpr-consent-tracking',
    regulation: 'GDPR',
    requirement: 'Article 7 - Consent tracking and withdrawal',
    automatedCheck: true,
    frequency: 'daily',
    lastCheck: new Date(),
    status: 'compliant'
  },
  {
    id: 'data-retention-enforcement',
    regulation: 'GDPR',
    requirement: 'Article 5 - Data retention limits',
    automatedCheck: true,
    frequency: 'weekly',
    lastCheck: new Date(),
    status: 'compliant'
  }
];
```

### 12.2 Security Metrics and KPIs

**Security Dashboard Metrics**
```typescript
interface SecurityMetrics {
  authenticationFailureRate: number;
  averageResponseTime: number;
  vulnerabilitiesDetected: number;
  incidentsResolved: number;
  complianceScore: number;
  userSecurityTrainingCompletion: number;
}

const calculateSecurityScore = async (): Promise<SecurityMetrics> => {
  return {
    authenticationFailureRate: await getAuthFailureRate(),
    averageResponseTime: await getIncidentResponseTime(),
    vulnerabilitiesDetected: await getVulnerabilityCount(),
    incidentsResolved: await getResolvedIncidentCount(),
    complianceScore: await calculateComplianceScore(),
    userSecurityTrainingCompletion: await getTrainingCompletion()
  };
};
```

## Implementation Timeline

### Phase 1: Foundation Security (Weeks 1-4)
- Basic authentication and authorization
- Row Level Security implementation
- Input validation and sanitization
- Security headers and CORS configuration

### Phase 2: Advanced Security (Weeks 5-8)
- Multi-factor authentication
- Comprehensive audit logging
- Encryption implementation
- Security monitoring setup

### Phase 3: Compliance Implementation (Weeks 9-12)
- GDPR compliance features
- CCPA compliance implementation
- SOC 2 readiness preparation
- Security testing integration

### Phase 4: Monitoring and Response (Weeks 13-16)
- Advanced threat detection
- Incident response procedures
- Compliance reporting automation
- Security training and documentation

This comprehensive security and compliance framework ensures the Survey Web Application meets enterprise-grade security standards while maintaining usability and performance requirements.