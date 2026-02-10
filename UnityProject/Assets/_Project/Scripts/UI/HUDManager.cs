using UnityEngine;
using UnityEngine.UI;

namespace FutureGadgetAdventure.UI
{
    /// <summary>
    /// Central HUD manager coordinating all HUD elements
    /// Controls visibility, layout, and updates for all on-screen UI
    /// </summary>
    public class HUDManager : MonoBehaviour
    {
        [Header("HUD Panels")]
        [SerializeField] private GameObject mainHUD;
        [SerializeField] private GameObject healthPanel;
        [SerializeField] private GameObject energyPanel;
        [SerializeField] private GameObject questTrackerPanel;
        [SerializeField] private GameObject gadgetPanel;
        [SerializeField] private GameObject minimap;
        [SerializeField] private GameObject notificationPanel;
        
        [Header("HUD Elements")]
        [SerializeField] private HealthBar healthBar;
        [SerializeField] private StaminaBar staminaBar;
        [SerializeField] private QuestUI questUI;
        [SerializeField] private Text timeDisplay;
        [SerializeField] private Text locationDisplay;
        
        [Header("Notifications")]
        [SerializeField] private Text notificationText;
        [SerializeField] private float notificationDuration = 3f;
        [SerializeField] private CanvasGroup notificationCanvasGroup;
        
        [Header("Companion Dialogue")]
        [SerializeField] private GameObject companionDialoguePanel;
        [SerializeField] private Text companionDialogueText;
        [SerializeField] private Image companionPortrait;
        
        [Header("Settings")]
        [SerializeField] private bool showHUDOnStart = true;
        [SerializeField] private KeyCode toggleHUDKey = KeyCode.H;
        [SerializeField] private bool isMobilePlatform = false;
        
        // State
        private bool isHUDVisible = true;
        private float notificationTimer = 0f;
        private float companionDialogueTimer = 0f;
        private Systems.World.WorldTimeSystem timeSystem;
        
        private void Awake()
        {
            timeSystem = FindObjectOfType<Systems.World.WorldTimeSystem>();
            
            // Auto-detect mobile platform
#if UNITY_ANDROID || UNITY_IOS
            isMobilePlatform = true;
#endif
            
            // Hide notification panels initially
            if (notificationPanel != null)
            {
                notificationPanel.SetActive(false);
            }
            
            if (companionDialoguePanel != null)
            {
                companionDialoguePanel.SetActive(false);
            }
        }
        
        private void Start()
        {
            // Subscribe to events
            Core.GameEvents.OnShowNotification += ShowNotification;
            Core.GameEvents.OnShowTimedNotification += ShowTimedNotification;
            Core.GameEvents.OnShowCompanionDialogue += ShowCompanionDialogue;
            
            // Set initial HUD visibility
            SetHUDVisible(showHUDOnStart);
        }
        
        private void OnDestroy()
        {
            // Unsubscribe from events
            Core.GameEvents.OnShowNotification -= ShowNotification;
            Core.GameEvents.OnShowTimedNotification -= ShowTimedNotification;
            Core.GameEvents.OnShowCompanionDialogue -= ShowCompanionDialogue;
        }
        
        private void Update()
        {
            // Toggle HUD
            if (Input.GetKeyDown(toggleHUDKey))
            {
                ToggleHUD();
            }
            
            // Update time display
            UpdateTimeDisplay();
            
            // Update notifications
            UpdateNotifications();
            UpdateCompanionDialogue();
        }
        
        /// <summary>
        /// Toggle HUD visibility
        /// </summary>
        public void ToggleHUD()
        {
            isHUDVisible = !isHUDVisible;
            SetHUDVisible(isHUDVisible);
        }
        
        /// <summary>
        /// Set HUD visibility
        /// </summary>
        public void SetHUDVisible(bool visible)
        {
            isHUDVisible = visible;
            
            if (mainHUD != null)
            {
                mainHUD.SetActive(visible);
            }
        }
        
        /// <summary>
        /// Show specific HUD panel
        /// </summary>
        public void ShowPanel(HUDPanel panel)
        {
            GameObject panelObject = GetPanelObject(panel);
            if (panelObject != null)
            {
                panelObject.SetActive(true);
            }
        }
        
        /// <summary>
        /// Hide specific HUD panel
        /// </summary>
        public void HidePanel(HUDPanel panel)
        {
            GameObject panelObject = GetPanelObject(panel);
            if (panelObject != null)
            {
                panelObject.SetActive(false);
            }
        }
        
        private GameObject GetPanelObject(HUDPanel panel)
        {
            switch (panel)
            {
                case HUDPanel.Health: return healthPanel;
                case HUDPanel.Energy: return energyPanel;
                case HUDPanel.QuestTracker: return questTrackerPanel;
                case HUDPanel.Gadget: return gadgetPanel;
                case HUDPanel.Minimap: return minimap;
                default: return null;
            }
        }
        
        /// <summary>
        /// Show a notification message
        /// </summary>
        private void ShowNotification(string message)
        {
            ShowTimedNotification(message, notificationDuration);
        }
        
        /// <summary>
        /// Show a timed notification message
        /// </summary>
        private void ShowTimedNotification(string message, float duration)
        {
            if (notificationPanel != null && notificationText != null)
            {
                notificationPanel.SetActive(true);
                notificationText.text = message;
                notificationTimer = duration;
                
                if (notificationCanvasGroup != null)
                {
                    notificationCanvasGroup.alpha = 1f;
                }
            }
        }
        
        /// <summary>
        /// Show companion dialogue
        /// </summary>
        private void ShowCompanionDialogue(string message, float duration)
        {
            if (companionDialoguePanel != null && companionDialogueText != null)
            {
                companionDialoguePanel.SetActive(true);
                companionDialogueText.text = message;
                companionDialogueTimer = duration;
            }
        }
        
        private void UpdateNotifications()
        {
            if (notificationTimer > 0)
            {
                notificationTimer -= Time.deltaTime;
                
                // Fade out in last second
                if (notificationTimer < 1f && notificationCanvasGroup != null)
                {
                    notificationCanvasGroup.alpha = notificationTimer;
                }
                
                if (notificationTimer <= 0 && notificationPanel != null)
                {
                    notificationPanel.SetActive(false);
                }
            }
        }
        
        private void UpdateCompanionDialogue()
        {
            if (companionDialogueTimer > 0)
            {
                companionDialogueTimer -= Time.deltaTime;
                
                if (companionDialogueTimer <= 0 && companionDialoguePanel != null)
                {
                    companionDialoguePanel.SetActive(false);
                }
            }
        }
        
        private void UpdateTimeDisplay()
        {
            if (timeDisplay != null && timeSystem != null)
            {
                timeDisplay.text = timeSystem.GetFormattedTime();
            }
        }
        
        /// <summary>
        /// Update location display
        /// </summary>
        public void UpdateLocation(string locationName)
        {
            if (locationDisplay != null)
            {
                locationDisplay.text = locationName;
            }
        }
        
        /// <summary>
        /// Set companion portrait
        /// </summary>
        public void SetCompanionPortrait(Sprite portrait)
        {
            if (companionPortrait != null)
            {
                companionPortrait.sprite = portrait;
            }
        }
        
        public bool IsHUDVisible() => isHUDVisible;
        public bool IsMobilePlatform() => isMobilePlatform;
    }
    
    public enum HUDPanel
    {
        Health,
        Energy,
        QuestTracker,
        Gadget,
        Minimap
    }
}
