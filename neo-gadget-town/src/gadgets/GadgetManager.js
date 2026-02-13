import * as THREE from 'three';

/**
 * Manages the 4 unique gadgets: Anywhere Door, Bamboo Copter,
 * Shrinking Light, and Time Cloth. Each gadget has cooldowns,
 * visual effects, and gameplay mechanics.
 */

const GADGETS = [
  {
    id: 'anywhere-door',
    name: 'Anywhere Door',
    description: 'Teleport to any visited location',
    cooldown: 10,
    duration: 0,
    color: 0xff6bcb,
    icon: '🚪',
  },
  {
    id: 'bamboo-copter',
    name: 'Bamboo Copter',
    description: 'Fly through the air for a limited time',
    cooldown: 8,
    duration: 5,
    color: 0x00d4ff,
    icon: '🚁',
  },
  {
    id: 'shrinking-light',
    name: 'Shrinking Light',
    description: 'Shrink to explore tiny spaces',
    cooldown: 12,
    duration: 8,
    color: 0xa855f7,
    icon: '🔦',
  },
  {
    id: 'time-cloth',
    name: 'Time Cloth',
    description: 'Become invisible to all NPCs',
    cooldown: 15,
    duration: 6,
    color: 0x44ff88,
    icon: '🧣',
  },
];

export class GadgetManager {
  constructor(scene, playerController) {
    this.scene = scene;
    this.player = playerController;
    this.gadgets = GADGETS.map((g) => ({
      ...g,
      currentCooldown: 0,
      isActive: false,
      remaining: 0,
    }));
    this.activeGadget = null;
    this.effects = [];

    // Visual effects group
    this.effectsGroup = new THREE.Group();
    scene.add(this.effectsGroup);
  }

  /** Get the list of gadgets with current state */
  getGadgets() {
    return this.gadgets;
  }

  /** Activate a gadget by ID */
  activate(gadgetId) {
    const gadget = this.gadgets.find((g) => g.id === gadgetId);
    if (!gadget || gadget.currentCooldown > 0 || gadget.isActive) return false;

    // Deactivate any current gadget
    if (this.activeGadget) {
      this._deactivate(this.activeGadget);
    }

    gadget.isActive = true;
    gadget.remaining = gadget.duration;
    this.activeGadget = gadget;

    // Apply gadget effect
    switch (gadget.id) {
      case 'anywhere-door':
        this._activateAnywhereDoor();
        break;
      case 'bamboo-copter':
        this._activateBambooCopter();
        break;
      case 'shrinking-light':
        this._activateShrinkingLight();
        break;
      case 'time-cloth':
        this._activateTimeCloth();
        break;
    }

    return true;
  }

  _activateAnywhereDoor() {
    // Create portal effect
    const portalGeo = new THREE.TorusGeometry(1.5, 0.1, 16, 32);
    const portalMat = new THREE.MeshStandardMaterial({
      color: 0xff6bcb,
      emissive: 0xff6bcb,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.8,
    });
    const portal = new THREE.Mesh(portalGeo, portalMat);
    const pos = this.player.getPosition();
    portal.position.set(pos.x + 3, pos.y + 1, pos.z);
    portal.rotation.y = Math.PI / 2;
    this.effectsGroup.add(portal);
    this.effects.push({ mesh: portal, type: 'portal', time: 0 });

    // Teleport player to a random position
    const tx = (Math.random() - 0.5) * 40;
    const tz = (Math.random() - 0.5) * 40;
    this.player.body.position.set(tx, 2, tz);
    this.player.mesh.position.set(tx, 2, tz);

    // Instant gadget - start cooldown immediately
    const gadget = this.gadgets.find((g) => g.id === 'anywhere-door');
    gadget.isActive = false;
    gadget.currentCooldown = gadget.cooldown;
    this.activeGadget = null;

    // Remove portal after animation
    setTimeout(() => {
      this.effectsGroup.remove(portal);
      portal.geometry.dispose();
      portal.material.dispose();
      this.effects = this.effects.filter((e) => e.mesh !== portal);
    }, 2000);
  }

  _activateBambooCopter() {
    // Create propeller on player head
    const propGeo = new THREE.BoxGeometry(1.5, 0.05, 0.15);
    const propMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.5,
    });
    const prop = new THREE.Mesh(propGeo, propMat);
    prop.position.y = 2.1;
    this.player.mesh.add(prop);
    this.effects.push({ mesh: prop, type: 'copter', time: 0 });

    // Give upward velocity
    this.player.body.velocity.y = 5;
  }

  _activateShrinkingLight() {
    // Shrink the player
    this.player.mesh.scale.set(0.3, 0.3, 0.3);

    // Create shrink ray visual
    const rayGeo = new THREE.CylinderGeometry(0.05, 0.3, 2, 8);
    const rayMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.6,
    });
    const ray = new THREE.Mesh(rayGeo, rayMat);
    const pos = this.player.getPosition();
    ray.position.copy(pos);
    ray.position.y += 3;
    this.effectsGroup.add(ray);
    this.effects.push({ mesh: ray, type: 'shrink-ray', time: 0 });

    setTimeout(() => {
      this.effectsGroup.remove(ray);
      ray.geometry.dispose();
      ray.material.dispose();
      this.effects = this.effects.filter((e) => e.mesh !== ray);
    }, 1000);
  }

  _activateTimeCloth() {
    // Make player semi-transparent
    this.player.mesh.traverse((child) => {
      if (child.material) {
        child.material.transparent = true;
        child.material.opacity = 0.3;
      }
    });
  }

  _deactivate(gadget) {
    gadget.isActive = false;
    gadget.currentCooldown = gadget.cooldown;

    switch (gadget.id) {
      case 'bamboo-copter':
        // Remove propeller
        this.effects = this.effects.filter((e) => {
          if (e.type === 'copter') {
            this.player.mesh.remove(e.mesh);
            e.mesh.geometry.dispose();
            e.mesh.material.dispose();
            return false;
          }
          return true;
        });
        break;
      case 'shrinking-light':
        this.player.mesh.scale.set(1, 1, 1);
        break;
      case 'time-cloth':
        this.player.mesh.traverse((child) => {
          if (child.material) {
            child.material.transparent = false;
            child.material.opacity = 1.0;
          }
        });
        break;
    }

    this.activeGadget = null;
  }

  update(dt) {
    // Update cooldowns
    for (const gadget of this.gadgets) {
      if (gadget.currentCooldown > 0) {
        gadget.currentCooldown = Math.max(0, gadget.currentCooldown - dt);
      }
      if (gadget.isActive && gadget.duration > 0) {
        gadget.remaining -= dt;
        if (gadget.remaining <= 0) {
          this._deactivate(gadget);
        }
      }
    }

    // Animate effects
    for (const effect of this.effects) {
      effect.time += dt;
      if (effect.type === 'portal') {
        effect.mesh.rotation.z += dt * 3;
        effect.mesh.material.opacity = 0.5 + Math.sin(effect.time * 5) * 0.3;
      } else if (effect.type === 'copter') {
        effect.mesh.rotation.y += dt * 20;
        // Keep player floating
        if (this.player.body.position.y < 8) {
          this.player.body.velocity.y = 3;
        }
      }
    }
  }

  dispose() {
    for (const effect of this.effects) {
      if (effect.mesh.parent) effect.mesh.parent.remove(effect.mesh);
      effect.mesh.geometry.dispose();
      effect.mesh.material.dispose();
    }
    this.effectsGroup.parent?.remove(this.effectsGroup);
  }
}
