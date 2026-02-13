import React, { useEffect, useRef } from 'react';
import useGameStore from './store/gameStore';
import { GameEngine } from './engine/GameEngine';
import { PhysicsEngine } from './engine/PhysicsEngine';
import { PlayerController } from './player/PlayerController';
import { CameraController } from './player/CameraController';
import { CompanionAI } from './ai/CompanionAI';
import { GadgetManager } from './gadgets/GadgetManager';
import { QuestManager } from './quests/QuestManager';
import { WorldGenerator } from './world/WorldGenerator';
import HUD from './ui/HUD';
import GadgetWheel from './ui/GadgetWheel';
import MobileControls from './ui/MobileControls';
import Tutorial from './ui/Tutorial';

/**
 * Main App component.
 * Initializes the game engine and connects React UI to game systems.
 */
export default function App() {
  const engineRef = useRef(null);
  const systemsRef = useRef({});
  const animRef = useRef(null);

  const {
    isRunning,
    isPaused,
    updatePlayerStats,
    updateGameTime,
    setGadgets,
    setActiveQuests,
    showQuestNotification,
    setShowMobileControls,
    toggleGadgetWheel,
  } = useGameStore();

  // Initialize game on first render
  useEffect(() => {
    const canvas = document.getElementById('game-canvas');
    if (!canvas || engineRef.current) return;

    // Detect mobile
    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.innerWidth < 768;
    setShowMobileControls(isMobile);

    // Create engine
    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    // Physics
    const physics = new PhysicsEngine();

    // World
    const world = new WorldGenerator(engine.scene, physics);
    world.generate();

    // Player
    const player = new PlayerController(engine.scene, physics);

    // Camera
    const camera = new CameraController(engine.camera, canvas);

    // Companion AI
    const companion = new CompanionAI(engine.scene);

    // Gadgets
    const gadgets = new GadgetManager(engine.scene, player);

    // Quests
    const quests = new QuestManager();
    quests.onQuestEvent((event, data) => {
      if (event === 'questCompleted') {
        showQuestNotification(`✅ Quest Complete: ${data.quest.title}`);
      } else if (event === 'objectiveCompleted') {
        showQuestNotification(`✔ ${data.objective.text}`);
      } else if (event === 'questActivated') {
        showQuestNotification(`📜 New Quest: ${data.quest.title}`);
      }
    });

    // Store systems
    systemsRef.current = { engine, physics, world, player, camera, companion, gadgets, quests };

    // Day/night cycle state
    let gameTime = 0.25;
    const daySpeed = 0.01; // full cycle speed

    // Game loop system
    const gameSystem = {
      update(dt) {
        if (useGameStore.getState().isPaused) return;

        // Physics
        physics.update(dt);

        // Player
        player.update(dt);

        // Camera follows player
        camera.setTarget(player.getPosition());
        camera.update(dt);

        // Companion follows player
        companion.setTarget(player.getPosition());
        companion.update(dt);

        // Gadgets
        gadgets.update(dt);

        // World animations
        world.update(dt);

        // Day/night cycle
        gameTime = (gameTime + daySpeed * dt) % 1;
        engine.setTimeOfDay(gameTime);

        // Quest proximity checks
        const pPos = player.getPosition();
        quests.checkProximity(pPos, world.locations);

        // Crystal collection check
        for (let i = 0; i < world.crystals.length; i++) {
          const c = world.crystals[i];
          if (!c.collected) {
            const dist = Math.sqrt(
              (pPos.x - c.x) ** 2 + (pPos.z - c.z) ** 2
            );
            if (dist < c.radius) {
              world.collectCrystal(i);
              quests.completeObjective(c.questId, c.objectiveId);
            }
          }
        }

        // Companion proximity -> complete "find companion" objective
        const compDist = companion.getPosition().distanceTo(pPos);
        if (compDist < 5) {
          quests.completeObjective('welcome', 'find-companion');
          quests.completeObjective('welcome', 'talk-companion');
        }

        // Update React state periodically (throttled)
        updatePlayerStats(player.health, player.stamina, player.isSprinting);
        updateGameTime(gameTime);
        setGadgets([...gadgets.getGadgets()]);
        setActiveQuests([...quests.getActiveQuests()]);
      },
    };

    engine.addSystem(gameSystem);
    engine.start();

    // Custom event listeners
    const onActivateGadget = (e) => {
      gadgets.activate(e.detail.gadgetId);

      // Quest tracking for gadget usage
      if (e.detail.gadgetId === 'anywhere-door') {
        quests.completeObjective('gadget-training', 'use-door');
      } else if (e.detail.gadgetId === 'bamboo-copter') {
        quests.completeObjective('gadget-training', 'use-copter');
      }
    };

    const onMobileInput = (e) => {
      player.setMobileInput(e.detail.x, e.detail.z);
    };

    const onMobileAction = (e) => {
      if (e.detail.action === 'jump') {
        player.keys.space = true;
        setTimeout(() => { player.keys.space = false; }, 100);
      } else if (e.detail.action === 'sprint') {
        player.keys.shift = !player.keys.shift;
      }
    };

    const onKeyDown = (e) => {
      if (e.key.toLowerCase() === 'q') {
        toggleGadgetWheel();
      }
    };

    window.addEventListener('activateGadget', onActivateGadget);
    window.addEventListener('mobileInput', onMobileInput);
    window.addEventListener('mobileAction', onMobileAction);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('activateGadget', onActivateGadget);
      window.removeEventListener('mobileInput', onMobileInput);
      window.removeEventListener('mobileAction', onMobileAction);
      window.removeEventListener('keydown', onKeyDown);
      engine.dispose();
      physics.dispose();
      world.dispose();
      player.dispose();
      camera.dispose();
      companion.dispose();
      gadgets.dispose();
    };
  }, []);

  return (
    <>
      <Tutorial />
      <HUD />
      <GadgetWheel />
      <MobileControls />
    </>
  );
}
