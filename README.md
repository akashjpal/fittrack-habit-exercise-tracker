# FitTrack - Habit & Exercise Tracker

A comprehensive habit and exercise tracker with detailed workout logging, streak tracking, and progress visualization. Built with modern web technologies for a seamless fitness tracking experience.

## Features

### 🏋️ Exercise Tracking
- **Section-based Organization**: Create custom exercise sections (Chest, Back, Legs, etc.)
- **Detailed Workout Logging**: Track sets, reps, weight, and exercise type for each workout
- **Weekly Volume Targets**: Set and monitor weekly set goals for each muscle group
- **Workout History**: View complete workout history with collapsible entries

### 🔥 Habit Tracking
- **Daily/Weekly Habits**: Track recurring habits with daily or weekly frequencies
- **7-Day View**: Visualize the last 7 days of habit completions
- **Streak Tracking**: Monitor your consistency with automatic streak calculations
- **Motivational Messages**: Get encouragement at streak milestones

### 📊 Progress Analytics
- **Interactive Charts**: Visualize workout volume trends over time with line and bar charts
- **Section Comparison**: Compare training volume across different muscle groups
- **Progress Metrics**: Track total sets, average sets per day, and trend analysis
- **Weekly Stats**: Monitor your weekly performance and improvements

### 🎨 Modern UI/UX
- **Clean, Goal-Focused Layout**: Minimalist design that keeps you focused on your goals
- **Dark Mode Support**: Seamless light/dark theme switching
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Real-time Updates**: Interactive components with instant feedback

## Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - High-quality component library
- **Recharts** - Data visualization library
- **Wouter** - Lightweight routing
- **TanStack Query** - Data fetching and caching
- **date-fns** - Date manipulation library

### Backend
- **Express.js** - Web framework
- **Node.js** - Runtime environment
- **In-memory Storage** - Fast data persistence for MVP

### Development
- **Vite** - Fast build tool and dev server
- **TSX** - TypeScript execution

## Getting Started

### Prerequisites
- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/akashjpal/fittrack-habit-exercise-tracker.git
cd fittrack-habit-exercise-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
fittrack-habit-exercise-tracker/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (Dashboard, Exercises, etc.)
│   │   ├── lib/           # Utility functions
│   │   └── App.tsx        # Main application component
│   └── index.html         # HTML entry point
├── server/                # Backend Express application
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage interface
│   └── app.ts             # Express app configuration
├── shared/                # Shared types and schemas
│   └── schema.ts          # Data models
└── package.json           # Dependencies and scripts
```

## Usage

### Dashboard
View your overall progress including:
- Current streak
- Weekly volume completion
- Progress by section

### Exercises
- Add new exercise sections
- Log workouts with detailed metrics
- View workout history

### Habits
- Create daily or weekly habits
- Track completions over the last 7 days
- Monitor streaks

### Progress
- View interactive charts showing volume trends
- Compare performance across sections
- Track key metrics and improvements

## Roadmap

- [ ] Database integration (PostgreSQL)
- [ ] User authentication
- [ ] Exercise templates and quick-log presets
- [ ] Calendar view for workout scheduling
- [ ] Personal records tracking
- [ ] Data export (CSV/PDF)
- [ ] Mobile app (React Native)
- [ ] Social features and community challenges

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Design inspired by modern fitness apps (Strong, Hevy, Apple Fitness)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Built with ❤️ by the Replit Agent

---

**Start your fitness journey today with FitTrack!** 🚀
