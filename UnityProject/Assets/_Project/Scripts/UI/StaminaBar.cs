using UnityEngine;
using UnityEngine.UI;

namespace FutureGadgetAdventure.UI
{
    /// <summary>
    /// Stamina/Energy bar UI component
    /// Displays player energy with smooth animations and regeneration indicator
    /// </summary>
    public class StaminaBar : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private Image fillImage;
        [SerializeField] private Text energyText;
        [SerializeField] private GameObject depletedWarning;
        
        [Header("Settings")]
        [SerializeField] private bool showNumericValue = true;
        [SerializeField] private float smoothSpeed = 5f;
        [SerializeField] private bool pulseWhenLow = true;
        [SerializeField] private float lowEnergyThreshold = 0.2f;
        
        [Header("Colors")]
        [SerializeField] private Color normalColor = new Color(0.3f, 0.8f, 1f); // Cyan
        [SerializeField] private Color lowColor = Color.yellow;
        [SerializeField] private Color depletedColor = Color.red;
        
        private float currentEnergy;
        private float maxEnergy;
        private float targetFillAmount;
        private float pulseTimer;
        
        private void Start()
        {
            // Subscribe to energy change events
            Core.GameEvents.OnEnergyChanged += OnEnergyChanged;
            
            // Initialize
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                Gameplay.Player.PlayerController controller = player.GetComponent<Gameplay.Player.PlayerController>();
                if (controller != null)
                {
                    currentEnergy = controller.GetCurrentEnergy();
                    maxEnergy = controller.GetMaxEnergy();
                    targetFillAmount = currentEnergy / maxEnergy;
                    
                    if (fillImage != null)
                    {
                        fillImage.fillAmount = targetFillAmount;
                    }
                }
            }
            
            if (depletedWarning != null)
            {
                depletedWarning.SetActive(false);
            }
        }
        
        private void OnDestroy()
        {
            // Unsubscribe from events
            Core.GameEvents.OnEnergyChanged -= OnEnergyChanged;
        }
        
        private void Update()
        {
            // Smooth fill animation
            if (fillImage != null)
            {
                fillImage.fillAmount = Mathf.Lerp(fillImage.fillAmount, targetFillAmount, smoothSpeed * Time.deltaTime);
                
                // Update color
                UpdateEnergyColor();
                
                // Pulse effect when low
                if (pulseWhenLow && targetFillAmount <= lowEnergyThreshold && targetFillAmount > 0)
                {
                    pulseTimer += Time.deltaTime * 3f;
                    float pulse = (Mathf.Sin(pulseTimer) + 1f) * 0.5f;
                    fillImage.color = Color.Lerp(lowColor, depletedColor, pulse * 0.5f);
                }
            }
            
            // Show depleted warning
            if (depletedWarning != null)
            {
                depletedWarning.SetActive(currentEnergy <= 0);
            }
        }
        
        private void OnEnergyChanged(float newEnergy)
        {
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                Gameplay.Player.PlayerController controller = player.GetComponent<Gameplay.Player.PlayerController>();
                if (controller != null)
                {
                    currentEnergy = newEnergy;
                    maxEnergy = controller.GetMaxEnergy();
                    targetFillAmount = currentEnergy / maxEnergy;
                    
                    // Update text
                    UpdateEnergyText();
                }
            }
        }
        
        private void UpdateEnergyColor()
        {
            if (fillImage == null) return;
            
            if (pulseWhenLow && targetFillAmount <= lowEnergyThreshold)
            {
                // Color will be handled by pulse effect
                return;
            }
            
            Color targetColor;
            
            if (targetFillAmount <= 0)
            {
                targetColor = depletedColor;
            }
            else if (targetFillAmount <= lowEnergyThreshold)
            {
                targetColor = lowColor;
            }
            else
            {
                targetColor = normalColor;
            }
            
            fillImage.color = targetColor;
        }
        
        private void UpdateEnergyText()
        {
            if (energyText != null && showNumericValue)
            {
                energyText.text = $"{Mathf.CeilToInt(currentEnergy)}/{Mathf.CeilToInt(maxEnergy)}";
            }
        }
    }
}
