# Scene Hierarchy Structure

## Unity 3D Open-World Adventure Game - Scene Organization Guide

This document outlines the recommended scene hierarchy for optimal organization and performance.

---

## MAIN GAME SCENE (MainGame.unity)

```
Scene: MainGame
│
├── === MANAGERS === (DontDestroyOnLoad)
│   ├── GameManager
│   │   ├── SceneTransitionManager
│   │   ├── SaveLoadManager
│   │   ├── QuestManager
│   │   ├── InventoryManager
│   │   ├── AudioManager
│   │   └── InputManager
│   │
│   ├── ObjectPooler
│   └── PerformanceOptimizer
│
├── === WORLD ===
│   ├── Environment
│   │   ├── Terrain
│   │   ├── Buildings
│   │   │   ├── School
│   │   │   ├── Houses
│   │   │   └── Shops
│   │   ├── Streets
│   │   ├── Park
│   │   └── Props
│   │
│   ├── Lighting
│   │   ├── Directional Light (Sun)
│   │   ├── Directional Light (Moon)
│   │   ├── WorldTimeSystem
│   │   └── Reflection Probes
│   │
│   ├── Navigation
│   │   └── NavMesh (baked, not visible)
│   │
│   └── NPCs
│       ├── NPCScheduler
│       └── SpawnPoints
│           ├── NPC_School_01
│           ├── NPC_Park_01
│           └── NPC_Street_01
│
├── === PLAYER ===
│   ├── Player
│   │   ├── CharacterModel
│   │   ├── CameraFollow
│   │   └── GroundCheck
│   │
│   ├── PlayerCamera
│   │
│   └── Companion
│       └── CompanionModel
│
├── === GAMEPLAY SYSTEMS ===
│   ├── GadgetController
│   ├── GadgetManager
│   └── QuestTriggers
│       ├── QuestTrigger_MainQuest01
│       └── QuestTrigger_SideQuest01
│
├── === UI ===
│   ├── Canvas_MainHUD
│   │   ├── HUDManager
│   │   ├── HealthPanel
│   │   │   └── HealthBar
│   │   ├── EnergyPanel
│   │   │   └── StaminaBar
│   │   ├── QuestTracker
│   │   │   └── QuestUI (tracker part)
│   │   ├── GadgetDisplay
│   │   │   ├── CurrentGadgetIcon
│   │   │   └── CooldownIndicator
│   │   ├── TimeDisplay
│   │   ├── LocationDisplay
│   │   ├── Minimap
│   │   └── NotificationPanel
│   │       └── NotificationText
│   │
│   ├── Canvas_GadgetWheel
│   │   ├── GadgetWheelUI
│   │   ├── WheelBackground
│   │   └── GadgetSlotsParent
│   │
│   ├── Canvas_QuestLog
│   │   ├── QuestUI (full log)
│   │   ├── TabButtons
│   │   ├── ActiveQuestsList
│   │   ├── AvailableQuestsList
│   │   ├── CompletedQuestsList
│   │   └── QuestDetailPanel
│   │
│   ├── Canvas_Mobile
│   │   ├── MobileControls
│   │   ├── VirtualJoystick
│   │   └── ActionButtons
│   │
│   └── EventSystem
│
├── === AUDIO ===
│   ├── MusicSource
│   ├── AmbienceSource
│   └── AudioManager
│
└── === POST PROCESSING ===
    ├── Post-process Volume
    └── Camera Effects

```

---

## SCENE BREAKDOWN

### 1. MANAGERS HIERARCHY

**Purpose:** Core game systems that persist across scenes

**Organization:**
```
GameManager (Root)
├── Child Managers (as components or children)
├── DontDestroyOnLoad on root
└── Singleton pattern for access
```

**Setup:**
1. Create empty GameObject "GameManager"
2. Add GameManager script
3. Add all manager components or children
4. Mark DontDestroyOnLoad in GameManager.Awake()

---

### 2. WORLD HIERARCHY

**Purpose:** All environmental and world elements

**Environment Structure:**
```
Environment
├── Terrain (Unity Terrain or mesh)
├── Buildings (folder for organization)
│   ├── Building_School
│   ├── Building_House_01
│   └── Building_Shop_01
├── Streets
│   ├── Street_Main
│   └── Street_Side_01
├── Park
│   ├── Trees
│   ├── Benches
│   └── Playground
└── Props
    ├── StreetLights
    ├── TrafficSigns
    └── Decorations
```

**Lighting Structure:**
```
Lighting
├── Directional Light (Sun) - Tag: "MainLight"
├── Directional Light (Moon) - Tag: "MoonLight"
├── WorldTimeSystem (script only)
└── Reflection Probes (if needed)
```

**Navigation:**
- Bake NavMesh in Unity
- Mark walkable surfaces
- Add NavMesh obstacles for buildings

**NPCs:**
```
NPCs
├── NPCScheduler (component)
└── SpawnPoints (empty GameObjects)
```

---

### 3. PLAYER HIERARCHY

**Structure:**
```
Player (Root GameObject with tag "Player")
├── CharacterModel (visual mesh + Animator)
├── CameraFollow (empty transform for camera positioning)
└── GroundCheck (empty transform for ground detection)

PlayerCamera (Separate GameObject)
└── Main Camera (child if using Cinemachine)

Companion
└── CompanionModel (mesh + Animator)
```

**Important:**
- Player and Companion are separate root objects
- Camera is separate for flexibility
- All have independent transforms

---

### 4. GAMEPLAY SYSTEMS HIERARCHY

**Structure:**
```
Gameplay
├── GadgetController (attach to Player)
├── GadgetManager (scene singleton)
└── QuestTriggers
    ├── Trigger_Quest01 (Collider + trigger script)
    └── Trigger_Quest02
```

**Quest Triggers:**
- BoxCollider with "Is Trigger" checked
- Layer: "Triggers"
- Custom script to detect player entry

---

### 5. UI HIERARCHY

**Canvas Organization:**

Use **multiple canvases** for performance:
1. **Canvas_MainHUD** - Always visible HUD elements
2. **Canvas_GadgetWheel** - Overlay, shown on demand
3. **Canvas_QuestLog** - Overlay, shown on demand  
4. **Canvas_Mobile** - Mobile-only controls

**Canvas Settings:**
- Render Mode: Screen Space - Overlay
- Canvas Scaler: Scale With Screen Size
  - Reference Resolution: 1920x1080
  - Match: 0.5 (balance width/height)
  
**Sorting Orders:**
- MainHUD: 0
- GadgetWheel: 10
- QuestLog: 20
- Mobile: 5
- Notifications: 100

**MainHUD Structure:**
```
Canvas_MainHUD
├── LeftPanel
│   ├── HealthBar
│   └── EnergyBar
├── TopPanel
│   ├── TimeDisplay
│   └── LocationDisplay
├── RightPanel
│   ├── Minimap
│   └── CurrentGadget
├── BottomLeft
│   └── QuestTracker
└── Notifications (center)
```

---

## LAYER ORGANIZATION

Recommended layers:
```
0  - Default
1  - TransparentFX
2  - Ignore Raycast
3  - (Unused)
4  - Water
5  - UI
6  - (Unused)
7  - (Unused)
8  - Player
9  - Companion
10 - NPC
11 - Ground
12 - Buildings
13 - Props
14 - Triggers
15 - Gadgets
```

**Layer Collision Matrix:**
- Player doesn't collide with Companion
- Triggers only detect Player
- NPCs collide with Ground and Buildings

---

## TAG ORGANIZATION

Essential tags:
```
- Player
- Companion
- MainCamera
- GameController
- NPC
- Enemy (if applicable)
- Ground
- Interactable
- QuestItem
- SavePoint
```

---

## SCENE LOADING STRATEGY

### Multi-Scene Setup:

**Persistent Scene:** (always loaded)
```
_Persistent
└── GameManager (DontDestroyOnLoad)
```

**Game Scenes:** (loaded additively)
```
- MainMenu
- Town_Central
- Town_School
- Town_Park
- PlayerHouse
```

**Loading Flow:**
1. Bootstrap scene loads first
2. Loads _Persistent additively
3. Loads game scene additively
4. Unloads previous game scene when transitioning

---

## PREFAB ORGANIZATION IN HIERARCHY

**When to use prefabs:**
- NPCs (spawned dynamically)
- Gadget effects
- UI panels (reusable)
- Pooled objects
- Environmental props (repeated)

**When to use scene objects:**
- Unique buildings
- Terrain
- Main player
- Lighting
- Managers

---

## PERFORMANCE BEST PRACTICES

### Hierarchy Optimization:

1. **Group static objects:**
   ```
   StaticEnvironment (mark Static)
   ├── Buildings (all static)
   └── Props (all static)
   ```

2. **Separate dynamic objects:**
   ```
   DynamicObjects
   ├── NPCs
   └── MovableProps
   ```

3. **Use parent empty objects:**
   - Keeps hierarchy clean
   - Easy to toggle groups
   - Better for scene management

4. **Limit hierarchy depth:**
   - Avoid more than 5-6 levels deep
   - Flatten where possible

---

## DEBUGGING HIERARCHY

Add debug objects (disable in builds):
```
_Debug
├── FPS Counter
├── Profiler Display
└── Developer Console
```

Use `#if UNITY_EDITOR` to hide in builds.

---

## SCENE LOADING CHECKLIST

Before building scene:
- [ ] All managers are present
- [ ] Player and Camera are set up
- [ ] NavMesh is baked
- [ ] Lighting is configured
- [ ] UI Canvas settings are correct
- [ ] Audio sources are assigned
- [ ] All required prefabs are in scene
- [ ] Layers and tags are set correctly
- [ ] Static objects are marked
- [ ] Occlusion culling is baked (if used)
- [ ] No missing script references
- [ ] All colliders are properly sized

---

For more information, refer to:
- PREFAB_SETUP.md
- TECHNICAL_DESIGN_DOCUMENT.md
