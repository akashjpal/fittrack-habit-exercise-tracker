# FitTrack - Habit & Exercise Tracker

A comprehensive fitness tracking application that helps users monitor their workout routines, build habits, and visualize progress over time. Built with modern web technologies for a seamless fitness tracking experience.

## 📋 Table of Contents
- [Application Overview](#-application-overview)
- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Development Workflow](#-development-workflow)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

## 🏃‍♂️ Application Overview

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

For experienced developers who want to get started quickly:

```bash
# Clone and install
git clone https://github.com/your-username/fittrack-habit-exercise-tracker.git
cd fittrack-habit-exercise-tracker
npm install

# Set up environment variables (see detailed setup below)
cp .env.example .env  # Then edit .env with your Appwrite credentials

# Start development server
npm run dev
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** (v20 or higher) - [Download](https://nodejs.org/)
  - Check version: `node --version`
- **npm** (comes with Node.js) or **yarn** or **pnpm**
  - Check version: `npm --version`
- **Git** - [Download](https://git-scm.com/)
  - Check version: `git --version`

### Required Services
- **Appwrite Account** - [Sign up for free](https://appwrite.io/)
  - You can use Appwrite Cloud (recommended for beginners) or self-host
  - This project uses Appwrite as the backend database

## 🔧 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/fittrack-habit-exercise-tracker.git
cd fittrack-habit-exercise-tracker
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages for both the frontend and backend.

### Step 3: Appwrite Setup (Detailed)

This project uses **Appwrite** as its backend database. Follow these steps carefully:

#### 3.1 Create an Appwrite Project

1. Go to [Appwrite Cloud Console](https://cloud.appwrite.io/) or your self-hosted instance
2. Click **"Create Project"**
3. Give it a name (e.g., "FitTrack")
4. Copy the **Project ID** - you'll need this later

#### 3.2 Create a Database

1. In your project, navigate to **Databases** in the left sidebar
2. Click **"Create Database"**
3. Name it (e.g., "fittrack-db")
4. Copy the **Database ID** - you'll need this later

#### 3.3 Create Collections

You need to create **4 collections** with the following attributes:

##### Collection 1: Exercise Sections
- **Collection Name**: `exercise_sections`
- **Attributes**:
  - `id` - String (required)
  - `name` - String (required)
  - `targetSets` - Integer (required)
  - `createdAt` - String (required)

##### Collection 2: Workouts
- **Collection Name**: `workouts`
- **Attributes**:
  - `id` - String (required)
  - `sectionId` - String (required)
  - `exerciseType` - String (required)
  - `sets` - Integer (required)
  - `reps` - Integer (required)
  - `weight` - Float (required)
  - `unit` - String (required)
  - `date` - String (required)

##### Collection 3: Habits
- **Collection Name**: `habits`
- **Attributes**:
  - `id` - String (required)
  - `name` - String (required)
  - `frequency` - String (required, enum: 'daily' or 'weekly')
  - `createdAt` - String (required)

##### Collection 4: Habit Completions
- **Collection Name**: `habit_completions`
- **Attributes**:
  - `id` - String (required)
  - `habitId` - String (required)
  - `date` - String (required)

**Important**: After creating each collection, copy its **Collection ID**.

#### 3.4 Generate API Key

1. Navigate to **Settings** → **API Keys** in your Appwrite project
2. Click **"Create API Key"**
3. Give it a name (e.g., "FitTrack Server Key")
4. Set the following scopes (permissions):
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `documents.read`
   - `documents.write`
5. Copy the **API Key** - you'll need this later

### Step 4: Environment Configuration

Create a `.env` file in the **root directory** of the project:

```bash
# On Windows
copy NUL .env

# On macOS/Linux
touch .env
```

Add the following environment variables to your `.env` file:

```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here
APPWRITE_DATABASE_ID=your_database_id_here

# Collection IDs (from Step 3.3)
APPWRITE_EXERCISE_SECTIONS_COLLECTION_ID=your_exercise_sections_collection_id
APPWRITE_WORKOUTS_COLLECTION_ID=your_workouts_collection_id
APPWRITE_HABITS_COLLECTION_ID=your_habits_collection_id
APPWRITE_HABIT_COMPLETIONS_COLLECTION_ID=your_habit_completions_collection_id
```

**Replace** all `your_*_here` placeholders with the actual values you copied from Appwrite.

> **Note**: If you're using a self-hosted Appwrite instance, change `APPWRITE_ENDPOINT` to your instance URL (e.g., `http://localhost/v1`).

### Step 5: Start Development Server

```bash
npm run dev
```

This command starts both the frontend (Vite) and backend (Express) development servers concurrently.

### Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

> **Note**: The exact port may vary. Check your terminal output for the actual URL.

## 💻 Tech Stack

### Frontend Technologies

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **React** | 18.3.1 | UI library for building component-based interfaces | [Docs](https://react.dev/) |
| **TypeScript** | 5.6.3 | Type-safe JavaScript superset | [Docs](https://www.typescriptlang.org/docs/) |
| **Vite** | 5.4.20 | Fast build tool and development server | [Docs](https://vitejs.dev/) |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework | [Docs](https://tailwindcss.com/docs) |
| **Shadcn/ui** | Latest | Accessible, customizable UI components | [Docs](https://ui.shadcn.com/) |
| **Wouter** | 3.3.5 | Lightweight client-side routing | [Docs](https://github.com/molefrog/wouter) |
| **TanStack Query** | 5.60.5 | Data fetching, caching, and state management | [Docs](https://tanstack.com/query/latest) |
| **React Hook Form** | 7.55.0 | Performant form validation | [Docs](https://react-hook-form.com/) |
| **Recharts** | 2.15.2 | Composable charting library | [Docs](https://recharts.org/) |
| **Zod** | 3.24.2 | TypeScript-first schema validation | [Docs](https://zod.dev/) |
| **Framer Motion** | 11.13.1 | Animation library for React | [Docs](https://www.framer.com/motion/) |
| **Lucide React** | 0.453.0 | Beautiful icon library | [Docs](https://lucide.dev/) |
| **date-fns** | 3.6.0 | Modern JavaScript date utility library | [Docs](https://date-fns.org/) |

### Backend Technologies

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **Node.js** | 20+ | JavaScript runtime environment | [Docs](https://nodejs.org/docs/) |
| **Express.js** | 4.21.2 | Minimal web framework for Node.js | [Docs](https://expressjs.com/) |
| **TypeScript** | 5.6.3 | Type-safe server-side development | [Docs](https://www.typescriptlang.org/docs/) |
| **Appwrite** | 21.4.0 (client) / 20.3.0 (server) | Backend-as-a-Service for database | [Docs](https://appwrite.io/docs) |
| **Zod** | 3.24.2 | Runtime type validation | [Docs](https://zod.dev/) |
| **dotenv** | 17.2.3 | Environment variable management | [Docs](https://github.com/motdotla/dotenv) |

### Development Tools

| Tool | Version | Purpose | Documentation |
|------|---------|---------|---------------|
| **tsx** | 4.20.5 | TypeScript execution for Node.js | [Docs](https://github.com/esbuild-kit/tsx) |
| **esbuild** | 0.25.0 | Fast JavaScript bundler | [Docs](https://esbuild.github.io/) |
| **cross-env** | 10.1.0 | Cross-platform environment variables | [Docs](https://github.com/kentcdodds/cross-env) |

## 🏛️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Components (Pages)                            │  │
│  │  - Dashboard.tsx                                     │  │
│  │  - Exercises.tsx                                     │  │
│  │  - Habits.tsx                                        │  │
│  │  - Progress.tsx                                      │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                         │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │  TanStack Query (useQuery, useMutation)             │  │
│  │  - Data fetching & caching                          │  │
│  │  - Optimistic updates                               │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                         │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │  UI Components (Shadcn/ui)                          │  │
│  │  - Forms, Buttons, Cards, Charts                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP Requests (/api/*)
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                         SERVER                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express.js (app.ts)                                 │  │
│  │  - Middleware setup                                  │  │
│  │  - CORS, JSON parsing                                │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                         │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │  Routes (routes.ts)                                  │  │
│  │  - /api/sections                                     │  │
│  │  - /api/workouts                                     │  │
│  │  - /api/habits                                       │  │
│  │  - /api/completions                                  │  │
│  │  - /api/analytics/*                                  │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                         │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │  Storage Layer (storage.ts)                          │  │
│  │  - Business logic                                    │  │
│  │  - Data transformation                               │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                         │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │  DbHelper (dbHelper.ts)                              │  │
│  │  - Appwrite SDK wrapper                              │  │
│  │  - CRUD operations                                   │  │
│  └────────────────┬─────────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────────┘
                    │ Appwrite SDK
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                      APPWRITE                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database                                            │  │
│  │  - exercise_sections                                 │  │
│  │  - workouts                                          │  │
│  │  - habits                                            │  │
│  │  - habit_completions                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         SHARED                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Zod Schemas (schema.ts)                             │  │
│  │  - Type definitions                                  │  │
│  │  - Validation rules                                  │  │
│  │  - Shared between client & server                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

The application follows a **unidirectional data flow** pattern:

1. **User Interaction** → User interacts with React components (e.g., clicks "Add Workout")
2. **Query/Mutation** → Component triggers TanStack Query hook (`useMutation`)
3. **HTTP Request** → Query sends HTTP request to Express backend (`POST /api/workouts`)
4. **Route Handler** → Express route in `routes.ts` receives the request
5. **Validation** → Request body is validated against Zod schema from `shared/schema.ts`
6. **Storage Layer** → Route calls method on `storage` instance (e.g., `storage.createWorkout()`)
7. **Database Helper** → Storage layer calls `DbHelper` static method
8. **Appwrite SDK** → `DbHelper` uses `node-appwrite` SDK to interact with Appwrite
9. **Database Operation** → Appwrite performs the database operation (create/read/update/delete)
10. **Response Chain** → Data flows back through the chain to the client
11. **Cache Update** → TanStack Query updates its cache and triggers re-render
12. **UI Update** → React components re-render with new data

### Project Structure

```
fittrack-habit-exercise-tracker/
├── client/                          # Frontend application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # Shadcn/ui components
│   │   │   ├── Dashboard/           # Dashboard-specific components
│   │   │   ├── Exercise/            # Exercise-related components
│   │   │   └── Habit/               # Habit-related components
│   │   ├── pages/                   # Route pages
│   │   │   ├── Dashboard.tsx        # Main dashboard page
│   │   │   ├── Exercises.tsx        # Exercise management page
│   │   │   ├── Habits.tsx           # Habit tracking page
│   │   │   └── Progress.tsx         # Analytics & progress page
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── use-*.ts             # TanStack Query hooks
│   │   ├── lib/                     # Utility functions
│   │   ├── App.tsx                  # Main app component with routing
│   │   ├── main.tsx                 # React entry point
│   │   └── index.css                # Global styles
│   ├── index.html                   # HTML template
│   └── public/                      # Static assets
│
├── server/                          # Backend application
│   ├── app.ts                       # Express app configuration
│   ├── routes.ts                    # API route definitions
│   ├── storage.ts                   # Storage layer (business logic)
│   ├── dbHelper.ts                  # Appwrite SDK wrapper
│   ├── index-dev.ts                 # Development server entry
│   └── index-prod.ts                # Production server entry
│
├── shared/                          # Shared code between client & server
│   └── schema.ts                    # Zod schemas & TypeScript types
│
├── .env                             # Environment variables (not in git)
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite build configuration
├── tailwind.config.ts               # Tailwind CSS configuration
└── README.md                        # This file
```

## 🗄️ Database Schema

The application uses **Appwrite** as its database with the following schema:

### Collections Overview

```
┌──────────────────────┐
│  exercise_sections   │
└──────────┬───────────┘
           │
           │ 1:N
           │
┌──────────▼───────────┐
│      workouts        │
└──────────────────────┘

┌──────────────────────┐
│       habits         │
└──────────┬───────────┘
           │
           │ 1:N
           │
┌──────────▼───────────┐
│ habit_completions    │
└──────────────────────┘
```

### Collection: `exercise_sections`

Stores different exercise categories (e.g., Chest, Back, Legs).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Yes | Unique identifier (UUID) |
| `name` | String | Yes | Section name (e.g., "Chest", "Back") |
| `targetSets` | Integer | Yes | Weekly target number of sets |
| `createdAt` | String | Yes | ISO 8601 timestamp |

**Example Document:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Chest",
  "targetSets": 12,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Collection: `workouts`

Stores individual workout logs.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Yes | Unique identifier (UUID) |
| `sectionId` | String | Yes | Foreign key to `exercise_sections` |
| `exerciseType` | String | Yes | Exercise name (e.g., "Bench Press") |
| `sets` | Integer | Yes | Number of sets performed |
| `reps` | Integer | Yes | Number of repetitions per set |
| `weight` | Float | Yes | Weight used |
| `unit` | String | Yes | Weight unit ("kg" or "lbs") |
| `date` | String | Yes | ISO 8601 timestamp of workout |

**Example Document:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "sectionId": "550e8400-e29b-41d4-a716-446655440000",
  "exerciseType": "Bench Press",
  "sets": 3,
  "reps": 10,
  "weight": 80.5,
  "unit": "kg",
  "date": "2024-01-15T14:30:00.000Z"
}
```

### Collection: `habits`

Stores habit definitions.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Yes | Unique identifier (UUID) |
| `name` | String | Yes | Habit name (e.g., "Morning Run") |
| `frequency` | String | Yes | "daily" or "weekly" |
| `createdAt` | String | Yes | ISO 8601 timestamp |

**Example Document:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Morning Run",
  "frequency": "daily",
  "createdAt": "2024-01-10T08:00:00.000Z"
}
```

### Collection: `habit_completions`

Stores habit completion records.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Yes | Unique identifier (UUID) |
| `habitId` | String | Yes | Foreign key to `habits` |
| `date` | String | Yes | ISO 8601 timestamp (start of day) |

**Example Document:**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "habitId": "770e8400-e29b-41d4-a716-446655440002",
  "date": "2024-01-15T00:00:00.000Z"
}
```

## 📡 API Reference

All API endpoints are prefixed with `/api`.

### Exercise Sections

#### Get All Sections
```http
GET /api/sections
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Chest",
    "targetSets": 12,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Create Section
```http
POST /api/sections
Content-Type: application/json

{
  "name": "Chest",
  "targetSets": 12
}
```

#### Delete Section
```http
DELETE /api/sections/:id
```

### Workouts

#### Get All Workouts
```http
GET /api/workouts
```

#### Get Workouts by Section
```http
GET /api/workouts/section/:sectionId
```

#### Create Workout
```http
POST /api/workouts
Content-Type: application/json

{
  "sectionId": "550e8400-e29b-41d4-a716-446655440000",
  "exerciseType": "Bench Press",
  "sets": 3,
  "reps": 10,
  "weight": 80.5,
  "unit": "kg"
}
```

#### Delete Workout
```http
DELETE /api/workouts/:id
```

### Habits

#### Get All Habits
```http
GET /api/habits
```

#### Create Habit
```http
POST /api/habits
Content-Type: application/json

{
  "name": "Morning Run",
  "frequency": "daily"
}
```

#### Delete Habit
```http
DELETE /api/habits/:id
```

### Habit Completions

#### Get All Completions
```http
GET /api/completions
```

#### Get Completions for Habit
```http
GET /api/habits/:habitId/completions
```

#### Create Completion
```http
POST /api/completions
Content-Type: application/json

{
  "habitId": "770e8400-e29b-41d4-a716-446655440002",
  "date": "2024-01-15T00:00:00.000Z"
}
```

#### Delete Completion
```http
DELETE /api/completions/:habitId/:date
```

### Analytics

#### Get Dashboard Analytics
```http
GET /api/analytics/dashboard
```

**Response:**
```json
{
  "currentStreak": 7,
  "totalCompletedSets": 45,
  "totalTargetSets": 60,
  "sectionProgress": [
    {
      "sectionId": "550e8400-e29b-41d4-a716-446655440000",
      "sectionName": "Chest",
      "completedSets": 15,
      "targetSets": 12,
      "lastWorkout": "2024-01-15T14:30:00.000Z"
    }
  ]
}
```

#### Get Progress Data
```http
GET /api/analytics/progress
```

**Response:**
```json
{
  "volumeData": [
    {
      "week": "Week 1",
      "total": 30,
      "bench_press": 15,
      "squats": 15
    }
  ]
}
```

## 🔄 Development Workflow

### Running the Development Server

```bash
npm run dev
```

This starts:
- **Frontend**: Vite dev server with hot module replacement (HMR)
- **Backend**: Express server with automatic restart on file changes

### Type Checking

```bash
npm run check
```

Runs TypeScript compiler in check mode without emitting files.

### Building for Production

```bash
npm run build
```

This command:
1. Builds the client with Vite (outputs to `dist/public`)
2. Bundles the server with esbuild (outputs to `dist/index.js`)

### Running Production Build

```bash
npm start
```

Starts the production server (requires `npm run build` first).

### Code Organization Best Practices

1. **Shared Types**: Always define data types in `shared/schema.ts` using Zod
2. **API Hooks**: Create custom hooks in `client/src/hooks/` for API calls
3. **Components**: Keep components small and focused on a single responsibility
4. **Styling**: Use Tailwind utility classes; avoid custom CSS when possible
5. **Validation**: Validate all user input with Zod schemas

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue: "Cannot connect to Appwrite"

**Symptoms:**
- API requests fail with connection errors
- Console shows "Failed to fetch" errors

**Solutions:**
1. Verify your `.env` file has correct Appwrite credentials
2. Check that `APPWRITE_ENDPOINT` is correct:
   - Appwrite Cloud: `https://cloud.appwrite.io/v1`
   - Self-hosted: `http://your-domain/v1` (include `/v1`)
3. Ensure your Appwrite project is active
4. Verify API key has correct permissions

#### Issue: "Collection not found"

**Symptoms:**
- Errors mentioning missing collections
- 404 errors from Appwrite

**Solutions:**
1. Verify all 4 collections are created in Appwrite
2. Check that collection IDs in `.env` match Appwrite console
3. Ensure collection attributes match the schema (see Database Schema section)

#### Issue: "Port already in use"

**Symptoms:**
- Error: `EADDRINUSE: address already in use :::5000`

**Solutions:**
1. Kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F

   # macOS/Linux
   lsof -ti:5000 | xargs kill -9
   ```
2. Or change the port in `vite.config.ts`

#### Issue: "Module not found" errors

**Symptoms:**
- Import errors in TypeScript files

**Solutions:**
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Restart your IDE/editor
3. Run `npm run check` to see TypeScript errors

#### Issue: "Zod validation errors"

**Symptoms:**
- API returns 400 errors with validation messages

**Solutions:**
1. Check that request body matches the schema in `shared/schema.ts`
2. Ensure all required fields are provided
3. Verify data types match (string, number, etc.)

#### Issue: "CORS errors"

**Symptoms:**
- Browser console shows CORS policy errors

**Solutions:**
1. Ensure you're accessing the app through the correct URL
2. Check `server/app.ts` CORS configuration
3. For production, update CORS origin to your domain

### Getting Help

If you encounter issues not listed here:

1. **Check the console**: Look for error messages in both browser console and terminal
2. **Review Appwrite logs**: Check the Appwrite console for database errors
3. **Verify environment**: Ensure all environment variables are set correctly
4. **Check dependencies**: Run `npm install` to ensure all packages are installed
5. **Open an issue**: If the problem persists, open a GitHub issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

## 🗺️ Roadmap

### Upcoming Features
- [ ] **User Authentication** - Appwrite Auth integration for multi-user support
- [ ] **Exercise Library** - Pre-built exercise templates and instructions
- [ ] **Calendar View** - Visual workout scheduling and planning
- [ ] **Personal Records** - Track and celebrate PRs
- [ ] **Data Export** - Export data to CSV/PDF for analysis
- [ ] **Mobile App** - React Native version for iOS/Android
- [ ] **Social Features** - Share progress with friends
- [ ] **Workout Plans** - Pre-made workout programs

### Technical Improvements
- [ ] **Performance Optimization** - Code splitting and lazy loading
- [ ] **Offline Support** - PWA capabilities with service workers
- [ ] **Real-time Sync** - WebSocket integration for live updates
- [ ] **Unit Tests** - Comprehensive test coverage
- [ ] **E2E Tests** - Automated browser testing
- [ ] **CI/CD Pipeline** - Automated testing and deployment
- [ ] **Docker Support** - Containerization for easy deployment

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/fittrack-habit-exercise-tracker.git
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes**
5. **Commit your changes**:
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Add comments for complex logic
- Update documentation if needed
- Test your changes thoroughly
- Keep commits focused and atomic

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Appwrite](https://appwrite.io/) for the excellent BaaS platform
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [TanStack Query](https://tanstack.com/query) for powerful data management
- All contributors who help improve this project

---

**Built with ❤️ by the FitTrack team**

For questions or support, please open an issue on GitHub.
