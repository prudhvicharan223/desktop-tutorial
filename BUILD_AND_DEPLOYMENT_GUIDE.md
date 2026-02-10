# Future Gadget Adventure - Build & Deployment Guide

## TABLE OF CONTENTS
1. [Overview](#overview)
2. [Pre-Build Checklist](#pre-build-checklist)
3. [Android Build](#android-build)
4. [PC Build (Windows/Mac/Linux)](#pc-build)
5. [Optimization](#optimization)
6. [Testing](#testing)
7. [Publishing](#publishing)
8. [Post-Launch Support](#post-launch-support)

---

## OVERVIEW

This guide covers the complete process of building, optimizing, testing, and deploying **Future Gadget Adventure** to Android and PC platforms.

### Target Platforms

- **Android:** Google Play Store
- **PC:** Steam, Epic Games Store, itch.io
- **Future:** iOS (App Store), Nintendo Switch

---

## PRE-BUILD CHECKLIST

### Code Quality
- [ ] All scripts compile without errors
- [ ] No warning messages in Console
- [ ] Code follows naming conventions
- [ ] All public methods documented
- [ ] No TODO comments in production code

### Assets
- [ ] All models have proper LODs
- [ ] Textures compressed appropriately
- [ ] Materials optimized for target platform
- [ ] Audio files compressed (OGG format)
- [ ] Unused assets removed from build

### Performance
- [ ] Frame rate meets targets (30 FPS mobile, 60 FPS PC)
- [ ] Memory usage under limits (<2GB mobile, <4GB PC)
- [ ] No memory leaks detected
- [ ] Load times acceptable (<10 seconds)
- [ ] Battery drain acceptable (mobile)

### Content
- [ ] All scenes added to Build Settings
- [ ] Starting scene correctly set
- [ ] All quests completable
- [ ] No placeholder content
- [ ] All dialogue proofread
- [ ] Tutorial clear and helpful

### Legal
- [ ] Copyright notices in place
- [ ] Third-party licenses included
- [ ] Age rating determined
- [ ] Privacy policy prepared
- [ ] Terms of service ready

---

## ANDROID BUILD

### 1. Unity Setup

#### Player Settings

**File > Build Settings > Player Settings > Android**

```
Company Name: Your Studio Name
Product Name: Future Gadget Adventure
Package Name: com.yourstudio.futuregadget
Version: 1.0.0
Bundle Version Code: 1

Icon:
- Set all icon sizes (192x192, 144x144, 96x96, 72x72, 48x48, 36x36)
- Adaptive icons for Android 8.0+

Splash Screen:
- Use custom splash screen
- Show Unity logo: Optional

Other Settings:
- Rendering:
  - Color Space: Linear (better quality)
  - Auto Graphics API: Disabled
  - Graphics APIs: Vulkan, OpenGLES3, OpenGLES2
  
- Identification:
  - Override Default Package Name: Enabled
  - Minimum API Level: Android 8.0 'Oreo' (API level 26)
  - Target API Level: Highest installed
  
- Configuration:
  - Scripting Backend: IL2CPP
  - API Compatibility Level: .NET Standard 2.1
  - Target Architectures: ARM64 (required), ARMv7 (optional)
  - Managed Stripping Level: Medium
  
- Optimization:
  - Prebake Collision Meshes: Enabled
  - Keep Loaded Shaders Alive: Disabled
  - Preloaded Assets: Add critical assets
  
- Logging:
  - For release: Set all to "Disabled" except Errors
```

#### Build Settings

**File > Build Settings**

```
Platform: Android
Texture Compression: ASTC
Compression Method: LZ4 (faster startup)
Build App Bundle (Google Play): Yes (AAB format)
Create symbols.zip: Yes (for crash analysis)
Development Build: No (for release)
```

### 2. Optimize for Mobile

**Graphics Quality Settings**

```csharp
// Assets/_Project/Scripts/Core/MobileOptimizer.cs

using UnityEngine;

public class MobileOptimizer : MonoBehaviour
{
    private void Awake()
    {
        #if UNITY_ANDROID
        OptimizeForMobile();
        #endif
    }
    
    private void OptimizeForMobile()
    {
        // Set quality level based on device
        if (SystemInfo.systemMemorySize >= 4096)
        {
            QualitySettings.SetQualityLevel(2); // High
        }
        else if (SystemInfo.systemMemorySize >= 2048)
        {
            QualitySettings.SetQualityLevel(1); // Medium
        }
        else
        {
            QualitySettings.SetQualityLevel(0); // Low
        }
        
        // Set target frame rate
        Application.targetFrameRate = 60;
        
        // Disable V-Sync on mobile
        QualitySettings.vSyncCount = 0;
        
        // Optimize rendering
        QualitySettings.shadows = ShadowQuality.Disable;
        QualitySettings.shadowResolution = ShadowResolution.Low;
    }
}
```

**Graphics Tiers**

Edit > Project Settings > Graphics > Tier Settings (Android)

```
Tier 1 (Low-end devices):
- Standard Shader Quality: Low
- Rendering Path: Forward
- Use HDR: No
- Use Reflection Probes: No

Tier 2 (Mid-range devices):
- Standard Shader Quality: Medium
- Rendering Path: Forward
- Use HDR: No
- Use Reflection Probes: Box Projection

Tier 3 (High-end devices):
- Standard Shader Quality: High
- Rendering Path: Forward
- Use HDR: Yes
- Use Reflection Probes: Simple
```

### 3. Build Process

#### Generate Keystore (First Time Only)

```bash
# Using Unity or Android Studio
keytool -genkey -v -keystore future-gadget.keystore -alias futuregadget -keyalg RSA -keysize 2048 -validity 10000

# Follow prompts and remember:
# - Keystore password
# - Key password
# - Alias name
```

#### Configure Signing

**Edit > Project Settings > Player > Publishing Settings**

```
Custom Keystore: Enabled
Keystore Path: [Path to your .keystore file]
Keystore Password: [Your password]
Alias: futuregadget
Alias Password: [Your password]
```

#### Build AAB (Android App Bundle)

1. **File > Build Settings**
2. Select **Android** platform
3. Check **Build App Bundle (Google Play)**
4. Click **Build**
5. Choose output folder: `Builds/Android/`
6. Wait for build to complete

Output: `future-gadget-adventure.aab`

#### Build APK (for testing)

1. **File > Build Settings**
2. Select **Android** platform
3. Uncheck **Build App Bundle**
4. Click **Build**
5. Choose output folder
6. Wait for build to complete

Output: `future-gadget-adventure.apk`

### 4. Testing on Device

```bash
# Install APK via ADB
adb install future-gadget-adventure.apk

# View logs
adb logcat -s Unity

# Monitor performance
adb shell dumpsys gfxinfo com.yourstudio.futuregadget
```

### 5. Google Play Console Upload

1. **Create App** in Google Play Console
2. **Set up app details:**
   - App name
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (min 2, max 8)
   - Feature graphic (1024x500)
   - App icon (512x512)

3. **Upload AAB:**
   - Go to Release > Production
   - Create new release
   - Upload AAB file
   - Add release notes
   - Review and roll out

4. **Content Rating:**
   - Complete questionnaire
   - Get rating (ESRB, PEGI, etc.)

5. **Pricing & Distribution:**
   - Set price (Free or Paid)
   - Select countries
   - Review policies

---

## PC BUILD

### 1. Unity Setup

#### Player Settings

**File > Build Settings > Player Settings > Standalone**

```
Company Name: Your Studio Name
Product Name: Future Gadget Adventure
Version: 1.0.0

Icon:
- Windows: 256x256 ICO file
- Mac: 1024x1024 ICNS file
- Linux: 512x512 PNG file

Splash Screen:
- Unity logo: Optional
- Custom splash: Enabled

Resolution and Presentation:
- Fullscreen Mode: Fullscreen Window
- Default Screen Width: 1920
- Default Screen Height: 1080
- Run in Background: Yes
- Resizable Window: Yes
- Display Resolution Dialog: Enabled

Other Settings:
- Color Space: Linear
- Auto Graphics API: Disabled (for optimization)
- Graphics APIs (Windows): Direct3D11, Vulkan, Direct3D12
- Graphics APIs (Mac): Metal
- Graphics APIs (Linux): Vulkan, OpenGLCore

Configuration:
- Scripting Backend: Mono
- API Compatibility: .NET Standard 2.1
- Managed Stripping Level: Low

Optimization:
- Prebake Collision Meshes: Enabled
- Strip Engine Code: Disabled (for compatibility)
```

### 2. Quality Settings

**Edit > Project Settings > Quality**

Create quality levels:
- **Low** (for integrated graphics)
- **Medium** (for mid-range GPUs)
- **High** (for dedicated GPUs)
- **Ultra** (for high-end systems)

```
Ultra Settings:
- V-Sync Count: Every V Blank
- Anti Aliasing: 8x MSAA
- Anisotropic Textures: Per Texture
- Texture Quality: Full Res
- Shadows: Hard and Soft Shadows
- Shadow Resolution: Very High
- Shadow Cascades: 4
- Realtime Reflection Probes: Yes
```

### 3. Build Process

#### Windows Build

**File > Build Settings**

```
Platform: Windows
Architecture: x86_64
Compression Method: LZ4HC
Development Build: No
Script Debugging: No
```

Click **Build** → Choose output folder → Wait

Output folder structure:
```
FutureGadgetAdventure_Windows/
├── FutureGadgetAdventure.exe
├── UnityPlayer.dll
├── FutureGadgetAdventure_Data/
├── MonoBleedingEdge/
└── README.txt
```

#### Mac Build

**File > Build Settings**

```
Platform: Mac OS X
Architecture: Universal (Intel + Apple Silicon)
Create Xcode Project: No
```

Output: `FutureGadgetAdventure.app` (single file)

#### Linux Build

**File > Build Settings**

```
Platform: Linux
Architecture: x86_64
```

Output folder structure similar to Windows

### 4. Create Installers

#### Windows Installer (Inno Setup)

```pascal
; Script for Inno Setup

[Setup]
AppName=Future Gadget Adventure
AppVersion=1.0.0
DefaultDirName={pf}\Future Gadget Adventure
DefaultGroupName=Future Gadget Adventure
OutputDir=Installers
OutputBaseFilename=FutureGadgetAdventure_Setup
Compression=lzma2
SolidCompression=yes

[Files]
Source: "Build\Windows\*"; DestDir: "{app}"; Flags: recursesubdirs

[Icons]
Name: "{group}\Future Gadget Adventure"; Filename: "{app}\FutureGadgetAdventure.exe"
Name: "{userdesktop}\Future Gadget Adventure"; Filename: "{app}\FutureGadgetAdventure.exe"

[Run]
Filename: "{app}\FutureGadgetAdventure.exe"; Description: "Launch Game"; Flags: postinstall nowait
```

---

## OPTIMIZATION

### Performance Profiling

**Unity Profiler** (Window > Analysis > Profiler)

Key metrics to monitor:
- CPU: < 16ms per frame (60 FPS)
- GPU: < 16ms per frame
- Memory: < 2GB (mobile), < 4GB (PC)
- Rendering: < 100 draw calls (mobile), < 300 (PC)
- Garbage Collection: Minimize spikes

### Common Optimizations

**Reduce Draw Calls:**
```csharp
// Use static batching
StaticBatchingUtility.Combine(gameObject);

// Or enable in Player Settings
PlayerSettings.SetMobileMTRendering(true);
```

**Object Pooling:**
```csharp
// Reuse objects instead of Instantiate/Destroy
ObjectPool.Instance.SpawnFromPool("Particle", position, rotation);
```

**Texture Compression:**
- Android: ASTC 6x6 (balanced)
- iOS: ASTC 6x6
- PC: DXT5

**Shader Optimization:**
- Use mobile shaders on Android
- Limit shader variants
- Avoid real-time reflections

---

## TESTING

### Test Plan

**Functionality Testing:**
- [ ] All gadgets work correctly
- [ ] All quests completable
- [ ] Save/Load works
- [ ] UI responsive
- [ ] No crashes

**Performance Testing:**
- [ ] Frame rate stable
- [ ] No memory leaks
- [ ] Loading times acceptable
- [ ] Battery drain reasonable (mobile)

**Compatibility Testing:**

**Android Devices:**
- Low-end: Samsung Galaxy A10
- Mid-range: Google Pixel 4a
- High-end: Samsung Galaxy S21

**PC Specifications:**
- Minimum: i5-6600, 8GB RAM, GTX 1050
- Recommended: i7-9700, 16GB RAM, RTX 2060

### Bug Reporting

Use this template for bug reports:

```
Title: [Brief description]

Description:
[Detailed explanation]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Device/Platform:
[Android/PC, specific device]

Unity Version:
[e.g., 2022.3.15f1]

Build Version:
[e.g., 1.0.0]

Screenshots:
[Attach if relevant]
```

---

## PUBLISHING

### Steam Release

1. **Steamworks Account**
   - Sign up at partner.steamgames.com
   - Pay $100 app fee (per game)

2. **App Setup**
   - Create new app
   - Set app name, description
   - Upload screenshots and trailer

3. **Upload Build**
   - Use SteamCmd or Steamworks SDK
   - Upload for Windows, Mac, Linux

4. **Store Page**
   - Set price
   - Add tags and categories
   - Write detailed description

5. **Release**
   - Set release date
   - Complete checklist
   - Publish

### Epic Games Store

Similar process to Steam:
1. Apply as developer
2. Create product page
3. Upload builds
4. Complete requirements
5. Launch

### itch.io

1. Create account
2. Create new project
3. Upload builds (zip files)
4. Set pricing (can be pay-what-you-want)
5. Publish immediately

---

## POST-LAUNCH SUPPORT

### Analytics Integration

**Unity Analytics:**
```csharp
using UnityEngine.Analytics;

// Track custom events
Analytics.CustomEvent("gadget_used", new Dictionary<string, object>
{
    { "gadget_name", gadgetName },
    { "player_level", playerLevel }
});
```

### Update Strategy

**Versioning:**
- Major.Minor.Patch (e.g., 1.2.3)
- Major: Big features, breaking changes
- Minor: New content, features
- Patch: Bug fixes

**Release Cadence:**
- Hotfixes: As needed (critical bugs)
- Patches: Monthly (bug fixes)
- Updates: Quarterly (new content)

### Community Management

- Discord server for players
- Regular dev blogs
- Listen to feedback
- Plan content roadmap
- Engage with community

---

## CONCLUSION

Following this guide ensures:
✅ High-quality builds for all platforms  
✅ Optimized performance  
✅ Proper testing coverage  
✅ Successful store submissions  
✅ Long-term support plan  

**Good luck with your launch! 🚀**

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-10  
**Status:** Production Ready
