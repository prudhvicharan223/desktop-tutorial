using UnityEngine;
using Cinemachine;

namespace FutureGadgetAdventure.Gameplay.Player
{
    /// <summary>
    /// Advanced camera controller for third-person gameplay
    /// Handles camera following, rotation, and dynamic adjustments
    /// Works with Cinemachine for smooth professional camera work
    /// </summary>
    public class PlayerCamera : MonoBehaviour
    {
        [Header("Target")]
        [SerializeField] private Transform target;
        [SerializeField] private Vector3 targetOffset = new Vector3(0, 1.5f, 0);
        
        [Header("Camera Settings")]
        [SerializeField] private float followDistance = 5f;
        [SerializeField] private float followHeight = 2f;
        [SerializeField] private float rotationSpeed = 5f;
        [SerializeField] private float smoothSpeed = 10f;
        
        [Header("Look Settings")]
        [SerializeField] private float minPitch = -40f;
        [SerializeField] private float maxPitch = 80f;
        [SerializeField] private bool invertY = false;
        
        [Header("Collision Detection")]
        [SerializeField] private LayerMask collisionMask;
        [SerializeField] private float collisionBuffer = 0.3f;
        [SerializeField] private float minDistance = 1f;
        
        [Header("Zoom")]
        [SerializeField] private float minZoom = 2f;
        [SerializeField] private float maxZoom = 10f;
        [SerializeField] private float zoomSpeed = 2f;
        
        // Private variables
        private float currentYaw = 0f;
        private float currentPitch = 0f;
        private float currentDistance;
        private Vector3 currentVelocity;
        private Camera mainCamera;
        
        private void Awake()
        {
            mainCamera = GetComponent<Camera>();
            currentDistance = followDistance;
            
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
        
        private void Start()
        {
            if (target != null)
            {
                // Initialize rotation to face same direction as target
                Vector3 angles = target.eulerAngles;
                currentYaw = angles.y;
                currentPitch = angles.x;
            }
        }
        
        private void LateUpdate()
        {
            if (target == null) return;
            
            UpdateCameraPosition();
        }
        
        private void UpdateCameraPosition()
        {
            // Calculate desired position
            Vector3 targetPosition = target.position + targetOffset;
            
            // Calculate rotation
            Quaternion rotation = Quaternion.Euler(currentPitch, currentYaw, 0);
            
            // Calculate desired camera position
            Vector3 desiredPosition = targetPosition - (rotation * Vector3.forward * currentDistance);
            
            // Check for collisions
            Vector3 finalPosition = CheckCameraCollision(targetPosition, desiredPosition);
            
            // Smooth camera movement
            transform.position = Vector3.SmoothDamp(transform.position, finalPosition, ref currentVelocity, 1f / smoothSpeed);
            
            // Look at target
            transform.LookAt(targetPosition);
        }
        
        private Vector3 CheckCameraCollision(Vector3 targetPosition, Vector3 desiredPosition)
        {
            Vector3 direction = desiredPosition - targetPosition;
            float distance = direction.magnitude;
            
            RaycastHit hit;
            if (Physics.Raycast(targetPosition, direction.normalized, out hit, distance, collisionMask))
            {
                // Camera hit something, move it closer
                float adjustedDistance = Mathf.Max(hit.distance - collisionBuffer, minDistance);
                return targetPosition + direction.normalized * adjustedDistance;
            }
            
            return desiredPosition;
        }
        
        /// <summary>
        /// Rotate camera based on input
        /// </summary>
        public void RotateCamera(float horizontalInput, float verticalInput)
        {
            currentYaw += horizontalInput * rotationSpeed;
            
            float pitchChange = verticalInput * rotationSpeed;
            if (invertY) pitchChange = -pitchChange;
            
            currentPitch -= pitchChange;
            currentPitch = Mathf.Clamp(currentPitch, minPitch, maxPitch);
        }
        
        /// <summary>
        /// Zoom camera in or out
        /// </summary>
        public void ZoomCamera(float scrollInput)
        {
            currentDistance -= scrollInput * zoomSpeed;
            currentDistance = Mathf.Clamp(currentDistance, minZoom, maxZoom);
        }
        
        /// <summary>
        /// Set camera target dynamically
        /// </summary>
        public void SetTarget(Transform newTarget)
        {
            target = newTarget;
            
            if (target != null)
            {
                Vector3 angles = target.eulerAngles;
                currentYaw = angles.y;
                currentPitch = angles.x;
            }
        }
        
        /// <summary>
        /// Get current camera forward direction (useful for movement)
        /// </summary>
        public Vector3 GetForward()
        {
            return transform.forward;
        }
        
        /// <summary>
        /// Get current camera right direction
        /// </summary>
        public Vector3 GetRight()
        {
            return transform.right;
        }
        
        /// <summary>
        /// Shake the camera for impact effects
        /// </summary>
        public void Shake(float intensity, float duration)
        {
            // This would be implemented with a coroutine
            StartCoroutine(ShakeCoroutine(intensity, duration));
        }
        
        private System.Collections.IEnumerator ShakeCoroutine(float intensity, float duration)
        {
            Vector3 originalPos = transform.localPosition;
            float elapsed = 0f;
            
            while (elapsed < duration)
            {
                float x = Random.Range(-1f, 1f) * intensity;
                float y = Random.Range(-1f, 1f) * intensity;
                
                transform.localPosition = new Vector3(x, y, originalPos.z);
                
                elapsed += Time.deltaTime;
                yield return null;
            }
            
            transform.localPosition = originalPos;
        }
        
        private void OnDrawGizmosSelected()
        {
            if (target == null) return;
            
            // Draw camera target position
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(target.position + targetOffset, 0.2f);
            
            // Draw camera distance
            Gizmos.color = Color.green;
            Gizmos.DrawLine(target.position + targetOffset, transform.position);
        }
    }
}
