using System;
using UnityEngine;

namespace FutureGadgetAdventure.Core
{
    /// <summary>
    /// Central event system for decoupled communication between game systems
    /// Uses C# events and delegates to avoid tight coupling
    /// </summary>
    public static class GameEvents
    {
        // === GAME STATE EVENTS ===
        public static event Action<GameState> OnGameStateChanged;
        
        // === QUEST EVENTS ===
        public static event Action<Quest> OnQuestStarted;
        public static event Action<Quest> OnQuestCompleted;
        public static event Action<QuestObjective> OnObjectiveCompleted;
        public static event Action<QuestObjective> OnObjectiveUpdated;
        
        // === GADGET EVENTS ===
        public static event Action<Gadget> OnGadgetUnlocked;
        public static event Action<Gadget> OnGadgetUsed;
        public static event Action<Gadget> OnGadgetUpgraded;
        public static event Action<Gadget, float> OnGadgetCooldownUpdated;
        
        // === PLAYER EVENTS ===
        public static event Action<float> OnHealthChanged;
        public static event Action<float> OnEnergyChanged;
        public static event Action OnPlayerDeath;
        public static event Action OnPlayerRespawn;
        public static event Action<Vector3> OnPlayerTeleported;
        
        // === INVENTORY EVENTS ===
        public static event Action<int> OnCoinsChanged;
        public static event Action<ItemData, int> OnItemAdded;
        public static event Action<ItemData, int> OnItemRemoved;
        
        // === UI EVENTS ===
        public static event Action<string> OnShowNotification;
        public static event Action<string, float> OnShowTimedNotification;
        public static event Action<DialogueData> OnDialogueStarted;
        public static event Action OnDialogueEnded;
        public static event Action<string> OnShowHint;
        
        // === NPC EVENTS ===
        public static event Action<NPCData> OnNPCInteracted;
        public static event Action<NPCData, float> OnFriendshipChanged;
        
        // === WORLD EVENTS ===
        public static event Action<TimeOfDay> OnTimeOfDayChanged;
        public static event Action<WeatherType> OnWeatherChanged;
        public static event Action<string> OnAreaEntered;
        public static event Action<string> OnAreaExited;
        
        // === MINIGAME EVENTS ===
        public static event Action<string> OnMinigameStarted;
        public static event Action<string, int> OnMinigameCompleted;
        public static event Action<string> OnMinigameFailed;
        
        // === ACHIEVEMENT EVENTS ===
        public static event Action<string> OnAchievementUnlocked;
        
        // === TRIGGER METHODS ===
        
        // Quest triggers
        public static void QuestStarted(Quest quest) => OnQuestStarted?.Invoke(quest);
        public static void QuestCompleted(Quest quest) => OnQuestCompleted?.Invoke(quest);
        public static void ObjectiveCompleted(QuestObjective objective) => OnObjectiveCompleted?.Invoke(objective);
        public static void ObjectiveUpdated(QuestObjective objective) => OnObjectiveUpdated?.Invoke(objective);
        
        // Gadget triggers
        public static void GadgetUnlocked(Gadget gadget) => OnGadgetUnlocked?.Invoke(gadget);
        public static void GadgetUsed(Gadget gadget) => OnGadgetUsed?.Invoke(gadget);
        public static void GadgetUpgraded(Gadget gadget) => OnGadgetUpgraded?.Invoke(gadget);
        public static void GadgetCooldownUpdated(Gadget gadget, float cooldown) => OnGadgetCooldownUpdated?.Invoke(gadget, cooldown);
        
        // Player triggers
        public static void HealthChanged(float newHealth) => OnHealthChanged?.Invoke(newHealth);
        public static void EnergyChanged(float newEnergy) => OnEnergyChanged?.Invoke(newEnergy);
        public static void PlayerDeath() => OnPlayerDeath?.Invoke();
        public static void PlayerRespawn() => OnPlayerRespawn?.Invoke();
        public static void PlayerTeleported(Vector3 position) => OnPlayerTeleported?.Invoke(position);
        
        // Inventory triggers
        public static void CoinsChanged(int newAmount) => OnCoinsChanged?.Invoke(newAmount);
        public static void ItemAdded(ItemData item, int quantity) => OnItemAdded?.Invoke(item, quantity);
        public static void ItemRemoved(ItemData item, int quantity) => OnItemRemoved?.Invoke(item, quantity);
        
        // UI triggers
        public static void ShowNotification(string message) => OnShowNotification?.Invoke(message);
        public static void ShowTimedNotification(string message, float duration) => OnShowTimedNotification?.Invoke(message, duration);
        public static void DialogueStarted(DialogueData dialogue) => OnDialogueStarted?.Invoke(dialogue);
        public static void DialogueEnded() => OnDialogueEnded?.Invoke();
        public static void ShowHint(string hint) => OnShowHint?.Invoke(hint);
        
        // NPC triggers
        public static void NPCInteracted(NPCData npc) => OnNPCInteracted?.Invoke(npc);
        public static void FriendshipChanged(NPCData npc, float newValue) => OnFriendshipChanged?.Invoke(npc, newValue);
        
        // World triggers
        public static void TimeOfDayChanged(TimeOfDay time) => OnTimeOfDayChanged?.Invoke(time);
        public static void WeatherChanged(WeatherType weather) => OnWeatherChanged?.Invoke(weather);
        public static void AreaEntered(string areaName) => OnAreaEntered?.Invoke(areaName);
        public static void AreaExited(string areaName) => OnAreaExited?.Invoke(areaName);
        
        // Minigame triggers
        public static void MinigameStarted(string gameName) => OnMinigameStarted?.Invoke(gameName);
        public static void MinigameCompleted(string gameName, int score) => OnMinigameCompleted?.Invoke(gameName, score);
        public static void MinigameFailed(string gameName) => OnMinigameFailed?.Invoke(gameName);
        
        // Achievement triggers
        public static void AchievementUnlocked(string achievementID) => OnAchievementUnlocked?.Invoke(achievementID);
        
        /// <summary>
        /// Clear all event subscriptions (useful for scene transitions)
        /// </summary>
        public static void ClearAllEvents()
        {
            OnGameStateChanged = null;
            OnQuestStarted = null;
            OnQuestCompleted = null;
            OnObjectiveCompleted = null;
            OnGadgetUnlocked = null;
            OnGadgetUsed = null;
            OnHealthChanged = null;
            OnPlayerDeath = null;
            OnShowNotification = null;
            OnDialogueStarted = null;
            OnDialogueEnded = null;
        }
    }
    
    // === SUPPORTING DATA STRUCTURES ===
    
    [System.Serializable]
    public class DialogueData
    {
        public string speaker;
        public string text;
        public Sprite portrait;
        public AudioClip voiceClip;
    }
    
    [System.Serializable]
    public class NPCData
    {
        public string npcID;
        public string npcName;
        public float friendshipLevel;
    }
    
    public enum TimeOfDay
    {
        Morning,
        Afternoon,
        Evening,
        Night
    }
    
    public enum WeatherType
    {
        Sunny,
        Cloudy,
        Rainy,
        Snowy
    }
    
    // Forward declarations (actual implementations will be in separate files)
    public class Quest { }
    public class QuestObjective { }
    public class Gadget { }
    public class ItemData { }
}
