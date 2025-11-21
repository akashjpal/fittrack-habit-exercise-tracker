# Habit & Exercise Tracker - Design Guidelines

## Design Approach

**System**: Hybrid of Material Design (data visualization) + Fitness App Patterns (Strong, Hevy, Streaks, Apple Fitness)
**Rationale**: Utility-focused productivity tool requiring efficient data entry, clear metric display, and motivational engagement through visual progress tracking.

## Core Design Principles

1. **Data-First Hierarchy**: Progress metrics and achievements prominently displayed
2. **Efficient Input**: Quick workout logging with minimal friction
3. **Visual Motivation**: Charts, streaks, and progress indicators drive engagement
4. **Scannable Organization**: Section-based structure with clear visual grouping

---

## Typography

**Primary Font**: Inter (Google Fonts)
**Secondary/Display**: DM Sans (for metrics and numbers)

- Page Headers: text-3xl/4xl, font-bold
- Section Titles: text-xl/2xl, font-semibold
- Metric Numbers: text-4xl/5xl, font-bold, DM Sans
- Body Text: text-base, font-medium
- Labels/Captions: text-sm, font-medium, uppercase tracking

---

## Layout System

**Spacing Units**: Consistent use of 4, 6, 8, 12, 16 (tailwind: p-4, gap-6, mb-8, py-12, space-y-16)

**Grid Structure**:
- Dashboard: 3-column grid on desktop (lg:grid-cols-3), 1-column mobile
- Exercise Sections: 2-column cards (md:grid-cols-2)
- Workout Log Entries: Single column list with grouped dates
- Container max-width: max-w-7xl

---

## Component Library

### Navigation
- Sticky top header with app logo, navigation tabs (Dashboard, Habits, Exercises, Progress)
- Bottom navigation on mobile (fixed, icons + labels)
- Active state: Bold text with subtle indicator

### Dashboard Components

**Streak Card**:
- Large centered number (current streak days)
- Fire emoji 🔥 icon alongside
- Subtitle: "Day streak" or motivational message
- Compact size: Takes 1/3 of dashboard row

**Weekly Volume Card**:
- Circular progress indicator showing weekly set completion
- Large percentage in center
- "12/15 sets completed this week" label below

**Section Progress Cards**:
- Exercise section name (e.g., "Chest", "Back")
- Horizontal progress bar (completed sets / target)
- "8/12 sets" counter
- Last workout timestamp
- Grid of 2-3 cards per row

### Exercise Section Manager

**Section Card**:
- Header: Section name + weekly target sets
- "Add Exercise" button (prominent, full-width in card)
- List of recent workouts with collapsible details
- Each workout: Date, exercise type, sets × reps @ weight

**Workout Entry Form**:
- Modal or slide-in panel
- Fields: Exercise type (dropdown), Sets (number), Reps (number), Weight (number + unit selector)
- Quick-add buttons for common rep/weight combinations
- "Log Workout" primary button

### Progress Dashboard

**Chart Components**:
- Line chart: Weekly volume over time (8-12 week view)
- Bar chart: Sets per section comparison
- Use Chart.js or Recharts library
- Muted grid lines, bold data lines
- Tooltips on hover with exact values

**Filter Controls**:
- Date range selector (dropdown: Last 7 days, 30 days, 3 months)
- Section filter (checkboxes: Chest, Back, Legs, etc.)
- Compact, top-aligned above charts

### Habit Tracker

**Habit List**:
- Each habit: Checkbox grid for last 7 days
- Habit name on left
- 7-day completion dots/checkboxes
- Streak counter on right
- Motivational message when streak milestone hit (7, 30, 100 days)

**Add Habit Form**:
- Simple inline form or modal
- Habit name, frequency (daily/weekly), optional reminder time

### Motivational Elements

**Messages**:
- Display on streak milestones: "🎉 7-day streak! Keep it up!"
- Weekly completion: "💪 You hit your target! Great work!"
- Position: Toast notifications (top-right) or inline in cards

**Visual Indicators**:
- Checkmark animations on completion
- Progress bar fills with smooth transitions
- Subtle confetti effect on milestone achievements (sparingly)

---

## Icons

**Library**: Heroicons (via CDN)
**Usage**:
- Navigation: Chart, Calendar, Dumbbell, User icons
- Actions: Plus, Check, X, ChevronDown
- Metrics: Fire (🔥), Trophy (🏆), Target (🎯) - use emoji for personality
- Size: 20px (h-5 w-5) for inline, 24px (h-6 w-6) for emphasis

---

## Data Visualization

**Chart Style**:
- Clean, minimal axes
- Smooth curves for line charts
- Subtle drop shadows on bars
- Data points highlighted on hover
- Responsive scaling for mobile

**Progress Bars**:
- Rounded ends (rounded-full)
- Height: h-2 to h-3
- Animated fill on load (transition-all duration-500)

---

## Forms & Inputs

**Input Fields**:
- Border: border-2, rounded-lg
- Padding: px-4 py-3
- Focus state: Prominent border change
- Number inputs: Large, easy-to-tap stepper buttons (+ / -)

**Buttons**:
- Primary: Full rounded (rounded-lg), py-3 px-6, font-semibold
- Secondary: Outlined style, same sizing
- Icon buttons: Square, p-2, rounded-md
- Hover: Slight scale transform (scale-105)

---

## Accessibility

- All interactive elements: min-height 44px (touch target)
- Form labels: Always visible, not placeholder-only
- Chart data: Available in table format toggle
- Keyboard navigation: Tab order follows visual hierarchy
- Screen reader labels on icon-only buttons

---

## Images

**Not Required**: This is a data-driven application dashboard. Focus on charts, metrics, and progress indicators instead of hero images or decorative photography.

---

## Animations

**Use Sparingly**:
- Progress bar fills: 500ms ease-out
- Completion checkmarks: Scale-in animation (300ms)
- Page transitions: Subtle fade (200ms)
- Avoid: Scroll-triggered animations, complex parallax