# Future Gadget Adventure - Technical Design Document (TDD)

## TABLE OF CONTENTS
1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Core Systems Architecture](#4-core-systems-architecture)
5. [Gadget System Implementation](#5-gadget-system-implementation)
6. [Character Controllers](#6-character-controllers)
7. [AI Systems](#7-ai-systems)
8. [Mission & Quest System](#8-mission--quest-system)
9. [Save/Load System](#9-saveload-system)
10. [UI/UX Implementation](#10-uiux-implementation)
11. [Performance Optimization](#11-performance-optimization)
12. [Build & Deployment](#12-build--deployment)

---

## 1. OVERVIEW

### 1.1 Purpose
This Technical Design Document outlines the architecture, systems, and implementation details for **Future Gadget Adventure**. It serves as a blueprint for developers to build a scalable, maintainable, and performant game.

### 1.2 Target Platforms
- **Android:** API Level 26+ (Android 8.0+)
- **Windows PC:** Windows 10/11 64-bit
- **macOS:** macOS 10.15+
- **Linux:** Ubuntu 20.04+

### 1.3 Performance Targets
- **Mobile:** 30-60 FPS, <2GB RAM usage, <100ms input latency
- **PC:** 60-144 FPS, <4GB RAM usage, <50ms input latency

---

## 2. TECHNOLOGY STACK

### 2.1 Game Engine
**Unity 2022.3 LTS (Long-Term Support)**

**Rationale:**
- Stable, production-ready
- Excellent cross-platform support
- Strong mobile optimization
- Large asset ecosystem
- C# scripting (familiar to most developers)

### 2.2 Core Dependencies

**Unity Packages:**
- `com.unity.inputsystem` - New Input System for cross-platform controls
- `com.unity.cinemachine` - Advanced camera system
- `com.unity.ai.navigation` - NavMesh and pathfinding
- `com.unity.textmeshpro` - High-quality UI text
- `com.unity.timeline` - Cutscene creation
- `com.unity.postprocessing` - Visual effects
- `com.unity.addressables` - Asset management and loading
- `com.unity.localization` - Multi-language support
- `com.unity.analytics` - Player behavior tracking

**Third-Party Assets (Optional):**
- **DOTween** - Animation library
- **UniTask** - Async/await for Unity
- **Odin Inspector** - Enhanced editor tools
- **Universal Sound FX** - Sound library
- **Dialogue System for Unity** - Advanced dialogue trees

### 2.3 Development Tools
- **IDE:** Visual Studio 2022 / JetBrains Rider
- **Version Control:** Git + GitHub/GitLab
- **Project Management:** Jira / Monday.com
- **Art Pipeline:** Blender (3D models), Substance Painter (textures)
- **Audio:** FMOD Studio / Wwise (adaptive audio)

---

## 3. PROJECT STRUCTURE

### 3.1 Folder Organization

```
FutureGadgetAdventure/
├── Assets/
│   ├── _Project/                      # Main game assets
│   │   ├── Art/
│   │   │   ├── Characters/
│   │   │   │   ├── Player/
│   │   │   │   ├── Gadget/
│   │   │   │   ├── NPCs/
│   │   │   ├── Environments/
│   │   │   │   ├── Town/
│   │   │   │   ├── School/
│   │   │   │   ├── Props/
│   │   │   ├── UI/
│   │   │   ├── VFX/
│   │   │   └── Animations/
│   │   ├── Audio/
│   │   │   ├── Music/
│   │   │   ├── SFX/
│   │   │   └── Voice/
│   │   ├── Prefabs/
│   │   │   ├── Characters/
│   │   │   ├── Gadgets/
│   │   │   ├── Environment/
│   │   │   └── UI/
│   │   ├── Scenes/
│   │   │   ├── _Core/              # Persistent scenes
│   │   │   ├── Town/
│   │   │   ├── School/
│   │   │   └── Menus/
│   │   ├── ScriptableObjects/
│   │   │   ├── Gadgets/
│   │   │   ├── Quests/
│   │   │   ├── Characters/
│   │   │   └── Settings/
│   │   ├── Scripts/
│   │   │   ├── Core/
│   │   │   │   ├── Managers/
│   │   │   │   ├── Utilities/
│   │   │   │   └── Interfaces/
│   │   │   ├── Gameplay/
│   │   │   │   ├── Player/
│   │   │   │   ├── Gadgets/
│   │   │   │   ├── AI/
│   │   │   │   ├── Interactables/
│   │   │   │   └── Combat/
│   │   │   ├── UI/
│   │   │   ├── Systems/
│   │   │   │   ├── Quests/
│   │   │   │   ├── Inventory/
│   │   │   │   ├── Dialogue/
│   │   │   │   └── SaveLoad/
│   │   │   └── Utilities/
│   │   ├── Materials/
│   │   ├── Shaders/
│   │   └── Settings/
│   ├── Plugins/                       # Third-party plugins
│   ├── StreamingAssets/               # Read-only runtime data
│   └── TextMesh Pro/                  # TMP essentials
├── Packages/                          # Package dependencies
├── ProjectSettings/                   # Unity project settings
└── Build/                            # Build output (gitignored)
```

### 3.2 Naming Conventions

**Scripts:**
- PascalCase for classes: `PlayerController.cs`
- camelCase for variables: `currentHealth`
- UPPER_SNAKE_CASE for constants: `MAX_HEALTH`

**Prefabs:**
- Descriptive names: `Player_Hiro.prefab`
- Prefix for variants: `NPC_Student_Male_01.prefab`

**Scenes:**
- PascalCase: `TownCenter.unity`
- Prefix for categories: `Menu_MainMenu.unity`

---

## 4. CORE SYSTEMS ARCHITECTURE

### 4.1 Singleton Manager Pattern

**GameManager.cs** - Central game state controller

```csharp
using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [Header("Game State")]
    public GameState currentGameState = GameState.MainMenu;
    
    [Header("Managers")]
    public SceneTransitionManager sceneManager;
    public SaveLoadManager saveLoadManager;
    public QuestManager questManager;
    public InventoryManager inventoryManager;
    public AudioManager audioManager;
    public InputManager inputManager;
    
    private void Awake()
    {
        // Singleton pattern
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
        DontDestroyOnLoad(gameObject);
        
        InitializeManagers();
    }
    
    private void InitializeManagers()
    {
        // Initialize all manager subsystems
        sceneManager?.Initialize();
        saveLoadManager?.Initialize();
        questManager?.Initialize();
        inventoryManager?.Initialize();
        audioManager?.Initialize();
        inputManager?.Initialize();
    }
    
    public void ChangeGameState(GameState newState)
    {
        currentGameState = newState;
        OnGameStateChanged(newState);
    }
    
    private void OnGameStateChanged(GameState newState)
    {
        switch (newState)
        {
            case GameState.MainMenu:
                Time.timeScale = 1f;
                break;
            case GameState.Playing:
                Time.timeScale = 1f;
                break;
            case GameState.Paused:
                Time.timeScale = 0f;
                break;
            case GameState.Cutscene:
                // Disable player input
                break;
        }
    }
}

public enum GameState
{
    MainMenu,
    Playing,
    Paused,
    Cutscene,
    Loading
}
```

### 4.2 Event System

**GameEvents.cs** - Decoupled communication

```csharp
using UnityEngine;
using UnityEngine.Events;
using System;

public static class GameEvents
{
    // Quest Events
    public static event Action<Quest> OnQuestStarted;
    public static event Action<Quest> OnQuestCompleted;
    public static event Action<QuestObjective> OnObjectiveCompleted;
    
    // Gadget Events
    public static event Action<Gadget> OnGadgetUnlocked;
    public static event Action<Gadget> OnGadgetUsed;
    
    // Player Events
    public static event Action<float> OnHealthChanged;
    public static event Action OnPlayerDeath;
    
    // UI Events
    public static event Action<string> OnShowNotification;
    public static event Action<DialogueData> OnDialogueStarted;
    public static event Action OnDialogueEnded;
    
    // Trigger event methods
    public static void QuestStarted(Quest quest) => OnQuestStarted?.Invoke(quest);
    public static void QuestCompleted(Quest quest) => OnQuestCompleted?.Invoke(quest);
    public static void GadgetUnlocked(Gadget gadget) => OnGadgetUnlocked?.Invoke(gadget);
    public static void ShowNotification(string message) => OnShowNotification?.Invoke(message);
}
```

### 4.3 Object Pooling System

**ObjectPool.cs** - Performance optimization

```csharp
using System.Collections.Generic;
using UnityEngine;

public class ObjectPool : MonoBehaviour
{
    [System.Serializable]
    public class Pool
    {
        public string tag;
        public GameObject prefab;
        public int size;
    }
    
    public List<Pool> pools;
    private Dictionary<string, Queue<GameObject>> poolDictionary;
    
    public static ObjectPool Instance { get; private set; }
    
    private void Awake()
    {
        Instance = this;
        InitializePools();
    }
    
    private void InitializePools()
    {
        poolDictionary = new Dictionary<string, Queue<GameObject>>();
        
        foreach (Pool pool in pools)
        {
            Queue<GameObject> objectPool = new Queue<GameObject>();
            
            for (int i = 0; i < pool.size; i++)
            {
                GameObject obj = Instantiate(pool.prefab);
                obj.SetActive(false);
                objectPool.Enqueue(obj);
            }
            
            poolDictionary.Add(pool.tag, objectPool);
        }
    }
    
    public GameObject SpawnFromPool(string tag, Vector3 position, Quaternion rotation)
    {
        if (!poolDictionary.ContainsKey(tag))
        {
            Debug.LogWarning($"Pool with tag {tag} doesn't exist.");
            return null;
        }
        
        GameObject objectToSpawn = poolDictionary[tag].Dequeue();
        objectToSpawn.SetActive(true);
        objectToSpawn.transform.position = position;
        objectToSpawn.transform.rotation = rotation;
        
        poolDictionary[tag].Enqueue(objectToSpawn);
        
        return objectToSpawn;
    }
}
```

---

## 5. GADGET SYSTEM IMPLEMENTATION

### 5.1 Gadget Base Class

**Gadget.cs** - ScriptableObject base

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "New Gadget", menuName = "FGA/Gadget")]
public class Gadget : ScriptableObject
{
    [Header("Gadget Info")]
    public string gadgetName;
    [TextArea] public string description;
    public Sprite icon;
    public GameObject prefab;
    
    [Header("Gameplay")]
    public float cooldownTime = 5f;
    public float duration = 0f; // 0 = instant
    public int energyCost = 10;
    
    [Header("Upgrades")]
    public int upgradeLevel = 0;
    public int maxUpgradeLevel = 3;
    
    [Header("Effects")]
    public GameObject activationVFX;
    public AudioClip activationSFX;
    
    // Override in child classes
    public virtual void Use(Vector3 position, Vector3 direction)
    {
        Debug.Log($"Using {gadgetName}");
    }
    
    public virtual void Upgrade()
    {
        if (upgradeLevel < maxUpgradeLevel)
        {
            upgradeLevel++;
            ApplyUpgrade();
        }
    }
    
    protected virtual void ApplyUpgrade()
    {
        // Implement upgrade logic in derived classes
    }
}
```

### 5.2 Specific Gadget Implementations

**AnywhereDoorGadget.cs**

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "AnywhereDoor", menuName = "FGA/Gadgets/Anywhere Door")]
public class AnywhereDoorGadget : Gadget
{
    [Header("Anywhere Door Settings")]
    public float maxPlacementDistance = 50f;
    public int maxDoorPairs = 1;
    public GameObject doorPrefab;
    
    private GameObject doorA;
    private GameObject doorB;
    private bool hasPlacedFirstDoor = false;
    
    public override void Use(Vector3 position, Vector3 direction)
    {
        if (!hasPlacedFirstDoor)
        {
            PlaceFirstDoor(position, direction);
        }
        else
        {
            PlaceSecondDoor(position, direction);
        }
    }
    
    private void PlaceFirstDoor(Vector3 position, Vector3 direction)
    {
        doorA = Instantiate(doorPrefab, position, Quaternion.LookRotation(direction));
        doorA.GetComponent<TeleportDoor>().Initialize(null, this);
        hasPlacedFirstDoor = true;
        
        GameEvents.ShowNotification("First door placed! Place second door to activate.");
    }
    
    private void PlaceSecondDoor(Vector3 position, Vector3 direction)
    {
        if (Vector3.Distance(doorA.transform.position, position) > maxPlacementDistance)
        {
            GameEvents.ShowNotification("Too far from first door!");
            return;
        }
        
        doorB = Instantiate(doorPrefab, position, Quaternion.LookRotation(direction));
        
        // Link doors
        doorA.GetComponent<TeleportDoor>().SetDestination(doorB.transform);
        doorB.GetComponent<TeleportDoor>().SetDestination(doorA.transform);
        
        hasPlacedFirstDoor = false;
        GameEvents.ShowNotification("Anywhere Door activated!");
    }
    
    protected override void ApplyUpgrade()
    {
        switch (upgradeLevel)
        {
            case 1:
                maxPlacementDistance *= 1.5f;
                break;
            case 2:
                maxDoorPairs = 2;
                break;
            case 3:
                cooldownTime *= 0.5f;
                break;
        }
    }
}
```

**TimeClothGadget.cs**

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "TimeCloth", menuName = "FGA/Gadgets/Time Cloth")]
public class TimeClothGadget : Gadget
{
    [Header("Time Cloth Settings")]
    public float rewindDuration = 5f;
    public float maxRewindTime = 30f;
    
    public override void Use(Vector3 position, Vector3 direction)
    {
        // Raycast to find object
        RaycastHit hit;
        if (Physics.Raycast(position, direction, out hit, 10f))
        {
            IRewindable rewindable = hit.collider.GetComponent<IRewindable>();
            if (rewindable != null)
            {
                rewindable.Rewind(rewindDuration);
                
                // Spawn VFX
                if (activationVFX != null)
                {
                    Instantiate(activationVFX, hit.point, Quaternion.identity);
                }
                
                GameEvents.ShowNotification($"Rewinding {hit.collider.name}");
            }
        }
    }
}

// Interface for objects that can be rewound
public interface IRewindable
{
    void Rewind(float seconds);
}
```

### 5.3 Gadget Controller

**GadgetController.cs** - Player gadget management

```csharp
using UnityEngine;
using System.Collections.Generic;

public class GadgetController : MonoBehaviour
{
    [Header("Gadget Inventory")]
    public List<Gadget> unlockedGadgets = new List<Gadget>();
    public Gadget currentGadget;
    private int currentGadgetIndex = 0;
    
    [Header("Cooldowns")]
    private Dictionary<Gadget, float> gadgetCooldowns = new Dictionary<Gadget, float>();
    
    private void Update()
    {
        HandleGadgetInput();
        UpdateCooldowns();
    }
    
    private void HandleGadgetInput()
    {
        // Gadget selection (number keys or wheel)
        if (Input.GetKeyDown(KeyCode.Alpha1)) SelectGadget(0);
        if (Input.GetKeyDown(KeyCode.Alpha2)) SelectGadget(1);
        if (Input.GetKeyDown(KeyCode.Alpha3)) SelectGadget(2);
        
        // Use gadget
        if (Input.GetKeyDown(KeyCode.Q) && currentGadget != null)
        {
            TryUseGadget();
        }
    }
    
    private void SelectGadget(int index)
    {
        if (index >= 0 && index < unlockedGadgets.Count)
        {
            currentGadget = unlockedGadgets[index];
            currentGadgetIndex = index;
            GameEvents.ShowNotification($"Selected: {currentGadget.gadgetName}");
        }
    }
    
    private void TryUseGadget()
    {
        if (IsOnCooldown(currentGadget))
        {
            GameEvents.ShowNotification("Gadget on cooldown!");
            return;
        }
        
        // Get use position and direction from camera
        Vector3 position = transform.position + transform.forward;
        Vector3 direction = Camera.main.transform.forward;
        
        currentGadget.Use(position, direction);
        StartCooldown(currentGadget);
        
        GameEvents.GadgetUsed(currentGadget);
    }
    
    private bool IsOnCooldown(Gadget gadget)
    {
        return gadgetCooldowns.ContainsKey(gadget) && gadgetCooldowns[gadget] > 0;
    }
    
    private void StartCooldown(Gadget gadget)
    {
        if (gadgetCooldowns.ContainsKey(gadget))
        {
            gadgetCooldowns[gadget] = gadget.cooldownTime;
        }
        else
        {
            gadgetCooldowns.Add(gadget, gadget.cooldownTime);
        }
    }
    
    private void UpdateCooldowns()
    {
        List<Gadget> keys = new List<Gadget>(gadgetCooldowns.Keys);
        foreach (Gadget gadget in keys)
        {
            if (gadgetCooldowns[gadget] > 0)
            {
                gadgetCooldowns[gadget] -= Time.deltaTime;
            }
        }
    }
    
    public void UnlockGadget(Gadget gadget)
    {
        if (!unlockedGadgets.Contains(gadget))
        {
            unlockedGadgets.Add(gadget);
            GameEvents.GadgetUnlocked(gadget);
        }
    }
}
```

---

## 6. CHARACTER CONTROLLERS

### 6.1 Player Controller

**PlayerController.cs** - Third-person character movement

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(CharacterController))]
public class PlayerController : MonoBehaviour
{
    [Header("Movement")]
    public float walkSpeed = 5f;
    public float sprintSpeed = 8f;
    public float crouchSpeed = 2.5f;
    public float jumpHeight = 2f;
    public float gravity = -19.62f;
    
    [Header("Camera")]
    public Transform cameraFollow;
    public float mouseSensitivity = 2f;
    public float controllerSensitivity = 150f;
    
    [Header("Ground Check")]
    public Transform groundCheck;
    public float groundDistance = 0.4f;
    public LayerMask groundMask;
    
    private CharacterController controller;
    private Animator animator;
    private Vector3 velocity;
    private bool isGrounded;
    private bool isSprinting;
    private bool isCrouching;
    
    private Vector2 moveInput;
    private Vector2 lookInput;
    private float currentSpeed;
    
    private void Awake()
    {
        controller = GetComponent<CharacterController>();
        animator = GetComponentInChildren<Animator>();
        
        Cursor.lockState = CursorLockMode.Locked;
    }
    
    private void Update()
    {
        HandleGroundCheck();
        HandleMovement();
        HandleJump();
        HandleGravity();
        HandleCamera();
        UpdateAnimations();
    }
    
    private void HandleGroundCheck()
    {
        isGrounded = Physics.CheckSphere(groundCheck.position, groundDistance, groundMask);
        
        if (isGrounded && velocity.y < 0)
        {
            velocity.y = -2f;
        }
    }
    
    private void HandleMovement()
    {
        // Calculate movement direction
        Vector3 move = transform.right * moveInput.x + transform.forward * moveInput.y;
        
        // Determine speed
        currentSpeed = isSprinting ? sprintSpeed : (isCrouching ? crouchSpeed : walkSpeed);
        
        // Apply movement
        controller.Move(move * currentSpeed * Time.deltaTime);
    }
    
    private void HandleJump()
    {
        // Jump is handled by OnJump() from Input System
    }
    
    private void HandleGravity()
    {
        velocity.y += gravity * Time.deltaTime;
        controller.Move(velocity * Time.deltaTime);
    }
    
    private void HandleCamera()
    {
        // Rotate player body (Y-axis)
        transform.Rotate(Vector3.up * lookInput.x * mouseSensitivity);
        
        // Rotate camera (X-axis) - handled by Cinemachine
    }
    
    private void UpdateAnimations()
    {
        float speed = new Vector3(controller.velocity.x, 0, controller.velocity.z).magnitude;
        animator.SetFloat("Speed", speed);
        animator.SetBool("IsGrounded", isGrounded);
        animator.SetBool("IsCrouching", isCrouching);
    }
    
    // Input System Callbacks
    public void OnMove(InputValue value)
    {
        moveInput = value.Get<Vector2>();
    }
    
    public void OnLook(InputValue value)
    {
        lookInput = value.Get<Vector2>();
    }
    
    public void OnJump(InputValue value)
    {
        if (isGrounded)
        {
            velocity.y = Mathf.Sqrt(jumpHeight * -2f * gravity);
            animator.SetTrigger("Jump");
        }
    }
    
    public void OnSprint(InputValue value)
    {
        isSprinting = value.isPressed;
    }
    
    public void OnCrouch(InputValue value)
    {
        isCrouching = !isCrouching;
        controller.height = isCrouching ? 1f : 2f;
    }
}
```

### 6.2 Interaction System

**Interactable.cs** - Base class for interactive objects

```csharp
using UnityEngine;
using UnityEngine.Events;

public class Interactable : MonoBehaviour
{
    [Header("Interaction")]
    public string interactionPrompt = "Press E to interact";
    public float interactionDistance = 3f;
    public bool canInteractMultipleTimes = true;
    
    [Header("Events")]
    public UnityEvent onInteract;
    
    private bool hasInteracted = false;
    
    public virtual void Interact(GameObject player)
    {
        if (!canInteractMultipleTimes && hasInteracted)
            return;
        
        hasInteracted = true;
        onInteract?.Invoke();
        OnInteract(player);
    }
    
    protected virtual void OnInteract(GameObject player)
    {
        // Override in derived classes
        Debug.Log($"Interacted with {gameObject.name}");
    }
    
    public bool CanInteract()
    {
        return canInteractMultipleTimes || !hasInteracted;
    }
}
```

---

## 7. AI SYSTEMS

### 7.1 Companion AI (Gadget the Cat)

**CompanionAI.cs** - Follow and assist behavior

```csharp
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent))]
public class CompanionAI : MonoBehaviour
{
    [Header("References")]
    public Transform player;
    public Animator animator;
    
    [Header("Follow Settings")]
    public float followDistance = 3f;
    public float maxDistance = 10f;
    public float teleportDistance = 20f;
    
    [Header("Behavior")]
    public float idleWaitTime = 5f;
    public float hintCooldown = 30f;
    
    private NavMeshAgent agent;
    private CompanionState currentState;
    private float idleTimer = 0f;
    private float hintTimer = 0f;
    
    private enum CompanionState
    {
        Following,
        Idle,
        Interacting
    }
    
    private void Awake()
    {
        agent = GetComponent<NavMeshAgent>();
    }
    
    private void Update()
    {
        HandleState();
        HandleHints();
        UpdateAnimations();
    }
    
    private void HandleState()
    {
        float distanceToPlayer = Vector3.Distance(transform.position, player.position);
        
        // Teleport if too far
        if (distanceToPlayer > teleportDistance)
        {
            TeleportToPlayer();
            return;
        }
        
        switch (currentState)
        {
            case CompanionState.Following:
                FollowPlayer(distanceToPlayer);
                break;
                
            case CompanionState.Idle:
                HandleIdle();
                break;
        }
    }
    
    private void FollowPlayer(float distance)
    {
        if (distance > followDistance)
        {
            agent.SetDestination(player.position);
            idleTimer = 0f;
        }
        else
        {
            agent.ResetPath();
            idleTimer += Time.deltaTime;
            
            if (idleTimer >= idleWaitTime)
            {
                currentState = CompanionState.Idle;
                PlayIdleAnimation();
            }
        }
    }
    
    private void HandleIdle()
    {
        float distanceToPlayer = Vector3.Distance(transform.position, player.position);
        
        if (distanceToPlayer > followDistance + 2f)
        {
            currentState = CompanionState.Following;
            idleTimer = 0f;
        }
    }
    
    private void TeleportToPlayer()
    {
        Vector3 teleportPosition = player.position - player.forward * followDistance;
        transform.position = teleportPosition;
        
        // Play teleport effect
        GameEvents.ShowNotification("Gadget teleported!");
    }
    
    private void HandleHints()
    {
        hintTimer += Time.deltaTime;
        
        if (hintTimer >= hintCooldown)
        {
            GiveHint();
            hintTimer = 0f;
        }
    }
    
    private void GiveHint()
    {
        // Check for nearby interactables or quest objectives
        Collider[] nearbyObjects = Physics.OverlapSphere(transform.position, 10f);
        
        foreach (Collider col in nearbyObjects)
        {
            Interactable interactable = col.GetComponent<Interactable>();
            if (interactable != null && interactable.CanInteract())
            {
                DialogueData hint = new DialogueData
                {
                    speaker = "Gadget",
                    text = $"I see something interesting over there: {interactable.interactionPrompt}"
                };
                GameEvents.OnDialogueStarted?.Invoke(hint);
                break;
            }
        }
    }
    
    private void PlayIdleAnimation()
    {
        int randomIdle = Random.Range(0, 3);
        animator.SetInteger("IdleType", randomIdle);
    }
    
    private void UpdateAnimations()
    {
        float speed = agent.velocity.magnitude;
        animator.SetFloat("Speed", speed);
        animator.SetBool("IsMoving", speed > 0.1f);
    }
}
```

---

## 8. MISSION & QUEST SYSTEM

### 8.1 Quest Data Structure

**Quest.cs** - ScriptableObject

```csharp
using UnityEngine;
using System.Collections.Generic;

[CreateAssetMenu(fileName = "New Quest", menuName = "FGA/Quest")]
public class Quest : ScriptableObject
{
    [Header("Quest Info")]
    public string questID;
    public string questName;
    [TextArea(3, 6)] public string description;
    public Sprite icon;
    
    [Header("Type")]
    public QuestType questType;
    public bool isMainQuest;
    
    [Header("Requirements")]
    public List<string> prerequisiteQuestIDs;
    public int requiredPlayerLevel = 0;
    
    [Header("Objectives")]
    public List<QuestObjective> objectives;
    
    [Header("Rewards")]
    public int coinReward;
    public List<Gadget> gadgetRewards;
    public List<ItemData> itemRewards;
    
    [Header("Dialogue")]
    public DialogueData startDialogue;
    public DialogueData completeDialogue;
    
    public bool IsCompleted()
    {
        foreach (QuestObjective objective in objectives)
        {
            if (!objective.isCompleted)
                return false;
        }
        return true;
    }
}

[System.Serializable]
public class QuestObjective
{
    public string description;
    public ObjectiveType type;
    public string targetID; // NPC ID, item ID, location ID, etc.
    public int targetCount = 1;
    public int currentCount = 0;
    public bool isCompleted = false;
    
    public void UpdateProgress(int amount = 1)
    {
        currentCount += amount;
        if (currentCount >= targetCount)
        {
            isCompleted = true;
            GameEvents.OnObjectiveCompleted?.Invoke(this);
        }
    }
}

public enum QuestType
{
    Story,
    Side,
    Gadget,
    Collection,
    Event
}

public enum ObjectiveType
{
    TalkToNPC,
    CollectItem,
    DefeatEnemy,
    ReachLocation,
    UseGadget,
    CompleteMinigame
}
```

### 8.2 Quest Manager

**QuestManager.cs**

```csharp
using UnityEngine;
using System.Collections.Generic;
using System.Linq;

public class QuestManager : MonoBehaviour
{
    [Header("Quests")]
    public List<Quest> allQuests;
    
    private List<Quest> activeQuests = new List<Quest>();
    private List<Quest> completedQuests = new List<Quest>();
    
    public void Initialize()
    {
        GameEvents.OnObjectiveCompleted += HandleObjectiveCompleted;
    }
    
    private void OnDestroy()
    {
        GameEvents.OnObjectiveCompleted -= HandleObjectiveCompleted;
    }
    
    public void StartQuest(Quest quest)
    {
        if (!CanStartQuest(quest))
        {
            Debug.LogWarning($"Cannot start quest: {quest.questName}");
            return;
        }
        
        activeQuests.Add(quest);
        GameEvents.QuestStarted(quest);
        
        if (quest.startDialogue != null)
        {
            GameEvents.OnDialogueStarted?.Invoke(quest.startDialogue);
        }
    }
    
    public void CompleteQuest(Quest quest)
    {
        if (!activeQuests.Contains(quest))
            return;
        
        activeQuests.Remove(quest);
        completedQuests.Add(quest);
        
        GiveRewards(quest);
        GameEvents.QuestCompleted(quest);
        
        if (quest.completeDialogue != null)
        {
            GameEvents.OnDialogueStarted?.Invoke(quest.completeDialogue);
        }
    }
    
    private bool CanStartQuest(Quest quest)
    {
        // Check prerequisites
        foreach (string prereqID in quest.prerequisiteQuestIDs)
        {
            Quest prereq = allQuests.FirstOrDefault(q => q.questID == prereqID);
            if (prereq != null && !completedQuests.Contains(prereq))
            {
                return false;
            }
        }
        
        // Check if already active or completed
        if (activeQuests.Contains(quest) || completedQuests.Contains(quest))
        {
            return false;
        }
        
        return true;
    }
    
    private void HandleObjectiveCompleted(QuestObjective objective)
    {
        // Check if quest is complete
        foreach (Quest quest in activeQuests)
        {
            if (quest.objectives.Contains(objective) && quest.IsCompleted())
            {
                CompleteQuest(quest);
            }
        }
    }
    
    private void GiveRewards(Quest quest)
    {
        // Coins
        GameManager.Instance.inventoryManager.AddCoins(quest.coinReward);
        
        // Gadgets
        foreach (Gadget gadget in quest.gadgetRewards)
        {
            GameManager.Instance.inventoryManager.AddGadget(gadget);
        }
        
        // Items
        foreach (ItemData item in quest.itemRewards)
        {
            GameManager.Instance.inventoryManager.AddItem(item);
        }
        
        GameEvents.ShowNotification($"Quest Complete! +{quest.coinReward} coins");
    }
    
    public Quest GetQuestByID(string id)
    {
        return allQuests.FirstOrDefault(q => q.questID == id);
    }
}
```

---

## 9. SAVE/LOAD SYSTEM

### 9.1 Save Data Structure

**SaveData.cs**

```csharp
using System;
using System.Collections.Generic;

[Serializable]
public class SaveData
{
    // Player Data
    public string playerName;
    public int playerLevel;
    public float[] playerPosition;
    public float[] playerRotation;
    
    // Progress
    public int totalPlayTime;
    public string currentScene;
    public List<string> unlockedGadgetIDs;
    public List<string> completedQuestIDs;
    public List<string> activeQuestIDs;
    
    // Inventory
    public int coins;
    public List<InventoryItem> inventory;
    
    // Settings
    public float musicVolume;
    public float sfxVolume;
    public int qualityLevel;
    public bool fullscreen;
    
    // Timestamps
    public string saveDate;
    public float saveVersion;
    
    public SaveData()
    {
        saveDate = DateTime.Now.ToString();
        saveVersion = 1.0f;
        playerPosition = new float[3];
        playerRotation = new float[3];
        unlockedGadgetIDs = new List<string>();
        completedQuestIDs = new List<string>();
        activeQuestIDs = new List<string>();
        inventory = new List<InventoryItem>();
    }
}

[Serializable]
public class InventoryItem
{
    public string itemID;
    public int quantity;
}
```

### 9.2 Save/Load Manager

**SaveLoadManager.cs**

```csharp
using UnityEngine;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;

public class SaveLoadManager : MonoBehaviour
{
    private string saveFilePath;
    private const string SAVE_FILE_NAME = "save_data.dat";
    
    public void Initialize()
    {
        saveFilePath = Path.Combine(Application.persistentDataPath, SAVE_FILE_NAME);
        Debug.Log($"Save file location: {saveFilePath}");
    }
    
    public void SaveGame()
    {
        SaveData data = CreateSaveData();
        
        try
        {
            // Serialize to JSON (human-readable, easier to debug)
            string json = JsonUtility.ToJson(data, true);
            File.WriteAllText(saveFilePath, json);
            
            Debug.Log("Game saved successfully!");
            GameEvents.ShowNotification("Game Saved");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Failed to save game: {e.Message}");
        }
    }
    
    public void LoadGame()
    {
        if (!File.Exists(saveFilePath))
        {
            Debug.LogWarning("No save file found.");
            return;
        }
        
        try
        {
            string json = File.ReadAllText(saveFilePath);
            SaveData data = JsonUtility.FromJson<SaveData>(json);
            
            ApplySaveData(data);
            Debug.Log("Game loaded successfully!");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Failed to load game: {e.Message}");
        }
    }
    
    private SaveData CreateSaveData()
    {
        SaveData data = new SaveData();
        
        // Player position
        Transform player = GameObject.FindGameObjectWithTag("Player").transform;
        data.playerPosition = new float[] { player.position.x, player.position.y, player.position.z };
        data.playerRotation = new float[] { player.eulerAngles.x, player.eulerAngles.y, player.eulerAngles.z };
        
        // Gadgets
        GadgetController gadgetController = player.GetComponent<GadgetController>();
        foreach (Gadget gadget in gadgetController.unlockedGadgets)
        {
            data.unlockedGadgetIDs.Add(gadget.name);
        }
        
        // Quests
        QuestManager questManager = GameManager.Instance.questManager;
        // ... collect quest data
        
        // Inventory
        data.coins = GameManager.Instance.inventoryManager.GetCoins();
        
        return data;
    }
    
    private void ApplySaveData(SaveData data)
    {
        // Restore player position
        Transform player = GameObject.FindGameObjectWithTag("Player").transform;
        player.position = new Vector3(data.playerPosition[0], data.playerPosition[1], data.playerPosition[2]);
        player.eulerAngles = new Vector3(data.playerRotation[0], data.playerRotation[1], data.playerRotation[2]);
        
        // Restore gadgets
        // Restore quests
        // Restore inventory
        
        GameEvents.ShowNotification("Game Loaded");
    }
    
    public bool HasSaveFile()
    {
        return File.Exists(saveFilePath);
    }
    
    public void DeleteSave()
    {
        if (File.Exists(saveFilePath))
        {
            File.Delete(saveFilePath);
            Debug.Log("Save file deleted.");
        }
    }
}
```

---

## 10. UI/UX IMPLEMENTATION

### 10.1 HUD Manager

**HUDManager.cs**

```csharp
using UnityEngine;
using TMPro;
using UnityEngine.UI;

public class HUDManager : MonoBehaviour
{
    [Header("HUD Elements")]
    public Slider healthBar;
    public TextMeshProUGUI coinText;
    public TextMeshProUGUI objectiveText;
    public Image gadgetIcon;
    public TextMeshProUGUI gadgetCooldownText;
    
    [Header("Notification")]
    public GameObject notificationPanel;
    public TextMeshProUGUI notificationText;
    public float notificationDuration = 3f;
    
    private void Start()
    {
        GameEvents.OnHealthChanged += UpdateHealth;
        GameEvents.OnShowNotification += ShowNotification;
        GameEvents.OnGadgetUsed += UpdateGadgetIcon;
        
        notificationPanel.SetActive(false);
    }
    
    private void OnDestroy()
    {
        GameEvents.OnHealthChanged -= UpdateHealth;
        GameEvents.OnShowNotification -= ShowNotification;
        GameEvents.OnGadgetUsed -= UpdateGadgetIcon;
    }
    
    private void Update()
    {
        UpdateCoinDisplay();
        UpdateObjectiveDisplay();
    }
    
    private void UpdateHealth(float health)
    {
        healthBar.value = health / 100f;
    }
    
    private void UpdateCoinDisplay()
    {
        int coins = GameManager.Instance.inventoryManager.GetCoins();
        coinText.text = $"{coins}";
    }
    
    private void UpdateObjectiveDisplay()
    {
        // Get current active quest
        QuestManager questManager = GameManager.Instance.questManager;
        // Display current objective
    }
    
    private void UpdateGadgetIcon(Gadget gadget)
    {
        gadgetIcon.sprite = gadget.icon;
    }
    
    private void ShowNotification(string message)
    {
        StopAllCoroutines();
        StartCoroutine(ShowNotificationCoroutine(message));
    }
    
    private System.Collections.IEnumerator ShowNotificationCoroutine(string message)
    {
        notificationText.text = message;
        notificationPanel.SetActive(true);
        
        yield return new WaitForSeconds(notificationDuration);
        
        notificationPanel.SetActive(false);
    }
}
```

---

## 11. PERFORMANCE OPTIMIZATION

### 11.1 Optimization Checklist

**Mobile Optimization:**
- [ ] Use LOD (Level of Detail) for all 3D models
- [ ] Implement occlusion culling
- [ ] Use object pooling for frequently spawned objects
- [ ] Compress textures (ASTC for Android)
- [ ] Bake lighting (no realtime lights)
- [ ] Limit draw calls (<100 on screen)
- [ ] Use sprite atlases for UI
- [ ] Simplify particle effects
- [ ] Reduce physics calculations (use layers)
- [ ] Profile with Unity Profiler

**Memory Management:**
```csharp
// Unload unused assets
Resources.UnloadUnusedAssets();
System.GC.Collect();

// Use Addressables for large assets
using UnityEngine.AddressableAssets;

public async void LoadAssetAsync(string key)
{
    var handle = Addressables.LoadAssetAsync<GameObject>(key);
    await handle.Task;
    GameObject obj = handle.Result;
}
```

**Shader Optimization:**
- Use Mobile/Unlit shaders when possible
- Avoid transparency (use cutout instead)
- Limit shader variants
- Use static batching for static objects

---

## 12. BUILD & DEPLOYMENT

### 12.1 Build Settings

**Android Build:**
```
- Architecture: ARM64 (required for Google Play)
- Scripting Backend: IL2CPP
- API Level: Minimum 26 (Android 8.0)
- Compression: LZ4 (faster loading)
- Split APKs: Yes (for larger games)
```

**PC Build:**
```
- Architecture: x86_64
- Scripting Backend: Mono
- Compression: LZ4HC
```

### 12.2 Version Control (.gitignore)

```
# Unity
/[Ll]ibrary/
/[Tt]emp/
/[Oo]bj/
/[Bb]uild/
/[Bb]uilds/
/[Ll]ogs/
/UserSettings/

# Visual Studio cache
.vs/
*.csproj
*.sln

# OS
.DS_Store
Thumbs.db
```

### 12.3 CI/CD Pipeline (GitHub Actions Example)

```yaml
name: Build Unity Project

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: game-ci/unity-builder@v2
        with:
          targetPlatform: Android
```

---

## 13. CONCLUSION

This Technical Design Document provides a comprehensive blueprint for implementing **Future Gadget Adventure**. Key takeaways:

✅ **Modular Architecture:** Easy to extend and maintain  
✅ **Scalable Systems:** Supports growth and new features  
✅ **Performance-Focused:** Optimized for mobile and PC  
✅ **Production-Ready:** Complete implementation examples  

**Next Steps:**
1. Set up Unity project with proper folder structure
2. Implement core managers and systems
3. Create player controller and camera system
4. Implement gadget prototypes
5. Build vertical slice for testing

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-10  
**Status:** Ready for Implementation  
**Maintained by:** Technical Lead
