# Healthcare Survey Dashboard - Agent & KB Integration Guide

## Overview

This application features a Power BI-inspired UI with intelligent agents and Archon Knowledge Base integration for enhanced survey management and analytics.

## Architecture

### Power BI-Style UI Components
- **Vertical Navigation Sidebar**: Collapsible navigation with AI-powered features
- **Top Bar**: Breadcrumbs, global search (Cmd+K), and user controls
- **Filter Panel**: Context-aware filtering for analytics
- **Page Transitions**: Smooth animations between pages
- **Command Palette**: Quick navigation and actions

### Agent & KB Integration Points

```
┌──────────────────────────────────────────────────────────┐
│                    User Interface                         │
├──────────────────────────────────────────────────────────┤
│  Power BI Layout │ Vertical Nav │ Filter Panel │ TopBar  │
├──────────────────────────────────────────────────────────┤
│                    React Hooks Layer                      │
│  useArchonQuery │ useAgent │ useArchonSuggestions        │
├──────────────────────────────────────────────────────────┤
│                  Agent Orchestrator                       │
│  Survey Enrichment │ Compliance │ Analytics │ Insights   │
├──────────────────────────────────────────────────────────┤
│                   Archon KB Client                        │
│  Query │ RAG Search │ Code Examples │ Streaming          │
├──────────────────────────────────────────────────────────┤
│                    Cache Manager                          │
│  LRU Cache │ TTL Management │ Fallback Responses         │
└──────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Update with your Archon API credentials
NEXT_PUBLIC_ARCHON_API_URL=http://localhost:8000/api
ARCHON_API_KEY=your_api_key_here
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Run Development Server

```bash
# With mock data (no Archon connection needed)
NEXT_PUBLIC_USE_MOCK_DATA=true npm run dev

# With live Archon connection
npm run dev
```

## Agent Integration Examples

### Survey Builder with AI Suggestions

```tsx
// app/(dashboard)/surveys/new/page.tsx
import { useArchonSuggestions } from '@/hooks/useArchonSuggestions';
import { useComplianceAgent } from '@/hooks/useComplianceAgent';

export function EnhancedSurveyBuilder() {
  const [survey, setSurvey] = useState<Survey>(defaultSurvey);
  
  // Get AI-powered question suggestions
  const { suggestions, loading } = useArchonSuggestions({
    context: survey.category,
    existingQuestions: survey.questions,
    source: 'file_2025_HC_Survey_FINAL_pdf_1755645523'
  });
  
  // Real-time compliance validation
  const compliance = useComplianceAgent();
  
  useEffect(() => {
    // Validate compliance as user builds survey
    compliance.validate(survey);
  }, [survey]);
  
  return (
    <div className="flex gap-6">
      <SurveyForm survey={survey} onChange={setSurvey} />
      <SuggestionsPanel suggestions={suggestions} />
      <ComplianceStatus status={compliance.status} />
    </div>
  );
}
```

### Analytics with KB Insights

```tsx
// components/analytics/IntelligentChart.tsx
import { useArchonQuery } from '@/hooks/useArchonQuery';

export function IntelligentChart({ data, surveyId }) {
  // Get insights from Archon KB
  const { data: insights } = useArchonQuery(
    `Analyze this healthcare survey data: ${JSON.stringify(data)}`,
    {
      cacheKey: `insights:${surveyId}`,
      cacheTTL: 300
    }
  );
  
  return (
    <Card>
      <Chart data={data} />
      {insights && <InsightPanel insights={insights.data.insights} />}
    </Card>
  );
}
```

### Dashboard with Agent-Enhanced Metrics

```tsx
// components/dashboard/MetricCard.tsx
import { useAgent } from '@/hooks/useAgent';

export function MetricCard({ title, value, surveyId }) {
  const analyzer = useAgent('metric-analyzer');
  const [analysis, setAnalysis] = useState(null);
  
  useEffect(() => {
    analyzer.execute({
      data: { metric: title, value, surveyId }
    }).then(setAnalysis);
  }, [value]);
  
  return (
    <Card>
      <CardHeader>{title}</CardHeader>
      <CardContent>
        <div className="text-3xl">{value}</div>
        {analysis && (
          <div className="text-sm mt-2">
            {analysis.trend} • {analysis.recommendation}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Available Agents

### 1. Survey Enrichment Agent
- **ID**: `survey-enrichment`
- **Purpose**: Enriches surveys with KB context and suggestions
- **Features**:
  - Question enhancement with help text
  - Accessibility improvements
  - Validation rules generation
  - Smart question suggestions

### 2. Compliance Validator Agent
- **ID**: `compliance-validator`
- **Purpose**: Validates surveys against regulations
- **Features**:
  - HIPAA compliance checking
  - GDPR compliance checking
  - Real-time validation
  - Compliance scoring (0-100)
  - Certification recommendations

### 3. Analytics Insight Agent (Coming Soon)
- **ID**: `insight-generator`
- **Purpose**: Generates insights from survey data
- **Features**:
  - Trend analysis
  - Anomaly detection
  - Predictive analytics
  - Actionable recommendations

## React Hooks Reference

### useArchonQuery
Query the Archon Knowledge Base with caching support.

```typescript
const { data, loading, error, refetch } = useArchonQuery(
  prompt: string,
  options?: {
    cacheKey?: string;
    cacheTTL?: number;
    source?: string;
    enabled?: boolean;
  }
);
```

### useAgent
Execute agent tasks with status tracking.

```typescript
const { execute, abort, status, loading, result } = useAgent(
  agentId: string,
  options?: {
    onSuccess?: (result) => void;
    onError?: (error) => void;
  }
);
```

### useArchonSuggestions
Get AI-powered survey question suggestions.

```typescript
const { suggestions, loading, error, refresh } = useArchonSuggestions({
  context?: string;
  existingQuestions?: Question[];
  source?: string;
  limit?: number;
});
```

### useComplianceAgent
Validate survey compliance with regulations.

```typescript
const { validate, status, loading, error } = useComplianceAgent({
  regulations?: string[]; // Default: ['HIPAA', 'GDPR']
});
```

## Environment Configuration

### Development
```env
NEXT_PUBLIC_ARCHON_API_URL=http://localhost:8000/api
ARCHON_API_KEY=dev-key-12345
ENABLE_CACHE=false
```

### Staging
```env
NEXT_PUBLIC_ARCHON_API_URL=https://staging-archon.company.com/api
ARCHON_API_KEY=${STAGING_KEY}
ENABLE_CACHE=true
CACHE_TTL_SECONDS=300
```

### Production
```env
NEXT_PUBLIC_ARCHON_API_URL=https://archon.company.com/api
ARCHON_SERVICE_ACCOUNT=${PROD_SERVICE_ACCOUNT}
ENABLE_CACHE=true
CACHE_TTL_SECONDS=600
REDIS_URL=${REDIS_CONNECTION}
```

## Testing Agent Integration

### Unit Tests
```typescript
// __tests__/hooks/useArchonQuery.test.tsx
import { renderHook } from '@testing-library/react';
import { useArchonQuery } from '@/hooks/useArchonQuery';
import { mockArchonClient } from '@/test-utils/mocks';

describe('useArchonQuery', () => {
  it('should fetch data from Archon KB', async () => {
    mockArchonClient.query.mockResolvedValue({
      data: { content: 'Test response' }
    });
    
    const { result } = renderHook(() => 
      useArchonQuery('Test prompt')
    );
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

### Integration Tests
```typescript
// __tests__/integration/survey-builder.test.tsx
describe('Survey Builder with AI', () => {
  it('should show KB suggestions', async () => {
    render(<EnhancedSurveyBuilder />);
    
    await waitFor(() => {
      expect(screen.getByText('Suggested Questions')).toBeInTheDocument();
    });
    
    const suggestions = screen.getAllByTestId('suggestion-item');
    expect(suggestions).toHaveLength(5);
  });
});
```

## Monitoring & Telemetry

### Key Metrics
- **KB Query Latency**: Target < 500ms
- **Agent Execution Time**: Target < 1s
- **Cache Hit Rate**: Target > 80%
- **Error Rate**: Target < 1%

### Monitoring Dashboard
```typescript
// lib/monitoring/dashboard.ts
export function getAgentMetrics() {
  return {
    queries: archonMonitor.getMetrics().queries,
    avgLatency: archonMonitor.getMetrics().avgLatency,
    cacheHitRate: cacheManager.getStats().hitRate,
    errorRate: archonMonitor.getMetrics().errorRate
  };
}
```

## Troubleshooting

### Common Issues

#### 1. Archon Connection Failed
```
Error: Failed to connect to Archon KB
```
**Solution**: Check ARCHON_API_URL and API_KEY in .env.local

#### 2. Agent Timeout
```
Error: Agent execution timeout after 30000ms
```
**Solution**: Increase AGENT_TIMEOUT_MS or optimize agent logic

#### 3. Cache Size Exceeded
```
Warning: Cache size exceeded 100MB
```
**Solution**: Increase CACHE_MAX_SIZE_MB or reduce TTL

#### 4. Circuit Breaker Open
```
Error: Circuit breaker open for agent X
```
**Solution**: Agent failing repeatedly, check logs and fix underlying issue

## Best Practices

### 1. Cache Strategy
- Use appropriate TTL for different query types
- Cache keys should be deterministic
- Implement fallback for cache misses

### 2. Error Handling
- Always provide fallback UI for agent failures
- Show loading states during agent execution
- Log errors for monitoring

### 3. Performance
- Batch agent requests when possible
- Use streaming for long responses
- Implement pagination for large datasets

### 4. Security
- Never expose API keys in client code
- Validate all agent responses
- Implement rate limiting

## API Reference

### Archon KB Client Methods

```typescript
interface ArchonKBClient {
  query(prompt: string, options?: QueryOptions): Promise<KBResponse>;
  searchCodeExamples(query: string, limit?: number): Promise<CodeExample[]>;
  getAvailableSources(): Promise<KBSource[]>;
  performRAGQuery(query: string, source?: string): Promise<RAGResponse>;
  streamQuery(prompt: string, onChunk: (chunk: string) => void): AsyncIterator<string>;
}
```

### Agent Orchestrator Methods

```typescript
interface AgentOrchestrator {
  registerAgent(agent: Agent): void;
  runAgent<T>(agentId: string, input: any): Promise<T>;
  runParallel(tasks: AgentTask[]): Promise<AgentResult[]>;
  setMaxRetries(retries: number): void;
  setTimeoutMs(timeout: number): void;
}
```

## Contributing

### Adding New Agents

1. Create agent class extending BaseAgent:
```typescript
// lib/agents/my-new-agent.ts
export class MyNewAgent extends BaseAgent {
  constructor() {
    super('my-new-agent', 'analyzer');
  }
  
  async execute(input: AgentInput): Promise<AgentResult> {
    // Agent logic here
  }
}
```

2. Register agent in orchestrator:
```typescript
// lib/agents/orchestrator.ts
orchestrator.registerAgent(new MyNewAgent());
```

3. Create React hook (optional):
```typescript
// hooks/useMyNewAgent.ts
export function useMyNewAgent() {
  return useAgent('my-new-agent');
}
```

### Updating KB Sources

Update the configuration in `lib/config/archon.config.ts`:
```typescript
kbSources: {
  primary: 'new_source_id',
  // ...
}
```

## Support

For issues or questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review the [API Reference](#api-reference)
- Open an issue on GitHub

## License

MIT