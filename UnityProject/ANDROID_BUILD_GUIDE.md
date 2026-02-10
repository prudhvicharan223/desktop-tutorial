# Android Build Guide

## Unity 3D Open-World Adventure Game - Android Build Configuration

Complete guide for building and optimizing the game for Android devices.

---

## TABLE OF CONTENTS
1. [Prerequisites](#prerequisites)
2. [Project Settings](#project-settings)
3. [Build Settings](#build-settings)
4. [Quality Settings](#quality-settings)
5. [Input Configuration](#input-configuration)
6. [Optimization](#optimization)
7. [Testing](#testing)
8. [Publishing](#publishing)

---

## PREREQUISITES

### Required Software:
- Unity 2022.3 LTS or Unity 6
- Android SDK (API Level 26 minimum)
- Android NDK
- JDK 11 or higher
- Gradle 7.x or higher

### Unity Modules:
Install via Unity Hub:
- ✅ Android Build Support
- ✅ Android SDK & NDK Tools
- ✅ OpenJDK

### Hardware Requirements:
**Minimum Target:**
- Android 8.0 (API 26)
- 2GB RAM
- Adreno 506 / Mali-G71 or better
- 1GB free storage

**Recommended Target:**
- Android 10+ (API 29+)
- 4GB+ RAM
- Adreno 618+ / Mali-G76+ or better
- 2GB free storage

---

## PROJECT SETTINGS

### 1. Player Settings

**File → Build Settings → Player Settings → Android**

#### Company & Product
```
Company Name: YourStudioName
Product Name: Future Gadget Adventure
Package Name: com.yourstudio.futuregadget
Version: 1.0.0
Bundle Version Code: 1
```

#### Icon
```
Override for Android: Yes
Adaptive Icon: 
  - Foreground: Your icon (512x512)
  - Background: Solid color or pattern
Round Icon: Your rounded icon (192x192)
Legacy Icons: Multiple sizes (192, 144, 96, 72, 48, 36)
```

#### Resolution and Presentation
```
Default Orientation: Landscape
  (or Portrait if your game is portrait)
  
Allowed Orientations:
  - Portrait: Disabled
  - Portrait Upside Down: Disabled
  - Landscape Right: Enabled
  - Landscape Left: Enabled

Render Over Native UI: Disabled
Use 32-bit Display Buffer: Enabled
```

#### Splash Image
```
Show Splash Screen: Yes (if using Unity splash)
Splash Image: Your splash screen image
Background Color: Match your branding
```

#### Other Settings

**Rendering:**
```
Color Space: Linear (for better visuals)
Auto Graphics API: Disabled
Graphics APIs:
  1. OpenGLES3
  2. OpenGLES2 (fallback)
  
Multithreaded Rendering: Enabled
Static Batching: Enabled
Dynamic Batching: Enabled
GPU Skinning: Enabled
```

**Identification:**
```
Package Name: com.yourstudio.futuregadget
  (Must be unique, no spaces or special characters)
  
Version*: 1.0.0
Bundle Version Code: 1 (increment for each release)
Minimum API Level: Android 8.0 'Oreo' (API level 26)
Target API Level: Highest installed (Android 13+)
```

**Configuration:**
```
Scripting Backend: IL2CPP
API Compatibility Level: .NET Standard 2.1
Target Architectures:
  ☑ ARM64 (required for Google Play)
  ☐ ARMv7 (optional, for older devices)
  ☐ x86 (not recommended)
  
Strip Engine Code: Enabled (Managed Stripping Level: Medium)
```

**Optimization:**
```
Prebake Collision Meshes: Enabled
Keep Loaded Shaders Alive: Disabled
Preloaded Assets: Add essential assets only
Optimize Mesh Data: Enabled
Vertex Compression: Mixed (per-mesh setting)
```

---

### 2. Quality Settings

**Edit → Project Settings → Quality**

Create Android-specific quality level:

```
Quality Level: Android_Medium
├── Pixel Light Count: 2
├── Texture Quality: Medium
├── Anisotropic Textures: Per Texture
├── Anti Aliasing: Disabled (use MSAA in URP)
├── Soft Particles: Disabled
├── Shadows:
│   ├── Shadow Quality: Hard Shadows Only
│   ├── Shadow Resolution: Medium
│   ├── Shadow Projection: Close Fit
│   ├── Shadow Distance: 30
│   └── Shadow Cascades: No Cascades
├── Shadow Near Plane Offset: 3
├── Shadow Mask Mode: Shadowmask
├── LOD Bias: 1
├── Maximum LOD Level: 0
├── Particle Raycast Budget: 512
├── Async Upload Time Slice: 2ms
├── Async Upload Buffer Size: 16MB
└── Skin Weights: 2 Bones
```

Set as default for Android:
```
Quality Settings → Default → Android → Android_Medium
```

---

### 3. URP (Universal Render Pipeline) Settings

**For Mobile:**

Create URP Asset for Android:
```
Right-click → Create → Rendering → URP Asset (with Universal Renderer)
```

**URP Asset Configuration:**
```
General:
  Depth Texture: Disabled (unless needed)
  Opaque Texture: Disabled
  Opaque Downsampling: None
  Terrain Holes: Disabled

Lighting:
  Main Light: Per Pixel
  Cast Shadows: Enabled
  Shadow Resolution: 512
  Additional Lights: Per Vertex
  Per Object Limit: 4

Shadows:
  Max Distance: 30
  Working Unit: Metric
  Cascade Count: 1
  Depth Bias: 1
  Normal Bias: 1
  Soft Shadows: Disabled

Post-processing:
  Enabled: Yes
  Grading Mode: Low Dynamic Range
  LUT Size: 16

Advanced:
  SRP Batcher: Enabled
  Dynamic Batching: Enabled (for small meshes)
  Mixed Lighting: Disabled (for performance)
  Debug Level: Disabled
```

**Renderer Settings:**
```
Rendering Path: Forward
Depth Priming Mode: Disabled
Accurate G-buffer Normals: Disabled
MSAA: 2x (or disabled on very low-end)
```

---

## BUILD SETTINGS

### Build Configuration

**File → Build Settings**

1. **Platform:**
   - Select "Android"
   - Click "Switch Platform"

2. **Scenes in Build:**
   - Add all game scenes
   - Ensure correct order:
     ```
     0: _Persistent
     1: MainMenu
     2: MainGame
     3: Town_Central
     ...
     ```

3. **Build Settings:**
   ```
   Texture Compression: ASTC
   ETC2 Fallback: 32-bit (for older devices)
   
   Build System: Gradle
   
   Build App Bundle (Google Play): 
     - Yes (for Play Store)
     - No (for APK testing)
   
   Export Project: No (unless debugging native code)
   
   Symlink Sources: No
   
   Development Build: Only for testing
   Autoconnect Profiler: Only for testing
   Deep Profiling: Never (heavy performance impact)
   Script Debugging: Only when needed
   Scripts Only Build: No
   ```

4. **Compression Method:**
   ```
   LZ4 (fast decompression) for development
   LZ4HC (high compression) for release
   ```

---

## OPTIMIZATION FOR ANDROID

### 1. Asset Optimization

**Textures:**
```
Max Size: 2048 (1024 for UI, 512 for small props)
Compression: ASTC
Format Override for Android: ASTC 6x6 (balanced)
  or ASTC 4x4 (higher quality)
  or ASTC 8x8 (smaller size)
Generate Mip Maps: Yes (for 3D textures)
```

**Meshes:**
```
Read/Write Enabled: No
Optimize Mesh: Yes
Compression: Medium or High
```

**Audio:**
```
Format:
  - Music: Vorbis, Quality 70%, Streaming
  - SFX: Vorbis, Quality 100%, Decompress on Load
  - Voice: Vorbis, Quality 70%, Compressed in Memory

Sample Rate: 44100 Hz
Force to Mono: For SFX (not music)
Load Type:
  - Background music: Streaming
  - Short SFX: Decompress on Load
  - Long SFX: Compressed in Memory
```

**Animations:**
```
Anim Compression: Optimal
Rotation Error: 0.5
Position Error: 0.5
Scale Error: 0.5
```

### 2. Code Optimization

**Implement PerformanceOptimizer:**
- Targets 30 FPS on mobile
- Adaptive quality
- Automatic LOD adjustments

**Use ObjectPooler:**
- Pool frequently spawned objects
- NPCs, particles, projectiles

**Optimize Scripts:**
- Cache component references
- Use object pooling
- Minimize Update() calls
- Use events instead of polling

### 3. Scene Optimization

**Lighting:**
- Use baked lightmaps
- Limit realtime lights (max 2-3)
- Use light probes for dynamic objects
- Disable shadows on small objects

**Occlusion Culling:**
```
Window → Rendering → Occlusion Culling
Bake for each scene
Smallest Occluder: 5
Smallest Hole: 0.25
Backface Threshold: 100
```

**LOD Groups:**
```
LOD 0 (0-10m): Full detail
LOD 1 (10-30m): Medium detail (50% triangles)
LOD 2 (30m+): Low detail (25% triangles)
```

### 4. Physics Optimization

```
Edit → Project Settings → Physics

Fixed Timestep: 0.02 (50 FPS)
Maximum Allowed Timestep: 0.1
Default Solver Iterations: 6
Default Solver Velocity Iterations: 1
Queries Hit Backfaces: No
Queries Hit Triggers: Yes
Enable Adaptive Force: No
Enable PCM: Yes (for better performance)
```

---

## INPUT CONFIGURATION

### Input System Setup

**Install Input System:**
```
Window → Package Manager → Input System → Install
```

**Create Input Actions:**
```
Right-click → Create → Input Actions
```

**Configure for Mobile:**
1. Touch screen support
2. Virtual joystick
3. UI buttons
4. Gyroscope (if needed)

**Mobile Controls:**
- Enable MobileControls script
- Position virtual joystick (bottom-left)
- Add action buttons (bottom-right)
- Configure touch areas

---

## TESTING

### Testing Checklist

**Pre-Build Tests:**
- [ ] All scenes load correctly
- [ ] No missing references
- [ ] No console errors
- [ ] All UI scales properly
- [ ] Mobile controls work
- [ ] Performance is acceptable (30+ FPS)

**Build Tests:**
1. **Development Build:**
   ```
   - Enable Development Build
   - Enable Autoconnect Profiler
   - Test all features
   - Check performance with Profiler
   ```

2. **Release Build:**
   ```
   - Disable Development Build
   - Test on multiple devices
   - Various Android versions
   - Different screen sizes
   - Different performance levels
   ```

### Device Testing Matrix

**Minimum:**
- Android 8.0
- 2GB RAM
- 720p screen

**Mid-Range:**
- Android 10
- 4GB RAM
- 1080p screen

**High-End:**
- Android 12+
- 6GB+ RAM
- 1440p screen

---

## BUILDING

### Create APK (Testing)

1. File → Build Settings
2. Platform: Android
3. Build App Bundle: **OFF**
4. Click "Build"
5. Choose output folder
6. Wait for build to complete
7. Transfer APK to device
8. Install and test

### Create AAB (Google Play)

1. File → Build Settings
2. Platform: Android
3. Build App Bundle: **ON**
4. Click "Build"
5. Choose output folder
6. Wait for build to complete
7. Sign with keystore
8. Upload to Play Console

---

## SIGNING

### Create Keystore

**First time:**
```
Edit → Project Settings → Player → Publishing Settings
Click "Keystore Manager"
Create New Keystore:
  - Location: Safe location (backup!)
  - Password: Strong password (save it!)
  
Create New Key:
  - Alias: your-game-key
  - Password: Strong password
  - Validity: 25+ years
  - Company info
```

**For builds:**
```
Publishing Settings:
☑ Custom Keystore
Keystore: [your keystore path]
Password: [keystore password]
Alias: your-game-key
Password: [key password]
```

⚠️ **IMPORTANT:** Backup your keystore! If lost, you cannot update your app!

---

## PUBLISHING

### Google Play Requirements (2024)

**Must have:**
- AAB format (not APK)
- Target API 33 (Android 13) minimum
- ARM64 support required
- Privacy Policy (if collecting data)
- Content Rating
- Store Listing (screenshots, description)

**Recommended:**
- App size under 150MB
- Fast startup time (< 3s)
- No crashes
- Positive ratings
- Regular updates

---

## TROUBLESHOOTING

**Build fails:**
- Check Android SDK/NDK paths
- Update to latest Gradle
- Clear build cache
- Restart Unity

**App crashes on launch:**
- Check API level compatibility
- Verify IL2CPP build
- Test Development Build first
- Check Logcat for errors

**Poor performance:**
- Enable PerformanceOptimizer
- Reduce quality settings
- Optimize assets
- Use Profiler to find bottlenecks

**Input doesn't work:**
- Verify Input System installed
- Check Mobile Controls setup
- Test EventSystem exists
- Verify touch input in Player Input

---

## RESOURCES

- [Unity Android Manual](https://docs.unity3d.com/Manual/android.html)
- [Android Developer Guide](https://developer.android.com/games)
- [URP Optimization](https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@latest)
- [Google Play Requirements](https://support.google.com/googleplay/android-developer)

---

## QUICK REFERENCE

### Recommended Settings Summary
```
API Level: 26 (minimum) / 33+ (target)
Scripting Backend: IL2CPP
Architecture: ARM64
Graphics API: OpenGLES3
Texture Compression: ASTC
Target FPS: 30-60
Quality: Medium
MSAA: 2x or Off
Shadow Distance: 30m
```

### Build Command
```
Minimum build for testing:
1. Switch to Android
2. Player Settings configured
3. Build APK
4. Test on device

Release build:
1. All above
2. Build AAB
3. Sign with keystore
4. Upload to Play Console
```
