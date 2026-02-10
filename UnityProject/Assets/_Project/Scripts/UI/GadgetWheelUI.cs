using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

namespace FutureGadgetAdventure.UI
{
    /// <summary>
    /// Radial gadget wheel UI for quick gadget selection
    /// Activated by holding Q button (or touch gesture on mobile)
    /// Shows all unlocked gadgets in a circular arrangement
    /// </summary>
    public class GadgetWheelUI : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private GameObject wheelContainer;
        [SerializeField] private Transform gadgetSlotsParent;
        [SerializeField] private GameObject gadgetSlotPrefab;
        
        [Header("Wheel Settings")]
        [SerializeField] private float wheelRadius = 150f;
        [SerializeField] private float selectionRadius = 50f;
        [SerializeField] private float scaleMultiplierOnHover = 1.2f;
        
        [Header("Visual")]
        [SerializeField] private Color normalColor = Color.white;
        [SerializeField] private Color selectedColor = Color.yellow;
        [SerializeField] private Color onCooldownColor = Color.gray;
        
        [Header("Input")]
        [SerializeField] private KeyCode toggleKey = KeyCode.Q;
        [SerializeField] private bool holdToShow = true;
        
        // Runtime data
        private List<GadgetSlot> gadgetSlots = new List<GadgetSlot>();
        private Gameplay.Gadgets.GadgetManager gadgetManager;
        private int currentSelection = -1;
        private bool isWheelActive = false;
        private Vector2 inputDirection;
        
        private class GadgetSlot
        {
            public GameObject slotObject;
            public Image iconImage;
            public Image backgroundImage;
            public Text nameText;
            public Image cooldownOverlay;
            public Gameplay.Gadgets.Gadget gadget;
            public float angle;
            public int index;
        }
        
        private void Awake()
        {
            gadgetManager = FindObjectOfType<Gameplay.Gadgets.GadgetManager>();
            
            if (wheelContainer != null)
            {
                wheelContainer.SetActive(false);
            }
        }
        
        private void Start()
        {
            // Subscribe to events
            Core.GameEvents.OnGadgetUnlocked += OnGadgetUnlocked;
            Core.GameEvents.OnGadgetSelected += OnGadgetSelected;
            
            RefreshGadgetWheel();
        }
        
        private void OnDestroy()
        {
            // Unsubscribe from events
            Core.GameEvents.OnGadgetUnlocked -= OnGadgetUnlocked;
            Core.GameEvents.OnGadgetSelected -= OnGadgetSelected;
        }
        
        private void Update()
        {
            HandleInput();
            
            if (isWheelActive)
            {
                UpdateSelection();
                UpdateCooldownVisuals();
            }
        }
        
        private void HandleInput()
        {
            // Toggle wheel with key
            if (holdToShow)
            {
                if (Input.GetKeyDown(toggleKey))
                {
                    ShowWheel();
                }
                else if (Input.GetKeyUp(toggleKey))
                {
                    HideWheel();
                }
            }
            else
            {
                if (Input.GetKeyDown(toggleKey))
                {
                    ToggleWheel();
                }
            }
            
            // Get input direction
            if (isWheelActive)
            {
                inputDirection = new Vector2(Input.GetAxis("Horizontal"), Input.GetAxis("Vertical"));
                
                // Also support mouse position from center
                if (inputDirection.sqrMagnitude < 0.1f)
                {
                    Vector2 mousePos = Input.mousePosition;
                    Vector2 centerPos = new Vector2(Screen.width / 2f, Screen.height / 2f);
                    inputDirection = (mousePos - centerPos).normalized;
                }
            }
        }
        
        private void UpdateSelection()
        {
            if (gadgetSlots.Count == 0) return;
            
            // Check if input is significant
            if (inputDirection.magnitude < 0.3f)
            {
                ResetSelection();
                return;
            }
            
            // Calculate angle from input
            float inputAngle = Mathf.Atan2(inputDirection.y, inputDirection.x) * Mathf.Rad2Deg;
            if (inputAngle < 0) inputAngle += 360f;
            
            // Find closest gadget
            float closestDiff = float.MaxValue;
            int closestIndex = -1;
            
            for (int i = 0; i < gadgetSlots.Count; i++)
            {
                float angleDiff = Mathf.Abs(Mathf.DeltaAngle(inputAngle, gadgetSlots[i].angle));
                if (angleDiff < closestDiff)
                {
                    closestDiff = angleDiff;
                    closestIndex = i;
                }
            }
            
            // Update selection
            if (closestIndex != currentSelection)
            {
                SelectSlot(closestIndex);
            }
        }
        
        private void SelectSlot(int index)
        {
            // Deselect previous
            if (currentSelection >= 0 && currentSelection < gadgetSlots.Count)
            {
                GadgetSlot previousSlot = gadgetSlots[currentSelection];
                previousSlot.slotObject.transform.localScale = Vector3.one;
                
                if (previousSlot.backgroundImage != null)
                {
                    previousSlot.backgroundImage.color = normalColor;
                }
            }
            
            // Select new
            currentSelection = index;
            if (currentSelection >= 0 && currentSelection < gadgetSlots.Count)
            {
                GadgetSlot slot = gadgetSlots[currentSelection];
                slot.slotObject.transform.localScale = Vector3.one * scaleMultiplierOnHover;
                
                if (slot.backgroundImage != null)
                {
                    slot.backgroundImage.color = selectedColor;
                }
                
                // Play selection sound
                // AudioManager.Instance?.PlaySFX("UI_GadgetSelect");
            }
        }
        
        private void ResetSelection()
        {
            if (currentSelection >= 0 && currentSelection < gadgetSlots.Count)
            {
                GadgetSlot slot = gadgetSlots[currentSelection];
                slot.slotObject.transform.localScale = Vector3.one;
                
                if (slot.backgroundImage != null)
                {
                    slot.backgroundImage.color = normalColor;
                }
            }
            
            currentSelection = -1;
        }
        
        private void UpdateCooldownVisuals()
        {
            if (gadgetManager == null) return;
            
            foreach (GadgetSlot slot in gadgetSlots)
            {
                if (slot.gadget == null || slot.cooldownOverlay == null) continue;
                
                float cooldownProgress = gadgetManager.GetCooldownProgress(slot.gadget);
                slot.cooldownOverlay.fillAmount = 1f - cooldownProgress;
                
                // Gray out if on cooldown
                if (gadgetManager.IsOnCooldown(slot.gadget))
                {
                    if (slot.iconImage != null)
                    {
                        slot.iconImage.color = onCooldownColor;
                    }
                }
                else
                {
                    if (slot.iconImage != null)
                    {
                        slot.iconImage.color = Color.white;
                    }
                }
            }
        }
        
        public void ShowWheel()
        {
            if (isWheelActive) return;
            
            isWheelActive = true;
            
            if (wheelContainer != null)
            {
                wheelContainer.SetActive(true);
            }
            
            // Pause game time
            Time.timeScale = 0.1f;
            
            // Show cursor
            Cursor.visible = true;
            Cursor.lockState = CursorLockMode.None;
            
            RefreshGadgetWheel();
        }
        
        public void HideWheel()
        {
            if (!isWheelActive) return;
            
            // Select the highlighted gadget
            if (currentSelection >= 0 && currentSelection < gadgetSlots.Count)
            {
                GadgetSlot slot = gadgetSlots[currentSelection];
                if (slot.gadget != null && gadgetManager != null)
                {
                    gadgetManager.SelectGadget(slot.index);
                }
            }
            
            isWheelActive = false;
            
            if (wheelContainer != null)
            {
                wheelContainer.SetActive(false);
            }
            
            // Resume game time
            Time.timeScale = 1f;
            
            // Hide cursor
            Cursor.visible = false;
            Cursor.lockState = CursorLockMode.Locked;
            
            ResetSelection();
        }
        
        public void ToggleWheel()
        {
            if (isWheelActive)
            {
                HideWheel();
            }
            else
            {
                ShowWheel();
            }
        }
        
        private void RefreshGadgetWheel()
        {
            // Clear existing slots
            foreach (GadgetSlot slot in gadgetSlots)
            {
                if (slot.slotObject != null)
                {
                    Destroy(slot.slotObject);
                }
            }
            gadgetSlots.Clear();
            
            if (gadgetManager == null) return;
            
            // Get unlocked gadgets
            List<Gameplay.Gadgets.Gadget> unlockedGadgets = gadgetManager.GetUnlockedGadgets();
            
            if (unlockedGadgets.Count == 0) return;
            
            // Create slots in circular arrangement
            float angleStep = 360f / unlockedGadgets.Count;
            
            for (int i = 0; i < unlockedGadgets.Count; i++)
            {
                CreateGadgetSlot(unlockedGadgets[i], i, angleStep * i);
            }
        }
        
        private void CreateGadgetSlot(Gameplay.Gadgets.Gadget gadget, int index, float angle)
        {
            if (gadgetSlotPrefab == null || gadgetSlotsParent == null) return;
            
            // Instantiate slot
            GameObject slotObj = Instantiate(gadgetSlotPrefab, gadgetSlotsParent);
            
            // Position in circle
            float radians = angle * Mathf.Deg2Rad;
            Vector2 position = new Vector2(Mathf.Cos(radians), Mathf.Sin(radians)) * wheelRadius;
            slotObj.GetComponent<RectTransform>().anchoredPosition = position;
            
            // Setup slot data
            GadgetSlot slot = new GadgetSlot
            {
                slotObject = slotObj,
                gadget = gadget,
                angle = angle,
                index = index,
                iconImage = slotObj.transform.Find("Icon")?.GetComponent<Image>(),
                backgroundImage = slotObj.GetComponent<Image>(),
                nameText = slotObj.GetComponentInChildren<Text>(),
                cooldownOverlay = slotObj.transform.Find("CooldownOverlay")?.GetComponent<Image>()
            };
            
            // Set visuals
            if (slot.iconImage != null && gadget.icon != null)
            {
                slot.iconImage.sprite = gadget.icon;
            }
            
            if (slot.nameText != null)
            {
                slot.nameText.text = gadget.gadgetName;
            }
            
            if (slot.cooldownOverlay != null)
            {
                slot.cooldownOverlay.fillAmount = 0f;
            }
            
            gadgetSlots.Add(slot);
        }
        
        private void OnGadgetUnlocked(Gameplay.Gadgets.Gadget gadget)
        {
            if (!isWheelActive)
            {
                RefreshGadgetWheel();
            }
        }
        
        private void OnGadgetSelected(Gameplay.Gadgets.Gadget gadget)
        {
            // Highlight selected gadget
        }
    }
}
