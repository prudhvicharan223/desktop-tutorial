using UnityEngine;
using System.Collections.Generic;

namespace FutureGadgetAdventure.Systems.Quest
{
    /// <summary>
    /// Quest ScriptableObject - Data-driven quest definition
    /// Supports main quests, side quests, and mini-game quests
    /// Can have multiple objectives and rewards
    /// </summary>
    [CreateAssetMenu(fileName = "New Quest", menuName = "Future Gadget Adventure/Quest/Quest")]
    public class Quest : ScriptableObject
    {
        [Header("Quest Information")]
        public string questID;
        public string questName;
        [TextArea(3, 6)] public string description;
        public QuestType questType = QuestType.SideQuest;
        public Sprite questIcon;
        
        [Header("Quest Chain")]
        public Quest prerequisiteQuest; // Quest that must be completed first
        public List<Quest> followUpQuests = new List<Quest>(); // Quests unlocked after this
        
        [Header("Objectives")]
        public List<QuestObjective> objectives = new List<QuestObjective>();
        
        [Header("Rewards")]
        public int experienceReward = 100;
        public int moneyReward = 50;
        public List<string> itemRewards = new List<string>(); // Item IDs
        public Gameplay.Gadgets.Gadget gadgetReward; // Optional gadget unlock
        
        [Header("Dialogue")]
        [TextArea(2, 4)] public string startDialogue;
        [TextArea(2, 4)] public string completionDialogue;
        public string questGiverNPCID;
        
        [Header("Settings")]
        public bool isRepeatable = false;
        public float timeLimit = 0f; // 0 = no time limit
        public int requiredPlayerLevel = 1;
        
        [Header("Map & Markers")]
        public Vector3 questStartLocation;
        public Vector3 questGoalLocation;
        public bool showQuestMarker = true;
        
        // Runtime state (not serialized)
        [System.NonSerialized] public QuestStatus status = QuestStatus.NotStarted;
        [System.NonSerialized] public float timeStarted;
        [System.NonSerialized] public int currentObjectiveIndex = 0;
        
        /// <summary>
        /// Check if quest can be started
        /// </summary>
        public bool CanStart(int playerLevel)
        {
            // Check level requirement
            if (playerLevel < requiredPlayerLevel)
            {
                return false;
            }
            
            // Check prerequisite
            if (prerequisiteQuest != null && prerequisiteQuest.status != QuestStatus.Completed)
            {
                return false;
            }
            
            // Check if already completed (and not repeatable)
            if (status == QuestStatus.Completed && !isRepeatable)
            {
                return false;
            }
            
            // Check if already active
            if (status == QuestStatus.Active)
            {
                return false;
            }
            
            return true;
        }
        
        /// <summary>
        /// Start the quest
        /// </summary>
        public void StartQuest()
        {
            status = QuestStatus.Active;
            currentObjectiveIndex = 0;
            timeStarted = Time.time;
            
            // Reset objectives
            foreach (QuestObjective objective in objectives)
            {
                objective.currentProgress = 0;
                objective.isCompleted = false;
            }
            
            Core.GameEvents.QuestStarted(this);
            
            Debug.Log($"[Quest] Started: {questName}");
        }
        
        /// <summary>
        /// Update quest progress
        /// </summary>
        public void UpdateProgress(string objectiveID, int amount = 1)
        {
            if (status != QuestStatus.Active) return;
            
            foreach (QuestObjective objective in objectives)
            {
                if (objective.objectiveID == objectiveID && !objective.isCompleted)
                {
                    objective.currentProgress += amount;
                    
                    if (objective.currentProgress >= objective.targetProgress)
                    {
                        objective.currentProgress = objective.targetProgress;
                        objective.isCompleted = true;
                        
                        Core.GameEvents.QuestObjectiveCompleted(this, objective);
                        
                        Debug.Log($"[Quest] Objective completed: {objective.description}");
                    }
                    
                    Core.GameEvents.QuestProgressUpdated(this, objective);
                    break;
                }
            }
            
            // Check if all objectives are complete
            if (AreAllObjectivesComplete())
            {
                CompleteQuest();
            }
        }
        
        /// <summary>
        /// Check if all objectives are completed
        /// </summary>
        public bool AreAllObjectivesComplete()
        {
            foreach (QuestObjective objective in objectives)
            {
                if (!objective.isCompleted)
                {
                    return false;
                }
            }
            return objectives.Count > 0;
        }
        
        /// <summary>
        /// Complete the quest and give rewards
        /// </summary>
        public void CompleteQuest()
        {
            if (status == QuestStatus.Completed) return;
            
            status = QuestStatus.Completed;
            
            // Notify completion
            Core.GameEvents.QuestCompleted(this);
            
            // Give rewards through event system
            GiveRewards();
            
            // Unlock follow-up quests
            foreach (Quest followUp in followUpQuests)
            {
                if (followUp != null)
                {
                    Core.GameEvents.QuestUnlocked(followUp);
                }
            }
            
            Debug.Log($"[Quest] Completed: {questName}");
        }
        
        /// <summary>
        /// Fail the quest
        /// </summary>
        public void FailQuest()
        {
            status = QuestStatus.Failed;
            Core.GameEvents.QuestFailed(this);
            
            Debug.Log($"[Quest] Failed: {questName}");
        }
        
        /// <summary>
        /// Abandon the quest
        /// </summary>
        public void AbandonQuest()
        {
            status = QuestStatus.NotStarted;
            currentObjectiveIndex = 0;
            
            Core.GameEvents.QuestAbandoned(this);
            
            Debug.Log($"[Quest] Abandoned: {questName}");
        }
        
        /// <summary>
        /// Give quest rewards to player
        /// </summary>
        private void GiveRewards()
        {
            // Rewards are given through event system
            // Individual managers listen and apply rewards
            Core.GameEvents.QuestRewardsGiven(this, experienceReward, moneyReward, itemRewards);
            
            // Unlock gadget if any
            if (gadgetReward != null)
            {
                Core.GameEvents.GadgetUnlocked(gadgetReward);
            }
        }
        
        /// <summary>
        /// Get current objective
        /// </summary>
        public QuestObjective GetCurrentObjective()
        {
            if (objectives.Count == 0) return null;
            
            // Find first incomplete objective
            foreach (QuestObjective objective in objectives)
            {
                if (!objective.isCompleted)
                {
                    return objective;
                }
            }
            
            return null;
        }
        
        /// <summary>
        /// Get quest progress as percentage (0-1)
        /// </summary>
        public float GetProgressPercentage()
        {
            if (objectives.Count == 0) return 0f;
            
            float totalProgress = 0f;
            foreach (QuestObjective objective in objectives)
            {
                totalProgress += (float)objective.currentProgress / objective.targetProgress;
            }
            
            return totalProgress / objectives.Count;
        }
        
        /// <summary>
        /// Check if quest has time limit and is expired
        /// </summary>
        public bool IsExpired()
        {
            if (timeLimit <= 0 || status != QuestStatus.Active) return false;
            
            return (Time.time - timeStarted) > timeLimit;
        }
        
        /// <summary>
        /// Get remaining time in seconds
        /// </summary>
        public float GetRemainingTime()
        {
            if (timeLimit <= 0) return float.MaxValue;
            
            float elapsed = Time.time - timeStarted;
            return Mathf.Max(0, timeLimit - elapsed);
        }
    }
    
    /// <summary>
    /// Individual quest objective
    /// </summary>
    [System.Serializable]
    public class QuestObjective
    {
        public string objectiveID;
        [TextArea(2, 3)] public string description;
        public ObjectiveType type;
        public string targetID; // ID of what to interact with
        public int targetProgress = 1;
        public int currentProgress = 0;
        public bool isCompleted = false;
        public bool isOptional = false;
        
        public string GetProgressText()
        {
            return $"{currentProgress}/{targetProgress}";
        }
    }
    
    /// <summary>
    /// Types of quests
    /// </summary>
    public enum QuestType
    {
        MainQuest,
        SideQuest,
        MiniGame,
        Tutorial,
        Daily,
        Repeatable
    }
    
    /// <summary>
    /// Quest completion status
    /// </summary>
    public enum QuestStatus
    {
        NotStarted,
        Active,
        Completed,
        Failed
    }
    
    /// <summary>
    /// Types of quest objectives
    /// </summary>
    public enum ObjectiveType
    {
        TalkToNPC,
        DefeatEnemies,
        CollectItems,
        ReachLocation,
        UseGadget,
        SolveP puzzle,
        EscortNPC,
        Photograph,
        Custom
    }
}
