# Frontend Development Conventions

## React Patterns

### Component Structure

```typescript
// ✅ Good: Clear structure with proper typing
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary',
  size = 'md',
  onClick,
  children 
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### File Organization

```
components/
├── ui/                   # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
├── features/            # Feature-specific components
│   ├── survey/
│   │   ├── SurveyList.tsx
│   │   ├── SurveyForm.tsx
│   │   └── index.ts
│   └── analytics/
│       ├── Chart.tsx
│       └── Metrics.tsx
└── layouts/            # Layout components
    ├── Header.tsx
    ├── Footer.tsx
    └── Sidebar.tsx
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRIES`)
- **Types/Interfaces**: PascalCase with descriptive names
- **Hooks**: camelCase with 'use' prefix (`useAuth`)

## Next.js Patterns

### Server vs Client Components

```typescript
// ✅ Server Component (default)
// app/page.tsx
async function HomePage() {
  const data = await fetchData(); // Server-side data fetching
  return <div>{data}</div>;
}

// ✅ Client Component (when needed)
// components/InteractiveChart.tsx
'use client';

import { useState } from 'react';

export function InteractiveChart() {
  const [filter, setFilter] = useState('all');
  // Interactive client-side logic
}
```

### Data Fetching Patterns

```typescript
// ✅ Server Component with streaming
async function DataTable() {
  const data = await fetch('/api/data', {
    next: { revalidate: 60 } // ISR caching
  });
  
  return <Table data={data} />;
}

// ✅ Client-side with SWR/React Query
function useData() {
  const { data, error, isLoading } = useSWR('/api/data', fetcher);
  return { data, error, isLoading };
}
```

### Route Organization

```
app/
├── (auth)/              # Route group for auth pages
│   ├── login/
│   └── register/
├── (dashboard)/         # Route group for dashboard
│   ├── layout.tsx       # Shared dashboard layout
│   ├── page.tsx        # Dashboard home
│   └── surveys/
│       ├── page.tsx    # Surveys list
│       └── [id]/       # Dynamic routes
│           ├── page.tsx
│           └── edit/
└── api/                # API routes
    └── surveys/
        └── route.ts
```

## TypeScript Patterns

### Type Safety Rules

```typescript
// ✅ Good: Explicit types, no any
interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

// ❌ Bad: Using any
const processData = (data: any) => { /* ... */ };

// ✅ Good: Type guards
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj
  );
}

// ✅ Good: Discriminated unions
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
```

### Generic Components

```typescript
// ✅ Reusable generic component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}
```

## Tailwind CSS Patterns

### Utility Organization

```typescript
// ✅ Good: Extract repeated patterns
const buttonStyles = {
  base: 'inline-flex items-center justify-center rounded-md font-medium',
  variants: {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  },
  sizes: {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg',
  },
};

// ✅ Using cn() utility for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  isDisabled && 'disabled-classes'
)} />
```

### Design Tokens

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        gray: {
          // Custom gray scale
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontSize: {
        'xxs': '0.625rem',
      },
    },
  },
};
```

## State Management Patterns

### Local State

```typescript
// ✅ Good: Use local state for component-specific state
function SearchBar() {
  const [query, setQuery] = useState('');
  // Component-specific state
}
```

### Global State

```typescript
// ✅ Context for cross-cutting concerns
const ThemeContext = createContext<ThemeContextType>();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ✅ Zustand for complex state
const useSurveyStore = create<SurveyStore>((set) => ({
  surveys: [],
  loading: false,
  fetchSurveys: async () => {
    set({ loading: true });
    const surveys = await api.getSurveys();
    set({ surveys, loading: false });
  },
}));
```

## Form Handling Patterns

### With Zod Validation

```typescript
const surveySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500),
  questions: z.array(questionSchema),
});

function SurveyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(surveySchema),
  });

  const onSubmit = async (data: SurveyInput) => {
    const sanitized = sanitizeJson(data);
    await createSurvey(sanitized);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('title')} />
      {errors.title && <Error>{errors.title.message}</Error>}
    </form>
  );
}
```

## Performance Patterns

### Code Splitting

```typescript
// ✅ Dynamic imports for heavy components
const ChartComponent = dynamic(
  () => import('@/components/charts/ChartContainer'),
  { 
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);
```

### Memoization

```typescript
// ✅ Memo for expensive components
const ExpensiveList = memo(({ items }: { items: Item[] }) => {
  return items.map(item => <ItemCard key={item.id} {...item} />);
});

// ✅ useMemo for expensive computations
const sortedData = useMemo(
  () => data.sort((a, b) => b.score - a.score),
  [data]
);

// ✅ useCallback for stable references
const handleSearch = useCallback(
  (query: string) => {
    setSearchQuery(query);
  },
  []
);
```

## Error Handling Patterns

### Error Boundaries

```typescript
// ✅ Error boundary component
class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error caught:', error, info);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Async Error Handling

```typescript
// ✅ Try-catch with proper error handling
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    // Show user-friendly error
    toast.error('Failed to load data. Please try again.');
    throw error;
  }
}
```

## Accessibility Patterns

### ARIA Labels

```typescript
// ✅ Proper ARIA attributes
<button
  aria-label="Close dialog"
  aria-pressed={isPressed}
  aria-expanded={isExpanded}
  onClick={handleClick}
>
  <X className="h-4 w-4" />
</button>

// ✅ Semantic HTML
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/home">Home</a></li>
  </ul>
</nav>
```

### Keyboard Navigation

```typescript
// ✅ Keyboard event handlers
function handleKeyDown(event: React.KeyboardEvent) {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      handleSelect();
      break;
    case 'Escape':
      handleClose();
      break;
    case 'ArrowDown':
      focusNext();
      break;
  }
}
```

## Testing Patterns

### Component Testing

```typescript
// ✅ Component test with React Testing Library
describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Code Quality Checklist

- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Properly formatted (`npm run format`)
- [ ] Accessibility compliant (WCAG 2.2 AA)
- [ ] Performance budget met (<200KB JS)
- [ ] Tests passing with >70% coverage
- [ ] No console.logs in production
- [ ] Error boundaries implemented
- [ ] Loading states for async operations
- [ ] Proper SEO meta tags