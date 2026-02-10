using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

namespace FutureGadgetAdventure.UI
{
    /// <summary>
    /// Quest UI display - shows quest log, tracked quest, and objective markers
    /// Handles both HUD quest tracking and full quest log UI
    /// </summary>
    public class QuestUI : MonoBehaviour
    {
        [Header("Quest Tracker HUD")]
        [SerializeField] private GameObject questTrackerPanel;
        [SerializeField] private Text questTitleText;
        [SerializeField] private Text questDescriptionText;
        [SerializeField] private Transform objectivesContainer;
        [SerializeField] private GameObject objectiveItemPrefab;
        
        [Header("Quest Log UI")]
        [SerializeField] private GameObject questLogPanel;
        [SerializeField] private Transform activeQuestsContainer;
        [SerializeField] private Transform availableQuestsContainer;
        [SerializeField] private Transform completedQuestsContainer;
        [SerializeField] private GameObject questLogItemPrefab;
        
        [Header("Quest Detail Panel")]
        [SerializeField] private GameObject questDetailPanel;
        [SerializeField] private Text detailTitleText;
        [SerializeField] private Text detailDescriptionText;
        [SerializeField] private Text detailRewardsText;
        [SerializeField] private Transform detailObjectivesContainer;
        [SerializeField] private Button startQuestButton;
        [SerializeField] private Button abandonQuestButton;
        [SerializeField] private Button trackQuestButton;
        
        [Header("World Markers")]
        [SerializeField] private GameObject questMarkerPrefab;
        [SerializeField] private Transform markersContainer;
        [SerializeField] private float markerMaxDistance = 100f;
        
        [Header("Settings")]
        [SerializeField] private bool showQuestTracker = true;
        [SerializeField] private bool showWorldMarkers = true;
        [SerializeField] private KeyCode questLogKey = KeyCode.J;
        
        // Runtime data
        private Systems.Quest.QuestManager questManager;
        private Systems.Quest.Quest currentlyViewedQuest;
        private List<GameObject> activeMarkers = new List<GameObject>();
        private Camera mainCamera;
        
        private void Awake()
        {
            questManager = FindObjectOfType<Systems.Quest.QuestManager>();
            mainCamera = Camera.main;
            
            // Initially hide panels
            if (questLogPanel != null) questLogPanel.SetActive(false);
            if (questDetailPanel != null) questDetailPanel.SetActive(false);
            
            // Setup button listeners
            if (startQuestButton != null)
            {
                startQuestButton.onClick.AddListener(OnStartQuestClicked);
            }
            if (abandonQuestButton != null)
            {
                abandonQuestButton.onClick.AddListener(OnAbandonQuestClicked);
            }
            if (trackQuestButton != null)
            {
                trackQuestButton.onClick.AddListener(OnTrackQuestClicked);
            }
        }
        
        private void Start()
        {
            // Subscribe to events
            Core.GameEvents.OnQuestStarted += OnQuestStarted;
            Core.GameEvents.OnQuestCompleted += OnQuestCompleted;
            Core.GameEvents.OnQuestFailed += OnQuestFailed;
            Core.GameEvents.OnQuestTracked += OnQuestTracked;
            Core.GameEvents.OnQuestProgressUpdated += OnQuestProgressUpdated;
            
            RefreshQuestTracker();
        }
        
        private void OnDestroy()
        {
            // Unsubscribe from events
            Core.GameEvents.OnQuestStarted -= OnQuestStarted;
            Core.GameEvents.OnQuestCompleted -= OnQuestCompleted;
            Core.GameEvents.OnQuestFailed -= OnQuestFailed;
            Core.GameEvents.OnQuestTracked -= OnQuestTracked;
            Core.GameEvents.OnQuestProgressUpdated -= OnQuestProgressUpdated;
        }
        
        private void Update()
        {
            // Toggle quest log
            if (Input.GetKeyDown(questLogKey))
            {
                ToggleQuestLog();
            }
            
            // Update world markers
            if (showWorldMarkers)
            {
                UpdateWorldMarkers();
            }
        }
        
        /// <summary>
        /// Refresh the quest tracker HUD
        /// </summary>
        private void RefreshQuestTracker()
        {
            if (!showQuestTracker || questManager == null)
            {
                if (questTrackerPanel != null)
                {
                    questTrackerPanel.SetActive(false);
                }
                return;
            }
            
            Systems.Quest.Quest trackedQuest = questManager.GetTrackedQuest();
            
            if (trackedQuest == null)
            {
                if (questTrackerPanel != null)
                {
                    questTrackerPanel.SetActive(false);
                }
                return;
            }
            
            // Show panel
            if (questTrackerPanel != null)
            {
                questTrackerPanel.SetActive(true);
            }
            
            // Update quest info
            if (questTitleText != null)
            {
                questTitleText.text = trackedQuest.questName;
            }
            
            if (questDescriptionText != null)
            {
                questDescriptionText.text = trackedQuest.description;
            }
            
            // Update objectives
            RefreshObjectivesList(trackedQuest);
        }
        
        /// <summary>
        /// Refresh objectives display
        /// </summary>
        private void RefreshObjectivesList(Systems.Quest.Quest quest)
        {
            if (objectivesContainer == null || objectiveItemPrefab == null) return;
            
            // Clear existing
            foreach (Transform child in objectivesContainer)
            {
                Destroy(child.gameObject);
            }
            
            // Create objective items
            foreach (Systems.Quest.QuestObjective objective in quest.objectives)
            {
                GameObject item = Instantiate(objectiveItemPrefab, objectivesContainer);
                
                Text objectiveText = item.GetComponentInChildren<Text>();
                if (objectiveText != null)
                {
                    string prefix = objective.isCompleted ? "[X]" : "[ ]";
                    objectiveText.text = $"{prefix} {objective.description} {objective.GetProgressText()}";
                    
                    if (objective.isCompleted)
                    {
                        objectiveText.color = Color.green;
                    }
                }
            }
        }
        
        /// <summary>
        /// Toggle quest log UI
        /// </summary>
        public void ToggleQuestLog()
        {
            if (questLogPanel == null) return;
            
            bool isActive = questLogPanel.activeSelf;
            questLogPanel.SetActive(!isActive);
            
            if (!isActive)
            {
                RefreshQuestLog();
                
                // Pause game
                Time.timeScale = 0f;
                Cursor.visible = true;
                Cursor.lockState = CursorLockMode.None;
            }
            else
            {
                // Resume game
                Time.timeScale = 1f;
                Cursor.visible = false;
                Cursor.lockState = CursorLockMode.Locked;
            }
        }
        
        /// <summary>
        /// Refresh quest log lists
        /// </summary>
        private void RefreshQuestLog()
        {
            if (questManager == null) return;
            
            PopulateQuestList(activeQuestsContainer, questManager.GetActiveQuests(), "Active");
            PopulateQuestList(availableQuestsContainer, questManager.GetAvailableQuests(), "Available");
            PopulateQuestList(completedQuestsContainer, questManager.GetCompletedQuests(), "Completed");
        }
        
        /// <summary>
        /// Populate a quest list container
        /// </summary>
        private void PopulateQuestList(Transform container, List<Systems.Quest.Quest> quests, string category)
        {
            if (container == null || questLogItemPrefab == null) return;
            
            // Clear existing
            foreach (Transform child in container)
            {
                Destroy(child.gameObject);
            }
            
            // Create quest items
            foreach (Systems.Quest.Quest quest in quests)
            {
                GameObject item = Instantiate(questLogItemPrefab, container);
                
                // Setup quest item
                Text titleText = item.transform.Find("Title")?.GetComponent<Text>();
                if (titleText != null)
                {
                    titleText.text = quest.questName;
                }
                
                Text typeText = item.transform.Find("Type")?.GetComponent<Text>();
                if (typeText != null)
                {
                    typeText.text = quest.questType.ToString();
                }
                
                // Add click listener
                Button button = item.GetComponent<Button>();
                if (button != null)
                {
                    Systems.Quest.Quest questCopy = quest; // Capture for closure
                    button.onClick.AddListener(() => ShowQuestDetail(questCopy));
                }
            }
        }
        
        /// <summary>
        /// Show detailed quest information
        /// </summary>
        private void ShowQuestDetail(Systems.Quest.Quest quest)
        {
            if (questDetailPanel == null) return;
            
            currentlyViewedQuest = quest;
            questDetailPanel.SetActive(true);
            
            // Update detail panel
            if (detailTitleText != null)
            {
                detailTitleText.text = quest.questName;
            }
            
            if (detailDescriptionText != null)
            {
                detailDescriptionText.text = quest.description;
            }
            
            if (detailRewardsText != null)
            {
                detailRewardsText.text = $"Rewards:\nXP: {quest.experienceReward}\nMoney: {quest.moneyReward}";
            }
            
            // Update objectives
            if (detailObjectivesContainer != null)
            {
                foreach (Transform child in detailObjectivesContainer)
                {
                    Destroy(child.gameObject);
                }
                
                foreach (Systems.Quest.QuestObjective objective in quest.objectives)
                {
                    GameObject item = Instantiate(objectiveItemPrefab, detailObjectivesContainer);
                    Text text = item.GetComponentInChildren<Text>();
                    if (text != null)
                    {
                        text.text = objective.description;
                    }
                }
            }
            
            // Update buttons
            if (startQuestButton != null)
            {
                startQuestButton.gameObject.SetActive(quest.status == Systems.Quest.QuestStatus.NotStarted);
            }
            
            if (abandonQuestButton != null)
            {
                abandonQuestButton.gameObject.SetActive(quest.status == Systems.Quest.QuestStatus.Active);
            }
            
            if (trackQuestButton != null)
            {
                trackQuestButton.gameObject.SetActive(quest.status == Systems.Quest.QuestStatus.Active);
            }
        }
        
        /// <summary>
        /// Update world quest markers
        /// </summary>
        private void UpdateWorldMarkers()
        {
            if (!showWorldMarkers || questManager == null || mainCamera == null) return;
            
            // This is a simplified version - in production, you'd optimize this
            // For now, just update tracked quest marker
            Systems.Quest.Quest trackedQuest = questManager.GetTrackedQuest();
            if (trackedQuest != null && trackedQuest.showQuestMarker)
            {
                // Position marker at quest goal
                // This would need a proper marker management system in production
            }
        }
        
        // Button callbacks
        private void OnStartQuestClicked()
        {
            if (currentlyViewedQuest != null && questManager != null)
            {
                questManager.StartQuest(currentlyViewedQuest);
                questDetailPanel.SetActive(false);
                RefreshQuestLog();
            }
        }
        
        private void OnAbandonQuestClicked()
        {
            if (currentlyViewedQuest != null && questManager != null)
            {
                questManager.AbandonQuest(currentlyViewedQuest);
                questDetailPanel.SetActive(false);
                RefreshQuestLog();
            }
        }
        
        private void OnTrackQuestClicked()
        {
            if (currentlyViewedQuest != null && questManager != null)
            {
                questManager.SetTrackedQuest(currentlyViewedQuest);
                questDetailPanel.SetActive(false);
            }
        }
        
        // Event handlers
        private void OnQuestStarted(Systems.Quest.Quest quest)
        {
            RefreshQuestTracker();
            RefreshQuestLog();
        }
        
        private void OnQuestCompleted(Systems.Quest.Quest quest)
        {
            RefreshQuestTracker();
            RefreshQuestLog();
        }
        
        private void OnQuestFailed(Systems.Quest.Quest quest)
        {
            RefreshQuestTracker();
            RefreshQuestLog();
        }
        
        private void OnQuestTracked(Systems.Quest.Quest quest)
        {
            RefreshQuestTracker();
        }
        
        private void OnQuestProgressUpdated(Systems.Quest.Quest quest, Systems.Quest.QuestObjective objective)
        {
            RefreshQuestTracker();
        }
        
        public void SetQuestTrackerVisible(bool visible)
        {
            showQuestTracker = visible;
            RefreshQuestTracker();
        }
    }
}
