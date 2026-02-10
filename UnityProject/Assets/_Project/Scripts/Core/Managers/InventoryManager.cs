using UnityEngine;
using System.Collections.Generic;

namespace FutureGadgetAdventure.Core.Managers
{
    /// <summary>
    /// Manages player inventory - items, currency, resources
    /// Integrates with quest and gadget systems
    /// </summary>
    public class InventoryManager : MonoBehaviour
    {
        [Header("Currency")]
        [SerializeField] private int money = 0;
        [SerializeField] private int upgradeParts = 0;
        
        [Header("Inventory")]
        [SerializeField] private int maxInventorySlots = 50;
        private Dictionary<string, int> items = new Dictionary<string, int>();
        
        /// <summary>
        /// Add money to player
        /// </summary>
        public void AddMoney(int amount)
        {
            money += amount;
            Core.GameEvents.CoinsChanged(money);
        }
        
        /// <summary>
        /// Remove money from player
        /// </summary>
        public bool RemoveMoney(int amount)
        {
            if (money >= amount)
            {
                money -= amount;
                Core.GameEvents.CoinsChanged(money);
                return true;
            }
            return false;
        }
        
        /// <summary>
        /// Add item to inventory
        /// </summary>
        public bool AddItem(string itemID, int quantity = 1)
        {
            if (items.ContainsKey(itemID))
            {
                items[itemID] += quantity;
            }
            else
            {
                items[itemID] = quantity;
            }
            
            return true;
        }
        
        /// <summary>
        /// Remove item from inventory
        /// </summary>
        public bool RemoveItem(string itemID, int quantity = 1)
        {
            if (items.ContainsKey(itemID) && items[itemID] >= quantity)
            {
                items[itemID] -= quantity;
                if (items[itemID] <= 0)
                {
                    items.Remove(itemID);
                }
                return true;
            }
            return false;
        }
        
        /// <summary>
        /// Check if player has item
        /// </summary>
        public bool HasItem(string itemID, int quantity = 1)
        {
            return items.ContainsKey(itemID) && items[itemID] >= quantity;
        }
        
        /// <summary>
        /// Get item quantity
        /// </summary>
        public int GetItemCount(string itemID)
        {
            return items.ContainsKey(itemID) ? items[itemID] : 0;
        }
        
        public int GetMoney() => money;
        public int GetUpgradeParts() => upgradeParts;
        
        public void Initialize()
        {
            Debug.Log("[InventoryManager] Initialized");
        }
    }
}
