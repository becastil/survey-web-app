# Healthcare Survey Dashboard

A comprehensive healthcare survey platform built with Next.js, TypeScript, and Tailwind CSS. This application enables organizations to create, distribute, and analyze healthcare benefit surveys with powerful analytics and real-time insights.

## 🚀 Live Demo

The application runs in **Demo Mode** by default, providing a fully functional experience without backend setup. All features are available using mock data and localStorage persistence.

## ✨ Features

- 📊 **Interactive Dashboard** - Real-time analytics with charts and metrics
- 📝 **Survey Builder** - Create custom surveys with drag-and-drop question builder
- 📈 **Comprehensive Analytics** - Data visualization with response trends and insights
- 📱 **Survey Response Interface** - Mobile-friendly survey taking experience
- 💾 **Progress Saving** - Auto-save and resume survey responses
- 👥 **Role-Based Access** - Admin, Analyst, and Viewer permissions (ready for production)
- 🎨 **Modern UI/UX** - Beautiful, responsive design with shadcn/ui components
- 🔒 **Security Ready** - Supabase authentication integration prepared

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui with Radix UI
- **Charts**: React-Vega (Vega-Lite)
- **Authentication**: Supabase (optional)
- **Database**: PostgreSQL with Supabase (optional)
- **Deployment**: Optimized for Vercel

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
│   └── charts/           # Chart components
├── lib/                   
│   ├── mock-data/        # Mock data for demo mode
│   ├── services/         # Service layer
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

Open [http://localhost:3000](http://localhost:3000) to view the application.

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
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Key Features in Detail

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

For support, please open an issue in the GitHub repository.

---

Built with ❤️ for the Keenan Healthcare Survey initiative