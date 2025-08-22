# Healthcare Survey Analytics - Simplified MVP

## Overview
A minimalist, configuration-driven healthcare survey analytics web application that processes Excel/CSV files, validates and maps data, benchmarks metrics, and generates PDF reports.

## Architecture (Simplified)
```
User → Upload Excel/CSV → Parse & Validate → Dashboard → Generate PDF
         ↓                    ↓                 ↓           ↓
    [Config YAML]        [Config YAML]    [PostgreSQL]  [Template]
```

## Technology Stack
- **Framework**: Next.js 15 with TypeScript
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: Plotly.js (single library)
- **Database**: PostgreSQL via Supabase
- **PDF Generation**: pdf-lib
- **Configuration**: YAML-based metrics and field mappings

## Project Structure
```
survey-web-app/
├── app/                    # Next.js pages
├── components/            
│   ├── charts/            # Plotly chart wrapper
│   ├── healthcare/        # Healthcare dashboard
│   ├── ui/                # Reusable UI components
│   └── upload/            # File upload component
├── config/
│   ├── metrics.yaml       # Healthcare metrics configuration
│   └── field-mappings.yaml # Column mapping rules
├── lib/
│   ├── config/            # Config loader utilities
│   ├── parsers/           # CSV/Excel parsers
│   ├── services/          # Business logic
│   ├── supabase/          # Database client
│   └── validation/        # Data validators
└── public/                # Static assets
```

## Key Features

### 1. Configuration-Driven Metrics
All healthcare metrics, benchmarks, and calculations are defined in `config/metrics.yaml`:
- Coverage metrics (employee, dependent rates)
- Cost metrics (premiums, budget increases)
- Satisfaction scores
- Demographics analysis

### 2. Smart Field Mapping
Automatic column mapping from various Excel formats using `config/field-mappings.yaml`:
- Recognizes aliases (e.g., "employees", "headcount", "staff" → "employee_count")
- Type validation and transformation
- Data quality checks

### 3. Core Workflow
1. **Upload**: Drag & drop Excel/CSV files
2. **Parse**: Automatic field detection and mapping
3. **Validate**: Data quality checks and corrections
4. **Analyze**: Generate charts and insights
5. **Export**: Create branded PDF reports

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## Environment Variables

```env
# Required for production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
SKIP_ENV_VALIDATION=true  # For local development
```

## Configuration

### Adding New Metrics
Edit `config/metrics.yaml`:
```yaml
metrics:
  your_category:
    your_metric:
      name: "Metric Name"
      calculation: "formula"
      benchmark: 0.85
      format: "percentage"
```

### Adding Field Mappings
Edit `config/field-mappings.yaml`:
```yaml
field_mappings:
  your_field:
    standard_field: "your_field"
    aliases: ["alias1", "alias2"]
    type: "number"
    validation:
      min: 0
      max: 100
```

## Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

## Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Performance Optimizations
- Lazy loading for Plotly charts
- Dynamic imports for heavy components
- Efficient data parsing with streaming
- Client-side caching for processed data

## Security
- Input sanitization on all uploads
- File type validation (CSV/Excel only)
- Secure environment variable handling
- HTTPS-only in production

## Roadmap to V2
- [ ] Background job processing for large files
- [ ] Advanced PDF customization templates
- [ ] API endpoints for programmatic access
- [ ] Multi-tenant support with organizations
- [ ] Real-time collaboration features

## Support
For issues or questions, please contact the development team.

## License
Proprietary - All rights reserved