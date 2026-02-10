using UnityEngine;

namespace FutureGadgetAdventure.Gameplay.Gadgets
{
    /// <summary>
    /// Base class for all gadgets in the game
    /// Uses ScriptableObject for data-driven design
    /// Each specific gadget inherits from this and implements custom behavior
    /// </summary>
    [CreateAssetMenu(fileName = "New Gadget", menuName = "Future Gadget Adventure/Gadget/Base Gadget")]
    public class Gadget : ScriptableObject
    {
        [Header("Gadget Information")]
        public string gadgetID;
        public string gadgetName;
        [TextArea(3, 6)] public string description;
        public Sprite icon;
        public GameObject prefab;
        
        [Header("Gameplay Settings")]
        [Tooltip("Cooldown time in seconds before gadget can be used again")]
        public float cooldownTime = 5f;
        
        [Tooltip("How long the gadget effect lasts (0 = instant)")]
        public float duration = 0f;
        
        [Tooltip("Energy cost to use this gadget")]
        public int energyCost = 10;
        
        [Tooltip("Can this gadget be used while in air?")]
        public bool canUseInAir = true;
        
        [Header("Upgrade System")]
        public int upgradeLevel = 0;
        public int maxUpgradeLevel = 3;
        public int upgradePartsCost = 5;
        
        [Header("Visual & Audio")]
        public GameObject activationVFX;
        public AudioClip activationSFX;
        public GameObject loopingVFX;
        public AudioClip loopingSFX;
        
        [Header("Tutorial")]
        [TextArea(2, 4)] public string tutorialText;
        public bool hasBeenUsed = false;
        
        /// <summary>
        /// Main method to use the gadget - override in derived classes
        /// </summary>
        /// <param name="user">The character using the gadget</param>
        /// <param name="position">Position where gadget is used</param>
        /// <param name="direction">Direction the user is facing</param>
        /// <returns>True if gadget was successfully used</returns>
        public virtual bool Use(GameObject user, Vector3 position, Vector3 direction)
        {
            Debug.Log($"[Gadget] Using {gadgetName}");
            
            if (!hasBeenUsed)
            {
                ShowTutorial();
                hasBeenUsed = true;
            }
            
            // Play activation effects
            PlayActivationEffects(position);
            
            return true;
        }
        
        /// <summary>
        /// Called when gadget effect should end
        /// </summary>
        public virtual void EndEffect(GameObject user)
        {
            Debug.Log($"[Gadget] {gadgetName} effect ended");
        }
        
        /// <summary>
        /// Upgrades the gadget to next level
        /// </summary>
        public virtual void Upgrade()
        {
            if (upgradeLevel < maxUpgradeLevel)
            {
                upgradeLevel++;
                ApplyUpgrade();
                Core.GameEvents.GadgetUpgraded(this);
                
                Debug.Log($"[Gadget] {gadgetName} upgraded to level {upgradeLevel}");
            }
            else
            {
                Debug.LogWarning($"[Gadget] {gadgetName} is already at max level");
            }
        }
        
        /// <summary>
        /// Apply upgrade benefits - override in derived classes
        /// </summary>
        protected virtual void ApplyUpgrade()
        {
            // Default upgrade: reduce cooldown by 20%
            cooldownTime *= 0.8f;
        }
        
        /// <summary>
        /// Checks if gadget can currently be used
        /// </summary>
        public virtual bool CanUse(GameObject user)
        {
            Player.PlayerController player = user.GetComponent<Player.PlayerController>();
            if (player == null) return false;
            
            // Check energy
            if (player.GetCurrentEnergy() < energyCost)
            {
                Core.GameEvents.ShowNotification("Not enough energy!");
                return false;
            }
            
            // Check if grounded requirement
            if (!canUseInAir && !player.IsGrounded())
            {
                Core.GameEvents.ShowNotification("Can't use while in air!");
                return false;
            }
            
            return true;
        }
        
        private void PlayActivationEffects(Vector3 position)
        {
            // Spawn VFX
            if (activationVFX != null)
            {
                GameObject vfx = Instantiate(activationVFX, position, Quaternion.identity);
                Destroy(vfx, 3f); // Auto-destroy after 3 seconds
            }
            
            // Play SFX
            if (activationSFX != null)
            {
                AudioSource.PlayClipAtPoint(activationSFX, position);
            }
        }
        
        private void ShowTutorial()
        {
            if (!string.IsNullOrEmpty(tutorialText))
            {
                Core.GameEvents.ShowTimedNotification($"Tutorial: {tutorialText}", 5f);
            }
        }
        
        /// <summary>
        /// Get current cooldown remaining time
        /// </summary>
        public float GetCooldownProgress()
        {
            // This will be managed by GadgetController
            return 0f;
        }
        
        /// <summary>
        /// Get description with current stats
        /// </summary>
        public string GetDetailedDescription()
        {
            string details = $"{description}\n\n";
            details += $"<b>Cooldown:</b> {cooldownTime}s\n";
            details += $"<b>Energy Cost:</b> {energyCost}\n";
            details += $"<b>Upgrade Level:</b> {upgradeLevel}/{maxUpgradeLevel}";
            
            return details;
        }
    }
}
