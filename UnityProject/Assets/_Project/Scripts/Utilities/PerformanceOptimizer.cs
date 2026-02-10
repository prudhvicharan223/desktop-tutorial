using UnityEngine;
using UnityEngine.Rendering;

namespace FutureGadgetAdventure.Utilities
{
    /// <summary>
    /// Performance optimizer for mobile and PC platforms
    /// Adjusts quality settings based on platform and performance targets
    /// Monitors FPS and dynamically adjusts settings
    /// </summary>
    public class PerformanceOptimizer : MonoBehaviour
    {
        [Header("Target Performance")]
        [SerializeField] private int targetFrameRate = 60;
        [SerializeField] private int mobileTargetFrameRate = 30;
        [SerializeField] private bool adaptivePerformance = true;
        
        [Header("Quality Presets")]
        [SerializeField] private QualityPreset pcQuality = QualityPreset.High;
        [SerializeField] private QualityPreset mobileQuality = QualityPreset.Medium;
        
        [Header("Monitoring")]
        [SerializeField] private float fpsCheckInterval = 1f;
        [SerializeField] private float targetFPSThreshold = 0.9f; // 90% of target
        [SerializeField] private bool showFPSCounter = true;
        
        [Header("Optimization Settings")]
        [SerializeField] private bool optimizeShadows = true;
        [SerializeField] private bool optimizeParticles = true;
        [SerializeField] private bool optimizePostProcessing = true;
        [SerializeField] private bool reduceLODDistance = true;
        
        // Runtime data
        private float currentFPS = 60f;
        private float fpsTimer = 0f;
        private int frameCount = 0;
        private bool isMobile = false;
        private QualityPreset currentQualityPreset;
        
        private void Awake()
        {
            // Detect platform
#if UNITY_ANDROID || UNITY_IOS
            isMobile = true;
#endif
            
            ApplyInitialSettings();
        }
        
        private void Start()
        {
            ApplyQualityPreset(isMobile ? mobileQuality : pcQuality);
        }
        
        private void Update()
        {
            MonitorPerformance();
        }
        
        private void ApplyInitialSettings()
        {
            // Set target frame rate
            int targetFPS = isMobile ? mobileTargetFrameRate : targetFrameRate;
            Application.targetFrameRate = targetFPS;
            
            // Set VSync
            QualitySettings.vSyncCount = isMobile ? 0 : 1;
            
            // Screen settings
            if (isMobile)
            {
                Screen.sleepTimeout = SleepTimeout.NeverSleep;
            }
            
            Debug.Log($"[PerformanceOptimizer] Platform: {(isMobile ? "Mobile" : "PC")}, Target FPS: {targetFPS}");
        }
        
        private void MonitorPerformance()
        {
            if (!adaptivePerformance) return;
            
            // Calculate FPS
            frameCount++;
            fpsTimer += Time.unscaledDeltaTime;
            
            if (fpsTimer >= fpsCheckInterval)
            {
                currentFPS = frameCount / fpsTimer;
                frameCount = 0;
                fpsTimer = 0f;
                
                // Check if we need to adjust quality
                float targetFPS = isMobile ? mobileTargetFrameRate : targetFrameRate;
                
                if (currentFPS < targetFPS * targetFPSThreshold)
                {
                    // FPS is too low, reduce quality
                    ReduceQuality();
                }
                else if (currentFPS > targetFPS * 1.2f)
                {
                    // FPS is very high, we can increase quality
                    IncreaseQuality();
                }
            }
        }
        
        /// <summary>
        /// Apply quality preset
        /// </summary>
        public void ApplyQualityPreset(QualityPreset preset)
        {
            currentQualityPreset = preset;
            
            switch (preset)
            {
                case QualityPreset.VeryLow:
                    ApplyVeryLowQuality();
                    break;
                case QualityPreset.Low:
                    ApplyLowQuality();
                    break;
                case QualityPreset.Medium:
                    ApplyMediumQuality();
                    break;
                case QualityPreset.High:
                    ApplyHighQuality();
                    break;
                case QualityPreset.VeryHigh:
                    ApplyVeryHighQuality();
                    break;
            }
            
            Debug.Log($"[PerformanceOptimizer] Applied quality preset: {preset}");
        }
        
        private void ApplyVeryLowQuality()
        {
            QualitySettings.SetQualityLevel(0, true);
            
            if (optimizeShadows)
            {
                QualitySettings.shadows = ShadowQuality.Disable;
                QualitySettings.shadowDistance = 0f;
            }
            
            if (optimizeParticles)
            {
                QualitySettings.particleRaycastBudget = 64;
            }
            
            QualitySettings.antiAliasing = 0;
            QualitySettings.anisotropicFiltering = AnisotropicFiltering.Disable;
        }
        
        private void ApplyLowQuality()
        {
            QualitySettings.SetQualityLevel(1, true);
            
            if (optimizeShadows)
            {
                QualitySettings.shadows = ShadowQuality.HardOnly;
                QualitySettings.shadowDistance = 30f;
                QualitySettings.shadowResolution = ShadowResolution.Low;
            }
            
            if (optimizeParticles)
            {
                QualitySettings.particleRaycastBudget = 256;
            }
            
            QualitySettings.antiAliasing = 0;
            QualitySettings.anisotropicFiltering = AnisotropicFiltering.Enable;
        }
        
        private void ApplyMediumQuality()
        {
            QualitySettings.SetQualityLevel(2, true);
            
            if (optimizeShadows)
            {
                QualitySettings.shadows = ShadowQuality.HardOnly;
                QualitySettings.shadowDistance = 50f;
                QualitySettings.shadowResolution = ShadowResolution.Medium;
            }
            
            if (optimizeParticles)
            {
                QualitySettings.particleRaycastBudget = 512;
            }
            
            QualitySettings.antiAliasing = isMobile ? 0 : 2;
            QualitySettings.anisotropicFiltering = AnisotropicFiltering.Enable;
        }
        
        private void ApplyHighQuality()
        {
            QualitySettings.SetQualityLevel(3, true);
            
            if (optimizeShadows)
            {
                QualitySettings.shadows = ShadowQuality.All;
                QualitySettings.shadowDistance = 100f;
                QualitySettings.shadowResolution = ShadowResolution.High;
            }
            
            if (optimizeParticles)
            {
                QualitySettings.particleRaycastBudget = 1024;
            }
            
            QualitySettings.antiAliasing = 4;
            QualitySettings.anisotropicFiltering = AnisotropicFiltering.ForceEnable;
        }
        
        private void ApplyVeryHighQuality()
        {
            QualitySettings.SetQualityLevel(4, true);
            
            if (optimizeShadows)
            {
                QualitySettings.shadows = ShadowQuality.All;
                QualitySettings.shadowDistance = 150f;
                QualitySettings.shadowResolution = ShadowResolution.VeryHigh;
            }
            
            if (optimizeParticles)
            {
                QualitySettings.particleRaycastBudget = 2048;
            }
            
            QualitySettings.antiAliasing = 8;
            QualitySettings.anisotropicFiltering = AnisotropicFiltering.ForceEnable;
        }
        
        private void ReduceQuality()
        {
            if (currentQualityPreset == QualityPreset.VeryLow) return;
            
            QualityPreset newPreset = currentQualityPreset - 1;
            ApplyQualityPreset(newPreset);
            
            Debug.LogWarning($"[PerformanceOptimizer] Reduced quality to {newPreset} due to low FPS ({currentFPS:F1})");
        }
        
        private void IncreaseQuality()
        {
            if (currentQualityPreset == QualityPreset.VeryHigh) return;
            if (isMobile && currentQualityPreset >= QualityPreset.Medium) return; // Cap mobile at Medium
            
            QualityPreset newPreset = currentQualityPreset + 1;
            ApplyQualityPreset(newPreset);
            
            Debug.Log($"[PerformanceOptimizer] Increased quality to {newPreset} due to high FPS ({currentFPS:F1})");
        }
        
        /// <summary>
        /// Get current FPS
        /// </summary>
        public float GetCurrentFPS()
        {
            return currentFPS;
        }
        
        /// <summary>
        /// Enable/disable adaptive performance
        /// </summary>
        public void SetAdaptivePerformance(bool enabled)
        {
            adaptivePerformance = enabled;
        }
        
        private void OnGUI()
        {
            if (showFPSCounter)
            {
                int w = Screen.width, h = Screen.height;
                GUIStyle style = new GUIStyle();
                
                Rect rect = new Rect(10, 10, w, h * 2 / 50);
                style.alignment = TextAnchor.UpperLeft;
                style.fontSize = h * 2 / 50;
                style.normal.textColor = currentFPS >= (isMobile ? mobileTargetFrameRate : targetFrameRate) * targetFPSThreshold 
                    ? Color.green : Color.red;
                
                string text = $"FPS: {currentFPS:F1} | Quality: {currentQualityPreset}";
                GUI.Label(rect, text, style);
            }
        }
    }
    
    public enum QualityPreset
    {
        VeryLow = 0,
        Low = 1,
        Medium = 2,
        High = 3,
        VeryHigh = 4
    }
}
