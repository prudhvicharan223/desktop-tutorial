using UnityEngine;
using System.Collections.Generic;

namespace FutureGadgetAdventure.Gameplay.Gadgets
{
    /// <summary>
    /// Time Cloth - Rewinds objects to their previous state
    /// Can repair broken bridges, restore items, reverse environmental changes
    /// </summary>
    [CreateAssetMenu(fileName = "TimeCloth", menuName = "Future Gadget Adventure/Gadget/Time Cloth")]
    public class TimeClothGadget : Gadget
    {
        [Header("Time Cloth Settings")]
        [SerializeField] private float rewindDuration = 5f;
        [SerializeField] private float maxRewindTime = 30f;
        [SerializeField] private float maxRayDistance = 10f;
        [SerializeField] private LayerMask rewindableLayer;
        
        [Header("Effects")]
        [SerializeField] private Color rewindGlowColor = Color.cyan;
        [SerializeField] private GameObject rewindParticles;
        
        public override bool Use(GameObject user, Vector3 position, Vector3 direction)
        {
            if (!CanUse(user)) return false;
            
            // Raycast to find rewindable object
            RaycastHit hit;
            if (Physics.Raycast(position, direction, out hit, maxRayDistance, rewindableLayer))
            {
                IRewindable rewindable = hit.collider.GetComponent<IRewindable>();
                if (rewindable != null)
                {
                    // Apply rewind effect
                    rewindable.Rewind(rewindDuration);
                    
                    // Play effects at hit point
                    if (activationVFX != null)
                    {
                        GameObject vfx = Instantiate(activationVFX, hit.point, Quaternion.identity);
                        Destroy(vfx, 5f);
                    }
                    
                    if (rewindParticles != null)
                    {
                        GameObject particles = Instantiate(rewindParticles, hit.collider.transform.position, Quaternion.identity);
                        particles.transform.parent = hit.collider.transform;
                        Destroy(particles, rewindDuration);
                    }
                    
                    // Consume energy
                    Player.PlayerController player = user.GetComponent<Player.PlayerController>();
                    player?.ConsumeEnergy(energyCost);
                    
                    Core.GameEvents.ShowNotification($"Rewinding: {hit.collider.name}");
                    base.Use(user, position, direction);
                    return true;
                }
                else
                {
                    Core.GameEvents.ShowNotification("This object cannot be rewound!");
                }
            }
            else
            {
                Core.GameEvents.ShowNotification("No rewindable object in range!");
            }
            
            return false;
        }
        
        protected override void ApplyUpgrade()
        {
            switch (upgradeLevel)
            {
                case 1:
                    maxRayDistance *= 1.5f;
                    Core.GameEvents.ShowNotification("Upgrade: Longer rewind range!");
                    break;
                    
                case 2:
                    maxRewindTime *= 2f;
                    Core.GameEvents.ShowNotification("Upgrade: Can rewind further back in time!");
                    break;
                    
                case 3:
                    // Can affect multiple objects
                    Core.GameEvents.ShowNotification("Upgrade: Area rewind effect!");
                    break;
            }
        }
    }
    
    /// <summary>
    /// Interface for objects that can be rewound by Time Cloth
    /// </summary>
    public interface IRewindable
    {
        void Rewind(float seconds);
        bool CanRewind();
    }
    
    /// <summary>
    /// Component that records object states and allows rewinding
    /// Attach to any object that should be rewindable
    /// </summary>
    public class RewindableObject : MonoBehaviour, IRewindable
    {
        [Header("Rewind Settings")]
        [SerializeField] private float recordInterval = 0.1f;
        [SerializeField] private int maxStateHistory = 300; // 30 seconds at 0.1 interval
        [SerializeField] private bool rewindPosition = true;
        [SerializeField] private bool rewindRotation = true;
        [SerializeField] private bool rewindScale = false;
        
        [Header("State Restoration")]
        [SerializeField] private bool canRestoreBrokenState = true;
        [SerializeField] private GameObject brokenStatePrefab;
        [SerializeField] private GameObject repairedStatePrefab;
        
        private struct ObjectState
        {
            public Vector3 position;
            public Quaternion rotation;
            public Vector3 scale;
            public float timestamp;
        }
        
        private Queue<ObjectState> stateHistory = new Queue<ObjectState>();
        private float recordTimer = 0f;
        private bool isRewinding = false;
        private bool isBroken = false;
        
        private void Start()
        {
            RecordState();
        }
        
        private void Update()
        {
            if (!isRewinding)
            {
                recordTimer += Time.deltaTime;
                
                if (recordTimer >= recordInterval)
                {
                    RecordState();
                    recordTimer = 0f;
                }
            }
        }
        
        private void RecordState()
        {
            ObjectState state = new ObjectState
            {
                position = transform.position,
                rotation = transform.rotation,
                scale = transform.localScale,
                timestamp = Time.time
            };
            
            stateHistory.Enqueue(state);
            
            // Limit history size
            if (stateHistory.Count > maxStateHistory)
            {
                stateHistory.Dequeue();
            }
        }
        
        public void Rewind(float seconds)
        {
            if (!CanRewind()) return;
            
            StartCoroutine(RewindCoroutine(seconds));
        }
        
        public bool CanRewind()
        {
            return stateHistory.Count > 0 && !isRewinding;
        }
        
        private System.Collections.IEnumerator RewindCoroutine(float duration)
        {
            isRewinding = true;
            
            // Visual feedback
            Renderer renderer = GetComponent<Renderer>();
            Material originalMaterial = null;
            if (renderer != null)
            {
                originalMaterial = renderer.material;
                renderer.material.SetColor("_EmissionColor", Color.cyan);
            }
            
            float elapsed = 0f;
            while (elapsed < duration && stateHistory.Count > 0)
            {
                ObjectState state = stateHistory.Dequeue();
                
                if (rewindPosition)
                    transform.position = state.position;
                    
                if (rewindRotation)
                    transform.rotation = state.rotation;
                    
                if (rewindScale)
                    transform.localScale = state.scale;
                
                elapsed += Time.deltaTime;
                yield return null;
            }
            
            // Check if should repair broken state
            if (isBroken && canRestoreBrokenState)
            {
                RepairObject();
            }
            
            // Restore original material
            if (renderer != null && originalMaterial != null)
            {
                renderer.material = originalMaterial;
            }
            
            isRewinding = false;
            
            // Start recording again
            RecordState();
        }
        
        public void BreakObject()
        {
            isBroken = true;
            
            if (brokenStatePrefab != null && repairedStatePrefab != null)
            {
                // Replace with broken model
                Instantiate(brokenStatePrefab, transform.position, transform.rotation, transform.parent);
                gameObject.SetActive(false);
            }
        }
        
        private void RepairObject()
        {
            isBroken = false;
            
            if (brokenStatePrefab != null && repairedStatePrefab != null)
            {
                gameObject.SetActive(true);
                Core.GameEvents.ShowNotification("Object repaired!");
            }
        }
    }
}
