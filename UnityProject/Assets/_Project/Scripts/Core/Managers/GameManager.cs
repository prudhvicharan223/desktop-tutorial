using UnityEngine;

namespace FutureGadgetAdventure.Core
{
    /// <summary>
    /// Central game state controller managing all core systems
    /// Singleton pattern ensures only one instance exists
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Game State")]
        public GameState currentGameState = GameState.MainMenu;
        
        [Header("Managers")]
        public SceneTransitionManager sceneManager;
        public SaveLoadManager saveLoadManager;
        public QuestManager questManager;
        public InventoryManager inventoryManager;
        public AudioManager audioManager;
        public InputManager inputManager;
        
        [Header("Debug")]
        public bool showDebugInfo = true;
        
        private void Awake()
        {
            // Singleton pattern implementation
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            
            Instance = this;
            DontDestroyOnLoad(gameObject);
            
            InitializeManagers();
        }
        
        private void InitializeManagers()
        {
            Debug.Log("[GameManager] Initializing all game systems...");
            
            // Initialize managers in dependency order
            sceneManager?.Initialize();
            saveLoadManager?.Initialize();
            questManager?.Initialize();
            inventoryManager?.Initialize();
            audioManager?.Initialize();
            inputManager?.Initialize();
            
            Debug.Log("[GameManager] All systems initialized successfully");
        }
        
        /// <summary>
        /// Changes the current game state and triggers appropriate responses
        /// </summary>
        public void ChangeGameState(GameState newState)
        {
            if (currentGameState == newState) return;
            
            GameState previousState = currentGameState;
            currentGameState = newState;
            
            OnGameStateChanged(previousState, newState);
        }
        
        private void OnGameStateChanged(GameState previousState, GameState newState)
        {
            if (showDebugInfo)
            {
                Debug.Log($"[GameManager] State changed: {previousState} -> {newState}");
            }
            
            switch (newState)
            {
                case GameState.MainMenu:
                    Time.timeScale = 1f;
                    Cursor.lockState = CursorLockMode.None;
                    Cursor.visible = true;
                    break;
                    
                case GameState.Playing:
                    Time.timeScale = 1f;
                    Cursor.lockState = CursorLockMode.Locked;
                    Cursor.visible = false;
                    break;
                    
                case GameState.Paused:
                    Time.timeScale = 0f;
                    Cursor.lockState = CursorLockMode.None;
                    Cursor.visible = true;
                    break;
                    
                case GameState.Cutscene:
                    Time.timeScale = 1f;
                    // Disable player input during cutscenes
                    if (inputManager != null)
                    {
                        inputManager.DisablePlayerInput();
                    }
                    break;
                    
                case GameState.Loading:
                    Time.timeScale = 1f;
                    break;
            }
            
            // Notify other systems of state change
            GameEvents.OnGameStateChanged?.Invoke(newState);
        }
        
        private void OnApplicationQuit()
        {
            Debug.Log("[GameManager] Application quitting, performing cleanup...");
            // Auto-save on quit
            saveLoadManager?.SaveGame();
        }
        
        private void OnApplicationPause(bool pauseStatus)
        {
            if (pauseStatus)
            {
                // Auto-save when app goes to background (important for mobile)
                saveLoadManager?.SaveGame();
            }
        }
    }

    /// <summary>
    /// Enum defining all possible game states
    /// </summary>
    public enum GameState
    {
        MainMenu,
        Playing,
        Paused,
        Cutscene,
        Loading,
        GameOver
    }
}
