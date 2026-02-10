using UnityEngine;
using UnityEngine.InputSystem;

namespace FutureGadgetAdventure.Gameplay.Player
{
    /// <summary>
    /// Third-person player character controller with modern movement mechanics
    /// Handles walking, running, jumping, crouching, and swimming
    /// Uses Unity's new Input System for cross-platform support
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        [Header("Movement Settings")]
        [SerializeField] private float walkSpeed = 5f;
        [SerializeField] private float sprintSpeed = 8f;
        [SerializeField] private float crouchSpeed = 2.5f;
        [SerializeField] private float jumpHeight = 2f;
        [SerializeField] private float gravity = -19.62f;
        [SerializeField] private float turnSmoothTime = 0.1f;
        
        [Header("Camera")]
        [SerializeField] private Transform cameraFollow;
        [SerializeField] private float mouseSensitivity = 2f;
        [SerializeField] private float controllerSensitivity = 150f;
        [SerializeField] private float minCameraAngle = -40f;
        [SerializeField] private float maxCameraAngle = 80f;
        
        [Header("Ground Check")]
        [SerializeField] private Transform groundCheck;
        [SerializeField] private float groundDistance = 0.4f;
        [SerializeField] private LayerMask groundMask;
        
        [Header("Player Stats")]
        [SerializeField] private float maxHealth = 100f;
        [SerializeField] private float maxEnergy = 100f;
        [SerializeField] private float energyRegenRate = 10f;
        
        // Components
        private CharacterController controller;
        private Animator animator;
        private PlayerInput playerInput;
        
        // Movement variables
        private Vector3 velocity;
        private bool isGrounded;
        private bool isSprinting;
        private bool isCrouching;
        private float currentSpeed;
        private float turnSmoothVelocity;
        
        // Input variables
        private Vector2 moveInput;
        private Vector2 lookInput;
        
        // Player stats
        private float currentHealth;
        private float currentEnergy;
        
        // Camera rotation
        private float cameraRotationX = 0f;
        
        private void Awake()
        {
            controller = GetComponent<CharacterController>();
            animator = GetComponentInChildren<Animator>();
            playerInput = GetComponent<PlayerInput>();
            
            // Initialize stats
            currentHealth = maxHealth;
            currentEnergy = maxEnergy;
            
            // Lock cursor for gameplay
            Cursor.lockState = CursorLockMode.Locked;
            Cursor.visible = false;
        }
        
        private void Update()
        {
            HandleGroundCheck();
            HandleMovement();
            HandleJump();
            HandleGravity();
            HandleCamera();
            HandleEnergyRegen();
            UpdateAnimations();
        }
        
        private void HandleGroundCheck()
        {
            isGrounded = Physics.CheckSphere(groundCheck.position, groundDistance, groundMask);
            
            // Reset falling velocity when grounded
            if (isGrounded && velocity.y < 0)
            {
                velocity.y = -2f;
            }
        }
        
        private void HandleMovement()
        {
            if (moveInput.sqrMagnitude < 0.01f)
            {
                return;
            }
            
            // Calculate movement direction relative to camera
            Vector3 moveDirection = CalculateMoveDirection();
            
            // Determine speed based on state
            currentSpeed = DetermineSpeed();
            
            // Smooth rotation towards movement direction
            if (moveDirection != Vector3.zero)
            {
                float targetAngle = Mathf.Atan2(moveDirection.x, moveDirection.z) * Mathf.Rad2Deg;
                float angle = Mathf.SmoothDampAngle(transform.eulerAngles.y, targetAngle, ref turnSmoothVelocity, turnSmoothTime);
                transform.rotation = Quaternion.Euler(0f, angle, 0f);
            }
            
            // Apply movement
            controller.Move(moveDirection.normalized * currentSpeed * Time.deltaTime);
            
            // Consume energy while sprinting
            if (isSprinting)
            {
                ConsumeEnergy(5f * Time.deltaTime);
            }
        }
        
        private Vector3 CalculateMoveDirection()
        {
            Vector3 cameraForward = cameraFollow.forward;
            Vector3 cameraRight = cameraFollow.right;
            
            // Project camera vectors onto horizontal plane
            cameraForward.y = 0f;
            cameraRight.y = 0f;
            cameraForward.Normalize();
            cameraRight.Normalize();
            
            // Calculate desired move direction
            return cameraForward * moveInput.y + cameraRight * moveInput.x;
        }
        
        private float DetermineSpeed()
        {
            if (isCrouching)
            {
                return crouchSpeed;
            }
            else if (isSprinting && currentEnergy > 0)
            {
                return sprintSpeed;
            }
            else
            {
                return walkSpeed;
            }
        }
        
        private void HandleJump()
        {
            // Jump is handled by OnJump input callback
        }
        
        private void HandleGravity()
        {
            velocity.y += gravity * Time.deltaTime;
            controller.Move(velocity * Time.deltaTime);
        }
        
        private void HandleCamera()
        {
            // Rotate camera up/down (X-axis)
            cameraRotationX -= lookInput.y * mouseSensitivity;
            cameraRotationX = Mathf.Clamp(cameraRotationX, minCameraAngle, maxCameraAngle);
            cameraFollow.localRotation = Quaternion.Euler(cameraRotationX, 0f, 0f);
            
            // Rotate player body left/right (Y-axis)
            transform.Rotate(Vector3.up * lookInput.x * mouseSensitivity);
        }
        
        private void HandleEnergyRegen()
        {
            if (currentEnergy < maxEnergy && !isSprinting)
            {
                currentEnergy += energyRegenRate * Time.deltaTime;
                currentEnergy = Mathf.Min(currentEnergy, maxEnergy);
                Core.GameEvents.EnergyChanged(currentEnergy);
            }
        }
        
        private void UpdateAnimations()
        {
            if (animator == null) return;
            
            float speed = new Vector3(controller.velocity.x, 0, controller.velocity.z).magnitude;
            float normalizedSpeed = speed / sprintSpeed;
            
            animator.SetFloat("Speed", normalizedSpeed);
            animator.SetBool("IsGrounded", isGrounded);
            animator.SetBool("IsCrouching", isCrouching);
            animator.SetBool("IsSprinting", isSprinting);
        }
        
        // === INPUT SYSTEM CALLBACKS ===
        
        public void OnMove(InputValue value)
        {
            moveInput = value.Get<Vector2>();
        }
        
        public void OnLook(InputValue value)
        {
            lookInput = value.Get<Vector2>();
        }
        
        public void OnJump(InputValue value)
        {
            if (isGrounded && value.isPressed)
            {
                velocity.y = Mathf.Sqrt(jumpHeight * -2f * gravity);
                
                if (animator != null)
                {
                    animator.SetTrigger("Jump");
                }
            }
        }
        
        public void OnSprint(InputValue value)
        {
            isSprinting = value.isPressed;
        }
        
        public void OnCrouch(InputValue value)
        {
            if (value.isPressed)
            {
                isCrouching = !isCrouching;
                controller.height = isCrouching ? 1f : 2f;
            }
        }
        
        // === PUBLIC METHODS ===
        
        public void TakeDamage(float damage)
        {
            currentHealth -= damage;
            currentHealth = Mathf.Max(currentHealth, 0);
            
            Core.GameEvents.HealthChanged(currentHealth);
            
            if (currentHealth <= 0)
            {
                Die();
            }
        }
        
        public void Heal(float amount)
        {
            currentHealth += amount;
            currentHealth = Mathf.Min(currentHealth, maxHealth);
            Core.GameEvents.HealthChanged(currentHealth);
        }
        
        public void ConsumeEnergy(float amount)
        {
            currentEnergy -= amount;
            currentEnergy = Mathf.Max(currentEnergy, 0);
            Core.GameEvents.EnergyChanged(currentEnergy);
        }
        
        public void RestoreEnergy(float amount)
        {
            currentEnergy += amount;
            currentEnergy = Mathf.Min(currentEnergy, maxEnergy);
            Core.GameEvents.EnergyChanged(currentEnergy);
        }
        
        private void Die()
        {
            Debug.Log("[PlayerController] Player died!");
            Core.GameEvents.PlayerDeath();
            
            // Disable player control
            enabled = false;
            
            // Play death animation
            if (animator != null)
            {
                animator.SetTrigger("Death");
            }
            
            // TODO: Show game over screen or respawn logic
        }
        
        public void Respawn(Vector3 position)
        {
            transform.position = position;
            currentHealth = maxHealth;
            currentEnergy = maxEnergy;
            enabled = true;
            
            Core.GameEvents.PlayerRespawn();
            Core.GameEvents.HealthChanged(currentHealth);
            Core.GameEvents.EnergyChanged(currentEnergy);
        }
        
        public void EnableInput()
        {
            playerInput.ActivateInput();
        }
        
        public void DisableInput()
        {
            playerInput.DeactivateInput();
            moveInput = Vector2.zero;
            lookInput = Vector2.zero;
        }
        
        // === GETTERS ===
        
        public float GetCurrentHealth() => currentHealth;
        public float GetMaxHealth() => maxHealth;
        public float GetCurrentEnergy() => currentEnergy;
        public float GetMaxEnergy() => maxEnergy;
        public bool IsGrounded() => isGrounded;
        public bool IsSprinting() => isSprinting;
        public bool IsCrouching() => isCrouching;
        
        private void OnDrawGizmosSelected()
        {
            // Visualize ground check sphere
            if (groundCheck != null)
            {
                Gizmos.color = isGrounded ? Color.green : Color.red;
                Gizmos.DrawWireSphere(groundCheck.position, groundDistance);
            }
        }
    }
}
