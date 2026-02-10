using UnityEngine;
using System.Collections.Generic;
using System.Linq;

namespace FutureGadgetAdventure.Gameplay.Gadgets
{
    /// <summary>
    /// Manages all player gadgets - inventory, selection, cooldowns, and unlocking
    /// Integrates with GadgetController for actual gadget usage
    /// Uses ScriptableObject pattern for data-driven gadget management
    /// </summary>
    public class GadgetManager : MonoBehaviour
    {
        [Header("Gadget Inventory")]
        [SerializeField] private List<Gadget> allGadgets = new List<Gadget>();
        [SerializeField] private List<Gadget> unlockedGadgets = new List<Gadget>();
        [SerializeField] private int maxGadgetSlots = 5;
        
        [Header("Selection")]
        [SerializeField] private int currentGadgetIndex = 0;
        [SerializeField] private Gadget currentGadget;
        
        [Header("Cooldown Tracking")]
        private Dictionary<string, float> gadgetCooldowns = new Dictionary<string, float>();
        private Dictionary<string, float> gadgetLastUsedTime = new Dictionary<string, float>();
        
        [Header("References")]
        [SerializeField] private GadgetController gadgetController;
        [SerializeField] private Player.PlayerController playerController;
        
        [Header("Upgrade System")]
        [SerializeField] private int upgradeParts = 0;
        
        private void Awake()
        {
            // Find player controller if not assigned
            if (playerController == null)
            {
                playerController = FindObjectOfType<Player.PlayerController>();
            }
            
            // Find gadget controller if not assigned
            if (gadgetController == null)
            {
                gadgetController = FindObjectOfType<GadgetController>();
            }
            
            // Initialize cooldown dictionary
            foreach (Gadget gadget in allGadgets)
            {
                if (gadget != null)
                {
                    gadgetCooldowns[gadget.gadgetID] = 0f;
                    gadgetLastUsedTime[gadget.gadgetID] = -999f;
                }
            }
        }
        
        private void Start()
        {
            // Select first gadget if available
            if (unlockedGadgets.Count > 0)
            {
                SelectGadget(0);
            }
            
            // Subscribe to events
            Core.GameEvents.OnGadgetUsed += OnGadgetUsed;
        }
        
        private void OnDestroy()
        {
            // Unsubscribe from events
            Core.GameEvents.OnGadgetUsed -= OnGadgetUsed;
        }
        
        private void Update()
        {
            UpdateCooldowns();
            HandleGadgetInput();
        }
        
        private void UpdateCooldowns()
        {
            // Update all gadget cooldowns
            List<string> keys = gadgetCooldowns.Keys.ToList();
            foreach (string gadgetID in keys)
            {
                if (gadgetCooldowns[gadgetID] > 0)
                {
                    gadgetCooldowns[gadgetID] -= Time.deltaTime;
                    
                    if (gadgetCooldowns[gadgetID] <= 0)
                    {
                        gadgetCooldowns[gadgetID] = 0;
                        Core.GameEvents.GadgetCooldownComplete(GetGadgetByID(gadgetID));
                    }
                }
            }
        }
        
        private void HandleGadgetInput()
        {
            // Cycle gadgets with number keys (1-5)
            for (int i = 0; i < Mathf.Min(maxGadgetSlots, unlockedGadgets.Count); i++)
            {
                if (Input.GetKeyDown(KeyCode.Alpha1 + i))
                {
                    SelectGadget(i);
                }
            }
            
            // Cycle with mouse wheel or Q/E keys
            if (Input.GetKeyDown(KeyCode.Q) || Input.mouseScrollDelta.y > 0)
            {
                SelectPreviousGadget();
            }
            else if (Input.GetKeyDown(KeyCode.E) || Input.mouseScrollDelta.y < 0)
            {
                SelectNextGadget();
            }
        }
        
        /// <summary>
        /// Unlock a new gadget for the player
        /// </summary>
        public bool UnlockGadget(Gadget gadget)
        {
            if (gadget == null)
            {
                Debug.LogWarning("[GadgetManager] Attempted to unlock null gadget");
                return false;
            }
            
            if (unlockedGadgets.Contains(gadget))
            {
                Debug.LogWarning($"[GadgetManager] Gadget {gadget.gadgetName} already unlocked");
                return false;
            }
            
            if (unlockedGadgets.Count >= maxGadgetSlots)
            {
                Debug.LogWarning("[GadgetManager] Maximum gadget slots reached");
                return false;
            }
            
            unlockedGadgets.Add(gadget);
            Core.GameEvents.GadgetUnlocked(gadget);
            Core.GameEvents.ShowNotification($"Unlocked: {gadget.gadgetName}!");
            
            Debug.Log($"[GadgetManager] Unlocked gadget: {gadget.gadgetName}");
            
            return true;
        }
        
        /// <summary>
        /// Lock/remove a gadget
        /// </summary>
        public bool LockGadget(Gadget gadget)
        {
            if (unlockedGadgets.Remove(gadget))
            {
                if (currentGadget == gadget)
                {
                    SelectGadget(0);
                }
                return true;
            }
            return false;
        }
        
        /// <summary>
        /// Select a gadget by index
        /// </summary>
        public void SelectGadget(int index)
        {
            if (unlockedGadgets.Count == 0) return;
            
            currentGadgetIndex = Mathf.Clamp(index, 0, unlockedGadgets.Count - 1);
            currentGadget = unlockedGadgets[currentGadgetIndex];
            
            Core.GameEvents.GadgetSelected(currentGadget);
            
            Debug.Log($"[GadgetManager] Selected: {currentGadget.gadgetName}");
        }
        
        /// <summary>
        /// Select next gadget in inventory
        /// </summary>
        public void SelectNextGadget()
        {
            if (unlockedGadgets.Count == 0) return;
            
            currentGadgetIndex = (currentGadgetIndex + 1) % unlockedGadgets.Count;
            SelectGadget(currentGadgetIndex);
        }
        
        /// <summary>
        /// Select previous gadget in inventory
        /// </summary>
        public void SelectPreviousGadget()
        {
            if (unlockedGadgets.Count == 0) return;
            
            currentGadgetIndex--;
            if (currentGadgetIndex < 0) currentGadgetIndex = unlockedGadgets.Count - 1;
            
            SelectGadget(currentGadgetIndex);
        }
        
        /// <summary>
        /// Check if gadget is on cooldown
        /// </summary>
        public bool IsOnCooldown(Gadget gadget)
        {
            if (gadget == null) return true;
            return gadgetCooldowns.ContainsKey(gadget.gadgetID) && gadgetCooldowns[gadget.gadgetID] > 0;
        }
        
        /// <summary>
        /// Get remaining cooldown time for a gadget
        /// </summary>
        public float GetCooldownRemaining(Gadget gadget)
        {
            if (gadget == null) return 0f;
            return gadgetCooldowns.ContainsKey(gadget.gadgetID) ? gadgetCooldowns[gadget.gadgetID] : 0f;
        }
        
        /// <summary>
        /// Get cooldown progress (0-1)
        /// </summary>
        public float GetCooldownProgress(Gadget gadget)
        {
            if (gadget == null) return 1f;
            
            float remaining = GetCooldownRemaining(gadget);
            return 1f - (remaining / gadget.cooldownTime);
        }
        
        /// <summary>
        /// Called when a gadget is used
        /// </summary>
        private void OnGadgetUsed(Gadget gadget)
        {
            if (gadget == null) return;
            
            // Start cooldown
            gadgetCooldowns[gadget.gadgetID] = gadget.cooldownTime;
            gadgetLastUsedTime[gadget.gadgetID] = Time.time;
            
            Debug.Log($"[GadgetManager] {gadget.gadgetName} used, cooldown: {gadget.cooldownTime}s");
        }
        
        /// <summary>
        /// Upgrade a gadget using upgrade parts
        /// </summary>
        public bool UpgradeGadget(Gadget gadget)
        {
            if (gadget == null) return false;
            
            if (!unlockedGadgets.Contains(gadget))
            {
                Core.GameEvents.ShowNotification("Gadget not unlocked!");
                return false;
            }
            
            if (gadget.upgradeLevel >= gadget.maxUpgradeLevel)
            {
                Core.GameEvents.ShowNotification("Already at max level!");
                return false;
            }
            
            if (upgradeParts < gadget.upgradePartsCost)
            {
                Core.GameEvents.ShowNotification("Not enough upgrade parts!");
                return false;
            }
            
            // Consume upgrade parts
            upgradeParts -= gadget.upgradePartsCost;
            
            // Upgrade gadget
            gadget.Upgrade();
            
            Core.GameEvents.ShowNotification($"{gadget.gadgetName} upgraded to Level {gadget.upgradeLevel}!");
            
            return true;
        }
        
        /// <summary>
        /// Add upgrade parts
        /// </summary>
        public void AddUpgradeParts(int amount)
        {
            upgradeParts += amount;
            Core.GameEvents.ShowNotification($"Gained {amount} upgrade parts!");
        }
        
        /// <summary>
        /// Get gadget by ID
        /// </summary>
        private Gadget GetGadgetByID(string id)
        {
            return allGadgets.Find(g => g != null && g.gadgetID == id);
        }
        
        // Getters
        public Gadget GetCurrentGadget() => currentGadget;
        public List<Gadget> GetUnlockedGadgets() => new List<Gadget>(unlockedGadgets);
        public List<Gadget> GetAllGadgets() => new List<Gadget>(allGadgets);
        public int GetUpgradeParts() => upgradeParts;
        public int GetCurrentGadgetIndex() => currentGadgetIndex;
    }
}
