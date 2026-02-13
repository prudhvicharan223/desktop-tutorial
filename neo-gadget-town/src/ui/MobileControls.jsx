import React, { useRef, useCallback, useEffect } from 'react';
import useGameStore from '../store/gameStore';

/**
 * Virtual joystick + action buttons for mobile touch controls.
 */
export default function MobileControls() {
  const { showMobileControls } = useGameStore();
  const joystickRef = useRef(null);
  const knobRef = useRef(null);
  const touchIdRef = useRef(null);
  const centerRef = useRef({ x: 0, y: 0 });

  const joystickRadius = 50;

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchIdRef.current = touch.identifier;
    const rect = joystickRef.current.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    for (const touch of e.touches) {
      if (touch.identifier === touchIdRef.current) {
        const dx = touch.clientX - centerRef.current.x;
        const dy = touch.clientY - centerRef.current.y;
        const dist = Math.min(Math.sqrt(dx * dx + dy * dy), joystickRadius);
        const angle = Math.atan2(dy, dx);

        const knobX = Math.cos(angle) * dist;
        const knobY = Math.sin(angle) * dist;

        if (knobRef.current) {
          knobRef.current.style.transform = `translate(${knobX}px, ${knobY}px)`;
        }

        // Dispatch movement
        const normalX = knobX / joystickRadius;
        const normalZ = knobY / joystickRadius;
        window.dispatchEvent(
          new CustomEvent('mobileInput', { detail: { x: normalX, z: normalZ } })
        );
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchIdRef.current = null;
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
    window.dispatchEvent(
      new CustomEvent('mobileInput', { detail: { x: 0, z: 0 } })
    );
  }, []);

  const handleAction = useCallback((action) => {
    window.dispatchEvent(new CustomEvent('mobileAction', { detail: { action } }));
  }, []);

  if (!showMobileControls) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Joystick */}
      <div
        ref={joystickRef}
        className="absolute bottom-8 left-8 w-32 h-32 rounded-full bg-neo-dark/50 border-2 border-neo-blue/30 flex items-center justify-center pointer-events-auto touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={knobRef}
          className="w-12 h-12 rounded-full bg-neo-blue/40 border-2 border-neo-blue transition-transform"
        />
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-3 pointer-events-auto">
        <button
          onTouchStart={() => handleAction('jump')}
          className="w-14 h-14 rounded-full bg-neo-panel border-2 border-neo-blue text-neo-blue font-orbitron text-xs flex items-center justify-center active:scale-90"
        >
          JUMP
        </button>
        <button
          onTouchStart={() => handleAction('sprint')}
          className="w-14 h-14 rounded-full bg-neo-panel border-2 border-neo-purple text-neo-purple font-orbitron text-xs flex items-center justify-center active:scale-90"
        >
          RUN
        </button>
      </div>
    </div>
  );
}
