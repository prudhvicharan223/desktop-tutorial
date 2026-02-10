using UnityEngine;
using System;
using System.Collections.Generic;

namespace FutureGadgetAdventure.Systems.SaveSystem
{
    /// <summary>
    /// Complete game save data structure
    /// Contains all persistent game state
    /// </summary>
    [Serializable]
    public class GameData
    {
        public string saveVersion;
        public string saveTime;
        public float playTimeSeconds;
        
        public PlayerData playerData;
        public QuestData questData;
        public GadgetData gadgetData;
        public WorldData worldData;
        public SettingsData settingsData;
    }
    
    /// <summary>
    /// Player-specific save data
    /// </summary>
    [Serializable]
    public class PlayerData
    {
        // Position and state
        public Vector3 position;
        public Vector3 rotation;
        public string currentScene;
        
        // Stats
        public float health = 100f;
        public float energy = 100f;
        public int level = 1;
        public int experience = 0;
        
        // Currency and resources
        public int money = 0;
        public int upgradeParts = 0;
        
        // Inventory
        public List<string> inventoryItemIDs = new List<string>();
        public List<int> inventoryItemCounts = new List<int>();
        
        // Unlocks
        public List<string> unlockedAreas = new List<string>();
        public List<string> discoveredLocations = new List<string>();
        
        // Statistics
        public float totalPlayTime = 0f;
        public int totalQuestsCompleted = 0;
        public int totalGadgetsUsed = 0;
        public float totalDistanceTraveled = 0f;
    }
    
    /// <summary>
    /// Quest progress save data
    /// </summary>
    [Serializable]
    public class QuestData
    {
        public List<string> activeQuestIDs = new List<string>();
        public List<string> completedQuestIDs = new List<string>();
        public List<string> failedQuestIDs = new List<string>();
        
        // Quest objectives progress
        public List<QuestProgressEntry> questProgress = new List<QuestProgressEntry>();
        
        // Tracked quest
        public string trackedQuestID;
    }
    
    [Serializable]
    public class QuestProgressEntry
    {
        public string questID;
        public string objectiveID;
        public int currentProgress;
    }
    
    /// <summary>
    /// Gadget unlock and upgrade save data
    /// </summary>
    [Serializable]
    public class GadgetData
    {
        public List<string> unlockedGadgetIDs = new List<string>();
        public List<int> gadgetUpgradeLevels = new List<int>();
        public int upgradeParts = 0;
        
        // Gadget usage statistics
        public List<string> gadgetIDs = new List<string>();
        public List<int> gadgetUsageCounts = new List<int>();
        
        // Current selection
        public string currentGadgetID;
    }
    
    /// <summary>
    /// World state save data
    /// </summary>
    [Serializable]
    public class WorldData
    {
        // Time system
        public float timeOfDay = 8f;
        public int currentDay = 1;
        
        // NPCs
        public List<string> metNPCIDs = new List<string>();
        public List<int> npcRelationshipLevels = new List<int>();
        
        // World objects state
        public List<string> destroyedObjectIDs = new List<string>();
        public List<string> activatedObjectIDs = new List<string>();
        
        // Collectibles
        public List<string> collectedItemIDs = new List<string>();
        
        // Weather (if implemented)
        public string currentWeather = "Clear";
    }
    
    /// <summary>
    /// Game settings save data
    /// </summary>
    [Serializable]
    public class SettingsData
    {
        // Audio
        public float masterVolume = 1f;
        public float musicVolume = 0.8f;
        public float sfxVolume = 1f;
        public float voiceVolume = 1f;
        
        // Graphics
        public int qualityLevel = 2;
        public int resolutionWidth = 1920;
        public int resolutionHeight = 1080;
        public bool fullscreen = true;
        public int targetFrameRate = 60;
        
        // Gameplay
        public float mouseSensitivity = 1f;
        public bool invertY = false;
        public float uiScale = 1f;
        public bool subtitlesEnabled = true;
        
        // Mobile-specific
        public float touchSensitivity = 1f;
        public bool hapticFeedback = true;
        public int performanceMode = 0; // 0=Auto, 1=Quality, 2=Performance
        
        // Accessibility
        public bool colorBlindMode = false;
        public string colorBlindType = "None";
        public bool screenShakeEnabled = true;
        public float textSize = 1f;
    }
}
