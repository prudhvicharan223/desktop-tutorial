# 🎮 Neo Gadget Town

A production-ready 3D open-world browser game with anime-futuristic aesthetics, built with React, Three.js, and Cannon-es.

## Overview

Neo Gadget Town is a browser-based 3D adventure game set in a futuristic Japanese town. Explore a vibrant world, use unique gadgets, complete quests, and interact with your AI robot companion.

## Tech Stack

- **React 18** - UI framework
- **Vite 5** - Build tool and dev server
- **Three.js 0.160** - 3D rendering engine
- **Cannon-es** - Physics engine
- **Zustand** - State management
- **TailwindCSS 3** - UI styling

## Project Structure

```
neo-gadget-town/
├── index.html                    # Entry HTML with canvas
├── package.json                  # Dependencies and scripts
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # TailwindCSS theme
├── postcss.config.js            # PostCSS plugins
│
├── src/
│   ├── main.jsx                 # React entry point
│   ├── App.jsx                  # Main component & game loop
│   ├── index.css                # Global styles
│   │
│   ├── engine/
│   │   ├── GameEngine.js        # Three.js renderer & scene management
│   │   └── PhysicsEngine.js     # Cannon-es physics wrapper
│   │
│   ├── player/
│   │   ├── PlayerController.js  # Movement, jump, sprint, stamina
│   │   └── CameraController.js  # Orbit camera with zoom
│   │
│   ├── ai/
│   │   └── CompanionAI.js       # Robot companion with moods
│   │
│   ├── gadgets/
│   │   └── GadgetManager.js     # 4 unique gadgets with cooldowns
│   │
│   ├── quests/
│   │   └── QuestManager.js      # Quest system with objectives
│   │
│   ├── world/
│   │   └── WorldGenerator.js    # Procedural world creation
│   │
│   ├── store/
│   │   └── gameStore.js         # Zustand global state
│   │
│   └── ui/
│       ├── HUD.jsx              # Health, stamina, quest tracker
│       ├── GadgetWheel.jsx      # Circular gadget selector
│       ├── MobileControls.jsx   # Virtual joystick & buttons
│       └── Tutorial.jsx         # New player onboarding
│
├── QUICKSTART.md                # Quick start guide
├── README.md                    # This file
├── FEATURES.md                  # Technical deep-dive
├── DEVELOPMENT.md               # Developer extension guide
└── PROJECT_SUMMARY.md           # Project overview
```

## Getting Started

```bash
cd neo-gadget-town
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

## Features

### 🌍 Open World
- Futuristic Japanese town with school, park, river, houses, and gadget lab
- Procedurally generated buildings and decorations
- Dynamic day/night cycle with lighting changes

### 🕹️ Player Controller
- Third-person WASD movement
- Jump and sprint with stamina system
- Physics-based collisions

### 📷 Camera System
- Smooth orbit camera
- Mouse drag rotation and scroll zoom
- Two-finger touch rotation on mobile

### 🤖 Robot Companion
- AI buddy that follows the player
- Mood-based glow colors (happy, curious, alert, sleepy)
- Bobbing idle animation

### 🔧 4 Unique Gadgets
1. **Anywhere Door** 🚪 - Teleport to random locations
2. **Bamboo Copter** 🚁 - Fly through the air
3. **Shrinking Light** 🔦 - Shrink to tiny size
4. **Time Cloth** 🧣 - Become invisible

### 📜 Quest System
- Story quests with sequential progression
- Exploration quests (visit locations)
- Collection quests (gather crystals)
- Objective tracking with notifications

### 📱 Mobile Support
- Virtual joystick for movement
- Touch action buttons
- Responsive UI for all screen sizes

## Controls

### Desktop
| Key | Action |
|-----|--------|
| W/A/S/D | Move |
| Space | Jump |
| Shift | Sprint |
| Q | Toggle gadget wheel |
| Right-click drag | Rotate camera |
| Scroll | Zoom |

### Mobile
| Touch | Action |
|-------|--------|
| Joystick (left) | Move |
| Jump button | Jump |
| Run button | Sprint toggle |
| Two-finger drag | Rotate camera |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
```

## License

MIT
