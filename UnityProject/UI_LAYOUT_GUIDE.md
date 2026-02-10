# UI Layout Guide

## Unity 3D Open-World Adventure Game - Complete UI/UX Design Guide

Comprehensive guide for setting up all UI elements with exact specifications.

---

## TABLE OF CONTENTS
1. [Canvas Setup](#canvas-setup)
2. [HUD Elements](#hud-elements)
3. [Gadget Wheel](#gadget-wheel)
4. [Quest UI](#quest-ui)
5. [Mobile Controls](#mobile-controls)
6. [Menus](#menus)
7. [Responsive Design](#responsive-design)

---

## CANVAS SETUP

### Base Canvas Configuration

**Canvas Component:**
```
Render Mode: Screen Space - Overlay
Pixel Perfect: No (for performance)
Sort Order: See below

Canvas Scaler:
  UI Scale Mode: Scale With Screen Size
  Reference Resolution: 1920 x 1080
  Screen Match Mode: Match Width Or Height
  Match: 0.5 (balanced)
  Reference Pixels Per Unit: 100
```

### Multiple Canvas Structure

Create separate canvases for performance:

1. **Canvas_MainHUD** (Sort Order: 0)
   - Always visible elements
   - Health, Energy, Time, Location
   - Quest Tracker
   - Current Gadget

2. **Canvas_GadgetWheel** (Sort Order: 10)
   - Radial gadget selector
   - Only visible when activated

3. **Canvas_QuestLog** (Sort Order: 20)
   - Full quest menu
   - Only visible when opened

4. **Canvas_Mobile** (Sort Order: 5)
   - Virtual joystick
   - Touch controls
   - Mobile-only

5. **Canvas_Notifications** (Sort Order: 100)
   - Popup messages
   - Companion dialogue
   - System notifications

---

## HUD ELEMENTS

### 1. Health Bar

**Position:** Top-Left
**Anchor:** Min(0, 1), Max(0, 1) - Top-Left corner
**Position:** X=20, Y=-20
**Size:** 250 x 30

**Structure:**
```
HealthPanel (Panel)
├── Background (Image - dark semi-transparent)
├── HealthFill (Image - green to red gradient)
│   └── Image Type: Filled
│       Fill Method: Horizontal
│       Fill Origin: Left
├── DamageFill (Image - red, behind HealthFill)
└── HealthText (Text)
    └── "100/100"
```

**Colors:**
```
Healthy: #4CAF50 (green)
Warning: #FFEB3B (yellow) - below 50%
Critical: #F44336 (red) - below 25%
Background: #000000 50% alpha
```

**Fonts:**
```
Font: Arial or similar
Size: 18
Color: White
Outline: 2px black
```

### 2. Energy/Stamina Bar

**Position:** Top-Left (below Health)
**Anchor:** Min(0, 1), Max(0, 1)
**Position:** X=20, Y=-60
**Size:** 250 x 25

**Structure:**
```
EnergyPanel
├── Background
├── EnergyFill (Image - cyan gradient)
│   └── Fill Type: Horizontal
└── EnergyText
    └── "100/100"
```

**Colors:**
```
Normal: #00BCD4 (cyan)
Low: #FFC107 (amber) - below 20%
Depleted: #F44336 (red)
```

### 3. Quest Tracker

**Position:** Top-Right
**Anchor:** Min(1, 1), Max(1, 1) - Top-Right
**Position:** X=-20, Y=-20
**Size:** 300 x 200

**Structure:**
```
QuestTrackerPanel
├── Background (semi-transparent)
├── QuestTitle (Text)
│   └── "Main Quest: Find the Lost Gadget"
├── QuestDescription (Text)
│   └── "Talk to Professor in the lab"
└── ObjectivesList (Vertical Layout Group)
    ├── Objective1 (Text)
    │   └── "[X] Talk to Professor"
    └── Objective2 (Text)
        └── "[ ] Find Lab Key (0/1)"
```

**Layout:**
```
Background Padding: 10px all sides
Spacing between objectives: 5px
Font Size: 16 (title), 14 (objectives)
Color: White with black outline
```

### 4. Time & Location Display

**Position:** Top-Center
**Anchor:** Min(0.5, 1), Max(0.5, 1)
**Pivot:** (0.5, 1)
**Size:** 200 x 50

**Structure:**
```
TopCenterPanel
├── TimeDisplay (Text)
│   └── "14:35"
├── DayDisplay (Text)
│   └── "Day 5"
└── LocationDisplay (Text)
    └── "Miracle Town - School"
```

**Styling:**
```
Font: Bold
Size: 20 (time), 16 (location)
Shadow: 2px offset
```

### 5. Current Gadget Display

**Position:** Bottom-Right
**Anchor:** Min(1, 0), Max(1, 0)
**Position:** X=-20, Y=20
**Size:** 100 x 100

**Structure:**
```
CurrentGadgetPanel
├── GadgetIcon (Image - 80x80)
├── CooldownOverlay (Image - Radial Fill)
│   └── Fill Method: Radial 360
│       Fill Origin: Top
├── GadgetName (Text)
└── Hotkey (Text)
    └── "Press E"
```

**Cooldown Animation:**
```
When on cooldown:
  - Overlay fills from top clockwise
  - Icon is grayed out (50% alpha)
  - Shows remaining time text
```

### 6. Minimap

**Position:** Bottom-Left
**Anchor:** Min(0, 0), Max(0, 0)
**Position:** X=20, Y=20
**Size:** 200 x 200

**Structure:**
```
MinimapPanel
├── Background (circular mask)
├── MinimapCamera (RenderTexture)
├── PlayerIcon (Image - center)
├── QuestMarkers (dynamic)
└── NPCMarkers (dynamic)
```

**Setup:**
```
Create separate camera:
  - Orthographic
  - Top-down view
  - Render to texture
  - Culling mask: Minimap layer only
  
Circular mask:
  - Use Image component
  - Type: Filled
  - Circular sprite
```

---

## GADGET WHEEL

### Layout Specifications

**Position:** Center Screen
**Anchor:** Center (0.5, 0.5)
**Size:** 400 x 400

**Structure:**
```
GadgetWheelPanel
├── Background (Image - radial gradient)
├── CenterInfo (Panel)
│   ├── SelectedGadgetIcon (Image)
│   ├── GadgetName (Text)
│   └── GadgetDescription (Text)
└── GadgetSlotsParent (Empty)
    ├── Gadget1 (positioned via code)
    ├── Gadget2
    ├── Gadget3
    ├── Gadget4
    └── Gadget5
```

### Individual Gadget Slot

**Size:** 80 x 80
**Position:** Calculated in circle (radius 150px)

**Structure:**
```
GadgetSlot (Button)
├── Background (Image)
├── Icon (Image - 64x64)
├── CooldownOverlay (Image - Radial Fill)
├── Name (Text)
└── Hotkey (Text)
```

**States:**
```
Normal:
  - Background: Semi-transparent white
  - Scale: 1.0
  
Hovered/Selected:
  - Background: Yellow
  - Scale: 1.2
  - Transition: 0.1s
  
On Cooldown:
  - Icon: Grayscale
  - Overlay: Visible
  - Background: Dark gray
```

**Positioning Formula:**
```csharp
float angle = (360f / slotCount) * index;
float radians = angle * Mathf.Deg2Rad;
float x = Mathf.Cos(radians) * radius;
float y = Mathf.Sin(radians) * radius;
```

---

## QUEST UI

### Quest Log Panel

**Size:** 80% of screen (1536 x 864 at 1920x1080)
**Position:** Center
**Background:** Semi-transparent dark (80% alpha)

**Structure:**
```
QuestLogPanel
├── HeaderPanel
│   ├── Title (Text) - "Quest Log"
│   ├── CloseButton (Button)
│   └── TabButtons
│       ├── ActiveTab
│       ├── AvailableTab
│       └── CompletedTab
├── QuestListPanel (Scroll View)
│   ├── Viewport
│   │   └── Content (Vertical Layout)
│   │       ├── QuestItem1
│   │       ├── QuestItem2
│   │       └── ...
│   └── Scrollbar
└── QuestDetailPanel
    ├── QuestTitle
    ├── QuestType
    ├── QuestDescription
    ├── ObjectivesList
    ├── RewardsPanel
    └── ActionButtons
        ├── AcceptButton
        ├── AbandonButton
        └── TrackButton
```

### Quest Item Template

**Size:** 400 x 80
**Structure:**
```
QuestItem (Button)
├── Background
├── IconImage (64x64)
├── InfoPanel
│   ├── TitleText
│   ├── TypeText
│   └── ProgressBar
└── ArrowIcon (">")
```

**Styling:**
```
Background:
  - Normal: #212121
  - Hovered: #424242
  - Selected: #616161
  
Border: 2px #FFEB3B (main quests)
        2px #03A9F4 (side quests)
```

---

## MOBILE CONTROLS

### Virtual Joystick

**Position:** Bottom-Left
**Anchor:** Min(0, 0), Max(0, 0)
**Position:** X=150, Y=150
**Size:** 200 x 200

**Structure:**
```
JoystickPanel
├── Background (Image - circular, alpha 30%)
│   └── Size: 200x200
└── Handle (Image - circular)
    └── Size: 80x80
```

**Behavior:**
```
Background: Fixed position (or dynamic on touch)
Handle: Moves within background (max radius 60px)
Dead Zone: 10px from center
```

**Visual:**
```
Background: White circle, 30% alpha
Handle: White circle, 60% alpha
Border: 2px white outline
```

### Action Buttons

**Position:** Bottom-Right
**Anchor:** Min(1, 0), Max(1, 0)
**Sizes:** 80 x 80 each

**Layout:**
```
ButtonsPanel
├── JumpButton (X=-100, Y=180)
├── GadgetButton (X=-100, Y=100)
├── SprintButton (X=-180, Y=140)
└── InteractButton (X=-20, Y=140)
```

**Button Template:**
```
ActionButton (Button)
├── Background (Image - circular)
├── Icon (Image - 48x48)
└── Label (Text)
```

**Styling:**
```
Background: Semi-transparent white
Pressed: Full white, scale 0.9
Icon: White symbols
Shadow: 4px blur
```

### Camera Touch Area

**Position:** Right side of screen
**Anchor:** Min(0.5, 0), Max(1, 1)
**Size:** Fills right half

**Structure:**
```
CameraTouchArea (Invisible Panel)
└── Just for touch detection, no visuals
```

---

## MENUS

### Main Menu

**Full Screen**

**Structure:**
```
MainMenuCanvas
├── Background (Image or Video)
├── Logo (Image - top center)
├── MenuButtons (Vertical Layout)
│   ├── NewGameButton
│   ├── ContinueButton
│   ├── SettingsButton
│   └── QuitButton
└── VersionText (bottom-right)
```

**Button Specs:**
```
Size: 300 x 60
Font Size: 24
Spacing: 20px
Color: White with #212121 background
Hover: #FFEB3B background
```

### Pause Menu

**Size:** 600 x 400
**Position:** Center
**Background:** Dark blur effect

**Structure:**
```
PauseMenuPanel
├── Title - "Paused"
├── ButtonsList
│   ├── ResumeButton
│   ├── SettingsButton
│   ├── SaveButton
│   └── MainMenuButton
└── Background Blur
```

### Settings Menu

**Size:** 800 x 600
**Tabs:** Graphics, Audio, Controls

**Common Elements:**
```
Setting Row:
├── Label (Text)
├── Control (Slider/Toggle/Dropdown)
└── Value Display (Text)
```

---

## RESPONSIVE DESIGN

### Screen Resolutions

Support for:
```
Mobile:
  - 720 x 1280 (Portrait)
  - 1280 x 720 (Landscape)
  - 1080 x 1920 (Portrait)
  - 1920 x 1080 (Landscape)

Tablet:
  - 1536 x 2048
  - 2048 x 1536

PC:
  - 1920 x 1080 (Full HD)
  - 2560 x 1440 (2K)
  - 3840 x 2160 (4K)
```

### Anchor Presets

Use proper anchors for responsiveness:

```
HUD Elements:
  - Health/Energy: Anchor to Top-Left
  - Quest Tracker: Anchor to Top-Right
  - Gadget Display: Anchor to Bottom-Right
  - Minimap: Anchor to Bottom-Left
  - Time: Anchor to Top-Center
  
Centered Panels:
  - Anchor: Center
  - Pivot: Center
  
Stretch Panels:
  - Use stretch anchors
  - Set offsets instead of size
```

### Safe Areas (Mobile)

Handle notches and curved screens:

```csharp
// Apply safe area
RectTransform panel = GetComponent<RectTransform>();
Rect safeArea = Screen.safeArea;

Vector2 anchorMin = safeArea.position;
Vector2 anchorMax = safeArea.position + safeArea.size;

anchorMin.x /= Screen.width;
anchorMin.y /= Screen.height;
anchorMax.x /= Screen.width;
anchorMax.y /= Screen.height;

panel.anchorMin = anchorMin;
panel.anchorMax = anchorMax;
```

---

## ACCESSIBILITY

### Text Readability
```
Minimum Font Size: 14
Outline or Shadow: Always
Contrast Ratio: 4.5:1 minimum
Background: Semi-transparent behind text
```

### Color Blind Support
```
Don't rely on color alone
Use symbols + colors
Support color blind modes:
  - Deuteranopia
  - Protanopia
  - Tritanopia
```

### Touch Targets (Mobile)
```
Minimum Size: 48 x 48 dp
Spacing: 8dp minimum
Visual feedback on touch
No tiny buttons
```

---

## PERFORMANCE TIPS

1. **Separate Canvases:**
   - Static elements in one canvas
   - Dynamic elements in another
   - Prevents full canvas rebuild

2. **Disable Raycast:**
   - On non-interactive images
   - Improves touch performance

3. **Optimize Fill Rate:**
   - Minimize overlapping UI
   - Use sliced images, not full
   - Avoid full-screen blur effects

4. **Font Optimization:**
   - Use TextMesh Pro
   - Limit dynamic text updates
   - Pregenerate font atlases

5. **Image Atlasing:**
   - Pack UI sprites into atlases
   - Reduce draw calls
   - Use Unity Sprite Packer

---

## UI ANIMATION

### Transitions

**Panel Appear:**
```
- Fade in: 0.2s
- Scale from 0.8 to 1.0
- Ease out curve
```

**Button Press:**
```
- Scale to 0.95
- Duration: 0.1s
- Ease in-out
```

**Notification:**
```
- Slide in from top
- Duration: 0.3s
- Hold: 3s
- Slide out: 0.3s
```

---

For implementation, refer to the scripts:
- HUDManager.cs
- GadgetWheelUI.cs
- QuestUI.cs
- MobileControls.cs
