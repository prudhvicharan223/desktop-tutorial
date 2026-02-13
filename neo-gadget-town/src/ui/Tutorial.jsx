import React from 'react';
import useGameStore from '../store/gameStore';

/**
 * Tutorial overlay displayed for new players.
 */
export default function Tutorial() {
  const { showTutorial, startGame } = useGameStore();

  if (!showTutorial) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-neo-dark/90 backdrop-blur-sm">
      <div className="max-w-lg w-full mx-4 bg-neo-panel border-2 border-neo-blue rounded-2xl p-8 animate-fade-in">
        {/* Title */}
        <h1 className="font-orbitron text-3xl text-center mb-2">
          <span className="text-neo-blue">NEO</span>{' '}
          <span className="text-neo-pink">GADGET</span>{' '}
          <span className="text-neo-purple">TOWN</span>
        </h1>
        <p className="text-gray-400 text-center text-sm mb-6">
          A Futuristic Open-World Adventure
        </p>

        {/* Controls */}
        <div className="space-y-4 mb-8">
          <h2 className="text-neo-blue font-orbitron text-sm">CONTROLS</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-neo-dark/50 rounded-lg p-3 border border-neo-blue/20">
              <span className="text-neo-blue font-bold">WASD</span>
              <p className="text-gray-400 text-xs">Move around</p>
            </div>
            <div className="bg-neo-dark/50 rounded-lg p-3 border border-neo-blue/20">
              <span className="text-neo-blue font-bold">SPACE</span>
              <p className="text-gray-400 text-xs">Jump</p>
            </div>
            <div className="bg-neo-dark/50 rounded-lg p-3 border border-neo-blue/20">
              <span className="text-neo-blue font-bold">SHIFT</span>
              <p className="text-gray-400 text-xs">Sprint</p>
            </div>
            <div className="bg-neo-dark/50 rounded-lg p-3 border border-neo-blue/20">
              <span className="text-neo-blue font-bold">Q</span>
              <p className="text-gray-400 text-xs">Gadget wheel</p>
            </div>
            <div className="bg-neo-dark/50 rounded-lg p-3 border border-neo-blue/20 col-span-2">
              <span className="text-neo-blue font-bold">RIGHT-CLICK + DRAG</span>
              <p className="text-gray-400 text-xs">Rotate camera</p>
            </div>
          </div>
        </div>

        {/* Gadgets preview */}
        <div className="mb-8">
          <h2 className="text-neo-purple font-orbitron text-sm mb-3">YOUR GADGETS</h2>
          <div className="flex justify-around">
            {[
              { icon: '🚪', name: 'Anywhere Door' },
              { icon: '🚁', name: 'Bamboo Copter' },
              { icon: '🔦', name: 'Shrinking Light' },
              { icon: '🧣', name: 'Time Cloth' },
            ].map((g) => (
              <div key={g.name} className="text-center">
                <span className="text-2xl">{g.icon}</span>
                <p className="text-gray-400 text-[10px] mt-1">{g.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startGame}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-neo-blue via-neo-purple to-neo-pink text-white font-orbitron text-lg hover:scale-105 transition-transform animate-glow-pulse"
        >
          START ADVENTURE
        </button>
      </div>
    </div>
  );
}
