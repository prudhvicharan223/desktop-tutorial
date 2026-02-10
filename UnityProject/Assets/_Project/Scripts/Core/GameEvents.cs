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
        public static event Action<Systems.Quest.Quest> OnQuestStarted;
        public static event Action<Systems.Quest.Quest> OnQuestCompleted;
        public static event Action<Systems.Quest.Quest> OnQuestFailed;
        public static event Action<Systems.Quest.Quest> OnQuestAbandoned;
        public static event Action<Systems.Quest.Quest> OnQuestTracked;
        public static event Action<Systems.Quest.Quest> OnQuestUnlocked;
        public static event Action<Systems.Quest.Quest, Systems.Quest.QuestObjective> OnQuestObjectiveCompleted;
        public static event Action<Systems.Quest.Quest, Systems.Quest.QuestObjective> OnQuestProgressUpdated;
        public static event Action<Systems.Quest.Quest, int, int, System.Collections.Generic.List<string>> OnQuestRewardsGiven;
        
        // === GADGET EVENTS ===
        public static event Action<Gameplay.Gadgets.Gadget> OnGadgetUnlocked;
        public static event Action<Gameplay.Gadgets.Gadget> OnGadgetUsed;
        public static event Action<Gameplay.Gadgets.Gadget> OnGadgetUpgraded;
        public static event Action<Gameplay.Gadgets.Gadget> OnGadgetSelected;
        public static event Action<Gameplay.Gadgets.Gadget> OnGadgetCooldownComplete;
        
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
        public static event Action<string, float> OnShowCompanionDialogue;
        public static event Action<DialogueData> OnDialogueStarted;
        public static event Action OnDialogueEnded;
        public static event Action<string> OnShowHint;
        
        // === SAVE/LOAD EVENTS ===
        public static event Action<int> OnGameSaved;
        public static event Action<int> OnGameLoaded;
        
        // === NPC EVENTS ===
        public static event Action<NPCData> OnNPCInteracted;
        public static event Action<NPCData, float> OnFriendshipChanged;
        
        // === WORLD EVENTS ===
        public static event Action<Systems.World.TimeOfDayPeriod> OnTimeOfDayChanged;
        public static event Action<int> OnDayChanged;
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
        public static void QuestStarted(Systems.Quest.Quest quest) => OnQuestStarted?.Invoke(quest);
        public static void QuestCompleted(Systems.Quest.Quest quest) => OnQuestCompleted?.Invoke(quest);
        public static void QuestFailed(Systems.Quest.Quest quest) => OnQuestFailed?.Invoke(quest);
        public static void QuestAbandoned(Systems.Quest.Quest quest) => OnQuestAbandoned?.Invoke(quest);
        public static void QuestTracked(Systems.Quest.Quest quest) => OnQuestTracked?.Invoke(quest);
        public static void QuestUnlocked(Systems.Quest.Quest quest) => OnQuestUnlocked?.Invoke(quest);
        public static void QuestObjectiveCompleted(Systems.Quest.Quest quest, Systems.Quest.QuestObjective objective) => OnQuestObjectiveCompleted?.Invoke(quest, objective);
        public static void QuestProgressUpdated(Systems.Quest.Quest quest, Systems.Quest.QuestObjective objective) => OnQuestProgressUpdated?.Invoke(quest, objective);
        public static void QuestRewardsGiven(Systems.Quest.Quest quest, int exp, int money, System.Collections.Generic.List<string> items) => OnQuestRewardsGiven?.Invoke(quest, exp, money, items);
        
        // Gadget triggers
        public static void GadgetUnlocked(Gameplay.Gadgets.Gadget gadget) => OnGadgetUnlocked?.Invoke(gadget);
        public static void GadgetUsed(Gameplay.Gadgets.Gadget gadget) => OnGadgetUsed?.Invoke(gadget);
        public static void GadgetUpgraded(Gameplay.Gadgets.Gadget gadget) => OnGadgetUpgraded?.Invoke(gadget);
        public static void GadgetSelected(Gameplay.Gadgets.Gadget gadget) => OnGadgetSelected?.Invoke(gadget);
        public static void GadgetCooldownComplete(Gameplay.Gadgets.Gadget gadget) => OnGadgetCooldownComplete?.Invoke(gadget);
        
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
        public static void ShowCompanionDialogue(string message, float duration) => OnShowCompanionDialogue?.Invoke(message, duration);
        public static void DialogueStarted(DialogueData dialogue) => OnDialogueStarted?.Invoke(dialogue);
        public static void DialogueEnded() => OnDialogueEnded?.Invoke();
        public static void ShowHint(string hint) => OnShowHint?.Invoke(hint);
        
        // Save/Load triggers
        public static void GameSaved(int slot) => OnGameSaved?.Invoke(slot);
        public static void GameLoaded(int slot) => OnGameLoaded?.Invoke(slot);
        
        // NPC triggers
        public static void NPCInteracted(NPCData npc) => OnNPCInteracted?.Invoke(npc);
        public static void FriendshipChanged(NPCData npc, float newValue) => OnFriendshipChanged?.Invoke(npc, newValue);
        
        // World triggers
        public static void TimeOfDayChanged(Systems.World.TimeOfDayPeriod period) => OnTimeOfDayChanged?.Invoke(period);
        public static void DayChanged(int day) => OnDayChanged?.Invoke(day);
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
    
    public enum WeatherType
    {
        Sunny,
        Cloudy,
        Rainy,
        Snowy
    }
    
    // Supporting data structures
    public class ItemData { }
}
