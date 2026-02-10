using UnityEngine;
using System.Collections.Generic;

namespace FutureGadgetAdventure.Utilities
{
    /// <summary>
    /// Generic object pooler for performance optimization
    /// Reuses GameObjects instead of instantiating/destroying them
    /// Essential for mobile performance
    /// </summary>
    public class ObjectPooler : MonoBehaviour
    {
        [System.Serializable]
        public class Pool
        {
            public string tag;
            public GameObject prefab;
            public int size;
            public bool expandable = true;
        }
        
        public static ObjectPooler Instance { get; private set; }
        
        [Header("Pools")]
        [SerializeField] private List<Pool> pools = new List<Pool>();
        
        [Header("Settings")]
        [SerializeField] private Transform poolParent;
        
        private Dictionary<string, Queue<GameObject>> poolDictionary;
        private Dictionary<string, GameObject> prefabDictionary;
        private Dictionary<string, bool> expandableDictionary;
        
        private void Awake()
        {
            // Singleton pattern
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            
            Instance = this;
            
            InitializePools();
        }
        
        private void InitializePools()
        {
            poolDictionary = new Dictionary<string, Queue<GameObject>>();
            prefabDictionary = new Dictionary<string, GameObject>();
            expandableDictionary = new Dictionary<string, bool>();
            
            foreach (Pool pool in pools)
            {
                Queue<GameObject> objectPool = new Queue<GameObject>();
                
                for (int i = 0; i < pool.size; i++)
                {
                    GameObject obj = CreateNewObject(pool.prefab);
                    objectPool.Enqueue(obj);
                }
                
                poolDictionary.Add(pool.tag, objectPool);
                prefabDictionary.Add(pool.tag, pool.prefab);
                expandableDictionary.Add(pool.tag, pool.expandable);
            }
            
            Debug.Log($"[ObjectPooler] Initialized {pools.Count} pools");
        }
        
        private GameObject CreateNewObject(GameObject prefab)
        {
            GameObject obj = Instantiate(prefab);
            obj.SetActive(false);
            
            if (poolParent != null)
            {
                obj.transform.SetParent(poolParent);
            }
            else
            {
                obj.transform.SetParent(transform);
            }
            
            return obj;
        }
        
        /// <summary>
        /// Spawn object from pool
        /// </summary>
        public GameObject SpawnFromPool(string tag, Vector3 position, Quaternion rotation)
        {
            if (!poolDictionary.ContainsKey(tag))
            {
                Debug.LogWarning($"[ObjectPooler] Pool with tag '{tag}' doesn't exist");
                return null;
            }
            
            GameObject objectToSpawn;
            
            // Get object from pool
            if (poolDictionary[tag].Count > 0)
            {
                objectToSpawn = poolDictionary[tag].Dequeue();
            }
            else if (expandableDictionary[tag])
            {
                // Pool is expandable, create new object
                objectToSpawn = CreateNewObject(prefabDictionary[tag]);
                Debug.Log($"[ObjectPooler] Expanded pool '{tag}'");
            }
            else
            {
                Debug.LogWarning($"[ObjectPooler] Pool '{tag}' is full and not expandable");
                return null;
            }
            
            objectToSpawn.SetActive(true);
            objectToSpawn.transform.position = position;
            objectToSpawn.transform.rotation = rotation;
            
            // Notify pooled object
            IPooledObject pooledObj = objectToSpawn.GetComponent<IPooledObject>();
            if (pooledObj != null)
            {
                pooledObj.OnObjectSpawn();
            }
            
            return objectToSpawn;
        }
        
        /// <summary>
        /// Return object to pool
        /// </summary>
        public void ReturnToPool(string tag, GameObject obj)
        {
            if (!poolDictionary.ContainsKey(tag))
            {
                Debug.LogWarning($"[ObjectPooler] Pool with tag '{tag}' doesn't exist");
                Destroy(obj);
                return;
            }
            
            obj.SetActive(false);
            obj.transform.SetParent(poolParent != null ? poolParent : transform);
            
            poolDictionary[tag].Enqueue(obj);
        }
        
        /// <summary>
        /// Create a new pool at runtime
        /// </summary>
        public void CreatePool(string tag, GameObject prefab, int size, bool expandable = true)
        {
            if (poolDictionary.ContainsKey(tag))
            {
                Debug.LogWarning($"[ObjectPooler] Pool '{tag}' already exists");
                return;
            }
            
            Pool newPool = new Pool
            {
                tag = tag,
                prefab = prefab,
                size = size,
                expandable = expandable
            };
            
            pools.Add(newPool);
            
            Queue<GameObject> objectPool = new Queue<GameObject>();
            
            for (int i = 0; i < size; i++)
            {
                GameObject obj = CreateNewObject(prefab);
                objectPool.Enqueue(obj);
            }
            
            poolDictionary.Add(tag, objectPool);
            prefabDictionary.Add(tag, prefab);
            expandableDictionary.Add(tag, expandable);
            
            Debug.Log($"[ObjectPooler] Created new pool '{tag}' with {size} objects");
        }
        
        /// <summary>
        /// Clear a specific pool
        /// </summary>
        public void ClearPool(string tag)
        {
            if (!poolDictionary.ContainsKey(tag))
            {
                return;
            }
            
            Queue<GameObject> pool = poolDictionary[tag];
            while (pool.Count > 0)
            {
                GameObject obj = pool.Dequeue();
                if (obj != null)
                {
                    Destroy(obj);
                }
            }
            
            poolDictionary.Remove(tag);
            prefabDictionary.Remove(tag);
            expandableDictionary.Remove(tag);
        }
        
        /// <summary>
        /// Get pool statistics
        /// </summary>
        public void GetPoolStats(string tag, out int available, out int total)
        {
            if (poolDictionary.ContainsKey(tag))
            {
                available = poolDictionary[tag].Count;
                total = pools.Find(p => p.tag == tag)?.size ?? 0;
            }
            else
            {
                available = 0;
                total = 0;
            }
        }
    }
    
    /// <summary>
    /// Interface for pooled objects to receive notifications
    /// </summary>
    public interface IPooledObject
    {
        void OnObjectSpawn();
    }
}
