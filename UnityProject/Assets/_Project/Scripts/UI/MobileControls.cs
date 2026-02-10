using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

namespace FutureGadgetAdventure.UI
{
    /// <summary>
    /// Mobile touch controls system
    /// Provides virtual joystick and action buttons for mobile platforms
    /// </summary>
    public class MobileControls : MonoBehaviour
    {
        [Header("Virtual Joystick")]
        [SerializeField] private GameObject joystickPanel;
        [SerializeField] private RectTransform joystickBackground;
        [SerializeField] private RectTransform joystickHandle;
        [SerializeField] private float joystickRange = 50f;
        [SerializeField] private float deadZone = 0.1f;
        
        [Header("Action Buttons")]
        [SerializeField] private Button jumpButton;
        [SerializeField] private Button sprintButton;
        [SerializeField] private Button interactButton;
        [SerializeField] private Button gadgetButton;
        [SerializeField] private Button gadgetWheelButton;
        
        [Header("Camera Controls")]
        [SerializeField] private RectTransform cameraArea;
        [SerializeField] private float cameraSensitivity = 2f;
        
        [Header("Settings")]
        [SerializeField] private bool enableJoystick = true;
        [SerializeField] private bool enableButtons = true;
        [SerializeField] private bool dynamicJoystick = true;
        
        // State
        private Vector2 joystickInput = Vector2.zero;
        private Vector2 cameraInput = Vector2.zero;
        private bool isJoystickActive = false;
        private int joystickTouchId = -1;
        private int cameraTouchId = -1;
        
        // References
        private Gameplay.Player.PlayerController playerController;
        private Gameplay.Gadgets.GadgetController gadgetController;
        private GadgetWheelUI gadgetWheelUI;
        
        private void Awake()
        {
            // Find player controller
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                playerController = player.GetComponent<Gameplay.Player.PlayerController>();
            }
            
            gadgetController = FindObjectOfType<Gameplay.Gadgets.GadgetController>();
            gadgetWheelUI = FindObjectOfType<GadgetWheelUI>();
            
            // Setup button listeners
            SetupButtons();
            
            // Show/hide based on platform
#if UNITY_ANDROID || UNITY_IOS
            ShowControls(true);
#else
            ShowControls(false);
#endif
        }
        
        private void SetupButtons()
        {
            if (jumpButton != null)
            {
                jumpButton.onClick.AddListener(OnJumpPressed);
            }
            
            if (sprintButton != null)
            {
                // Sprint is a toggle on mobile
                sprintButton.onClick.AddListener(OnSprintToggled);
            }
            
            if (interactButton != null)
            {
                interactButton.onClick.AddListener(OnInteractPressed);
            }
            
            if (gadgetButton != null)
            {
                gadgetButton.onClick.AddListener(OnGadgetPressed);
            }
            
            if (gadgetWheelButton != null)
            {
                gadgetWheelButton.onClick.AddListener(OnGadgetWheelPressed);
            }
        }
        
        private void Update()
        {
            if (!enableJoystick) return;
            
            HandleTouchInput();
            UpdateJoystickVisuals();
        }
        
        private void HandleTouchInput()
        {
            // Reset inputs
            if (!isJoystickActive)
            {
                joystickInput = Vector2.zero;
            }
            
            cameraInput = Vector2.zero;
            
            // Process all touches
            for (int i = 0; i < Input.touchCount; i++)
            {
                Touch touch = Input.GetTouch(i);
                
                // Check if touch is on joystick area
                if (IsInJoystickArea(touch.position))
                {
                    HandleJoystickTouch(touch);
                }
                // Check if touch is on camera area
                else if (IsInCameraArea(touch.position))
                {
                    HandleCameraTouch(touch);
                }
            }
        }
        
        private void HandleJoystickTouch(Touch touch)
        {
            if (touch.phase == TouchPhase.Began)
            {
                if (joystickTouchId == -1)
                {
                    joystickTouchId = touch.fingerId;
                    isJoystickActive = true;
                    
                    if (dynamicJoystick && joystickBackground != null)
                    {
                        joystickBackground.position = touch.position;
                    }
                }
            }
            
            if (touch.fingerId == joystickTouchId)
            {
                if (touch.phase == TouchPhase.Moved || touch.phase == TouchPhase.Stationary)
                {
                    Vector2 offset = touch.position - (Vector2)joystickBackground.position;
                    Vector2 direction = offset.magnitude > joystickRange ? offset.normalized : offset / joystickRange;
                    
                    // Apply dead zone
                    if (direction.magnitude < deadZone)
                    {
                        direction = Vector2.zero;
                    }
                    
                    joystickInput = direction;
                }
                else if (touch.phase == TouchPhase.Ended || touch.phase == TouchPhase.Canceled)
                {
                    joystickTouchId = -1;
                    isJoystickActive = false;
                    joystickInput = Vector2.zero;
                }
            }
        }
        
        private void HandleCameraTouch(Touch touch)
        {
            if (touch.phase == TouchPhase.Began)
            {
                if (cameraTouchId == -1)
                {
                    cameraTouchId = touch.fingerId;
                }
            }
            
            if (touch.fingerId == cameraTouchId)
            {
                if (touch.phase == TouchPhase.Moved)
                {
                    cameraInput = touch.deltaPosition * cameraSensitivity * Time.deltaTime;
                }
                else if (touch.phase == TouchPhase.Ended || touch.phase == TouchPhase.Canceled)
                {
                    cameraTouchId = -1;
                    cameraInput = Vector2.zero;
                }
            }
        }
        
        private void UpdateJoystickVisuals()
        {
            if (joystickHandle == null || joystickBackground == null) return;
            
            if (isJoystickActive)
            {
                Vector2 handlePosition = joystickInput * joystickRange;
                joystickHandle.anchoredPosition = handlePosition;
            }
            else
            {
                joystickHandle.anchoredPosition = Vector2.zero;
            }
        }
        
        private bool IsInJoystickArea(Vector2 position)
        {
            if (joystickPanel == null) return false;
            
            return RectTransformUtility.RectangleContainsScreenPoint(
                joystickPanel.GetComponent<RectTransform>(), 
                position
            );
        }
        
        private bool IsInCameraArea(Vector2 position)
        {
            if (cameraArea == null) return true; // Default to whole screen
            
            return RectTransformUtility.RectangleContainsScreenPoint(
                cameraArea, 
                position
            );
        }
        
        // Button callbacks
        private void OnJumpPressed()
        {
            // Trigger jump through player controller
            // In production, you'd use the Input System's message system
            if (playerController != null)
            {
                // Player controller handles jump through Input System
            }
        }
        
        private bool isSprinting = false;
        private void OnSprintToggled()
        {
            isSprinting = !isSprinting;
            
            // Update button visual to show toggle state
            if (sprintButton != null)
            {
                ColorBlock colors = sprintButton.colors;
                colors.normalColor = isSprinting ? Color.yellow : Color.white;
                sprintButton.colors = colors;
            }
        }
        
        private void OnInteractPressed()
        {
            // Trigger interact
            // In production, send interact event
        }
        
        private void OnGadgetPressed()
        {
            if (gadgetController != null)
            {
                // Use current gadget
                // gadgetController.UseCurrentGadget();
            }
        }
        
        private void OnGadgetWheelPressed()
        {
            if (gadgetWheelUI != null)
            {
                gadgetWheelUI.ToggleWheel();
            }
        }
        
        /// <summary>
        /// Show or hide mobile controls
        /// </summary>
        public void ShowControls(bool show)
        {
            gameObject.SetActive(show);
        }
        
        /// <summary>
        /// Get joystick input (for use by player controller)
        /// </summary>
        public Vector2 GetJoystickInput()
        {
            return joystickInput;
        }
        
        /// <summary>
        /// Get camera input (for use by camera controller)
        /// </summary>
        public Vector2 GetCameraInput()
        {
            return cameraInput;
        }
        
        public bool IsSprinting() => isSprinting;
    }
}
