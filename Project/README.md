# Mango Chango 🥭 — Phase 2: Team Collaboration & Modernization

A high-performance gamified task and orchard collaboration platform built with **React 19**, **TypeScript**, **Vite**, **Zustand**, and **Tailwind CSS v4**.

**Mango Harvest** reframes team productivity into a vibrant agricultural-to-beverage journey: plant unfinished objectives as **Seeds**, nurture them through collaborative **Ripening**, and reap synchronized **Harvests** to blend custom session Tetrapacks with deep virtue analytics.

---

## 🚀 Key Highlights & Architecture

### 1. Modern Core Stack
- **Framework**: React 19 + TypeScript (strict typing for all task payloads, RBAC roles, and state).
- **State Management**: Zustand with persistent storage (`useGardenStore.ts`).
- **Server Cache & Async Sync**: TanStack Query (`@tanstack/react-query`) with optimistic updates.
- **Styling**: Tailwind CSS v4 + rich glassmorphism CSS design system.
- **Testing**: Vitest unit test suite covering virtue rankings, RBAC permissions, and board state transitions.

### 2. Real-Time Collaboration & Team Orchards
- **Team Orchards (Workspaces)**:
  - **Home Garden**: Private sanctuary for personal daily seeds and deep focus bursts.
  - **Alpha Orchard**: Cross-functional team workspace with multi-user board collaboration.
  - **Zen Grove**: Creative and research side-quest orchard.
- **Role-Based Access Control (RBAC)**:
  - **Garden Keeper (Admin)**: Full CRUD permissions on tasks, delete actions, user management, and workspace settings.
  - **Harvester (Member)**: Create, assign, move, and cross-pollinate tasks.
  - **Observer (Viewer)**: Read-only access with locked mutation safeguards.
- **Real-Time Synchronization**:
  - `BroadcastChannel` real-time synchronization across multi-tab active sessions out of the box.
- **Live Multi-User Cursors**:
  - Teammate cursors rendered live on-screen with individual role-coded colors (Maya, Leo, Nina) trailing custom water droplets during interactions.
- **Synchronized Harvest Celebration**:
  - Trigger synchronized celebration across all connected orchard clients with animated blending and 3D interactive nutrition cartons.

### 3. Multi-View Routing & Pages
- **Board View (`/`)**: Enhanced 3-column Kanban with real-time presence avatars, assignee badges, drag-and-drop, and filter bars (Assignee, Virtue, Difficulty, Search).
- **Garden Analytics Hub (`/analytics`)**:
  - Dual-Polygon Virtue Balance Radar Chart (Individual vs. Team Average comparison).
  - Sprint burn-down trajectory vs ideal velocity.
  - Hourly productivity peak-time distribution (9 AM - 6 PM).
  - Key velocity and harvest turnaround metrics.
- **Orchard Timeline (`/timeline`)**:
  - Interactive Gantt chart visualizing task "Ripening Periods" over calendar time.
  - Dependency rules and milestone markers.
- **Harvest Archive (`/archive`)**:
  - Gallery of completed session Tetrapacks.
  - Searchable by batch ID, recipe formula, date, dominant virtue, and participating team members.
  - Interactive 3D flip-card carton with comprehensive Virtue Nutrition Table.

### 4. Enhanced Gamification Mechanics
- **Team Virtues & Goals**: Collaborative objectives (e.g., *Discipline Sprint*, *Cross-Pollination Harmony Surge*) with progress bars and claimable XP rewards.
- **Cross-Pollination (Task Transfers)**: Transfer seed tasks to teammates with an attached **+25% XP bonus multiplier**.
- **Custom Blends**: Configure recipe formulas (*Focus Nectar*, *Resilience Smoothie*, *Golden Harmony Tonic*, *Vitality Splash*, *Sun Sage Reserve*) requiring specific virtue ratios.

---

## 📁 Project Structure

```text
Project/
├── src/
│   ├── api/
│   │   └── useGardenQueries.ts      # TanStack Query hooks & optimistic mutations
│   ├── components/
│   │   ├── common/
│   │   │   ├── ProfileDrawer.tsx    # Lifetime stats & personal radar drawer
│   │   │   └── SprinklerCursorOverlay.tsx # Multi-user cursor & droplet spray
│   │   ├── layout/
│   │   │   └── Navbar.tsx           # Navigation, workspace switcher & RBAC toggle
│   │   └── modals/
│   │       ├── CelebrationPortal.tsx # Synchronized harvest 3D carton reveal
│   │       ├── CrossPollinateModal.tsx # Task transfer with +25% XP bonus
│   │       ├── RecipeConfigModal.tsx # Custom blend recipe configurator
│   │       └── TaskModal.tsx        # Task creator modal with templates
│   ├── constants/
│   │   └── gardenConstants.ts       # Virtues, users, recipes, and seed data
│   ├── pages/
│   │   ├── BlendHistory.tsx         # Archive of past harvests & cartons
│   │   ├── BoardView.tsx            # Enhanced Kanban board with team filters
│   │   ├── GardenAnalytics.tsx      # Virtue radar & productivity analytics
│   │   └── OrchardTimeline.tsx      # Gantt timeline view for ripening
│   ├── store/
│   │   └── useGardenStore.ts        # Zustand state store with BroadcastChannel
│   ├── styles/
│   │   └── main.css                 # Tailwind CSS v4 & custom design tokens
│   ├── tests/
│   │   └── gardenStore.test.ts      # Vitest unit test suite
│   ├── types/
│   │   └── garden.ts                # TypeScript interfaces and domain models
│   ├── App.tsx                      # Root App component
│   └── main.tsx                     # React 19 entry point
├── index.html                       # HTML5 entry template
├── vite.config.ts                   # Vite configuration with React & Tailwind v4
├── tsconfig.json                    # TypeScript compiler configuration
└── package.json                     # Dependencies, scripts and tools
```

---

## 🛠️ Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local development server:**
   ```bash
   npm run dev
   ```

3. **Run unit tests:**
   ```bash
   npm test
   ```

4. **Build production bundle:**
   ```bash
   npm run build
   ```
