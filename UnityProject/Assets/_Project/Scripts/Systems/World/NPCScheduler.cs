using UnityEngine;
using System.Collections.Generic;

namespace FutureGadgetAdventure.Systems.World
{
    /// <summary>
    /// NPC scheduling and spawning system
    /// Controls NPC appearance based on time of day, location, and player progress
    /// Uses object pooling for performance
    /// </summary>
    public class NPCScheduler : MonoBehaviour
    {
        [Header("NPC Database")]
        [SerializeField] private List<NPCScheduleData> npcSchedules = new List<NPCScheduleData>();
        
        [Header("Spawn Settings")]
        [SerializeField] private float spawnCheckInterval = 5f;
        [SerializeField] private float despawnDistance = 100f;
        [SerializeField] private float respawnDistance = 80f;
        
        [Header("Performance")]
        [SerializeField] private int maxActiveNPCs = 50;
        [SerializeField] private bool useObjectPooling = true;
        
        // Runtime data
        private WorldTimeSystem timeSystem;
        private Transform playerTransform;
        private float spawnTimer = 0f;
        private List<ActiveNPC> activeNPCs = new List<ActiveNPC>();
        private Dictionary<string, Queue<GameObject>> npcPools = new Dictionary<string, Queue<GameObject>>();
        
        private class ActiveNPC
        {
            public GameObject gameObject;
            public NPCScheduleData schedule;
            public Transform transform;
            public float spawnTime;
        }
        
        private void Awake()
        {
            timeSystem = FindObjectOfType<WorldTimeSystem>();
            
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                playerTransform = player.transform;
            }
            
            InitializeObjectPools();
        }
        
        private void Start()
        {
            // Subscribe to time events
            Core.GameEvents.OnTimeOfDayChanged += OnTimeOfDayChanged;
            
            // Initial spawn check
            CheckAndSpawnNPCs();
        }
        
        private void OnDestroy()
        {
            // Unsubscribe from events
            Core.GameEvents.OnTimeOfDayChanged -= OnTimeOfDayChanged;
        }
        
        private void Update()
        {
            spawnTimer += Time.deltaTime;
            
            if (spawnTimer >= spawnCheckInterval)
            {
                spawnTimer = 0f;
                CheckAndSpawnNPCs();
                CheckAndDespawnNPCs();
            }
        }
        
        private void InitializeObjectPools()
        {
            if (!useObjectPooling) return;
            
            foreach (NPCScheduleData schedule in npcSchedules)
            {
                if (schedule.npcPrefab != null && !npcPools.ContainsKey(schedule.npcID))
                {
                    npcPools[schedule.npcID] = new Queue<GameObject>();
                    
                    // Pre-instantiate some NPCs
                    for (int i = 0; i < 3; i++)
                    {
                        GameObject npc = Instantiate(schedule.npcPrefab);
                        npc.SetActive(false);
                        npc.transform.SetParent(transform);
                        npcPools[schedule.npcID].Enqueue(npc);
                    }
                }
            }
        }
        
        private void CheckAndSpawnNPCs()
        {
            if (activeNPCs.Count >= maxActiveNPCs) return;
            
            float currentTime = timeSystem != null ? timeSystem.GetCurrentTimeOfDay() : 12f;
            TimeOfDayPeriod currentPeriod = timeSystem != null ? timeSystem.GetCurrentPeriod() : TimeOfDayPeriod.Afternoon;
            
            foreach (NPCScheduleData schedule in npcSchedules)
            {
                // Check if NPC should be active
                if (!ShouldNPCBeActive(schedule, currentTime, currentPeriod))
                {
                    continue;
                }
                
                // Check if already spawned
                if (IsNPCSpawned(schedule.npcID))
                {
                    continue;
                }
                
                // Check distance from player
                if (playerTransform != null)
                {
                    float distance = Vector3.Distance(playerTransform.position, schedule.spawnPosition);
                    if (distance < respawnDistance && distance > 5f) // Don't spawn too close
                    {
                        SpawnNPC(schedule);
                    }
                }
                else
                {
                    SpawnNPC(schedule);
                }
            }
        }
        
        private bool ShouldNPCBeActive(NPCScheduleData schedule, float currentTime, TimeOfDayPeriod currentPeriod)
        {
            // Check time range
            if (schedule.activeStartTime <= schedule.activeEndTime)
            {
                // Normal time range (e.g., 8:00 to 18:00)
                if (currentTime < schedule.activeStartTime || currentTime > schedule.activeEndTime)
                {
                    return false;
                }
            }
            else
            {
                // Wraps around midnight (e.g., 22:00 to 6:00)
                if (currentTime < schedule.activeStartTime && currentTime > schedule.activeEndTime)
                {
                    return false;
                }
            }
            
            // Check specific periods if defined
            if (schedule.activePeriods != null && schedule.activePeriods.Count > 0)
            {
                if (!schedule.activePeriods.Contains(currentPeriod))
                {
                    return false;
                }
            }
            
            // Check quest requirements
            if (!string.IsNullOrEmpty(schedule.requiredQuestID))
            {
                // Would check with QuestManager if quest is completed
                // For now, assume it's available
            }
            
            return true;
        }
        
        private bool IsNPCSpawned(string npcID)
        {
            return activeNPCs.Exists(npc => npc.schedule.npcID == npcID);
        }
        
        private void SpawnNPC(NPCScheduleData schedule)
        {
            GameObject npcObject = null;
            
            // Try to get from pool
            if (useObjectPooling && npcPools.ContainsKey(schedule.npcID) && npcPools[schedule.npcID].Count > 0)
            {
                npcObject = npcPools[schedule.npcID].Dequeue();
                npcObject.SetActive(true);
            }
            else
            {
                // Instantiate new
                if (schedule.npcPrefab != null)
                {
                    npcObject = Instantiate(schedule.npcPrefab);
                }
            }
            
            if (npcObject == null) return;
            
            // Position NPC
            npcObject.transform.position = schedule.spawnPosition;
            npcObject.transform.rotation = Quaternion.Euler(0, schedule.spawnRotation, 0);
            
            // Add to active list
            ActiveNPC activeNPC = new ActiveNPC
            {
                gameObject = npcObject,
                schedule = schedule,
                transform = npcObject.transform,
                spawnTime = Time.time
            };
            
            activeNPCs.Add(activeNPC);
            
            Debug.Log($"[NPCScheduler] Spawned NPC: {schedule.npcName}");
        }
        
        private void CheckAndDespawnNPCs()
        {
            float currentTime = timeSystem != null ? timeSystem.GetCurrentTimeOfDay() : 12f;
            TimeOfDayPeriod currentPeriod = timeSystem != null ? timeSystem.GetCurrentPeriod() : TimeOfDayPeriod.Afternoon;
            
            List<ActiveNPC> toDespawn = new List<ActiveNPC>();
            
            foreach (ActiveNPC npc in activeNPCs)
            {
                bool shouldDespawn = false;
                
                // Check if still should be active
                if (!ShouldNPCBeActive(npc.schedule, currentTime, currentPeriod))
                {
                    shouldDespawn = true;
                }
                
                // Check distance from player
                if (playerTransform != null && npc.transform != null)
                {
                    float distance = Vector3.Distance(playerTransform.position, npc.transform.position);
                    if (distance > despawnDistance)
                    {
                        shouldDespawn = true;
                    }
                }
                
                if (shouldDespawn)
                {
                    toDespawn.Add(npc);
                }
            }
            
            // Despawn NPCs
            foreach (ActiveNPC npc in toDespawn)
            {
                DespawnNPC(npc);
            }
        }
        
        private void DespawnNPC(ActiveNPC npc)
        {
            if (npc.gameObject == null) return;
            
            // Return to pool or destroy
            if (useObjectPooling && npcPools.ContainsKey(npc.schedule.npcID))
            {
                npc.gameObject.SetActive(false);
                npc.gameObject.transform.SetParent(transform);
                npcPools[npc.schedule.npcID].Enqueue(npc.gameObject);
            }
            else
            {
                Destroy(npc.gameObject);
            }
            
            activeNPCs.Remove(npc);
            
            Debug.Log($"[NPCScheduler] Despawned NPC: {npc.schedule.npcName}");
        }
        
        private void OnTimeOfDayChanged(TimeOfDayPeriod period)
        {
            // Recheck spawns when time period changes
            CheckAndSpawnNPCs();
        }
        
        /// <summary>
        /// Force spawn a specific NPC regardless of schedule
        /// </summary>
        public void ForceSpawnNPC(string npcID)
        {
            NPCScheduleData schedule = npcSchedules.Find(s => s.npcID == npcID);
            if (schedule != null)
            {
                SpawnNPC(schedule);
            }
        }
        
        /// <summary>
        /// Force despawn a specific NPC
        /// </summary>
        public void ForceDespawnNPC(string npcID)
        {
            ActiveNPC npc = activeNPCs.Find(n => n.schedule.npcID == npcID);
            if (npc != null)
            {
                DespawnNPC(npc);
            }
        }
        
        /// <summary>
        /// Get all currently active NPCs
        /// </summary>
        public List<GameObject> GetActiveNPCs()
        {
            List<GameObject> npcs = new List<GameObject>();
            foreach (ActiveNPC npc in activeNPCs)
            {
                if (npc.gameObject != null)
                {
                    npcs.Add(npc.gameObject);
                }
            }
            return npcs;
        }
        
        public int GetActiveNPCCount() => activeNPCs.Count;
    }
    
    /// <summary>
    /// NPC schedule data - ScriptableObject for each NPC
    /// </summary>
    [System.Serializable]
    public class NPCScheduleData
    {
        [Header("NPC Info")]
        public string npcID;
        public string npcName;
        public GameObject npcPrefab;
        
        [Header("Spawn Settings")]
        public Vector3 spawnPosition;
        public float spawnRotation = 0f;
        
        [Header("Time Schedule")]
        [Range(0f, 24f)] public float activeStartTime = 8f;
        [Range(0f, 24f)] public float activeEndTime = 18f;
        public List<TimeOfDayPeriod> activePeriods = new List<TimeOfDayPeriod>();
        
        [Header("Requirements")]
        public string requiredQuestID;
        public int requiredPlayerLevel = 1;
        
        [Header("Behavior")]
        public bool isStatic = false; // Doesn't move
        public string[] dialogueIDs;
        public string questToGive;
    }
}
