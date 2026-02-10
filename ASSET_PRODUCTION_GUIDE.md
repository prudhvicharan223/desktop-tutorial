# Future Gadget Adventure - Asset Production Guide

## TABLE OF CONTENTS
1. [Overview](#overview)
2. [Art Style Guidelines](#art-style-guidelines)
3. [Character Production](#character-production)
4. [Environment Production](#environment-production)
5. [UI/UX Assets](#uiux-assets)
6. [VFX & Particles](#vfx--particles)
7. [Audio Assets](#audio-assets)
8. [Optimization Guidelines](#optimization-guidelines)
9. [Animation Guidelines](#animation-guidelines)
10. [Quality Assurance](#quality-assurance)

---

## OVERVIEW

This guide provides comprehensive standards for creating high-quality 3D assets for **Future Gadget Adventure**. All assets must maintain visual consistency while meeting performance targets for both mobile and PC platforms.

### Target Specifications

**Mobile (Android):**
- Poly count: Low-to-Medium
- Texture resolution: 512x512 to 2048x2048
- Shader complexity: Simple/Mobile-optimized
- Draw calls: <100 on-screen

**PC:**
- Poly count: Medium-to-High
- Texture resolution: 2048x2048 to 4096x4096
- Shader complexity: Full PBR with effects
- Draw calls: <300 on-screen

---

## ART STYLE GUIDELINES

### Visual Direction

**Core Aesthetic:**
- **Anime-Pixar Fusion:** Blend Japanese anime styling with Pixar-quality 3D rendering
- **Cel-Shaded with Soft Edges:** Gentle outlines, gradient shading, vibrant colors
- **Cozy & Nostalgic:** Warm lighting, lived-in details, inviting atmosphere
- **Futuristic but Friendly:** Gadgets look advanced but approachable, not intimidating

### Color Palette

**Primary Colors:**
- Sky Blue: #5BC0EB (Tech/Gadgets)
- Warm Yellow: #FDE74C (Sunlight/Happiness)
- Soft Pink: #FF6B9D (Friendship/UI Highlights)
- Fresh Green: #C5FAD5 (Nature/Parks)

**Secondary Colors:**
- Deep Purple: #6A4C93 (Night/Mystery)
- Coral: #FA7921 (Energy/Action)
- Mint: #9BC1BC (Calm/Water)

**Neutral Colors:**
- Off-White: #FFFBF0
- Warm Gray: #D4C5B9
- Dark Blue-Gray: #3E5C76

### Lighting Guidelines

**Day Lighting:**
- Warm, golden sunlight (Color: #FFF4D6)
- Soft shadows with ambient occlusion
- Sky with gradient (blue to light cyan)

**Night Lighting:**
- Cool moonlight (Color: #B8D4E8)
- Street lamps with warm glow
- Neon gadget effects (cyan, pink, yellow)

**Interior Lighting:**
- Warm indoor lights (Color: #FFE5B4)
- Window light casting soft rays
- Localized colored lights for mood

---

## CHARACTER PRODUCTION

### Character Design Principles

**Proportions:**
- Chibi-esque style: Head is 1/4 of total height
- Large expressive eyes (1/2 of face width)
- Small nose and simple mouth
- Slightly elongated limbs for expressiveness

**Model Specifications:**

| Asset Type | Polycount (Mobile) | Polycount (PC) | Texture Size |
|------------|-------------------|----------------|--------------|
| Main Character (Hiro) | 8K-12K | 15K-20K | 2048x2048 |
| Companion (Gadget Cat) | 6K-10K | 12K-18K | 2048x2048 |
| Main NPCs | 5K-8K | 10K-15K | 2048x2048 |
| Background NPCs | 3K-5K | 6K-10K | 1024x1024 |

### Hiro (Player Character)

**Design Elements:**
- School uniform: White shirt, dark pants/skirt
- Backpack with gadget pouch
- Casual sneakers
- Hair: Spiky anime style with 2-3 colors

**Customization Options:**
- 5 hairstyles
- 3 skin tones
- 10 outfit color schemes
- Accessories (glasses, hats, badges)

**Facial Blend Shapes Required:**
- Happy, Sad, Angry, Surprised, Confused
- Blink, Wink (L/R)
- Talking (A, E, I, O, U)

### Gadget (Robo Cat Companion)

**Design Elements:**
- Round, friendly appearance
- Blue metallic body with soft edges
- Large pouch on belly (for gadgets)
- Glowing cyan eyes
- Small propeller on tail (hover animation)

**Expressions:**
- Happy, Worried, Excited, Sleepy, Confused
- Ear movements (perked up, drooped)
- Tail swishes

### NPC Design Templates

**Student NPCs:**
- **Smart Friend (Shizuka-type):**
  - Glasses, neat hair, bookbag
  - Calm, kind expressions
  
- **Strong Friend (Takeshi-type):**
  - Athletic build, sports jersey
  - Confident, friendly expressions
  
- **Wealthy Friend (Suneo-type):**
  - Fancy outfit, stylish hair
  - Proud but friendly expressions
  
- **Rival (Kenta):**
  - Mischievous grin, messy hair
  - Playful, sneaky expressions

**Adult NPCs:**
- Teachers, shopkeepers, parents
- Simpler designs, lower poly count
- Fewer blend shapes (3-5 expressions)

### Character Texturing

**Texture Maps Required:**
- Albedo/Base Color
- Normal Map
- Roughness/Smoothness
- Emission (for glowing effects)
- Optional: AO (Ambient Occlusion)

**Texture Guidelines:**
- Use hand-painted style for cel-shading
- Avoid photorealistic textures
- Use gradient ramps for shading
- Include subtle edge highlights

**UV Mapping:**
- Minimize seams (hide on hidden edges)
- Optimize UV space utilization (80%+ coverage)
- Consistent texel density
- Separate UV islands for important areas (face, hands)

---

## ENVIRONMENT PRODUCTION

### World Design Philosophy

**Scale:**
- Medium-sized town (2km² playable area)
- Modular building system for variety
- Verticality (rooftops, underground)

**Zones:**
1. Residential Area
2. School Campus
3. Downtown Shopping District
4. Park & Nature Area
5. Temple & Traditional Zone

### Building Guidelines

**Modular Architecture:**
- Create reusable wall, floor, roof pieces
- Snap-to-grid system (1m grid)
- 3-5 building variations per zone

**Polycount Budgets:**

| Asset Type | Mobile | PC |
|------------|--------|-----|
| Large Building | 5K-10K | 15K-25K |
| Medium Building | 3K-6K | 8K-15K |
| Small Building | 2K-4K | 5K-10K |
| Props (furniture) | 500-2K | 1K-5K |

### Texture Atlases

**Atlas Organization:**
- Combine similar materials (wood, brick, metal)
- 2048x2048 master atlases
- Trim sheets for architectural details
- Use texture variants for variety

### Props & Interactables

**Essential Props:**
- Benches, vending machines, trash cans
- Bicycles, cars (non-drivable)
- Street signs, lanterns, mailboxes
- Cherry blossom trees, bushes, flowers

**Interactive Objects:**
- Doors (open/close animation)
- Drawers and cabinets
- Switches and buttons
- Collectible items

**Prop Optimization:**
- LOD (Level of Detail) system:
  - LOD0: Full detail (close-up)
  - LOD1: Medium detail (5-15m)
  - LOD2: Low detail (15-30m)
  - LOD3: Billboard/Impostor (30m+)

---

## UI/UX ASSETS

### UI Style

**Design Language:**
- Rounded corners, soft gradients
- Semi-transparent panels
- Neon accents for interactive elements
- Icon-based with minimal text

### HUD Elements

**Required UI Assets:**
- Health bar (gradient fill)
- Energy bar (animated)
- Gadget icons (64x64 to 256x256)
- Objective markers
- Compass/minimap
- Coin counter

**Gadget Icons:**
- Flat, recognizable silhouettes
- 3 states: Available, Cooldown, Locked
- Use gadget's signature color

### Menu Screens

**Main Menu:**
- Animated background (rotating gadgets)
- Logo with glow effect
- Button hover effects (scale + glow)

**Pause Menu:**
- Blur background effect
- Panel slide-in animation
- Icon grid layout

**Inventory UI:**
- Grid-based layout
- Item tooltips with stats
- Drag-and-drop support (PC)

### Font Choices

**Primary Font:** Rounded sans-serif (e.g., Nunito, Quicksand)
**Accent Font:** Bold display font for titles (e.g., Baloo, Fredoka)
**Body Text:** Clean, readable (e.g., Open Sans, Roboto)

**Font Sizes:**
- Titles: 48-72pt
- Headers: 24-36pt
- Body: 16-20pt
- Small text: 12-14pt

---

## VFX & PARTICLES

### Gadget Effects

**Anywhere Door:**
- Swirling portal particles (cyan/purple)
- Energy rings expanding
- Flash of light on teleport

**Time Cloth:**
- Reverse time spiral particles
- Object outline glow (cyan)
- Clock particles floating

**Bamboo Copter:**
- Wind trail particles
- Rotor blur effect
- Lift dust particles

**Shrinking Light:**
- Beam of light (yellow-green)
- Size change sparkles
- Distortion wave effect

### Environmental Effects

**Weather:**
- Rain: Raindrop particles + puddle splashes
- Snow: Snowflakes + ground accumulation
- Wind: Leaf particles + grass sway

**Day/Night Transition:**
- Sun/Moon glow
- Sky color gradient shift
- Star particles at night

**Special Effects:**
- Collectible glow and sparkle
- Objective marker beam
- Teleport flash
- Level-up burst

### Particle System Settings

**Performance Guidelines:**
- Max particles on screen: 500 (mobile), 2000 (PC)
- Use sprite sheets for flipbook animations
- Enable GPU instancing
- LOD for particle density

---

## AUDIO ASSETS

### Music Composition

**Style:**
- Orchestral with Japanese instruments
- Emotional piano melodies
- Upbeat adventure themes

**Required Tracks:**
- Main Theme (2-3 min loop)
- Town Exploration Day (3-4 min loop)
- Town Exploration Night (3-4 min loop)
- School Theme (2-3 min loop)
- Battle/Boss Theme (2-3 min loop)
- Cutscene Themes (emotional, mysterious, funny)
- Menu Music (1-2 min loop)

**Audio Specs:**
- Format: OGG Vorbis (compressed)
- Sample Rate: 44.1kHz
- Bitrate: 128-192 kbps
- Loopable (seamless)

### Sound Effects

**Categories:**

**Player Actions:**
- Footsteps (grass, concrete, wood, metal)
- Jump, land
- Gadget activation (unique per gadget)
- Item pickup

**UI Sounds:**
- Button click
- Menu open/close
- Notification popup
- Quest complete fanfare

**Environment:**
- Ambient (birds, wind, city noise)
- Door open/close
- Water fountain
- Bell chimes

**Audio Specs:**
- Format: WAV (uncompressed source), OGG (in-game)
- Sample Rate: 44.1kHz or 48kHz
- Bit Depth: 16-bit minimum
- Mono for most SFX, stereo for ambience

---

## OPTIMIZATION GUIDELINES

### General Optimization

**Polycount Reduction:**
- Remove hidden faces
- Optimize cylinders (8-16 sides, not 32)
- Merge overlapping vertices
- Use normal maps for detail

**Texture Optimization:**
- Power-of-two dimensions (512, 1024, 2048)
- Compress textures (DXT5 for PC, ASTC for mobile)
- Use mipmaps
- Atlas small textures

**Material Optimization:**
- Batch similar materials
- Limit shader variants
- Use simple shaders on mobile
- Avoid transparency when possible

### Mobile-Specific Optimization

**Graphics Settings:**
- Baked lighting only (no realtime)
- Lightmaps at 1024x1024
- Single directional light
- Disable shadows for small objects

**Rendering:**
- Occlusion culling enabled
- Frustum culling
- Layer-based rendering
- Limit post-processing effects

**Performance Targets:**
- 30 FPS minimum on mid-range devices
- 60 FPS on high-end devices
- <2GB RAM usage
- <3GB download size

---

## ANIMATION GUIDELINES

### Character Animations

**Player Character Required:**
- Idle (breathing, looking around)
- Walk (8-direction blend tree)
- Run
- Sprint
- Jump (start, loop, land)
- Crouch
- Climb ladder
- Interact (pickup, press button)
- Gadget use animations (per gadget)
- Emotes (wave, cheer, dance)

**Companion (Gadget Cat):**
- Idle (sit, stand, stretch)
- Walk
- Run
- Fly/Hover
- Happy reaction
- Worried reaction
- Sleep

### Animation Technical Specs

**Frame Rate:** 30 FPS (animations)  
**Keyframe Reduction:** Optimize curves, remove unnecessary keys  
**Root Motion:** Use for locomotion  
**Animation Compression:** Keyframe reduction, curve optimization  

### State Machines

**Player Locomotion:**
```
Idle -> Walk -> Run -> Sprint
  |      |       |       |
  +----> Jump <--+-------+
         |
         v
       Falling
         |
         v
       Landing -> Idle
```

**Gadget State:**
```
Equipped -> Using -> Cooldown -> Equipped
```

---

## QUALITY ASSURANCE

### Asset Checklist

**Before Import:**
- [ ] Correct scale (1 unit = 1 meter)
- [ ] Pivot point centered/at base
- [ ] Clean topology (no N-gons)
- [ ] Unwrapped UVs (no overlaps)
- [ ] Materials applied correctly
- [ ] Naming convention followed

**After Import:**
- [ ] Textures assigned correctly
- [ ] Materials use correct shaders
- [ ] Colliders set up
- [ ] LODs generated
- [ ] Animations imported and retargeted
- [ ] Prefab created and tested

### Naming Conventions

**Models:**
- `SM_[Category]_[Name]_[Variant]`
- Example: `SM_Building_House_01`

**Textures:**
- `T_[Model]_[Type]_[Size]`
- Example: `T_House_Albedo_2048`

**Materials:**
- `M_[Name]_[Type]`
- Example: `M_House_Standard`

**Animations:**
- `Anim_[Character]_[Action]`
- Example: `Anim_Player_Walk`

### Testing Requirements

**Performance Testing:**
- Test on minimum spec devices
- Profile with Unity Profiler
- Check frame rate in all areas
- Monitor memory usage

**Visual Testing:**
- Check at different times of day
- Test all weather conditions
- Verify LOD transitions
- Check from all camera angles

---

## CONCLUSION

Following these guidelines ensures:
✅ Consistent visual quality across all assets  
✅ Optimized performance on target platforms  
✅ Scalable production pipeline  
✅ Maintainable asset library  
✅ Professional AAA-quality output  

**Remember:** Quality over quantity. One polished asset is worth ten rushed ones.

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-10  
**For:** Future Gadget Adventure  
**Status:** Production Ready
