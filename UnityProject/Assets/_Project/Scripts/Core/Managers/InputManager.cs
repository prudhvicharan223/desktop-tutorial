using UnityEngine;
using UnityEngine.InputSystem;

namespace FutureGadgetAdventure.Core.Managers
{
    /// <summary>
    /// Input management system using Unity's new Input System
    /// Handles input device switching and control schemes
    /// </summary>
    public class InputManager : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private bool enablePlayerInput = true;
        [SerializeField] private bool enableUIInput = true;
        
        private PlayerInput playerInput;
        private bool isInputEnabled = true;
        
        private void Awake()
        {
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                playerInput = player.GetComponent<PlayerInput>();
            }
        }
        
        /// <summary>
        /// Enable player input
        /// </summary>
        public void EnablePlayerInput()
        {
            if (playerInput != null)
            {
                playerInput.ActivateInput();
                isInputEnabled = true;
            }
        }
        
        /// <summary>
        /// Disable player input
        /// </summary>
        public void DisablePlayerInput()
        {
            if (playerInput != null)
            {
                playerInput.DeactivateInput();
                isInputEnabled = false;
            }
        }
        
        /// <summary>
        /// Switch to specific control scheme
        /// </summary>
        public void SwitchControlScheme(string schemeName)
        {
            if (playerInput != null)
            {
                playerInput.SwitchCurrentControlScheme(schemeName);
            }
        }
        
        public bool IsInputEnabled() => isInputEnabled;
        
        public void Initialize()
        {
            Debug.Log("[InputManager] Initialized");
        }
    }
}
