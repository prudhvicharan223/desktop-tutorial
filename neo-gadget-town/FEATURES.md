# 🔧 Technical Features Deep-Dive

## Architecture Overview

Neo Gadget Town follows a modular architecture where each game system is independently encapsulated and communicates through well-defined interfaces.

### Render Pipeline

1. **GameEngine** manages the Three.js `WebGLRenderer`, `Scene`, and `Camera`
2. Each frame, the engine calls `update(dt)` on all registered systems
3. After all updates, the engine renders the scene
4. Delta time is capped at 50ms to prevent physics instability

### Physics Integration

- **Cannon-es** runs in a fixed timestep (1/60s) with up to 3 sub-steps
- Physics bodies are linked to Three.js meshes via UUID mapping
- Position and rotation are synced from physics to rendering each frame
- Static bodies (buildings, ground) have mass = 0
- Dynamic bodies (player) have realistic mass values

### State Management

Zustand provides a centralized store that bridges the imperative game engine with React's declarative UI:

```
Game Loop (imperative) → Zustand Store → React UI (reactive)
```

State updates from the game loop are throttled to prevent excessive React re-renders.

### Day/Night Cycle

The cycle is driven by a single `t` parameter (0 to 1):
- **0.0** - Midnight
- **0.25** - Sunrise
- **0.5** - Noon
- **0.75** - Sunset

The system updates:
- Sun directional light position and intensity
- Ambient light intensity
- Sky background color (lerp between day/night colors)
- Fog color

### Gadget System

Each gadget has:
- **Cooldown timer** - prevents spam activation
- **Duration** - how long the effect lasts (0 = instant)
- **Visual effects** - Three.js meshes and lights
- **Gameplay mechanics** - physics modifications, player transformations

Gadgets are activated via the UI wheel, which dispatches a `CustomEvent` that the game loop handles.

### Quest System

Quests follow a linear progression:
1. Story quests unlock sequentially
2. Exploration quests unlock after story completion
3. Collection quests run in parallel

Objectives are completed via:
- **Proximity checks** - entering a location radius
- **Action triggers** - using specific gadgets
- **Collection** - picking up crystals

### Mobile Architecture

Mobile detection uses user agent and viewport width. When mobile is detected:
- Virtual joystick dispatches normalized (-1 to 1) movement events
- Action buttons dispatch discrete events (jump, sprint toggle)
- Camera rotation uses two-finger touch gestures

## Performance Considerations

- **Pixel ratio** capped at 2x to prevent GPU overload on high-DPI mobile
- **Shadow maps** use PCF soft shadows at 2048x2048
- **Fog** reduces draw distance for performance
- **Object pooling** for crystal effects
- **Delta time capping** prevents physics explosion on tab switches
- **Manual chunks** in Vite config for optimal bundle splitting
