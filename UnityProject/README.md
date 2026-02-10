# Future Gadget Adventure - Unity Project

![Game Logo](Docs/logo.png)

**A charming 3D adventure game inspired by Doraemon**

Explore a vibrant Japanese town, solve puzzles with futuristic gadgets, help friends, and embark on heartwarming adventures with your robotic cat companion!

---

## 🎮 GAME OVERVIEW

### Core Concept
Play as Hiro, a curious middle school student who discovers Gadget, a robotic cat from the 22nd century. Together, explore Miracle Town using amazing futuristic gadgets to help friends, solve missions, and prevent mischief from turning into chaos!

### Key Features
- **🌍 Open World Town** - Explore a living, breathing Japanese suburban town
- **🔧 Futuristic Gadgets** - Use amazing tools like Anywhere Door, Time Cloth, and Bamboo Copter
- **🤝 Companion AI** - Gadget the robo-cat follows, helps, and provides hints
- **📖 Story-Driven Missions** - Help friends and save the town from time-space anomalies
- **🎨 Anime-Pixar Style** - Beautiful cel-shaded graphics with cozy atmosphere
- **🎯 Family-Friendly** - Suitable for all ages with positive messages

### Platforms
- 📱 **Android** (API 26+, Android 8.0+)
- 💻 **PC** (Windows, macOS, Linux)

---

## 📋 PROJECT STATUS

**Development Phase:** Pre-Production → Alpha  
**Unity Version:** 2022.3 LTS  
**Current Build:** v0.1.0-alpha  

### Completed Systems ✅
- [x] Core game architecture (GameManager, Event System)
- [x] Player controller with full movement
- [x] Gadget system framework
- [x] Anywhere Door (teleportation) implementation
- [x] Time Cloth (object rewind) implementation
- [x] Bamboo Copter (flight) implementation
- [x] Gadget inventory and selection system
- [x] Comprehensive documentation (GDD, TDD, Asset Guide)

### In Progress 🚧
- [ ] Companion AI system
- [ ] Quest/Mission system
- [ ] UI/UX implementation
- [ ] Save/Load system
- [ ] Audio integration

### Planned Features 📅
- [ ] Shrinking Light gadget
- [ ] Town environment (buildings, NPCs)
- [ ] Mini-games
- [ ] Boss battles
- [ ] Multiplayer features (future update)

---

## 🛠️ SETUP & INSTALLATION

### Prerequisites
1. **Unity Hub** (latest version)
2. **Unity 2022.3 LTS** (or newer LTS)
3. **Visual Studio 2022** or **JetBrains Rider**
4. **Git** for version control

### Required Unity Packages
Install these packages via Package Manager:
- `com.unity.inputsystem` - New Input System
- `com.unity.cinemachine` - Advanced camera system
- `com.unity.ai.navigation` - NavMesh and pathfinding
- `com.unity.textmeshpro` - High-quality UI text
- `com.unity.timeline` - Cutscene creation
- `com.unity.postprocessing` - Visual effects
- `com.unity.addressables` - Asset management
- `com.unity.localization` - Multi-language support

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/future-gadget-adventure.git
   cd future-gadget-adventure
   ```

2. **Open in Unity Hub**
   - Open Unity Hub
   - Click "Add" and select the `UnityProject` folder
   - Open the project with Unity 2022.3 LTS

3. **Import Required Packages**
   - Open Package Manager (Window > Package Manager)
   - Install all required packages listed above

4. **Open Main Scene**
   - Navigate to `Assets/_Project/Scenes/_Core`
   - Open `MainGame.unity`

5. **Play!**
   - Press the Play button in Unity Editor

---

## 📁 PROJECT STRUCTURE

```
UnityProject/
├── Assets/
│   └── _Project/                    # Main game assets
│       ├── Scripts/
│       │   ├── Core/               # Core systems (GameManager, Events)
│       │   ├── Gameplay/           # Gameplay scripts
│       │   │   ├── Player/         # Player controller
│       │   │   ├── Gadgets/        # Gadget implementations
│       │   │   ├── AI/             # NPC and companion AI
│       │   │   └── Interactables/  # Interactive objects
│       │   ├── UI/                 # UI controllers
│       │   └── Systems/            # Game systems (Quest, Inventory, etc.)
│       ├── Prefabs/                # Prefabs for characters, gadgets, etc.
│       ├── Scenes/                 # Game scenes
│       ├── ScriptableObjects/      # Data-driven content
│       ├── Art/                    # 3D models, textures, animations
│       ├── Audio/                  # Music and SFX
│       └── Materials/              # Shaders and materials
├── Packages/                        # Package dependencies
└── ProjectSettings/                 # Unity project settings
```

---

## 🎮 CONTROLS

### PC (Keyboard & Mouse)
- **WASD** - Move
- **Mouse** - Look around
- **Space** - Jump
- **Shift** - Sprint
- **Ctrl** - Crouch
- **E** - Interact / Use Gadget
- **Q** - Open Gadget Wheel
- **1-5** - Quick select gadgets
- **ESC** - Pause menu

### Mobile (Touch)
- **Left Joystick** - Move
- **Swipe** - Look around
- **Jump Button** - Jump
- **Sprint Toggle** - Sprint
- **Action Button** - Interact / Use Gadget
- **Gadget Button** - Open Gadget Wheel

### Controller (Xbox/PlayStation)
- **Left Stick** - Move
- **Right Stick** - Look around
- **A / Cross** - Jump
- **B / Circle** - Crouch
- **X / Square** - Interact
- **Y / Triangle** - Gadget Wheel
- **LB/RB** - Cycle gadgets
- **Start** - Pause menu

---

## 🧪 DEVELOPMENT WORKFLOW

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-gadget
   ```

2. **Implement Feature**
   - Follow coding standards (see TECHNICAL_DESIGN_DOCUMENT.md)
   - Add comments and documentation
   - Create ScriptableObjects for data

3. **Test Thoroughly**
   - Test in Editor
   - Build and test on target platforms
   - Check performance with Profiler

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "Add new gadget: Shrinking Light"
   git push origin feature/new-gadget
   ```

### Code Style Guidelines

- **Naming Conventions:**
  - PascalCase for classes and methods
  - camelCase for private variables
  - Descriptive names (no abbreviations)
  
- **Organization:**
  - Use namespaces (`FutureGadgetAdventure.Gameplay.Player`)
  - Group related code in regions
  - Keep files under 500 lines

- **Comments:**
  - XML documentation for public methods
  - Inline comments for complex logic
  - TODO comments for future improvements

### Testing

**Manual Testing:**
- Play through new features
- Test edge cases
- Verify on multiple platforms

**Performance Testing:**
- Use Unity Profiler
- Target 60 FPS on PC, 30 FPS on mobile
- Monitor memory usage
- Check for memory leaks

---

## 📦 BUILDING THE GAME

### Android Build

1. **Switch Platform**
   - File > Build Settings
   - Select Android
   - Click "Switch Platform"

2. **Configure Settings**
   - Player Settings > Android
   - Set Company Name and Product Name
   - Set Package Name (com.yourstudio.futuregadget)
   - Set Minimum API Level: 26 (Android 8.0)
   - Scripting Backend: IL2CPP
   - Target Architectures: ARM64

3. **Build**
   - Build Settings > Build
   - Choose output folder
   - Wait for build to complete

4. **Test APK**
   - Install on Android device
   - Test all features
   - Monitor performance

### PC Build

1. **Switch Platform**
   - File > Build Settings
   - Select Windows/Mac/Linux
   - Click "Switch Platform"

2. **Configure Settings**
   - Player Settings > PC
   - Set icon and splash screen
   - Configure quality settings

3. **Build**
   - Build Settings > Build
   - Choose output folder
   - Wait for build to complete

---

## 🐛 TROUBLESHOOTING

### Common Issues

**Problem:** Script compilation errors  
**Solution:** Ensure all required packages are installed. Check for missing namespaces.

**Problem:** Input not working  
**Solution:** Verify Input System package is installed and active in Project Settings.

**Problem:** Low FPS in Editor  
**Solution:** Reduce scene complexity, check Profiler for bottlenecks, optimize shaders.

**Problem:** Build fails  
**Solution:** Check Console for errors, ensure all assets are properly assigned, verify build settings.

### Getting Help

- 📖 **Documentation:** Check GAME_DESIGN_DOCUMENT.md and TECHNICAL_DESIGN_DOCUMENT.md
- 💬 **Discord:** Join our development Discord server
- 🐛 **Issues:** Report bugs on GitHub Issues
- 📧 **Email:** support@yourstudio.com

---

## 🤝 CONTRIBUTING

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**
3. **Follow code style guidelines**
4. **Write clear commit messages**
5. **Test your changes thoroughly**
6. **Submit a pull request**

### Code of Conduct
- Be respectful and professional
- Help others learn and grow
- Give constructive feedback
- Focus on collaboration

---

## 📜 LICENSE

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 👥 TEAM

**Game Design:** AAA Game Studio  
**Programming:** Senior Development Team  
**Art Direction:** Visual Arts Team  
**Audio:** Sound Design Team  

---

## 🙏 ACKNOWLEDGMENTS

- Inspired by **Doraemon** by Fujiko F. Fujio
- Unity Technologies for amazing tools
- Open-source community for libraries and resources
- Our amazing playtesters and supporters

---

## 📞 CONTACT

**Website:** https://www.futuregadgetadventure.com  
**Twitter:** @FutureGadgetDev  
**Discord:** discord.gg/futuregadget  
**Email:** dev@futuregadgetadventure.com  

---

**Version:** 0.1.0-alpha  
**Last Updated:** 2026-02-10  
**Status:** In Development  

*"Every gadget tells a story. Every adventure creates a memory."*  
— Gadget, the Robo Cat Companion
