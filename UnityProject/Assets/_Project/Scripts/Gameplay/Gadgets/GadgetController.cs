using UnityEngine;
using System.Collections.Generic;

namespace FutureGadgetAdventure.Gameplay.Gadgets
{
    /// <summary>
    /// Manages all gadgets for the player
    /// Handles inventory, selection, usage, and cooldowns
    /// </summary>
    public class GadgetController : MonoBehaviour
    {
        [Header("Gadget Inventory")]
        [SerializeField] private List<Gadget> unlockedGadgets = new List<Gadget>();
        [SerializeField] private Gadget currentGadget;
        [SerializeField] private int currentGadgetIndex = 0;
        
        [Header("UI References")]
        [SerializeField] private GameObject gadgetWheelUI;
        [SerializeField] private KeyCode gadgetMenuKey = KeyCode.Q;
        [SerializeField] private KeyCode useGadgetKey = KeyCode.E;
        
        private Dictionary<Gadget, float> gadgetCooldowns = new Dictionary<Gadget, float>();
        private Player.PlayerController playerController;
        private bool isGadgetWheelOpen = false;
        
        private void Awake()
        {
            playerController = GetComponent<Player.PlayerController>();
        }
        
        private void Start()
        {
            // Select first gadget if available
            if (unlockedGadgets.Count > 0)
            {
                SelectGadget(0);
            }
            
            if (gadgetWheelUI != null)
            {
                gadgetWheelUI.SetActive(false);
            }
        }
        
        private void Update()
        {
            HandleGadgetInput();
            UpdateCooldowns();
        }
        
        private void HandleGadgetInput()
        {
            // Open gadget wheel
            if (Input.GetKeyDown(gadgetMenuKey))
            {
                ToggleGadgetWheel();
            }
            
            // Quick select gadgets with number keys
            if (Input.GetKeyDown(KeyCode.Alpha1)) SelectGadget(0);
            if (Input.GetKeyDown(KeyCode.Alpha2)) SelectGadget(1);
            if (Input.GetKeyDown(KeyCode.Alpha3)) SelectGadget(2);
            if (Input.GetKeyDown(KeyCode.Alpha4)) SelectGadget(3);
            if (Input.GetKeyDown(KeyCode.Alpha5)) SelectGadget(4);
            
            // Scroll through gadgets
            float scroll = Input.GetAxis("Mouse ScrollWheel");
            if (scroll > 0f)
            {
                NextGadget();
            }
            else if (scroll < 0f)
            {
                PreviousGadget();
            }
            
            // Use current gadget
            if (Input.GetKeyDown(useGadgetKey) && currentGadget != null)
            {
                TryUseGadget();
            }
        }
        
        private void ToggleGadgetWheel()
        {
            isGadgetWheelOpen = !isGadgetWheelOpen;
            
            if (gadgetWheelUI != null)
            {
                gadgetWheelUI.SetActive(isGadgetWheelOpen);
            }
            
            if (isGadgetWheelOpen)
            {
                Time.timeScale = 0.3f; // Slow-mo effect
                Cursor.lockState = CursorLockMode.None;
                Cursor.visible = true;
            }
            else
            {
                Time.timeScale = 1f;
                Cursor.lockState = CursorLockMode.Locked;
                Cursor.visible = false;
            }
        }
        
        public void SelectGadget(int index)
        {
            if (index >= 0 && index < unlockedGadgets.Count)
            {
                currentGadget = unlockedGadgets[index];
                currentGadgetIndex = index;
                
                Core.GameEvents.ShowNotification($"Selected: {currentGadget.gadgetName}");
                Debug.Log($"[GadgetController] Selected gadget: {currentGadget.gadgetName}");
            }
        }
        
        public void NextGadget()
        {
            if (unlockedGadgets.Count == 0) return;
            
            currentGadgetIndex = (currentGadgetIndex + 1) % unlockedGadgets.Count;
            SelectGadget(currentGadgetIndex);
        }
        
        public void PreviousGadget()
        {
            if (unlockedGadgets.Count == 0) return;
            
            currentGadgetIndex--;
            if (currentGadgetIndex < 0)
            {
                currentGadgetIndex = unlockedGadgets.Count - 1;
            }
            SelectGadget(currentGadgetIndex);
        }
        
        public void TryUseGadget()
        {
            if (currentGadget == null)
            {
                Core.GameEvents.ShowNotification("No gadget selected!");
                return;
            }
            
            // Check cooldown
            if (IsOnCooldown(currentGadget))
            {
                float remainingCooldown = gadgetCooldowns[currentGadget];
                Core.GameEvents.ShowNotification($"Cooldown: {remainingCooldown:F1}s");
                return;
            }
            
            // Get usage position and direction
            Vector3 position = transform.position + transform.forward * 0.5f;
            Vector3 direction = Camera.main.transform.forward;
            
            // Try to use gadget
            bool success = currentGadget.Use(gameObject, position, direction);
            
            if (success)
            {
                StartCooldown(currentGadget);
                Core.GameEvents.GadgetUsed(currentGadget);
            }
        }
        
        public void UnlockGadget(Gadget gadget)
        {
            if (gadget == null)
            {
                Debug.LogWarning("[GadgetController] Trying to unlock null gadget");
                return;
            }
            
            if (unlockedGadgets.Contains(gadget))
            {
                Debug.LogWarning($"[GadgetController] {gadget.gadgetName} already unlocked");
                return;
            }
            
            unlockedGadgets.Add(gadget);
            Core.GameEvents.GadgetUnlocked(gadget);
            Core.GameEvents.ShowTimedNotification($"New Gadget Unlocked: {gadget.gadgetName}!", 3f);
            
            // Auto-select if it's the first gadget
            if (unlockedGadgets.Count == 1)
            {
                SelectGadget(0);
            }
            
            Debug.Log($"[GadgetController] Unlocked gadget: {gadget.gadgetName}");
        }
        
        public void UpgradeGadget(Gadget gadget)
        {
            if (!unlockedGadgets.Contains(gadget))
            {
                Debug.LogWarning($"[GadgetController] Cannot upgrade locked gadget: {gadget.gadgetName}");
                return;
            }
            
            gadget.Upgrade();
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
                    
                    // Notify UI of cooldown update
                    if (gadget == currentGadget)
                    {
                        Core.GameEvents.GadgetCooldownUpdated(gadget, gadgetCooldowns[gadget]);
                    }
                }
            }
        }
        
        public float GetGadgetCooldown(Gadget gadget)
        {
            if (gadgetCooldowns.ContainsKey(gadget))
            {
                return gadgetCooldowns[gadget];
            }
            return 0f;
        }
        
        public List<Gadget> GetUnlockedGadgets()
        {
            return new List<Gadget>(unlockedGadgets);
        }
        
        public Gadget GetCurrentGadget()
        {
            return currentGadget;
        }
        
        public bool HasGadget(Gadget gadget)
        {
            return unlockedGadgets.Contains(gadget);
        }
    }
}
