# 🥭 The Mango Harvest — Gamified Kanban Board

A state-of-the-art, gamified task management web application built with **React 19**, **Vite**, **Zustand**, **GSAP**, **Framer Motion**, and **@dnd-kit**.

![The Mango Harvest Banner](public/vite.svg)

---

## 🌟 Highlights & Features

- 📜 **Interactive Scroll-Driven Narrative**: An immersive GSAP & ScrollTrigger introduction telling the story of task ripening, from raw seeds to golden harvested mangoes.
- 📋 **Gamified Kanban Board**: 3 distinct ripening stages (`Backlog / Seeds`, `In Progress / Ripening`, `Done / Harvested`) with drag-and-drop controls powered by `@dnd-kit`.
- ⚡ **Virtue & Upgrade System**: Dynamic XP calculation, virtue weights (*Intellect*, *Harmony*, *Discipline*, *Resilience*), and harvest level leveling.
- 🎨 **Rich Aesthetics & Glassmorphic UI**: Sleek dark-mode palette (`slate-950`), custom CSS animations, micro-interactions, floating particle effects, and animated charts powered by `recharts`.
- 🏆 **Celebration Portal**: Trigger celebratory blend animations upon board completion, calculating session yields, harvest efficiency, and virtue gains.
- 📦 **Nutritional Carton Label**: A playful 3D-flipped product label summarizing harvest statistics and task metrics.

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Core Framework** | React 19, Vite 8, JavaScript (ES Next) |
| **State Management** | Zustand (with selector middleware) |
| **Drag & Drop** | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| **Animations** | GSAP 3 (ScrollTrigger), Framer Motion |
| **Styling** | Tailwind CSS v4, Custom Vanilla CSS Design System |
| **Data Visualization** | Recharts, Lucide Icons |
| **Code Quality** | Oxlint |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `^18.0.0` or higher
- npm `^9.0.0` or higher

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/icarus-77/frontend.git
   cd frontend/Project
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Run Linter**:
   ```bash
   npm run lint
   ```

---

## 📁 Project Structure

```text
Project/
├── public/
├── src/
│   ├── components/
│   │   ├── BlenderSVG.jsx       # Custom SVG vector graphics for blender
│   │   ├── Board.jsx            # Main Kanban board container
│   │   ├── CartonLabel.jsx      # Interactive 3D nutrition facts carton
│   │   ├── CelebrationPortal.jsx# Harvest celebration overlay
│   │   ├── Column.jsx           # Drop target column component
│   │   ├── ProfileStats.jsx     # User statistics modal & graphs
│   │   ├── ScrollStory.jsx      # ScrollTrigger landing page experience
│   │   └── TaskCard.jsx         # Draggable task card with virtue badges
│   ├── store/
│   │   └── useStore.js          # Main Zustand global state & logic
│   ├── virtues.js               # Virtue calculations & level algorithms
│   ├── App.jsx                  # Root view navigator (Landing vs Board)
│   ├── index.css                # Global design system & custom utilities
│   └── main.jsx                 # React DOM root entry
├── index.html                   # HTML entry point with meta & Google Fonts
├── package.json
└── vite.config.js
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
