using UnityEngine;
using System.Collections;

namespace FutureGadgetAdventure.Gameplay.Gadgets
{
    /// <summary>
    /// Shrinking Light Gadget - Allows player to shrink and enter small zones
    /// Perfect for puzzle-solving and accessing hidden areas
    /// </summary>
    [CreateAssetMenu(fileName = "ShrinkingLight", menuName = "Future Gadget Adventure/Gadget/Shrinking Light")]
    public class ShrinkingLightGadget : Gadget
    {
        [Header("Shrinking Settings")]
        [SerializeField] private float shrinkScale = 0.2f;
        [SerializeField] private float shrinkDuration = 10f;
        [SerializeField] private float transformSpeed = 1f;
        
        [Header("Physics Adjustments")]
        [SerializeField] private float shrunkGravity = -9.81f;
        [SerializeField] private float shrunkJumpHeight = 1f;
        [SerializeField] private float shrunkMoveSpeed = 2f;
        
        private Vector3 originalScale;
        private bool isShrunk = false;
        
        public override bool Use(GameObject user, Vector3 position, Vector3 direction)
        {
            if (!CanUse(user)) return false;
            
            // Call base to handle common functionality
            base.Use(user, position, direction);
            
            Player.PlayerController player = user.GetComponent<Player.PlayerController>();
            if (player == null) return false;
            
            // Consume energy
            player.ConsumeEnergy(energyCost);
            
            // Start shrinking/growing effect
            MonoBehaviour mono = user.GetComponent<MonoBehaviour>();
            if (mono != null)
            {
                if (!isShrunk)
                {
                    mono.StartCoroutine(ShrinkPlayer(user));
                }
                else
                {
                    mono.StartCoroutine(GrowPlayer(user));
                }
            }
            
            return true;
        }
        
        private IEnumerator ShrinkPlayer(GameObject player)
        {
            isShrunk = true;
            originalScale = player.transform.localScale;
            Vector3 targetScale = originalScale * shrinkScale;
            
            // Notify game
            Core.GameEvents.ShowNotification("Shrinking!");
            
            // Animate shrinking
            float elapsed = 0f;
            while (elapsed < transformSpeed)
            {
                player.transform.localScale = Vector3.Lerp(originalScale, targetScale, elapsed / transformSpeed);
                elapsed += Time.deltaTime;
                yield return null;
            }
            
            player.transform.localScale = targetScale;
            
            // Adjust player properties
            AdjustPlayerForShrinking(player, true);
            
            // Show notification about timer
            Core.GameEvents.ShowTimedNotification($"Shrunk! Reverting in {shrinkDuration}s", 3f);
            
            // Auto-revert after duration
            yield return new WaitForSeconds(shrinkDuration);
            
            // Grow back
            yield return GrowPlayer(player);
        }
        
        private IEnumerator GrowPlayer(GameObject player)
        {
            if (!isShrunk) yield break;
            
            isShrunk = false;
            Vector3 currentScale = player.transform.localScale;
            
            // Notify game
            Core.GameEvents.ShowNotification("Growing back!");
            
            // Animate growing
            float elapsed = 0f;
            while (elapsed < transformSpeed)
            {
                player.transform.localScale = Vector3.Lerp(currentScale, originalScale, elapsed / transformSpeed);
                elapsed += Time.deltaTime;
                yield return null;
            }
            
            player.transform.localScale = originalScale;
            
            // Restore player properties
            AdjustPlayerForShrinking(player, false);
            
            Core.GameEvents.ShowNotification("Back to normal size!");
        }
        
        private void AdjustPlayerForShrinking(GameObject player, bool shrunk)
        {
            // Adjust CharacterController
            CharacterController controller = player.GetComponent<CharacterController>();
            if (controller != null)
            {
                if (shrunk)
                {
                    controller.height *= shrinkScale;
                    controller.radius *= shrinkScale;
                    controller.center *= shrinkScale;
                }
                else
                {
                    controller.height /= shrinkScale;
                    controller.radius /= shrinkScale;
                    controller.center /= shrinkScale;
                }
            }
            
            // Note: In a real implementation, you'd also adjust:
            // - Camera offset
            // - Movement speed
            // - Jump height
            // - Collision layers (to interact with small-only objects)
        }
        
        public override void EndEffect(GameObject user)
        {
            // Force end shrinking if still active
            if (isShrunk)
            {
                MonoBehaviour mono = user.GetComponent<MonoBehaviour>();
                if (mono != null)
                {
                    mono.StartCoroutine(GrowPlayer(user));
                }
            }
            
            base.EndEffect(user);
        }
        
        protected override void ApplyUpgrade()
        {
            base.ApplyUpgrade();
            
            // Upgrade benefits
            switch (upgradeLevel)
            {
                case 1:
                    shrinkDuration += 5f; // Longer duration
                    break;
                case 2:
                    energyCost -= 5; // Less energy cost
                    transformSpeed *= 0.7f; // Faster transformation
                    break;
                case 3:
                    shrinkScale = 0.1f; // Even smaller!
                    cooldownTime *= 0.5f; // Half cooldown
                    break;
            }
        }
        
        public bool IsShrunk() => isShrunk;
        public float GetShrinkScale() => shrinkScale;
    }
}
