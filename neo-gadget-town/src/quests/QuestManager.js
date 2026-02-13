/**
 * Quest manager with story, exploration, and collection quest types.
 * Provides objective tracking and completion callbacks.
 */

const DEFAULT_QUESTS = [
  {
    id: 'welcome',
    type: 'story',
    title: 'Welcome to Neo Gadget Town',
    description: 'Explore the town and find your robot companion.',
    objectives: [
      { id: 'find-companion', text: 'Find your robot companion', completed: false },
      { id: 'talk-companion', text: 'Interact with your companion', completed: false },
    ],
    reward: { xp: 50 },
    isActive: true,
    isCompleted: false,
  },
  {
    id: 'gadget-training',
    type: 'story',
    title: 'Gadget Training',
    description: 'Learn to use the Anywhere Door and Bamboo Copter.',
    objectives: [
      { id: 'use-door', text: 'Use the Anywhere Door', completed: false },
      { id: 'use-copter', text: 'Use the Bamboo Copter', completed: false },
    ],
    reward: { xp: 100 },
    isActive: false,
    isCompleted: false,
  },
  {
    id: 'explore-town',
    type: 'exploration',
    title: 'Town Explorer',
    description: 'Visit all major locations in Neo Gadget Town.',
    objectives: [
      { id: 'visit-school', text: 'Visit the School', completed: false },
      { id: 'visit-park', text: 'Visit the Park', completed: false },
      { id: 'visit-river', text: 'Visit the River', completed: false },
      { id: 'visit-lab', text: 'Visit the Gadget Lab', completed: false },
    ],
    reward: { xp: 200 },
    isActive: false,
    isCompleted: false,
  },
  {
    id: 'crystal-collector',
    type: 'collection',
    title: 'Crystal Collector',
    description: 'Collect glowing crystals scattered around town.',
    objectives: [
      { id: 'collect-1', text: 'Collect Crystal 1', completed: false },
      { id: 'collect-2', text: 'Collect Crystal 2', completed: false },
      { id: 'collect-3', text: 'Collect Crystal 3', completed: false },
      { id: 'collect-4', text: 'Collect Crystal 4', completed: false },
      { id: 'collect-5', text: 'Collect Crystal 5', completed: false },
    ],
    reward: { xp: 300 },
    isActive: false,
    isCompleted: false,
  },
];

export class QuestManager {
  constructor() {
    this.quests = DEFAULT_QUESTS.map((q) => ({
      ...q,
      objectives: q.objectives.map((o) => ({ ...o })),
    }));
    this.completedQuests = [];
    this.listeners = [];
  }

  /** Subscribe to quest events */
  onQuestEvent(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  _emit(event, data) {
    for (const listener of this.listeners) {
      listener(event, data);
    }
  }

  /** Get all active quests */
  getActiveQuests() {
    return this.quests.filter((q) => q.isActive && !q.isCompleted);
  }

  /** Get all quests */
  getAllQuests() {
    return this.quests;
  }

  /** Complete a specific objective */
  completeObjective(questId, objectiveId) {
    const quest = this.quests.find((q) => q.id === questId);
    if (!quest || quest.isCompleted || !quest.isActive) return;

    const objective = quest.objectives.find((o) => o.id === objectiveId);
    if (!objective || objective.completed) return;

    objective.completed = true;
    this._emit('objectiveCompleted', { quest, objective });

    // Check if all objectives are done
    if (quest.objectives.every((o) => o.completed)) {
      quest.isCompleted = true;
      this.completedQuests.push(quest.id);
      this._emit('questCompleted', { quest });

      // Activate next quest
      this._activateNextQuest();
    }
  }

  /** Activate a quest by ID */
  activateQuest(questId) {
    const quest = this.quests.find((q) => q.id === questId);
    if (quest && !quest.isActive) {
      quest.isActive = true;
      this._emit('questActivated', { quest });
    }
  }

  _activateNextQuest() {
    const nextInactive = this.quests.find((q) => !q.isActive && !q.isCompleted);
    if (nextInactive) {
      nextInactive.isActive = true;
      this._emit('questActivated', { quest: nextInactive });
    }
  }

  /** Check proximity-based objectives */
  checkProximity(playerPos, locations) {
    for (const loc of locations) {
      const dist = Math.sqrt(
        (playerPos.x - loc.x) ** 2 + (playerPos.z - loc.z) ** 2
      );
      if (dist < loc.radius) {
        this.completeObjective(loc.questId, loc.objectiveId);
      }
    }
  }

  update() {
    // Quest logic updates can be done here if needed
  }
}
