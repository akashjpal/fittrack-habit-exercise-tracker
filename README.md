# FitTrack - Habit & Exercise Tracker

A comprehensive fitness tracking application that helps users monitor their workout routines, build habits, and visualize progress over time. Built with modern web technologies for a seamless fitness tracking experience.

## 🏃‍♂️ Application Flow

### User Journey
1. **Dashboard Entry** - View overview of fitness progress including current streak, weekly completion rates, and section-wise progress
2. **Exercise Management** - Create custom exercise sections (Chest, Back, Legs, etc.) and log detailed workouts
3. **Habit Tracking** - Set up daily/weekly habits and track completions with visual indicators
4. **Progress Analytics** - Analyze performance trends through interactive charts and metrics

### Core Features Flow
```
Dashboard → Exercise Tracking → Workout Logging → Progress Visualization
    ↓           ↓                 ↓                ↓
Habit Tracking → Streak Building → Completion Tracking → Analytics
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn

### Installation & Setup

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/fittrack-habit-exercise-tracker.git
cd fittrack-habit-exercise-tracker
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Setup:**
```bash
# Copy environment variables (if .env.example exists)
cp .env.example .env
# Edit .env with your configuration
```

4. **Database Setup (if using PostgreSQL):**
```bash
# Push database schema
npm run db:push
```

5. **Start Development Server:**
```bash
npm run dev
```

6. **Access the Application:**
- Open your browser to `http://localhost:5000`
- The app will automatically reload on code changes

## 🛠️ Build & Deployment Commands

### Development
```bash
npm run dev          # Start development server with hot reload
npm run check        # Run TypeScript type checking
npm run db:push      # Push database schema changes (if using DB)
```

### Production Build
```bash
npm run build        # Build client bundle and server
npm start           # Start production server
```

### Additional Commands
```bash
npm run lint        # Run linting (if configured)
npm test            # Run tests (if configured)
```

## 💻 Tech Stack

### Frontend Technologies
- **React 18.3.1** - Modern UI library with hooks and concurrent features
- **TypeScript 5.6.3** - Type-safe JavaScript development
- **Vite 5.4.20** - Fast build tool and development server
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Shadcn/ui Components** - High-quality, accessible UI components
- **Radix UI** - Unstyled, accessible component primitives
- **Wouter 3.3.5** - Lightweight routing solution
- **TanStack Query 5.60.5** - Data fetching, caching and state management
- **React Hook Form 7.55.0** - Performant forms with easy validation
- **Zod 3.24.2** - TypeScript-first schema validation
- **Recharts 2.15.2** - Data visualization and charting library
- **Framer Motion 11.13.1** - Animation library
- **Lucide React 0.453.0** - Beautiful icon library
- **date-fns 3.6.0** - Modern date utility library

### Backend Technologies
- **Express.js 4.21.2** - Fast, minimalist web framework
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe server-side development
- **Drizzle ORM 0.39.1** - Modern SQL toolkit for TypeScript
- **Neon Database** - Serverless PostgreSQL (optional)
- **Express Session 1.18.1** - Session middleware
- **Passport.js 0.7.0** - Authentication middleware

### Development & Build Tools
- **ESBuild 0.25.0** - Fast JavaScript bundler
- **TSX 4.20.5** - TypeScript execution
- **PostCSS 8.4.47** - CSS transformation tool
- **Cross-env 10.1.0** - Cross-platform environment variables

## 📁 Project Structure

```
fittrack-habit-exercise-tracker/
├── client/                     # Frontend React Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # Shadcn UI components
│   │   │   ├── examples/      # Component examples
│   │   │   ├── AddHabitDialog.tsx
│   │   │   ├── ExerciseSectionCard.tsx
│   │   │   ├── HabitTracker.tsx
│   │   │   ├── ProgressChart.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── pages/             # Main application pages
│   │   │   ├── Dashboard.tsx  # Overview page
│   │   │   ├── Exercises.tsx  # Workout tracking
│   │   │   ├── Habits.tsx     # Habit management
│   │   │   └── Progress.tsx   # Analytics & charts
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   └── App.tsx            # Main app component
│   └── index.html             # HTML entry point
├── server/                    # Backend Express Application
│   ├── app.ts                 # Express app configuration
│   ├── routes.ts              # API route definitions
│   ├── storage.ts             # In-memory data storage
│   ├── dbHelper.ts            # Database helper utilities
│   ├── index-dev.ts           # Development server entry
│   └── index-prod.ts          # Production server entry
├── shared/                    # Shared code between client/server
│   └── schema.ts              # TypeScript schemas and types
├── scripts/                   # Build and deployment scripts
├── drizzle.config.ts          # Database configuration
├── vite.config.ts             # Vite build configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## 🎯 Features

### 🏋️ Exercise Tracking
- **Section-based Organization**: Create custom exercise sections (Chest, Back, Legs, etc.)
- **Detailed Workout Logging**: Track sets, reps, weight, and exercise type
- **Weekly Volume Targets**: Set and monitor weekly set goals per muscle group
- **Workout History**: Complete workout history with collapsible entries
- **Real-time Progress**: Live updates of weekly completion percentages

### 🔥 Habit Tracking
- **Flexible Scheduling**: Daily or weekly habit frequencies
- **Visual 7-Day View**: Checkbox-based habit completion tracking
- **Intelligent Streaks**: Automatic streak calculation with milestone recognition
- **Motivational Feedback**: Dynamic messages based on streak achievements
- **Quick Toggle**: One-click habit completion for ease of use

### 📊 Progress Analytics
- **Interactive Charts**: Line and bar charts for volume trends
- **Weekly Comparisons**: 6-week performance history
- **Section Analysis**: Compare training volume across muscle groups
- **Key Metrics**: Total sets, daily averages, trend indicators
- **Dashboard Overview**: At-a-glance fitness summary

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Themes**: Seamless theme switching with system preference detection
- **Smooth Animations**: Micro-interactions and transitions
- **Accessibility**: WCAG compliant components
- **Mobile-First Navigation**: Collapsible navigation for small screens

## 🔄 Data Flow Architecture

```
Frontend (React) 
    ↓ API Calls (TanStack Query)
Backend (Express.js)
    ↓ Data Operations
Storage Layer (Memory/Database)
    ↓ Response
Frontend State Updates
```

### Key API Endpoints
- `GET/POST /api/sections` - Exercise section management
- `GET/POST/DELETE /api/workouts` - Workout logging
- `GET/POST/DELETE /api/habits` - Habit management
- `GET/POST/DELETE /api/completions` - Habit completions
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/progress` - Progress data

## 🗄️ Data Models

### Exercise Section
```typescript
{
  id: string
  name: string
  targetSets: number
  createdAt: string
}
```

### Workout
```typescript
{
  id: string
  sectionId: string
  exerciseType: string
  sets: number
  reps: number
  weight: number
  unit: string
  date: string
}
```

### Habit
```typescript
{
  id: string
  name: string
  frequency: 'daily' | 'weekly'
  createdAt: string
}
```

### Habit Completion
```typescript
{
  id: string
  habitId: string
  date: string
}
```

## 🚀 Deployment

### Development
```bash
npm run dev    # Runs on http://localhost:5000
```

### Production
```bash
npm run build  # Creates optimized build
npm start      # Runs production server
```

### Environment Variables
```bash
NODE_ENV=development
DATABASE_URL=your_database_url (if using PostgreSQL)
SESSION_SECRET=your_session_secret (if using sessions)
```

## 🗺️ Roadmap

### Upcoming Features
- [ ] **Database Integration**: PostgreSQL with Drizzle ORM
- [ ] **User Authentication**: Secure login/registration system
- [ ] **Exercise Library**: Pre-built exercise templates
- [ ] **Quick Logging**: Fast workout entry with presets
- [ ] **Calendar View**: Workout scheduling and planning
- [ ] **Personal Records**: PR tracking and notifications
- [ ] **Data Export**: CSV/PDF export capabilities
- [ ] **Mobile App**: React Native companion app
- [ ] **Social Features**: Friend challenges and sharing
- [ ] **Advanced Analytics**: AI-powered insights

### Technical Improvements
- [ ] **Performance Optimization**: Code splitting and lazy loading
- [ ] **Offline Support**: PWA capabilities
- [ ] **Real-time Sync**: WebSocket integration
- [ ] **Backup System**: Automated data backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use semantic HTML and accessible patterns
- Write meaningful commit messages
- Include tests for new features
- Follow existing code style

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Unstyled component primitives
- **Recharts** - Flexible charting library
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next-generation build tool

---

**Built with ❤️ for the fitness community** 💪

**Start tracking your fitness journey today!** 🚀