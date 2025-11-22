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
- npm (or yarn/pnpm)
- An active [Appwrite](https://appwrite.io/) instance.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/fittrack-habit-exercise-tracker.git
    cd fittrack-habit-exercise-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Appwrite Setup:**
    This project uses Appwrite as its backend database.
    - Create a new Project in your Appwrite console.
    - Create a new Database within your project.
    - Create the following collections within your database:
        - `exercise_sections_collection_id`
        - `workouts_collection_id`
        - `habits_collection_id`
        - `habit_completions_collection_id`
    - You will need to define the attributes for each collection based on the schemas in `shared/schema.ts`.

4.  **Environment Setup:**
    Create a `.env` file in the root of the project and add the following environment variables from your Appwrite project:
    ```env
    APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
    APPWRITE_PROJECT_ID=your_project_id
    APPWRITE_API_KEY=your_api_key
    APPWRITE_DATABASE_ID=your_database_id
    ```

5.  **Start Development Server:**
    ```bash
    npm run dev
    ```

6.  **Access the Application:**
    - Open your browser to `http://localhost:5000` (This is the default Vite port, check your terminal for the exact URL).

## 🛠️ Build & Deployment Commands

### Development
```bash
npm run dev          # Starts the Vite frontend and Express backend dev servers
npm run check        # Run TypeScript type checking
```

### Production Build
```bash
npm run build        # Bundles the client and server for production
npm start           # Starts the production server (after building)
```

## 💻 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Accessible UI components
- **Wouter** - Lightweight routing
- **TanStack Query** - Data fetching and caching
- **Zod** - Schema validation

### Backend
- **Express.js** - Web framework for Node.js
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe server-side development
- **Appwrite** - Backend-as-a-Service for database and storage

### Shared
- **Zod** is used in the `shared/` directory to define a common data schema, ensuring type safety between the frontend and backend.

## 🏛️ Architecture & Data Flow

This project is a **full-stack monorepo** with a React frontend and an Express.js backend.

-   **`client/`**: A standard Vite-powered React application. It uses **TanStack Query** to fetch data from the backend API. Components are built with **Shadcn/ui** and styled with **Tailwind CSS**.
-   **`server/`**: An **Express.js** server that exposes a REST API. It serves as a middle layer that communicates with the Appwrite database.
-   **`shared/`**: Contains **Zod** schemas that are used by both the client and server to ensure data consistency and type safety across the entire application.

### Data Flow
The data flows in a simple, unidirectional loop:

1.  A React component (e.g., in `client/src/pages/`) uses a `useQuery` hook to request data from an `/api/...` endpoint.
2.  The Express server (`server/app.ts` and `server/routes.ts`) receives the request.
3.  The route handler calls a static method on the `DbHelper` class (`server/dbHelper.ts`).
4.  `DbHelper` uses the `node-appwrite` SDK to perform the actual database operation (e.g., `listDocuments`, `createDocument`) against the Appwrite instance.
5.  Data flows back through the chain to the client, where TanStack Query caches and manages the state.

> **Note on Drizzle ORM:** The codebase contains files like `drizzle.config.ts`. These are misleading artifacts from a previous development phase. The project **does not** use Drizzle or a relational database. All data persistence is handled by **Appwrite**.

## 📁 Project Structure
```
fittrack-habit-exercise-tracker/
├── client/                     # Frontend React Application (Vite)
├── server/                     # Backend Express Application
│   ├── app.ts                  # Express app configuration
│   ├── routes.ts               # API route definitions
│   ├── dbHelper.ts             # Appwrite SDK logic
│   └── ...
├── shared/                     # Zod schemas shared between client/server
│   └── schema.ts
├── drizzle.config.ts           # (Unused) Misleading Drizzle ORM config
├── vite.config.ts              # Vite build configuration
├── package.json                # Dependencies and scripts
└── README.md
```

## 🗺️ Roadmap

### Upcoming Features
- [ ] User Authentication via Appwrite
- [ ] Exercise Library with pre-built templates
- [ ] Calendar View for workout scheduling
- [ ] Personal Record (PR) tracking
- [ ] Data Export (CSV/PDF)

### Technical Improvements
- [ ] Performance Optimization: Code splitting and lazy loading
- [ ] Offline Support: PWA capabilities
- [ ] Real-time Sync: WebSocket integration for live updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
