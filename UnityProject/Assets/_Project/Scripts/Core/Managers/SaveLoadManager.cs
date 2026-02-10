using UnityEngine;

namespace FutureGadgetAdventure.Core.Managers
{
    /// <summary>
    /// Wrapper for SaveManager to integrate with GameManager
    /// </summary>
    public class SaveLoadManager : MonoBehaviour
    {
        private Systems.SaveSystem.SaveManager saveManager;
        
        private void Awake()
        {
            saveManager = FindObjectOfType<Systems.SaveSystem.SaveManager>();
            if (saveManager == null)
            {
                GameObject saveObj = new GameObject("SaveManager");
                saveObj.transform.SetParent(transform);
                saveManager = saveObj.AddComponent<Systems.SaveSystem.SaveManager>();
            }
        }
        
        public void SaveGame()
        {
            if (saveManager != null)
            {
                saveManager.SaveGame();
            }
        }
        
        public void LoadGame(int slot = -1)
        {
            if (saveManager != null)
            {
                saveManager.LoadGame(slot);
            }
        }
        
        public void Initialize()
        {
            if (saveManager != null)
            {
                saveManager.Initialize();
            }
            Debug.Log("[SaveLoadManager] Initialized");
        }
    }
}
