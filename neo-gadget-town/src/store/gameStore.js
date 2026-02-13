import { create } from 'zustand';

/**
 * Global game state managed by Zustand.
 * Provides reactive state for all UI components.
 */
const useGameStore = create((set, get) => ({
  // Game state
  isRunning: false,
  isPaused: false,
  showTutorial: true,
  gameTime: 0.25, // 0-1 day cycle, start at sunrise

  // Player stats
  health: 100,
  maxHealth: 100,
  stamina: 100,
  maxStamina: 100,
  isSprinting: false,

  // Gadgets
  gadgets: [],
  activeGadget: null,
  showGadgetWheel: false,

  // Quests
  activeQuests: [],
  questNotification: null,

  // Companion
  companionMood: 'happy',

  // UI
  showMobileControls: false,

  // Actions
  startGame: () =>
    set({
      isRunning: true,
      showTutorial: false,
    }),

  togglePause: () =>
    set((state) => ({ isPaused: !state.isPaused })),

  updatePlayerStats: (health, stamina, isSprinting) =>
    set({ health, stamina, isSprinting }),

  updateGameTime: (gameTime) => set({ gameTime }),

  setGadgets: (gadgets) => set({ gadgets }),

  setActiveGadget: (activeGadget) => set({ activeGadget }),

  toggleGadgetWheel: () =>
    set((state) => ({ showGadgetWheel: !state.showGadgetWheel })),

  closeGadgetWheel: () => set({ showGadgetWheel: false }),

  setActiveQuests: (activeQuests) => set({ activeQuests }),

  showQuestNotification: (notification) => {
    set({ questNotification: notification });
    setTimeout(() => set({ questNotification: null }), 3000);
  },

  setCompanionMood: (companionMood) => set({ companionMood }),

  setShowMobileControls: (showMobileControls) => set({ showMobileControls }),
}));

export default useGameStore;
