using UnityEngine;
using UnityEngine.AI;

namespace FutureGadgetAdventure.Gameplay.CompanionAI
{
    /// <summary>
    /// Controls companion robot following behavior
    /// Implements smooth following with auto-teleport if too far
    /// Uses NavMesh for intelligent pathfinding
    /// </summary>
    [RequireComponent(typeof(NavMeshAgent))]
    public class CompanionFollow : MonoBehaviour
    {
        [Header("Target")]
        [SerializeField] private Transform target;
        [SerializeField] private float followDistance = 3f;
        [SerializeField] private float stopDistance = 2f;
        
        [Header("Movement")]
        [SerializeField] private float moveSpeed = 4f;
        [SerializeField] private float runSpeed = 6f;
        [SerializeField] private float rotationSpeed = 10f;
        
        [Header("Teleport")]
        [SerializeField] private float teleportDistance = 15f;
        [SerializeField] private float teleportCooldown = 2f;
        [SerializeField] private GameObject teleportVFX;
        [SerializeField] private AudioClip teleportSFX;
        
        [Header("Behavior")]
        [SerializeField] private bool enableFollowing = true;
        [SerializeField] private float idleTimeBeforeRest = 5f;
        [SerializeField] private float updatePathInterval = 0.3f;
        
        // Components
        private NavMeshAgent agent;
        private Animator animator;
        private CompanionEmotion emotion;
        
        // State tracking
        private float distanceToTarget;
        private float lastTeleportTime;
        private float idleTimer;
        private bool isMoving;
        private Vector3 lastTargetPosition;
        private float pathUpdateTimer;
        
        private void Awake()
        {
            agent = GetComponent<NavMeshAgent>();
            animator = GetComponentInChildren<Animator>();
            emotion = GetComponent<CompanionEmotion>();
            
            // Configure NavMesh agent
            agent.speed = moveSpeed;
            agent.acceleration = 8f;
            agent.angularSpeed = rotationSpeed * 60f; // Convert to degrees/second
            agent.stoppingDistance = stopDistance;
            
            // Find player if not assigned
            if (target == null)
            {
                GameObject player = GameObject.FindGameObjectWithTag("Player");
                if (player != null)
                {
                    target = player.transform;
                }
            }
        }
        
        private void Update()
        {
            if (target == null || !enableFollowing) return;
            
            UpdateFollowBehavior();
            UpdateAnimations();
            UpdateIdleTimer();
        }
        
        private void UpdateFollowBehavior()
        {
            distanceToTarget = Vector3.Distance(transform.position, target.position);
            
            // Check if should teleport
            if (ShouldTeleport())
            {
                TeleportToTarget();
                return;
            }
            
            // Update path periodically instead of every frame for performance
            pathUpdateTimer += Time.deltaTime;
            if (pathUpdateTimer >= updatePathInterval)
            {
                pathUpdateTimer = 0f;
                UpdatePath();
            }
            
            // Determine movement state
            isMoving = agent.velocity.magnitude > 0.1f;
            
            // Adjust speed based on distance
            if (distanceToTarget > followDistance * 2f)
            {
                agent.speed = runSpeed;
            }
            else
            {
                agent.speed = moveSpeed;
            }
        }
        
        private void UpdatePath()
        {
            // Only update if target moved significantly
            if (Vector3.Distance(target.position, lastTargetPosition) > 0.5f)
            {
                if (distanceToTarget > stopDistance)
                {
                    agent.SetDestination(target.position);
                    lastTargetPosition = target.position;
                }
                else
                {
                    agent.ResetPath();
                }
            }
        }
        
        private bool ShouldTeleport()
        {
            // Check distance and cooldown
            if (distanceToTarget > teleportDistance && Time.time - lastTeleportTime > teleportCooldown)
            {
                return true;
            }
            
            // Check if stuck (no valid path)
            if (distanceToTarget > followDistance && !agent.hasPath && !agent.pathPending)
            {
                return true;
            }
            
            return false;
        }
        
        private void TeleportToTarget()
        {
            // Find position near target
            Vector3 teleportPosition = GetTeleportPosition();
            
            // Teleport effects
            PlayTeleportEffects(transform.position); // At current position
            
            // Move companion
            agent.Warp(teleportPosition);
            
            // Play effects at new position
            PlayTeleportEffects(teleportPosition);
            
            lastTeleportTime = Time.time;
            
            // Trigger emotion
            if (emotion != null)
            {
                emotion.PlayEmotion(EmotionType.Surprised);
            }
            
            Debug.Log("[CompanionFollow] Teleported to player");
        }
        
        private Vector3 GetTeleportPosition()
        {
            // Try to find a position near the target
            Vector3 offset = Random.insideUnitSphere * 2f;
            offset.y = 0; // Keep on same height
            Vector3 targetPosition = target.position + offset;
            
            // Check if position is valid on NavMesh
            NavMeshHit hit;
            if (NavMesh.SamplePosition(targetPosition, out hit, 5f, NavMesh.AllAreas))
            {
                return hit.position;
            }
            
            // Fallback to target position
            return target.position;
        }
        
        private void PlayTeleportEffects(Vector3 position)
        {
            if (teleportVFX != null)
            {
                GameObject vfx = Instantiate(teleportVFX, position, Quaternion.identity);
                Destroy(vfx, 2f);
            }
            
            if (teleportSFX != null)
            {
                AudioSource.PlayClipAtPoint(teleportSFX, position);
            }
        }
        
        private void UpdateAnimations()
        {
            if (animator == null) return;
            
            float speed = agent.velocity.magnitude;
            float normalizedSpeed = speed / runSpeed;
            
            animator.SetFloat("Speed", normalizedSpeed);
            animator.SetBool("IsMoving", isMoving);
            animator.SetBool("IsRunning", speed > moveSpeed);
        }
        
        private void UpdateIdleTimer()
        {
            if (isMoving)
            {
                idleTimer = 0f;
            }
            else
            {
                idleTimer += Time.deltaTime;
                
                if (idleTimer >= idleTimeBeforeRest)
                {
                    if (animator != null && emotion != null)
                    {
                        // Play idle animations occasionally
                        if (Random.value < 0.1f * Time.deltaTime)
                        {
                            emotion.PlayRandomIdleEmotion();
                        }
                    }
                }
            }
        }
        
        /// <summary>
        /// Enable or disable following behavior
        /// </summary>
        public void SetFollowingEnabled(bool enabled)
        {
            enableFollowing = enabled;
            
            if (!enabled)
            {
                agent.ResetPath();
            }
        }
        
        /// <summary>
        /// Set new target to follow
        /// </summary>
        public void SetTarget(Transform newTarget)
        {
            target = newTarget;
            lastTargetPosition = target != null ? target.position : Vector3.zero;
        }
        
        /// <summary>
        /// Command companion to move to specific position
        /// </summary>
        public void MoveToPosition(Vector3 position)
        {
            agent.SetDestination(position);
        }
        
        /// <summary>
        /// Stop companion movement
        /// </summary>
        public void Stop()
        {
            agent.ResetPath();
            agent.velocity = Vector3.zero;
        }
        
        /// <summary>
        /// Get current companion state
        /// </summary>
        public bool IsFollowing() => enableFollowing;
        public bool IsMovingToTarget() => isMoving;
        public float GetDistanceToTarget() => distanceToTarget;
        
        private void OnDrawGizmosSelected()
        {
            if (target == null) return;
            
            // Draw follow distance
            Gizmos.color = Color.green;
            Gizmos.DrawWireSphere(target.position, followDistance);
            
            // Draw stop distance
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(target.position, stopDistance);
            
            // Draw teleport distance
            Gizmos.color = Color.red;
            Gizmos.DrawWireSphere(target.position, teleportDistance);
            
            // Draw line to target
            Gizmos.color = Color.cyan;
            Gizmos.DrawLine(transform.position, target.position);
        }
    }
}
