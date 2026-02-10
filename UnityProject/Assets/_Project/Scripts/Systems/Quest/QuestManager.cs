using UnityEngine;
using System.Collections.Generic;
using System.Linq;

namespace FutureGadgetAdventure.Systems.Quest
{
    /// <summary>
    /// Central quest management system
    /// Tracks active quests, completed quests, and available quests
    /// Handles quest state transitions and notifications
    /// </summary>
    public class QuestManager : MonoBehaviour
    {
        [Header("Quest Database")]
        [SerializeField] private List<Quest> allQuests = new List<Quest>();
        
        [Header("Quest State")]
        [SerializeField] private List<Quest> activeQuests = new List<Quest>();
        [SerializeField] private List<Quest> completedQuests = new List<Quest>();
        [SerializeField] private List<Quest> availableQuests = new List<Quest>();
        
        [Header("Settings")]
        [SerializeField] private int maxActiveQuests = 5;
        [SerializeField] private bool autoTrackNewQuests = true;
        [SerializeField] private Quest trackedQuest;
        
        [Header("Player Stats")]
        [SerializeField] private int playerLevel = 1;
        [SerializeField] private int totalQuestsCompleted = 0;
        
        private void Awake()
        {
            // Subscribe to events
            Core.GameEvents.OnQuestCompleted += OnQuestCompleted;
            Core.GameEvents.OnQuestFailed += OnQuestFailed;
        }
        
        private void OnDestroy()
        {
            // Unsubscribe from events
            Core.GameEvents.OnQuestCompleted -= OnQuestCompleted;
            Core.GameEvents.OnQuestFailed -= OnQuestFailed;
        }
        
        private void Start()
        {
            RefreshAvailableQuests();
        }
        
        private void Update()
        {
            UpdateActiveQuests();
        }
        
        /// <summary>
        /// Update all active quests (check time limits, etc.)
        /// </summary>
        private void UpdateActiveQuests()
        {
            List<Quest> questsToFail = new List<Quest>();
            
            foreach (Quest quest in activeQuests)
            {
                // Check time limit
                if (quest.timeLimit > 0 && quest.IsExpired())
                {
                    questsToFail.Add(quest);
                }
            }
            
            // Fail expired quests
            foreach (Quest quest in questsToFail)
            {
                quest.FailQuest();
            }
        }
        
        /// <summary>
        /// Start a new quest
        /// </summary>
        public bool StartQuest(Quest quest)
        {
            if (quest == null)
            {
                Debug.LogWarning("[QuestManager] Attempted to start null quest");
                return false;
            }
            
            if (!quest.CanStart(playerLevel))
            {
                Debug.LogWarning($"[QuestManager] Cannot start quest: {quest.questName}");
                Core.GameEvents.ShowNotification("Quest requirements not met!");
                return false;
            }
            
            if (activeQuests.Count >= maxActiveQuests)
            {
                Debug.LogWarning("[QuestManager] Maximum active quests reached");
                Core.GameEvents.ShowNotification("Too many active quests!");
                return false;
            }
            
            if (activeQuests.Contains(quest))
            {
                Debug.LogWarning($"[QuestManager] Quest already active: {quest.questName}");
                return false;
            }
            
            // Start the quest
            quest.StartQuest();
            activeQuests.Add(quest);
            
            if (availableQuests.Contains(quest))
            {
                availableQuests.Remove(quest);
            }
            
            // Auto-track if enabled
            if (autoTrackNewQuests)
            {
                SetTrackedQuest(quest);
            }
            
            Core.GameEvents.ShowNotification($"Quest Started: {quest.questName}");
            
            Debug.Log($"[QuestManager] Started quest: {quest.questName}");
            
            return true;
        }
        
        /// <summary>
        /// Abandon an active quest
        /// </summary>
        public bool AbandonQuest(Quest quest)
        {
            if (quest == null || !activeQuests.Contains(quest))
            {
                return false;
            }
            
            quest.AbandonQuest();
            activeQuests.Remove(quest);
            
            // Make it available again if it's repeatable
            if (quest.isRepeatable)
            {
                availableQuests.Add(quest);
            }
            
            if (trackedQuest == quest)
            {
                trackedQuest = null;
            }
            
            return true;
        }
        
        /// <summary>
        /// Update quest progress
        /// </summary>
        public void UpdateQuestProgress(string questID, string objectiveID, int amount = 1)
        {
            Quest quest = FindActiveQuest(questID);
            if (quest != null)
            {
                quest.UpdateProgress(objectiveID, amount);
            }
        }
        
        /// <summary>
        /// Find an active quest by ID
        /// </summary>
        public Quest FindActiveQuest(string questID)
        {
            return activeQuests.Find(q => q.questID == questID);
        }
        
        /// <summary>
        /// Find any quest by ID
        /// </summary>
        public Quest FindQuest(string questID)
        {
            return allQuests.Find(q => q.questID == questID);
        }
        
        /// <summary>
        /// Set currently tracked quest for HUD
        /// </summary>
        public void SetTrackedQuest(Quest quest)
        {
            if (quest == null || !activeQuests.Contains(quest))
            {
                trackedQuest = null;
                return;
            }
            
            trackedQuest = quest;
            Core.GameEvents.QuestTracked(quest);
            
            Debug.Log($"[QuestManager] Now tracking: {quest.questName}");
        }
        
        /// <summary>
        /// Refresh list of available quests based on player level and prerequisites
        /// </summary>
        public void RefreshAvailableQuests()
        {
            availableQuests.Clear();
            
            foreach (Quest quest in allQuests)
            {
                if (quest == null) continue;
                
                if (quest.CanStart(playerLevel) && 
                    !activeQuests.Contains(quest) && 
                    !completedQuests.Contains(quest))
                {
                    availableQuests.Add(quest);
                }
            }
            
            Debug.Log($"[QuestManager] {availableQuests.Count} quests available");
        }
        
        /// <summary>
        /// Called when quest is completed
        /// </summary>
        private void OnQuestCompleted(Quest quest)
        {
            if (quest == null) return;
            
            if (activeQuests.Contains(quest))
            {
                activeQuests.Remove(quest);
            }
            
            if (!completedQuests.Contains(quest))
            {
                completedQuests.Add(quest);
                totalQuestsCompleted++;
            }
            
            if (trackedQuest == quest)
            {
                // Auto-track next quest if any
                if (activeQuests.Count > 0)
                {
                    SetTrackedQuest(activeQuests[0]);
                }
                else
                {
                    trackedQuest = null;
                }
            }
            
            // Refresh available quests (follow-ups might be unlocked)
            RefreshAvailableQuests();
            
            Core.GameEvents.ShowNotification($"Quest Completed: {quest.questName}");
        }
        
        /// <summary>
        /// Called when quest is failed
        /// </summary>
        private void OnQuestFailed(Quest quest)
        {
            if (quest == null) return;
            
            if (activeQuests.Contains(quest))
            {
                activeQuests.Remove(quest);
            }
            
            if (trackedQuest == quest)
            {
                trackedQuest = null;
            }
            
            // Make available again if repeatable
            if (quest.isRepeatable && !availableQuests.Contains(quest))
            {
                availableQuests.Add(quest);
            }
            
            Core.GameEvents.ShowNotification($"Quest Failed: {quest.questName}");
        }
        
        /// <summary>
        /// Get quests by type
        /// </summary>
        public List<Quest> GetQuestsByType(QuestType type)
        {
            return activeQuests.Where(q => q.questType == type).ToList();
        }
        
        /// <summary>
        /// Check if a quest is active
        /// </summary>
        public bool IsQuestActive(string questID)
        {
            return activeQuests.Any(q => q.questID == questID);
        }
        
        /// <summary>
        /// Check if a quest is completed
        /// </summary>
        public bool IsQuestCompleted(string questID)
        {
            return completedQuests.Any(q => q.questID == questID);
        }
        
        /// <summary>
        /// Set player level (affects available quests)
        /// </summary>
        public void SetPlayerLevel(int level)
        {
            playerLevel = level;
            RefreshAvailableQuests();
        }
        
        /// <summary>
        /// Get quest completion statistics
        /// </summary>
        public void GetQuestStats(out int total, out int completed, out int active, out int available)
        {
            total = allQuests.Count;
            completed = completedQuests.Count;
            active = activeQuests.Count;
            available = availableQuests.Count;
        }
        
        // Getters
        public List<Quest> GetActiveQuests() => new List<Quest>(activeQuests);
        public List<Quest> GetCompletedQuests() => new List<Quest>(completedQuests);
        public List<Quest> GetAvailableQuests() => new List<Quest>(availableQuests);
        public Quest GetTrackedQuest() => trackedQuest;
        public int GetTotalQuestsCompleted() => totalQuestsCompleted;
        public int GetPlayerLevel() => playerLevel;
        
        /// <summary>
        /// Initialize manager
        /// </summary>
        public void Initialize()
        {
            Debug.Log("[QuestManager] Initialized");
            RefreshAvailableQuests();
        }
    }
}
