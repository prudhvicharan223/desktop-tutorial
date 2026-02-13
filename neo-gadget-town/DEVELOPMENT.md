# 🛠️ Developer Guide

## Extending Neo Gadget Town

This guide covers how to add new features to the game.

## Adding a New Gadget

1. Open `src/gadgets/GadgetManager.js`
2. Add an entry to the `GADGETS` array:

```javascript
{
  id: 'my-gadget',
  name: 'My Gadget',
  description: 'What it does',
  cooldown: 10,
  duration: 5,
  color: 0xff00ff,
  icon: '⚡',
}
```

3. Add an activation handler in the `activate()` method:

```javascript
case 'my-gadget':
  this._activateMyGadget();
  break;
```

4. Implement the activation method and its corresponding deactivation logic.

## Adding a New Quest

1. Open `src/quests/QuestManager.js`
2. Add a quest object to `DEFAULT_QUESTS`:

```javascript
{
  id: 'my-quest',
  type: 'exploration',
  title: 'My Quest',
  description: 'Description here',
  objectives: [
    { id: 'obj-1', text: 'Do something', completed: false },
  ],
  reward: { xp: 100 },
  isActive: false,
  isCompleted: false,
}
```

3. Add completion triggers in `App.jsx` game loop.

## Adding a New World Location

1. Open `src/world/WorldGenerator.js`
2. Create a new builder method (e.g., `_createMarket()`)
3. Call it from `generate()`
4. Add a location marker for quest proximity:

```javascript
this.locations.push({
  id: 'market',
  x: 30, z: 0,
  radius: 8,
  questId: 'explore-town',
  objectiveId: 'visit-market',
});
```

## Adding NPCs

Create a new file `src/ai/NPC.js`:

```javascript
export class NPC {
  constructor(scene, name, position) {
    this.name = name;
    this.mesh = this._createMesh();
    this.mesh.position.copy(position);
    this.dialogues = [];
    scene.add(this.mesh);
  }

  addDialogue(text) {
    this.dialogues.push(text);
  }

  update(dt) {
    // Idle animation, look at player, etc.
  }
}
```

## Project Scripts

```bash
npm run dev      # Development with hot reload
npm run build    # Production build to dist/
npm run preview  # Serve production build locally
```

## Code Style

- ES modules throughout
- Classes for game systems
- Functional components for React UI
- Zustand for state management
- TailwindCSS for styling
