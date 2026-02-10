using UnityEngine;

namespace FutureGadgetAdventure.Gameplay.Gadgets
{
    /// <summary>
    /// Bamboo Copter - Flight gadget
    /// Attach to player's head and fly for limited time
    /// Uses fuel system that can be recharged at stations
    /// </summary>
    [CreateAssetMenu(fileName = "BambooCopter", menuName = "Future Gadget Adventure/Gadget/Bamboo Copter")]
    public class BambooCopterGadget : Gadget
    {
        [Header("Flight Settings")]
        [SerializeField] private float flightSpeed = 10f;
        [SerializeField] private float maxFlightTime = 30f;
        [SerializeField] private float fuelRechargeRate = 5f;
        [SerializeField] private float verticalSpeed = 5f;
        [SerializeField] private bool unlimitedFuel = false;
        
        [Header("Visual")]
        [SerializeField] private GameObject copterModel;
        [SerializeField] private float rotorSpeed = 1000f;
        
        private float currentFuel;
        private bool isFlying = false;
        private GameObject activeCopter;
        
        public override bool Use(GameObject user, Vector3 position, Vector3 direction)
        {
            if (!CanUse(user)) return false;
            
            if (!isFlying)
            {
                StartFlight(user);
            }
            else
            {
                StopFlight(user);
            }
            
            base.Use(user, position, direction);
            return true;
        }
        
        private void StartFlight(GameObject user)
        {
            if (currentFuel <= 0 && !unlimitedFuel)
            {
                Core.GameEvents.ShowNotification("No fuel! Find a recharge station.");
                return;
            }
            
            isFlying = true;
            currentFuel = maxFlightTime;
            
            // Spawn copter on player's head
            Transform head = FindHeadBone(user.transform);
            if (head != null && copterModel != null)
            {
                activeCopter = Instantiate(copterModel, head.position, Quaternion.identity, head);
                
                // Add flight controller
                BambooCopterController controller = user.GetComponent<BambooCopterController>();
                if (controller == null)
                {
                    controller = user.AddComponent<BambooCopterController>();
                }
                controller.Initialize(this, activeCopter);
            }
            
            // Consume initial energy
            Player.PlayerController player = user.GetComponent<Player.PlayerController>();
            player?.ConsumeEnergy(energyCost);
            
            Core.GameEvents.ShowNotification("Bamboo Copter activated! Press [Jump] to ascend, [Crouch] to descend.");
        }
        
        private void StopFlight(GameObject user)
        {
            isFlying = false;
            
            // Remove copter
            if (activeCopter != null)
            {
                Destroy(activeCopter);
            }
            
            // Remove flight controller
            BambooCopterController controller = user.GetComponent<BambooCopterController>();
            if (controller != null)
            {
                Destroy(controller);
            }
            
            Core.GameEvents.ShowNotification("Bamboo Copter deactivated.");
        }
        
        public override void EndEffect(GameObject user)
        {
            StopFlight(user);
            base.EndEffect(user);
        }
        
        public void ConsumeFuel(float amount)
        {
            if (unlimitedFuel) return;
            
            currentFuel -= amount;
            if (currentFuel <= 0)
            {
                currentFuel = 0;
                // Will be stopped by controller
            }
        }
        
        public void RechargeFuel(float amount)
        {
            currentFuel += amount;
            currentFuel = Mathf.Min(currentFuel, maxFlightTime);
        }
        
        public float GetCurrentFuel() => currentFuel;
        public float GetMaxFuel() => maxFlightTime;
        public bool IsFlying() => isFlying;
        
        private Transform FindHeadBone(Transform root)
        {
            // Try to find head bone in character hierarchy
            Transform head = root.Find("Head");
            if (head == null)
            {
                // Search recursively
                foreach (Transform child in root.GetComponentsInChildren<Transform>())
                {
                    if (child.name.ToLower().Contains("head"))
                    {
                        return child;
                    }
                }
            }
            return head ?? root; // Fallback to root
        }
        
        protected override void ApplyUpgrade()
        {
            switch (upgradeLevel)
            {
                case 1:
                    maxFlightTime *= 1.5f;
                    Core.GameEvents.ShowNotification("Upgrade: Longer flight time!");
                    break;
                    
                case 2:
                    flightSpeed *= 1.3f;
                    Core.GameEvents.ShowNotification("Upgrade: Faster flight speed!");
                    break;
                    
                case 3:
                    unlimitedFuel = true;
                    Core.GameEvents.ShowNotification("Upgrade: Unlimited fuel!");
                    break;
            }
        }
    }
    
    /// <summary>
    /// Controller component for active flight
    /// </summary>
    public class BambooCopterController : MonoBehaviour
    {
        private BambooCopterGadget gadget;
        private GameObject copterVisual;
        private CharacterController controller;
        private Transform rotorTransform;
        
        private float verticalSpeed = 5f;
        private float horizontalSpeed = 10f;
        private float fuelConsumptionRate = 1f;
        
        public void Initialize(BambooCopterGadget gadgetData, GameObject copter)
        {
            gadget = gadgetData;
            copterVisual = copter;
            controller = GetComponent<CharacterController>();
            
            // Find rotor for spinning animation
            if (copterVisual != null)
            {
                rotorTransform = copterVisual.transform.Find("Rotor");
            }
        }
        
        private void Update()
        {
            HandleFlight();
            SpinRotor();
            ConsumeFuel();
        }
        
        private void HandleFlight()
        {
            if (controller == null) return;
            
            Vector3 movement = Vector3.zero;
            
            // Vertical movement
            if (Input.GetKey(KeyCode.Space)) // Ascend
            {
                movement.y = verticalSpeed;
            }
            else if (Input.GetKey(KeyCode.LeftControl)) // Descend
            {
                movement.y = -verticalSpeed;
            }
            else
            {
                movement.y = 0; // Hover
            }
            
            // Horizontal movement (WASD)
            float horizontal = Input.GetAxis("Horizontal");
            float vertical = Input.GetAxis("Vertical");
            
            Vector3 direction = transform.right * horizontal + transform.forward * vertical;
            movement += direction * horizontalSpeed;
            
            // Apply movement
            controller.Move(movement * Time.deltaTime);
        }
        
        private void SpinRotor()
        {
            if (rotorTransform != null)
            {
                rotorTransform.Rotate(Vector3.up, 1000f * Time.deltaTime);
            }
        }
        
        private void ConsumeFuel()
        {
            gadget.ConsumeFuel(fuelConsumptionRate * Time.deltaTime);
            
            if (gadget.GetCurrentFuel() <= 0)
            {
                Core.GameEvents.ShowNotification("Out of fuel!");
                gadget.EndEffect(gameObject);
            }
        }
    }
}
