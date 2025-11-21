# FitTrack - Habit & Exercise Tracker

## Overview

FitTrack is a comprehensive fitness tracking application that combines habit monitoring and exercise logging with detailed progress visualization. The app enables users to track workout volume across different muscle groups, maintain daily habit streaks, and visualize their fitness journey through interactive charts and metrics.

**Core Value Proposition**: A goal-focused productivity tool that provides efficient workout logging, clear progress metrics, and motivational engagement through visual progress tracking and streak mechanics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing (Dashboard, Exercises, Habits, Progress pages)

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management with caching, automatic refetching, and optimistic updates
- Custom query client configuration with infinite stale time and disabled window focus refetching
- Local state managed via React hooks (useState, useEffect)

**UI Component System**
- Shadcn UI component library based on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Design system follows Material Design patterns for data visualization combined with fitness app UX patterns (Strong, Hevy, Streaks)
- Dark mode support with theme toggle persisted to localStorage
- Responsive design with mobile-first breakpoints

**Key Design Patterns**
- Component composition with Radix UI primitives for accessibility
- Dialog-based workflows for data entry (habits, exercises, workouts)
- Collapsible sections for workout history
- Real-time visual feedback with progress bars, circular progress indicators, and streak counters

### Backend Architecture

**Server Framework**
- Express.js with TypeScript running on Node.js
- Development and production entry points (index-dev.ts, index-prod.ts)
- Custom logging middleware for API request/response tracking

**Data Storage**
- In-memory storage implementation (MemStorage class) for MVP phase
- Interface-based storage abstraction (IStorage) allowing future migration to persistent database
- Data models: ExerciseSections, Workouts, Habits, HabitCompletions
- UUID-based entity identification

**API Design**
- RESTful API endpoints organized by resource:
  - `/api/sections` - Exercise section CRUD
  - `/api/workouts` - Workout logging and retrieval
  - `/api/habits` - Habit management
  - `/api/completions` - Habit completion tracking
  - `/api/analytics/dashboard` - Aggregated dashboard metrics
  - `/api/analytics/progress` - Weekly volume trend data

**Data Validation**
- Zod schemas for runtime type validation on API inputs
- Shared schema definitions between client and server
- Type-safe API contracts with TypeScript inference

### Core Data Models

**Exercise Tracking**
- ExerciseSection: Named muscle groups with weekly set targets
- Workout: Individual exercise entries with sets, reps, weight, unit, exercise type, and timestamp
- Aggregation logic for weekly volume calculation and progress percentage

**Habit Tracking**
- Habit: Named habits with daily/weekly frequency
- HabitCompletion: Date-based completion records
- Streak calculation based on consecutive daily completions
- 7-day rolling view for visual habit tracking

**Analytics & Progress**
- Dashboard aggregations: current streak, total sets, section-wise progress, last workout timestamps
- Weekly volume trends grouped by exercise section
- Trend analysis and percentage change calculations

### Routing & Navigation

**Client-Side Routing**
- Wouter for declarative routing
- Four main routes: Dashboard (/), Exercises (/exercises), Habits (/habits), Progress (/progress)
- Sticky header navigation with active state indicators
- Mobile-responsive bottom navigation (planned)

**Server-Side Routing**
- Static file serving for production builds
- API routes under `/api` namespace
- Catch-all route for SPA fallback to index.html

### Development Workflow

**Development Mode**
- Vite middleware integration with Express
- HMR (Hot Module Replacement) for instant updates
- Source map support for debugging
- Custom error modal plugin for runtime error reporting

**Production Build**
- Client bundle built with Vite to `dist/public`
- Server bundle built with esbuild to `dist/index.js`
- Static asset serving from dist/public
- Environment-based configuration (NODE_ENV)

### Design System & Theming

**Color System**
- CSS custom properties for theme variables (HSL color space)
- Separate light and dark mode color palettes
- Semantic color tokens: primary, secondary, muted, accent, destructive
- Chart colors for data visualization (5 distinct colors)

**Typography**
- Inter as primary font (Google Fonts)
- DM Sans for display and numeric values
- Font size scale from text-xs to text-5xl
- Font weight variants for hierarchy

**Component Patterns**
- Card-based layouts with consistent padding and border radius
- Elevation system using shadows and subtle borders
- Hover and active state elevation effects
- Consistent spacing units (4, 6, 8, 12, 16 in Tailwind units)

## External Dependencies

### Third-Party Libraries & Frameworks

**Frontend**
- `react` & `react-dom` (v18) - Core UI library
- `wouter` - Lightweight routing
- `@tanstack/react-query` - Server state management
- `date-fns` - Date manipulation and formatting
- `recharts` - Data visualization and charting
- `clsx` & `tailwind-merge` - Conditional class composition

**UI Components**
- `@radix-ui/*` (20+ packages) - Accessible component primitives
- `class-variance-authority` - Type-safe component variants
- `cmdk` - Command menu component
- `lucide-react` - Icon library

**Backend**
- `express` - Web server framework
- `zod` - Schema validation
- `nanoid` - ID generation
- `drizzle-orm` & `drizzle-kit` - ORM (prepared for database integration)
- `@neondatabase/serverless` - Database driver (prepared for Postgres)

**Development Tools**
- `vite` - Build tool and dev server
- `@vitejs/plugin-react` - React support for Vite
- `typescript` & `tsx` - TypeScript execution
- `tailwindcss` - CSS framework
- `autoprefixer` & `postcss` - CSS processing
- `esbuild` - Server bundle building

### Planned Integrations

**Database (Prepared but Not Active)**
- Drizzle ORM configured for PostgreSQL
- Schema definitions exist in `shared/schema.ts`
- Migration configuration in `drizzle.config.ts`
- Connection expected via `DATABASE_URL` environment variable
- Currently using in-memory storage, ready for database migration

**GitHub Integration**
- `@octokit/rest` - GitHub API client
- GitHub connector for Replit environment
- Repository setup script for automated deployment

### Configuration Files

- `vite.config.ts` - Vite build configuration with React plugin
- `tailwind.config.ts` - Custom design tokens and theme configuration
- `tsconfig.json` - TypeScript compiler options with path aliases
- `drizzle.config.ts` - Database migration configuration
- `components.json` - Shadcn UI component configuration
- `postcss.config.js` - PostCSS plugins for Tailwind