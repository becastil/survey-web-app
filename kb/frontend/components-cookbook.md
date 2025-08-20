# Component Cookbook

## Introduction

This cookbook provides practical recipes for building and composing React components in the Healthcare Survey Dashboard. Each recipe includes implementation details, usage examples, and best practices.

## Base Component Patterns

### 1. Loading States

```typescript
// components/ui/LoadingState.tsx
interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingState({ size = 'md', message }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={cn(
        'animate-spin rounded-full border-b-2 border-primary',
        sizeClasses[size]
      )} />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
```

### 2. Empty States

```typescript
// components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {Icon && <Icon className="h-12 w-12 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

### 3. Error States

```typescript
// components/ui/ErrorState.tsx
interface ErrorStateProps {
  error: Error | string;
  retry?: () => void;
  showDetails?: boolean;
}

export function ErrorState({ error, retry, showDetails = false }: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'object' ? error.stack : undefined;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {errorMessage}
        {showDetails && errorStack && (
          <pre className="mt-2 text-xs overflow-auto">{errorStack}</pre>
        )}
      </AlertDescription>
      {retry && (
        <Button variant="outline" size="sm" onClick={retry} className="mt-4">
          Try Again
        </Button>
      )}
    </Alert>
  );
}
```

## Form Components

### 4. Form Field Wrapper

```typescript
// components/forms/FormField.tsx
interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
}

export function FormField({ 
  label, 
  name, 
  error, 
  required, 
  description, 
  children 
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

### 5. Controlled Input

```typescript
// components/forms/ControlledInput.tsx
interface ControlledInputProps extends InputProps {
  label: string;
  error?: string;
}

export const ControlledInput = forwardRef<HTMLInputElement, ControlledInputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <FormField label={label} name={props.name || ''} error={error}>
        <Input
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.name}-error` : undefined}
          {...props}
        />
      </FormField>
    );
  }
);
```

### 6. Select with Search

```typescript
// components/forms/SearchableSelect.tsx
interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder 
}: SearchableSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value ? options.find(o => o.value === value)?.label : placeholder}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Search..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {filtered.map(option => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

## Data Display Components

### 7. Data Table

```typescript
// components/data/DataTable.tsx
interface Column<T> {
  key: keyof T;
  header: string;
  cell?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({ 
  data, 
  columns, 
  onRowClick,
  emptyMessage = "No data available"
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map(col => (
            <TableHead key={String(col.key)} className={col.className}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, idx) => (
          <TableRow 
            key={idx}
            onClick={() => onRowClick?.(row)}
            className={onRowClick ? 'cursor-pointer hover:bg-muted' : ''}
          >
            {columns.map(col => (
              <TableCell key={String(col.key)} className={col.className}>
                {col.cell ? col.cell(row[col.key], row) : String(row[col.key])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### 8. Stat Card

```typescript
// components/data/StatCard.tsx
interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ComponentType<{ className?: string }>;
}

export function StatCard({ title, value, change, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={cn(
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            )}>
              {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
            </span>
            {' from last period'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

## Layout Components

### 9. Page Layout

```typescript
// components/layouts/PageLayout.tsx
interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageLayout({ 
  title, 
  description, 
  actions, 
  children, 
  breadcrumbs 
}: PageLayoutProps) {
  return (
    <div className="space-y-6">
      {breadcrumbs && (
        <Breadcrumbs items={breadcrumbs} />
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>
      
      <Separator />
      
      <div>{children}</div>
    </div>
  );
}
```

### 10. Split View

```typescript
// components/layouts/SplitView.tsx
interface SplitViewProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  sidebarWidth?: 'sm' | 'md' | 'lg';
  collapsible?: boolean;
}

export function SplitView({ 
  sidebar, 
  content, 
  sidebarWidth = 'md',
  collapsible = false 
}: SplitViewProps) {
  const [collapsed, setCollapsed] = useState(false);

  const widthClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
  };

  return (
    <div className="flex h-full">
      <aside className={cn(
        'border-r bg-background transition-all',
        collapsed ? 'w-0 overflow-hidden' : widthClasses[sidebarWidth]
      )}>
        {sidebar}
      </aside>
      
      {collapsible && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-muted"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      )}
      
      <main className="flex-1 overflow-auto">
        {content}
      </main>
    </div>
  );
}
```

## Interactive Components

### 11. Confirmation Dialog

```typescript
// components/ui/ConfirmDialog.tsx
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={variant === 'destructive' ? 'bg-destructive' : ''}
          >
            {loading ? 'Processing...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 12. Toast Notifications

```typescript
// hooks/useToast.tsx
interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
}

export function useToast() {
  const show = useCallback((options: ToastOptions) => {
    const toastElement = document.createElement('div');
    toastElement.className = cn(
      'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg',
      'animate-in slide-in-from-bottom-2',
      {
        'bg-background border': options.variant === 'default',
        'bg-green-600 text-white': options.variant === 'success',
        'bg-destructive text-white': options.variant === 'error',
        'bg-yellow-600 text-white': options.variant === 'warning',
      }
    );

    // Render toast content
    const root = createRoot(toastElement);
    root.render(
      <div>
        <div className="font-semibold">{options.title}</div>
        {options.description && (
          <div className="text-sm mt-1 opacity-90">{options.description}</div>
        )}
      </div>
    );

    document.body.appendChild(toastElement);

    // Auto-remove after duration
    setTimeout(() => {
      toastElement.classList.add('animate-out', 'slide-out-to-bottom-2');
      setTimeout(() => {
        root.unmount();
        document.body.removeChild(toastElement);
      }, 200);
    }, options.duration || 3000);
  }, []);

  return { show };
}
```

## Composite Components

### 13. Survey Card

```typescript
// components/surveys/SurveyCard.tsx
interface SurveyCardProps {
  survey: {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'active' | 'completed';
    responseCount: number;
    createdAt: Date;
  };
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
}

export function SurveyCard({ survey, onEdit, onView, onDelete }: SurveyCardProps) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{survey.title}</CardTitle>
            <CardDescription className="mt-1">
              {survey.description}
            </CardDescription>
          </div>
          <Badge className={statusColors[survey.status]}>
            {survey.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {survey.responseCount} responses
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(survey.createdAt)}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        {onView && (
          <Button variant="ghost" size="sm" onClick={onView}>
            View
          </Button>
        )}
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

### 14. Question Builder

```typescript
// components/surveys/QuestionBuilder.tsx
interface QuestionBuilderProps {
  question: Question;
  onChange: (question: Question) => void;
  onDelete: () => void;
}

export function QuestionBuilder({ 
  question, 
  onChange, 
  onDelete 
}: QuestionBuilderProps) {
  const updateField = (field: keyof Question, value: unknown) => {
    onChange({ ...question, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Input
            value={question.text}
            onChange={(e) => updateField('text', e.target.value)}
            placeholder="Enter question"
            className="text-lg font-medium"
          />
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Select
          value={question.type}
          onValueChange={(value) => updateField('type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="checkbox">Checkbox</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>

        {question.type === 'multiple_choice' && (
          <OptionsEditor
            options={question.options || []}
            onChange={(options) => updateField('options', options)}
          />
        )}

        <div className="flex items-center space-x-2">
          <Switch
            checked={question.required}
            onCheckedChange={(checked) => updateField('required', checked)}
          />
          <Label>Required</Label>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Usage Examples

### Basic Implementation

```typescript
// app/surveys/page.tsx
export default function SurveysPage() {
  const { data: surveys, loading, error } = useSurveys();

  if (loading) return <LoadingState message="Loading surveys..." />;
  if (error) return <ErrorState error={error} retry={() => window.location.reload()} />;
  if (!surveys?.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No surveys yet"
        description="Create your first survey to get started"
        action={{
          label: "Create Survey",
          onClick: () => router.push('/surveys/new')
        }}
      />
    );
  }

  return (
    <PageLayout
      title="Surveys"
      description="Manage your survey campaigns"
      actions={
        <Button onClick={() => router.push('/surveys/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Survey
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {surveys.map(survey => (
          <SurveyCard
            key={survey.id}
            survey={survey}
            onView={() => router.push(`/surveys/${survey.id}`)}
            onEdit={() => router.push(`/surveys/${survey.id}/edit`)}
            onDelete={() => handleDelete(survey.id)}
          />
        ))}
      </div>
    </PageLayout>
  );
}
```

### Complex Form

```typescript
// app/surveys/new/page.tsx
export default function NewSurveyPage() {
  const { show } = useToast();
  const [survey, setSurvey] = useState<Survey>(defaultSurvey);

  const handleSubmit = async () => {
    try {
      const validated = surveySchema.parse(survey);
      await createSurvey(validated);
      show({ 
        title: 'Survey created', 
        variant: 'success' 
      });
      router.push('/surveys');
    } catch (error) {
      show({ 
        title: 'Failed to create survey', 
        description: error.message,
        variant: 'error' 
      });
    }
  };

  return (
    <PageLayout
      title="Create Survey"
      breadcrumbs={[
        { label: 'Surveys', href: '/surveys' },
        { label: 'New Survey' }
      ]}
    >
      <div className="max-w-2xl">
        <FormField label="Title" name="title" required>
          <Input
            value={survey.title}
            onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
          />
        </FormField>

        <FormField label="Description" name="description">
          <Textarea
            value={survey.description}
            onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
          />
        </FormField>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Questions</h3>
          {survey.questions.map((question, index) => (
            <QuestionBuilder
              key={question.id}
              question={question}
              onChange={(q) => updateQuestion(index, q)}
              onDelete={() => removeQuestion(index)}
            />
          ))}
          <Button variant="outline" onClick={addQuestion}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        <div className="flex justify-end gap-2 mt-8">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Survey
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
```

## Best Practices

1. **Composition over Inheritance**: Build complex components by composing simpler ones
2. **Prop Validation**: Use TypeScript interfaces for all component props
3. **Accessibility**: Include ARIA labels, keyboard navigation, and screen reader support
4. **Error Handling**: Always handle loading, error, and empty states
5. **Performance**: Use React.memo for expensive components, lazy load heavy components
6. **Styling**: Use Tailwind utilities with cn() for conditional classes
7. **Testing**: Write tests for all interactive components
8. **Documentation**: Include usage examples in component files