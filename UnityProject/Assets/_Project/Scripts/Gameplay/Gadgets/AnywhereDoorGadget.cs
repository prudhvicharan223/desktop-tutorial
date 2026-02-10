using UnityEngine;

namespace FutureGadgetAdventure.Gameplay.Gadgets
{
    /// <summary>
    /// Anywhere Door - Teleportation gadget
    /// Place two doors and teleport between them
    /// Inspired by Doraemon's signature gadget
    /// </summary>
    [CreateAssetMenu(fileName = "AnywhereDoor", menuName = "Future Gadget Adventure/Gadget/Anywhere Door")]
    public class AnywhereDoorGadget : Gadget
    {
        [Header("Anywhere Door Settings")]
        [SerializeField] private float maxPlacementDistance = 50f;
        [SerializeField] private int maxDoorPairs = 1;
        [SerializeField] private GameObject doorPrefab;
        [SerializeField] private float doorLifetime = 60f; // Doors last 60 seconds
        
        private GameObject doorA;
        private GameObject doorB;
        private bool hasPlacedFirstDoor = false;
        
        public override bool Use(GameObject user, Vector3 position, Vector3 direction)
        {
            if (!CanUse(user)) return false;
            
            if (!hasPlacedFirstDoor)
            {
                PlaceFirstDoor(position, direction);
            }
            else
            {
                PlaceSecondDoor(position, direction);
            }
            
            // Consume energy
            Player.PlayerController player = user.GetComponent<Player.PlayerController>();
            player?.ConsumeEnergy(energyCost);
            
            base.Use(user, position, direction);
            return true;
        }
        
        private void PlaceFirstDoor(Vector3 position, Vector3 direction)
        {
            // Clear any existing doors
            if (doorA != null) Destroy(doorA);
            if (doorB != null) Destroy(doorB);
            
            // Spawn first door
            doorA = Instantiate(doorPrefab, position, Quaternion.LookRotation(direction));
            doorA.name = "Anywhere Door A";
            
            // Add teleport component
            TeleportDoor doorComponent = doorA.GetComponent<TeleportDoor>();
            if (doorComponent == null)
            {
                doorComponent = doorA.AddComponent<TeleportDoor>();
            }
            doorComponent.Initialize(null, this);
            
            hasPlacedFirstDoor = true;
            Core.GameEvents.ShowNotification("First door placed! Place second door to activate.");
            
            // Auto-destroy after lifetime
            Destroy(doorA, doorLifetime);
        }
        
        private void PlaceSecondDoor(Vector3 position, Vector3 direction)
        {
            if (doorA == null)
            {
                Core.GameEvents.ShowNotification("First door expired! Starting over.");
                hasPlacedFirstDoor = false;
                return;
            }
            
            // Check distance
            float distance = Vector3.Distance(doorA.transform.position, position);
            if (distance > maxPlacementDistance)
            {
                Core.GameEvents.ShowNotification($"Too far! Maximum distance: {maxPlacementDistance}m");
                return;
            }
            
            // Spawn second door
            doorB = Instantiate(doorPrefab, position, Quaternion.LookRotation(direction));
            doorB.name = "Anywhere Door B";
            
            // Link doors together
            TeleportDoor doorAComponent = doorA.GetComponent<TeleportDoor>();
            TeleportDoor doorBComponent = doorB.GetComponent<TeleportDoor>();
            
            if (doorBComponent == null)
            {
                doorBComponent = doorB.AddComponent<TeleportDoor>();
            }
            
            doorAComponent.SetDestination(doorB.transform);
            doorBComponent.SetDestination(doorA.transform);
            doorBComponent.Initialize(doorA.transform, this);
            
            hasPlacedFirstDoor = false;
            Core.GameEvents.ShowNotification("Anywhere Door activated! Step through to teleport.");
            
            // Auto-destroy after lifetime
            Destroy(doorB, doorLifetime);
        }
        
        protected override void ApplyUpgrade()
        {
            switch (upgradeLevel)
            {
                case 1:
                    maxPlacementDistance *= 1.5f; // 50% longer range
                    Core.GameEvents.ShowNotification("Upgrade: Door range increased!");
                    break;
                    
                case 2:
                    maxDoorPairs = 2; // Can place 2 pairs
                    Core.GameEvents.ShowNotification("Upgrade: Can place multiple door pairs!");
                    break;
                    
                case 3:
                    cooldownTime *= 0.5f; // Half cooldown
                    doorLifetime *= 2f; // Doors last twice as long
                    Core.GameEvents.ShowNotification("Upgrade: Faster cooldown & longer duration!");
                    break;
            }
        }
        
        public void OnDoorDestroyed(GameObject door)
        {
            if (door == doorA)
            {
                doorA = null;
            }
            else if (door == doorB)
            {
                doorB = null;
            }
            
            hasPlacedFirstDoor = false;
        }
    }
    
    /// <summary>
    /// Component attached to door instances to handle teleportation
    /// </summary>
    public class TeleportDoor : MonoBehaviour
    {
        private Transform destination;
        private AnywhereDoorGadget parentGadget;
        private bool canTeleport = true;
        private float teleportCooldown = 0.5f;
        
        [SerializeField] private GameObject teleportVFX;
        [SerializeField] private AudioClip teleportSound;
        
        public void Initialize(Transform dest, AnywhereDoorGadget gadget)
        {
            destination = dest;
            parentGadget = gadget;
        }
        
        public void SetDestination(Transform dest)
        {
            destination = dest;
        }
        
        private void OnTriggerEnter(Collider other)
        {
            if (!canTeleport || destination == null) return;
            
            // Check if it's the player or an NPC
            if (other.CompareTag("Player") || other.CompareTag("NPC"))
            {
                Teleport(other.gameObject);
            }
        }
        
        private void Teleport(GameObject entity)
        {
            // Disable teleport temporarily to prevent loops
            canTeleport = false;
            TeleportDoor destinationDoor = destination.GetComponent<TeleportDoor>();
            if (destinationDoor != null)
            {
                destinationDoor.DisableTeleportTemporarily();
            }
            
            // Teleport entity
            Vector3 teleportPosition = destination.position + destination.forward * 2f;
            entity.transform.position = teleportPosition;
            entity.transform.rotation = destination.rotation;
            
            // Play effects
            if (teleportVFX != null)
            {
                Instantiate(teleportVFX, transform.position, Quaternion.identity);
                Instantiate(teleportVFX, destination.position, Quaternion.identity);
            }
            
            if (teleportSound != null)
            {
                AudioSource.PlayClipAtPoint(teleportSound, transform.position);
                AudioSource.PlayClipAtPoint(teleportSound, destination.position);
            }
            
            // Notify game
            if (entity.CompareTag("Player"))
            {
                Core.GameEvents.PlayerTeleported(teleportPosition);
                Core.GameEvents.ShowNotification("Teleported!");
            }
            
            // Re-enable after cooldown
            Invoke(nameof(EnableTeleport), teleportCooldown);
        }
        
        private void DisableTeleportTemporarily()
        {
            canTeleport = false;
            Invoke(nameof(EnableTeleport), teleportCooldown);
        }
        
        private void EnableTeleport()
        {
            canTeleport = true;
        }
        
        private void OnDestroy()
        {
            if (parentGadget != null)
            {
                parentGadget.OnDoorDestroyed(gameObject);
            }
        }
    }
}
