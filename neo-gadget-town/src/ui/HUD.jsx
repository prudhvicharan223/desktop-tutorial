import React from 'react';
import useGameStore from '../store/gameStore';

/**
 * Heads-Up Display showing health, stamina, quest tracker,
 * and time of day.
 */
export default function HUD() {
  const {
    health,
    maxHealth,
    stamina,
    maxStamina,
    isSprinting,
    gameTime,
    activeQuests,
    questNotification,
    companionMood,
    toggleGadgetWheel,
    togglePause,
  } = useGameStore();

  const healthPercent = (health / maxHealth) * 100;
  const staminaPercent = (stamina / maxStamina) * 100;

  // Convert game time to display string
  const hours = Math.floor(gameTime * 24);
  const minutes = Math.floor((gameTime * 24 * 60) % 60);
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  const isDay = gameTime > 0.25 && gameTime < 0.75;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 font-exo">
      {/* Top bar */}
      <div className="flex justify-between items-start p-4">
        {/* Player stats */}
        <div className="pointer-events-auto space-y-2">
          {/* Health bar */}
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-sm font-bold w-6">HP</span>
            <div className="w-40 h-3 bg-neo-dark border border-red-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                style={{ width: `${healthPercent}%` }}
              />
            </div>
            <span className="text-red-300 text-xs">{Math.round(health)}</span>
          </div>

          {/* Stamina bar */}
          <div className="flex items-center gap-2">
            <span className="text-neo-blue text-sm font-bold w-6">SP</span>
            <div className="w-40 h-3 bg-neo-dark border border-cyan-900 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isSprinting
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                    : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                }`}
                style={{ width: `${staminaPercent}%` }}
              />
            </div>
            <span className="text-cyan-300 text-xs">{Math.round(stamina)}</span>
          </div>
        </div>

        {/* Time & controls */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="bg-neo-panel px-4 py-2 rounded-lg border border-neo-blue/30">
            <span className="text-neo-blue font-orbitron text-sm">
              {isDay ? '☀️' : '🌙'} {timeStr}
            </span>
          </div>
          <button
            onClick={togglePause}
            className="bg-neo-panel px-3 py-2 rounded-lg border border-neo-purple/30 text-neo-purple hover:bg-neo-purple/20 transition"
          >
            ⏸
          </button>
        </div>
      </div>

      {/* Quest tracker */}
      <div className="absolute top-20 right-4 pointer-events-auto max-w-xs">
        {activeQuests.slice(0, 2).map((quest) => (
          <div
            key={quest.id}
            className="bg-neo-panel border border-neo-purple/30 rounded-lg p-3 mb-2 animate-fade-in"
          >
            <h3 className="text-neo-purple font-orbitron text-xs mb-1">
              {quest.title}
            </h3>
            <ul className="space-y-1">
              {quest.objectives.map((obj) => (
                <li
                  key={obj.id}
                  className={`text-xs flex items-center gap-1 ${
                    obj.completed ? 'text-green-400 line-through' : 'text-gray-300'
                  }`}
                >
                  {obj.completed ? '✅' : '⬜'} {obj.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Companion mood indicator */}
      <div className="absolute bottom-20 left-4 pointer-events-auto">
        <div className="bg-neo-panel border border-neo-blue/30 rounded-lg px-3 py-2 flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="text-xs text-gray-300 capitalize">{companionMood}</span>
        </div>
      </div>

      {/* Gadget button */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <button
          onClick={toggleGadgetWheel}
          className="w-14 h-14 rounded-full bg-neo-panel border-2 border-neo-pink animate-glow-pulse flex items-center justify-center text-2xl hover:scale-110 transition-transform"
        >
          🔧
        </button>
      </div>

      {/* Quest notification */}
      {questNotification && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none animate-fade-in">
          <div className="bg-neo-panel border-2 border-neo-blue rounded-xl px-8 py-4 text-center">
            <p className="text-neo-blue font-orbitron text-sm">
              {questNotification}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
