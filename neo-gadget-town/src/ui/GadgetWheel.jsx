import React from 'react';
import useGameStore from '../store/gameStore';

/**
 * Circular gadget selection wheel with cooldown indicators.
 */
export default function GadgetWheel() {
  const { gadgets, showGadgetWheel, closeGadgetWheel, activeGadget } = useGameStore();

  if (!showGadgetWheel) return null;

  // Activate gadget via custom event (picked up by game loop)
  const handleActivate = (gadgetId) => {
    window.dispatchEvent(new CustomEvent('activateGadget', { detail: { gadgetId } }));
    closeGadgetWheel();
  };

  const count = gadgets.length;
  const radius = 100; // px

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center"
      onClick={closeGadgetWheel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Wheel */}
      <div className="relative w-64 h-64" onClick={(e) => e.stopPropagation()}>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-neo-blue font-orbitron text-xs">GADGETS</span>
        </div>

        {/* Gadget items arranged in circle */}
        {gadgets.map((gadget, i) => {
          const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * radius + 128 - 32;
          const y = Math.sin(angle) * radius + 128 - 32;
          const isOnCooldown = gadget.currentCooldown > 0;
          const isActive = gadget.isActive;
          const cooldownPercent = gadget.cooldown > 0
            ? (gadget.currentCooldown / gadget.cooldown) * 100
            : 0;

          return (
            <button
              key={gadget.id}
              onClick={() => !isOnCooldown && handleActivate(gadget.id)}
              className={`absolute w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center transition-all hover:scale-110 ${
                isActive
                  ? 'border-neo-pink bg-neo-pink/20 scale-110'
                  : isOnCooldown
                    ? 'border-gray-600 bg-gray-800/80 opacity-60'
                    : 'border-neo-blue bg-neo-panel hover:border-neo-pink'
              }`}
              style={{ left: `${x}px`, top: `${y}px` }}
              title={gadget.description}
            >
              <span className="text-xl">{gadget.icon}</span>
              <span className="text-[8px] text-gray-300 mt-0.5">{gadget.name}</span>

              {/* Cooldown overlay */}
              {isOnCooldown && (
                <div
                  className="absolute inset-0 rounded-full bg-gray-900/60 flex items-center justify-center"
                >
                  <span className="text-xs text-gray-400 font-orbitron">
                    {Math.ceil(gadget.currentCooldown)}s
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
