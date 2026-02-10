# Prefab Setup Instructions

## Unity 3D Open-World Adventure Game - Prefab Configuration Guide

This guide explains how to set up all prefabs for the game. Follow these instructions carefully to ensure proper functionality.

---

## 1. PLAYER PREFAB

### Setup Steps:
1. Create an empty GameObject named "Player"
2. Add tag "Player" to it
3. Add components:
   - CharacterController (Height: 2, Radius: 0.5)
   - PlayerController script
   - PlayerInput (Unity's Input System)

### PlayerController Configuration:
- **Movement Settings:**
  - Walk Speed: 5
  - Sprint Speed: 8
  - Crouch Speed: 2.5
  - Jump Height: 2
  - Gravity: -19.62
  
- **Camera:**
  - Create child GameObject "CameraFollow"
  - Position at (0, 1.5, 0)
  - Assign to PlayerController's cameraFollow field
  
- **Ground Check:**
  - Create child GameObject "GroundCheck"
  - Position at (0, 0, 0)
  - Assign to groundCheck field
  - Set groundDistance: 0.4
  - Set groundMask to "Ground" layer

### Visual Model:
- Add your character 3D model as child
- Ensure it has an Animator component
- Setup animation controller with parameters:
  - Float: "Speed"
  - Bool: "IsGrounded", "IsCrouching", "IsSprinting"
  - Trigger: "Jump", "Death"

---

## 2. CAMERA PREFAB

### Setup Steps:
1. Create GameObject "Main Camera"
2. Add Camera component
3. Add PlayerCamera script
4. Add Cinemachine Virtual Camera (optional but recommended)

### PlayerCamera Configuration:
- Follow Distance: 5
- Follow Height: 2
- Rotation Speed: 5
- Min Pitch: -40
- Max Pitch: 80
- Collision Mask: Everything except Player

---

## 3. COMPANION PREFAB

### Setup Steps:
1. Create GameObject "Companion"
2. Add NavMeshAgent component
3. Add CompanionFollow script
4. Add CompanionEmotion script

### CompanionFollow Configuration:
- **Target:** Assign Player transform
- **Movement:**
  - Follow Distance: 3
  - Stop Distance: 2
  - Move Speed: 4
  - Run Speed: 6
  
- **Teleport:**
  - Teleport Distance: 15
  - Teleport Cooldown: 2
  - Assign Teleport VFX prefab
  - Assign Teleport SFX audio clip

### CompanionEmotion Configuration:
- Add Animator with emotion triggers
- Assign particle systems for emotions:
  - Happy Particles
  - Sad Particles
  - Surprised Particles
  
- Add AudioSource component
- Populate sound lists with audio clips

### Visual Model:
- Add companion 3D model as child
- Setup Animator with triggers for each EmotionType

---

## 4. GADGET PREFABS

### Base Gadget ScriptableObject Setup:
1. Right-click in Project > Create > Future Gadget Adventure > Gadget
2. Configure base settings:
   - Gadget ID (unique)
   - Gadget Name
   - Description
   - Icon (sprite)
   - Cooldown Time
   - Energy Cost

### Anywhere Door Gadget:
- Create ScriptableObject using "Gadget/Anywhere Door"
- Assign door prefab to prefab field
- Set cooldown: 10s
- Energy cost: 20

### Bamboo Copter Gadget:
- Create ScriptableObject using "Gadget/Bamboo Copter"
- Set duration: 15s
- Cooldown: 20s
- Energy cost: 30

### Time Cloth Gadget:
- Create ScriptableObject using "Gadget/Time Cloth"
- Set rewind duration: 5s
- Cooldown: 15s
- Energy cost: 25

### Shrinking Light Gadget:
- Create ScriptableObject using "Gadget/Shrinking Light"
- Shrink Scale: 0.2
- Duration: 10s
- Cooldown: 20s
- Energy cost: 35

---

## 5. QUEST PREFABS

### Quest ScriptableObject Setup:
1. Right-click > Create > Future Gadget Adventure > Quest > Quest
2. Fill in quest information:
   - Quest ID (unique)
   - Quest Name
   - Description
   - Quest Type (Main/Side/MiniGame)
   
3. Configure objectives:
   - Add objectives to list
   - Set Objective ID, description, type
   - Set target progress
   
4. Set rewards:
   - Experience points
   - Money
   - Items (by ID)
   - Gadget unlock (optional)

---

## 6. NPC PREFAB

### Setup Steps:
1. Create GameObject "NPC"
2. Add:
   - NavMeshAgent component
   - Capsule Collider
   - Your NPC model

### NPC Schedule Data:
- Configure in NPCScheduler:
  - NPC ID
  - Spawn Position
  - Active Start Time (0-24)
  - Active End Time (0-24)
  - Active Periods (Morning, Afternoon, etc.)

---

## 7. UI PREFABS

### Gadget Wheel Slot Prefab:
Structure:
```
GadgetSlot (Image - Background)
├── Icon (Image)
├── Name (Text)
└── CooldownOverlay (Image - Radial Fill)
```

Components:
- Button component on root
- Images for background, icon, cooldown
- Text for gadget name

### Quest Log Item Prefab:
Structure:
```
QuestItem (Button)
├── Title (Text)
├── Type (Text)
└── Icon (Image)
```

### Objective Item Prefab:
Structure:
```
ObjectiveItem
└── ObjectiveText (Text)
```

### Notification Panel:
Structure:
```
NotificationPanel (Panel)
├── Background (Image)
└── NotificationText (Text)
```

Add CanvasGroup for fade animations

### Mobile Controls:
Structure:
```
MobileControls
├── JoystickPanel
│   ├── Background (Image)
│   └── Handle (Image)
├── ButtonsPanel
│   ├── JumpButton
│   ├── SprintButton
│   ├── InteractButton
│   └── GadgetButton
└── CameraArea (Invisible Panel)
```

---

## 8. WORLD PREFABS

### Lighting Setup:
1. **Directional Light (Sun)**
   - Assign to WorldTimeSystem's sunLight
   - Intensity: Use curve in WorldTimeSystem
   
2. **Directional Light (Moon)**
   - Assign to WorldTimeSystem's moonLight
   - Intensity: Use curve in WorldTimeSystem

### Spawn Points:
Create empty GameObjects for:
- Player Spawn Points
- NPC Spawn Points
- Enemy Spawn Points (if any)
- Gadget Pickup Points

---

## 9. POOLED OBJECT PREFABS

For objects that will be pooled (bullets, particles, etc.):

1. Create the prefab normally
2. Optionally add IPooledObject interface implementation
3. Add to ObjectPooler's pool list in scene

Example Pool Configuration:
- Tag: "Particle_Star"
- Prefab: Star particle prefab
- Size: 20
- Expandable: true

---

## 10. AUDIO PREFABS

### Audio Manager Setup:
- Create empty GameObject "AudioManager"
- Add AudioManager script
- Create child AudioSources:
  - MusicSource (looping)
  - SFXSource
  - VoiceSource

---

## ASSEMBLY CHECKLIST

Before using prefabs, verify:

- [ ] All scripts are attached
- [ ] All required components are present
- [ ] All references are assigned (no "None" or "Missing")
- [ ] Layers and tags are correctly set
- [ ] Colliders are properly sized
- [ ] NavMesh is baked (for AI)
- [ ] Animation controllers are assigned
- [ ] Audio clips are assigned
- [ ] Materials are applied
- [ ] Prefab variants are created for variations

---

## TESTING PREFABS

1. Drag prefab into test scene
2. Enter Play mode
3. Verify all functionality works
4. Check Console for errors
5. Test edge cases
6. Verify on both PC and mobile (if applicable)

---

## COMMON ISSUES

**Issue:** Player falls through ground  
**Fix:** Ensure CharacterController is not too tall, ground has collider

**Issue:** Companion doesn't follow  
**Fix:** Ensure NavMesh is baked, target is assigned

**Issue:** Gadgets don't work  
**Fix:** Check energy requirements, cooldowns, GadgetController is present

**Issue:** UI doesn't show  
**Fix:** Check Canvas settings, ensure EventSystem exists

**Issue:** Animations don't play  
**Fix:** Verify Animator parameters match script expectations

---

For more help, refer to:
- SCENE_HIERARCHY.md
- TECHNICAL_DESIGN_DOCUMENT.md
- Unity's official documentation
