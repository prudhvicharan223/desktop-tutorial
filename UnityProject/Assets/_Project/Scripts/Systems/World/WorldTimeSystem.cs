using UnityEngine;

namespace FutureGadgetAdventure.Systems.World
{
    /// <summary>
    /// Day/Night cycle system for the open world
    /// Controls time of day, lighting, skybox, and triggers time-based events
    /// Optimized for mobile with adjustable update rates
    /// </summary>
    public class WorldTimeSystem : MonoBehaviour
    {
        [Header("Time Settings")]
        [SerializeField] private float dayDurationMinutes = 24f; // Real minutes for full day cycle
        [SerializeField] private float startTimeOfDay = 8f; // Start at 8 AM
        [SerializeField] private bool pauseTime = false;
        [SerializeField] private float timeScale = 1f;
        
        [Header("Lighting")]
        [SerializeField] private Light sunLight;
        [SerializeField] private Light moonLight;
        [SerializeField] private Gradient sunColorGradient;
        [SerializeField] private AnimationCurve sunIntensityCurve;
        [SerializeField] private AnimationCurve moonIntensityCurve;
        
        [Header("Skybox")]
        [SerializeField] private Material daySkybox;
        [SerializeField] private Material nightSkybox;
        [SerializeField] private float skyboxBlendSpeed = 0.5f;
        
        [Header("Time Periods")]
        [SerializeField] private float sunriseStart = 6f;
        [SerializeField] private float sunriseEnd = 8f;
        [SerializeField] private float sunsetStart = 18f;
        [SerializeField] private float sunsetEnd = 20f;
        
        [Header("Ambient Settings")]
        [SerializeField] private Gradient ambientColorGradient;
        [SerializeField] private AnimationCurve ambientIntensityCurve;
        
        [Header("Performance")]
        [SerializeField] private float updateInterval = 0.1f; // Update lighting every 0.1 seconds
        
        // Current time state
        private float currentTimeOfDay = 8f; // 0-24 hours
        private int currentDay = 1;
        private float dayProgress = 0f; // 0-1
        private TimeOfDayPeriod currentPeriod = TimeOfDayPeriod.Morning;
        
        private float updateTimer = 0f;
        private float timeIncrement;
        
        private void Awake()
        {
            currentTimeOfDay = startTimeOfDay;
            CalculateTimeIncrement();
            
            // Initialize lights
            if (sunLight == null)
            {
                GameObject sun = GameObject.Find("Directional Light");
                if (sun != null) sunLight = sun.GetComponent<Light>();
            }
        }
        
        private void Start()
        {
            UpdateLighting();
        }
        
        private void Update()
        {
            if (pauseTime) return;
            
            // Advance time
            AdvanceTime();
            
            // Update lighting at intervals for performance
            updateTimer += Time.deltaTime;
            if (updateTimer >= updateInterval)
            {
                updateTimer = 0f;
                UpdateLighting();
            }
        }
        
        private void CalculateTimeIncrement()
        {
            // Calculate how much time passes per second
            float secondsInDay = dayDurationMinutes * 60f;
            timeIncrement = 24f / secondsInDay; // Hours per second
        }
        
        private void AdvanceTime()
        {
            currentTimeOfDay += timeIncrement * timeScale * Time.deltaTime;
            
            if (currentTimeOfDay >= 24f)
            {
                currentTimeOfDay -= 24f;
                currentDay++;
                Core.GameEvents.DayChanged(currentDay);
                
                Debug.Log($"[WorldTime] New day: Day {currentDay}");
            }
            
            // Calculate day progress (0-1)
            dayProgress = currentTimeOfDay / 24f;
            
            // Determine current period
            DetermineTimeOfDayPeriod();
        }
        
        private void DetermineTimeOfDayPeriod()
        {
            TimeOfDayPeriod newPeriod;
            
            if (currentTimeOfDay >= sunriseStart && currentTimeOfDay < sunriseEnd)
            {
                newPeriod = TimeOfDayPeriod.Sunrise;
            }
            else if (currentTimeOfDay >= sunriseEnd && currentTimeOfDay < 12f)
            {
                newPeriod = TimeOfDayPeriod.Morning;
            }
            else if (currentTimeOfDay >= 12f && currentTimeOfDay < sunsetStart)
            {
                newPeriod = TimeOfDayPeriod.Afternoon;
            }
            else if (currentTimeOfDay >= sunsetStart && currentTimeOfDay < sunsetEnd)
            {
                newPeriod = TimeOfDayPeriod.Sunset;
            }
            else if (currentTimeOfDay >= sunsetEnd || currentTimeOfDay < sunriseStart)
            {
                newPeriod = TimeOfDayPeriod.Night;
            }
            else
            {
                newPeriod = currentPeriod;
            }
            
            if (newPeriod != currentPeriod)
            {
                currentPeriod = newPeriod;
                Core.GameEvents.TimeOfDayChanged(currentPeriod);
                
                Debug.Log($"[WorldTime] Time period changed: {currentPeriod}");
            }
        }
        
        private void UpdateLighting()
        {
            // Update sun rotation
            if (sunLight != null)
            {
                float sunAngle = (currentTimeOfDay / 24f) * 360f - 90f;
                sunLight.transform.rotation = Quaternion.Euler(sunAngle, 170f, 0f);
                
                // Update sun intensity and color
                if (sunIntensityCurve != null)
                {
                    sunLight.intensity = sunIntensityCurve.Evaluate(dayProgress);
                }
                
                if (sunColorGradient != null)
                {
                    sunLight.color = sunColorGradient.Evaluate(dayProgress);
                }
            }
            
            // Update moon
            if (moonLight != null)
            {
                float moonAngle = (currentTimeOfDay / 24f) * 360f + 90f;
                moonLight.transform.rotation = Quaternion.Euler(moonAngle, 170f, 0f);
                
                if (moonIntensityCurve != null)
                {
                    moonLight.intensity = moonIntensityCurve.Evaluate(dayProgress);
                }
            }
            
            // Update ambient lighting
            if (ambientColorGradient != null)
            {
                RenderSettings.ambientLight = ambientColorGradient.Evaluate(dayProgress);
            }
            
            if (ambientIntensityCurve != null)
            {
                RenderSettings.ambientIntensity = ambientIntensityCurve.Evaluate(dayProgress);
            }
            
            // Update skybox (simplified - in production use proper blending)
            UpdateSkybox();
        }
        
        private void UpdateSkybox()
        {
            // Simple day/night skybox switching
            // In production, use Material.Lerp for smooth blending
            if (currentPeriod == TimeOfDayPeriod.Night)
            {
                if (nightSkybox != null)
                {
                    RenderSettings.skybox = nightSkybox;
                }
            }
            else
            {
                if (daySkybox != null)
                {
                    RenderSettings.skybox = daySkybox;
                }
            }
        }
        
        /// <summary>
        /// Set the time of day directly
        /// </summary>
        public void SetTimeOfDay(float hours)
        {
            currentTimeOfDay = Mathf.Clamp(hours, 0f, 24f);
            dayProgress = currentTimeOfDay / 24f;
            DetermineTimeOfDayPeriod();
            UpdateLighting();
        }
        
        /// <summary>
        /// Advance time by hours
        /// </summary>
        public void AdvanceTimeBy(float hours)
        {
            currentTimeOfDay += hours;
            if (currentTimeOfDay >= 24f)
            {
                currentTimeOfDay -= 24f;
                currentDay++;
            }
            DetermineTimeOfDayPeriod();
            UpdateLighting();
        }
        
        /// <summary>
        /// Pause or resume time
        /// </summary>
        public void SetTimePaused(bool paused)
        {
            pauseTime = paused;
        }
        
        /// <summary>
        /// Set time scale (speed multiplier)
        /// </summary>
        public void SetTimeScale(float scale)
        {
            timeScale = Mathf.Max(0, scale);
        }
        
        /// <summary>
        /// Set day duration
        /// </summary>
        public void SetDayDuration(float minutes)
        {
            dayDurationMinutes = Mathf.Max(1f, minutes);
            CalculateTimeIncrement();
        }
        
        /// <summary>
        /// Get formatted time string
        /// </summary>
        public string GetFormattedTime(bool use24Hour = false)
        {
            int hours = Mathf.FloorToInt(currentTimeOfDay);
            int minutes = Mathf.FloorToInt((currentTimeOfDay - hours) * 60f);
            
            if (use24Hour)
            {
                return $"{hours:00}:{minutes:00}";
            }
            else
            {
                int displayHours = hours > 12 ? hours - 12 : hours;
                if (displayHours == 0) displayHours = 12;
                string period = hours >= 12 ? "PM" : "AM";
                return $"{displayHours}:{minutes:00} {period}";
            }
        }
        
        /// <summary>
        /// Check if it's currently night time
        /// </summary>
        public bool IsNightTime()
        {
            return currentPeriod == TimeOfDayPeriod.Night;
        }
        
        /// <summary>
        /// Check if it's currently day time
        /// </summary>
        public bool IsDayTime()
        {
            return currentPeriod == TimeOfDayPeriod.Morning || 
                   currentPeriod == TimeOfDayPeriod.Afternoon;
        }
        
        // Getters
        public float GetCurrentTimeOfDay() => currentTimeOfDay;
        public int GetCurrentDay() => currentDay;
        public float GetDayProgress() => dayProgress;
        public TimeOfDayPeriod GetCurrentPeriod() => currentPeriod;
        public bool IsTimePaused() => pauseTime;
        public float GetTimeScale() => timeScale;
        
        private void OnValidate()
        {
            // Recalculate when values change in inspector
            if (Application.isPlaying)
            {
                CalculateTimeIncrement();
            }
        }
    }
    
    /// <summary>
    /// Time of day periods
    /// </summary>
    public enum TimeOfDayPeriod
    {
        Sunrise,
        Morning,
        Afternoon,
        Sunset,
        Night
    }
}
