using UnityEngine;

namespace FutureGadgetAdventure.Core.Managers
{
    /// <summary>
    /// Wrapper for QuestManager to integrate with GameManager
    /// </summary>
    public class QuestManager : MonoBehaviour
    {
        private Systems.Quest.QuestManager questManager;
        
        private void Awake()
        {
            questManager = FindObjectOfType<Systems.Quest.QuestManager>();
            if (questManager == null)
            {
                GameObject questObj = new GameObject("QuestManager");
                questObj.transform.SetParent(transform);
                questManager = questObj.AddComponent<Systems.Quest.QuestManager>();
            }
        }
        
        public void Initialize()
        {
            if (questManager != null)
            {
                questManager.Initialize();
            }
            Debug.Log("[QuestManager Wrapper] Initialized");
        }
    }
}
