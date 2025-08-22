# Healthcare Survey Dashboard

A comprehensive healthcare survey platform built with Next.js, TypeScript, and Tailwind CSS. This application enables organizations to create, distribute, and analyze healthcare benefit surveys with powerful analytics and real-time insights.

## 🚀 Live Demo

The application runs in **Demo Mode** by default, providing a fully functional experience without backend setup. All features are available using mock data and localStorage persistence.

## ✨ Features

### Core Platform
- 📊 **Interactive Dashboard** - Real-time analytics with charts and metrics
- 📝 **Survey Builder** - Create custom surveys with drag-and-drop question builder
- 📈 **Comprehensive Analytics** - Data visualization with response trends and insights
- 📱 **Survey Response Interface** - Mobile-friendly survey taking experience
- 💾 **Progress Saving** - Auto-save and resume survey responses
- 👥 **Role-Based Access** - Admin, Analyst, and Viewer permissions (ready for production)
- 🎨 **Modern UI/UX** - Beautiful, responsive design with shadcn/ui components
- 🔒 **Security Ready** - Supabase authentication integration prepared

### Healthcare Data Visualization (NEW)
- 📁 **Multi-Format File Upload** - Support for CSV, Excel (xlsx/xls), PDF, and text files
- 🔍 **Smart Healthcare Field Detection** - Automatic recognition of medical plans, regions, employee demographics
- 📊 **Interactive Plotly.js Charts** - 5+ chart types including regional heatmaps, plan comparisons, cost analysis
- ✨ **Smooth Animations** - Framer Motion animations throughout the visualization interface
- 🏥 **Healthcare-Specific Processing** - Handles HMO/PPO/EPO/HDHP plans, union populations, budget data
- 📈 **Real-time Data Processing** - Progress indicators with validation feedback
- 🎯 **Interactive Filtering** - Filter by region, plan type, and other dimensions
- 📋 **Data Quality Validation** - Automatic detection of missing values and data issues

### Healthcare Enhancements
- 🏥 **Healthcare-Compliant Templates** - HIPAA/HITECH validated report generation
- 📊 **Advanced Data Processing** - Handle 10,000+ responses with statistical analysis
- 🎨 **Professional Landing Page** - 3D graphics with Paper Shaders and premium animations
- 📈 **Automated Report Generation** - Multi-format exports (PDF, PowerPoint, Excel, Word)
- 🔍 **Data Quality Engine** - 6-dimension assessment with auto-correction capabilities
- 📝 **CAHPS Integration** - Healthcare-specific metrics and national benchmarks
- ♿ **Accessibility Compliance** - WCAG 2.1 AA/AAA standards with contrast validation
- 🔐 **PHI Protection** - Encrypted field validation and audit trail support

## 🛠️ Tech Stack

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui with Radix UI
- **Charts**: Plotly.js (primary), React-Vega (Vega-Lite), Recharts
- **File Upload**: react-dropzone with drag & drop support
- **Authentication**: Supabase (optional)
- **Database**: PostgreSQL with Supabase (optional)
- **Deployment**: Optimized for Vercel

### Data Processing & Analytics
- **Statistical Analysis**: simple-statistics, d3-array
- **Data Parsing**: papaparse (CSV), xlsx (Excel), pdf-parse (PDF)
- **Quality Assessment**: Custom 6-dimension engine with healthcare field validation
- **Pattern Recognition**: Temporal analysis, seasonality detection
- **Healthcare Processing**: Medical plan type detection, employee demographics analysis

### 3D Graphics & Animations
- **3D Engine**: Three.js, React Three Fiber, React Three Drei
- **Shaders**: @paper-design/shaders-react
- **Animations**: Framer Motion, React Spring
- **Interactive Graphics**: Premium parallax and mesh gradients

### Report Generation
- **PDF**: pdf-lib, jspdf
- **Word**: docx
- **PowerPoint**: pptxgenjs
- **Excel**: exceljs
- **Templates**: Dynamic template engine with data binding

### Healthcare Standards
- **Compliance**: HIPAA/HITECH validation
- **Accessibility**: WCAG 2.1 AA/AAA
- **Metrics**: CAHPS, HCAHPS, NPS
- **Security**: PHI encryption validation

## 📁 Project Structure

```
survey-web-app/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (dashboard)/       # Main application pages
│   │   ├── surveys/       # Survey management
│   │   │   ├── new/       # Create survey
│   │   │   ├── [id]/      
│   │   │   │   ├── edit/  # Edit survey
│   │   │   │   ├── respond/ # Take survey
│   │   │   │   └── analytics/ # Survey analytics
│   │   ├── analytics/     # Global analytics
│   │   └── settings/      # User settings
│   └── api/               # API routes
├── components/            
│   ├── ui/               # Reusable UI components
│   ├── charts/           # Chart components
│   ├── upload/           # File upload components
│   │   └── EnhancedFileUploadZone.tsx # Multi-format file upload
│   ├── healthcare/       # Healthcare visualization components
│   │   └── HealthcareDashboard.tsx    # Main dashboard with Plotly charts
│   ├── analytics/        # Analytics components
│   │   └── CSVDataVisualizer.tsx      # CSV data visualizer
│   └── landing/          # Landing page components
│       ├── backgrounds/  # 3D animated backgrounds
│       │   └── AdvancedHeroBackground.tsx
│       ├── MetricsCounter.tsx     # Real-time metrics display
│       └── InteractiveDemo.tsx    # Processing pipeline demo
├── lib/                   
│   ├── mock-data/        # Mock data for demo mode
│   ├── parsers/          # Data parsing utilities
│   │   └── healthcareDataParser.ts # Multi-format healthcare data parser
│   ├── services/         # Service layer
│   │   ├── data-processor.ts      # Core data processing engine
│   │   ├── data-validator.ts      # CSV validation & scoring
│   │   └── data-quality-engine.ts # 6-dimension quality assessment
│   ├── report-templates/ # Healthcare report templates
│   │   ├── base-template.ts       # Base template with HIPAA validation
│   │   ├── patient-satisfaction-template.ts # CAHPS template
│   │   └── template-engine.ts     # Dynamic template engine
│   └── supabase/         # Supabase client config
└── types/                # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd survey-web-app
```

2. **Install dependencies:**
```bash
npm install --legacy-peer-deps
```

3. **Set up environment variables:**
```bash
# The app uses mock data by default
cp .env.local .env.local.backup  # If you have existing env file
```

4. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:1994](http://localhost:1994) to view the application.

## 🌐 Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/survey-web-app)

### Manual Deployment

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy to Vercel:**
```bash
vercel
```

3. **Follow the prompts** to link your project and deploy.

The application will automatically run in demo mode on Vercel with all features available.

## 🎮 Demo Mode Features

The application includes comprehensive mock data for demonstration:

- **8 Pre-configured Surveys** including:
  - Keenan Healthcare Survey 2025
  - Employee Benefits Satisfaction
  - Mental Health Support Assessment
  - Remote Work Health & Wellness
  - And more...

- **Sample Questions** of all types:
  - Single choice
  - Multiple choice
  - Scale/Rating
  - Text input
  - Number input
  - Date picker

- **Generated Analytics Data**:
  - Response trends
  - Completion rates
  - Demographic breakdowns
  - Time-to-complete distributions

## 🔧 Configuration

### Environment Variables

For **Demo Mode** (default):
```env
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_APP_NAME=Healthcare Survey Dashboard
```

For **Production** with Supabase:
```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production (with SKIP_ENV_VALIDATION)
- `npm run build:prod` - Full production build with validation
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🎯 Key Features in Detail

### Healthcare Data Visualization (CSV Analytics)
**Access at**: `/analytics/csv`
- **Multi-Format Upload**: Drag & drop support for CSV, Excel, PDF, and text files
- **Smart Field Detection**: Automatically recognizes healthcare survey fields
- **Interactive Charts**: 
  - Regional distribution bar charts
  - Medical plan type pie charts
  - Cost analysis scatter plots
  - Trend analysis line charts
  - Employee demographics box plots
- **Real-time Processing**: Upload progress with validation feedback
- **Data Filtering**: Interactive filters by region, plan type, and demographics
- **Healthcare Context**: Handles medical plan types (HMO, PPO, EPO, HDHP), union populations, budget increases

### Survey Builder
- Drag-and-drop question ordering
- Multiple question types
- Required/optional questions
- Help text support
- Real-time preview
- Question duplication

### Survey Response
- Progress tracking
- Question navigation grid
- Auto-save functionality
- Mobile-responsive design
- Validation support

### Analytics Dashboard
- 6 key metrics cards
- Response trend charts
- Completion funnel analysis
- Question-level analytics
- Export functionality
- AI-powered insights

### Data Persistence
- LocalStorage for demo mode
- Supabase ready for production
- Automatic data synchronization
- Offline capability

## 🏥 Healthcare Compliance & Standards

### HIPAA/HITECH Compliance
- **PHI Protection**: Automatic detection and validation of PHI fields
- **Encryption Validation**: Ensures sensitive data is properly encrypted
- **Audit Trail**: Complete logging for regulatory compliance
- **Data Retention**: Configurable retention policies
- **Access Control**: Role-based permissions enforcement

### Accessibility Standards (WCAG 2.1)
- **AA/AAA Compliance**: Full support for both levels
- **Color Contrast**: Automatic validation (4.5:1 minimum for AA, 7:1 for AAA)
- **Screen Reader**: Complete ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast Mode**: Support for users with visual impairments

### Healthcare Metrics & Benchmarks
- **CAHPS Scores**: Consumer Assessment of Healthcare Providers
- **HCAHPS**: Hospital CAHPS for inpatient experiences
- **NPS Calculation**: Net Promoter Score tracking
- **Regional Analysis**: Geographic performance comparison
- **Temporal Patterns**: Seasonality and trend detection
- **Industry Benchmarks**: Comparison against national averages

## 📊 Data Processing Pipeline

### Processing Capabilities
- **Scale**: Handle 10,000+ survey responses efficiently
- **Formats**: CSV, JSON, Excel parsing
- **Statistical Analysis**: Mean, median, standard deviation, percentiles
- **Outlier Detection**: IQR-based outlier removal
- **Pattern Recognition**: Temporal and seasonal patterns
- **Benchmark Comparisons**: Industry and regional comparisons

### Quality Assessment (6 Dimensions)
1. **Completeness**: Missing data detection and scoring
2. **Accuracy**: Format validation and range checking
3. **Consistency**: Cross-field validation and format standardization
4. **Validity**: Business rule validation
5. **Timeliness**: Data freshness evaluation
6. **Uniqueness**: Duplicate detection and removal

### Auto-Correction Features
- **Format Standardization**: Dates, regions, emails
- **Data Cleaning**: Whitespace trimming, case correction
- **Smart Defaults**: Intelligent fallback values
- **Validation Rules**: Custom business logic enforcement

## 📈 Report Generation System

### Template Engine
- **Dynamic Templates**: Conditional sections and data binding
- **HIPAA Validation**: Automatic PHI detection
- **Accessibility**: WCAG compliance checking
- **Multi-Format Export**: PDF, PowerPoint, Word, Excel, HTML

### Healthcare Templates
- **Patient Satisfaction**: CAHPS-integrated reports
- **Clinical Outcomes**: Quality measure tracking
- **Cost Efficiency**: Financial performance analysis
- **Regulatory Compliance**: Audit-ready documentation
- **Executive Summaries**: C-suite dashboards

### Visualization Features
- **Interactive Charts**: Drill-down capabilities
- **Heatmaps**: Regional performance visualization
- **Trend Analysis**: Time-series with forecasting
- **Risk Matrices**: Priority quadrant analysis
- **Benchmark Comparisons**: Industry standard tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

For support, please open an issue in the GitHub repository.

---

Built with ❤️ for the Keenan Healthcare Survey initiative