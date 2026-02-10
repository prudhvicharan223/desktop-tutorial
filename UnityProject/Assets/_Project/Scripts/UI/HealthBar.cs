using UnityEngine;
using UnityEngine.UI;

namespace FutureGadgetAdventure.UI
{
    /// <summary>
    /// Health bar UI component
    /// Displays player health with smooth animations
    /// </summary>
    public class HealthBar : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private Image fillImage;
        [SerializeField] private Image damageFillImage; // Shows damage taken
        [SerializeField] private Text healthText;
        
        [Header("Settings")]
        [SerializeField] private bool showNumericValue = true;
        [SerializeField] private float smoothSpeed = 5f;
        [SerializeField] private float damageAnimationDelay = 0.5f;
        
        [Header("Colors")]
        [SerializeField] private Color healthyColor = Color.green;
        [SerializeField] private Color warningColor = Color.yellow;
        [SerializeField] private Color criticalColor = Color.red;
        [SerializeField] private float warningThreshold = 0.5f;
        [SerializeField] private float criticalThreshold = 0.25f;
        
        private float currentHealth;
        private float maxHealth;
        private float targetFillAmount;
        private float damageFillAmount;
        private float damageAnimationTimer;
        
        private void Start()
        {
            // Subscribe to health change events
            Core.GameEvents.OnHealthChanged += OnHealthChanged;
            
            // Initialize
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                Gameplay.Player.PlayerController controller = player.GetComponent<Gameplay.Player.PlayerController>();
                if (controller != null)
                {
                    currentHealth = controller.GetCurrentHealth();
                    maxHealth = controller.GetMaxHealth();
                    targetFillAmount = currentHealth / maxHealth;
                    
                    if (fillImage != null)
                    {
                        fillImage.fillAmount = targetFillAmount;
                    }
                    
                    if (damageFillImage != null)
                    {
                        damageFillImage.fillAmount = targetFillAmount;
                        damageFillAmount = targetFillAmount;
                    }
                }
            }
        }
        
        private void OnDestroy()
        {
            // Unsubscribe from events
            Core.GameEvents.OnHealthChanged -= OnHealthChanged;
        }
        
        private void Update()
        {
            // Smooth fill animation
            if (fillImage != null)
            {
                fillImage.fillAmount = Mathf.Lerp(fillImage.fillAmount, targetFillAmount, smoothSpeed * Time.deltaTime);
                
                // Update color based on health
                UpdateHealthColor();
            }
            
            // Damage animation (red bar catches up slowly)
            if (damageFillImage != null)
            {
                if (damageAnimationTimer > 0)
                {
                    damageAnimationTimer -= Time.deltaTime;
                }
                else
                {
                    damageFillAmount = Mathf.Lerp(damageFillAmount, targetFillAmount, smoothSpeed * 0.5f * Time.deltaTime);
                    damageFillImage.fillAmount = damageFillAmount;
                }
            }
        }
        
        private void OnHealthChanged(float newHealth)
        {
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                Gameplay.Player.PlayerController controller = player.GetComponent<Gameplay.Player.PlayerController>();
                if (controller != null)
                {
                    currentHealth = newHealth;
                    maxHealth = controller.GetMaxHealth();
                    targetFillAmount = currentHealth / maxHealth;
                    
                    // Reset damage animation timer
                    damageAnimationTimer = damageAnimationDelay;
                    
                    // Update text
                    UpdateHealthText();
                }
            }
        }
        
        private void UpdateHealthColor()
        {
            if (fillImage == null) return;
            
            Color targetColor;
            
            if (targetFillAmount <= criticalThreshold)
            {
                targetColor = criticalColor;
            }
            else if (targetFillAmount <= warningThreshold)
            {
                targetColor = warningColor;
            }
            else
            {
                targetColor = healthyColor;
            }
            
            fillImage.color = targetColor;
        }
        
        private void UpdateHealthText()
        {
            if (healthText != null && showNumericValue)
            {
                healthText.text = $"{Mathf.CeilToInt(currentHealth)}/{Mathf.CeilToInt(maxHealth)}";
            }
        }
    }
}
