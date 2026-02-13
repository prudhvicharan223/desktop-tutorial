import * as THREE from 'three';

/**
 * AI robot companion that follows the player,
 * has mood-based glow colors, and idle animations.
 */
export class CompanionAI {
  constructor(scene) {
    this.scene = scene;
    this.targetPosition = new THREE.Vector3();
    this.followDistance = 3;
    this.moveSpeed = 5;
    this.bobSpeed = 2;
    this.bobHeight = 0.3;
    this.time = 0;

    // Mood system
    this.mood = 'happy'; // happy, curious, alert, sleepy
    this.moodColors = {
      happy: 0x00d4ff,
      curious: 0xa855f7,
      alert: 0xff4444,
      sleepy: 0x44ff88,
    };

    // Build mesh
    this.mesh = this._createCompanionMesh();
    this.mesh.position.set(2, 2, 2);
    scene.add(this.mesh);

    // Glow light
    this.glowLight = new THREE.PointLight(this.moodColors[this.mood], 1.5, 8);
    this.mesh.add(this.glowLight);
  }

  _createCompanionMesh() {
    const group = new THREE.Group();

    // Main body - rounded sphere
    const bodyGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeff,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x001122,
      emissiveIntensity: 0.2,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    group.add(body);

    // Eye visor
    const visorGeo = new THREE.SphereGeometry(0.25, 16, 8, 0, Math.PI);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.7,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.rotation.y = Math.PI;
    visor.position.z = 0.2;
    group.add(visor);
    this._visorMat = visorMat;

    // Antenna
    const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.y = 0.55;
    group.add(antenna);

    // Antenna tip
    const tipGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0xff6bcb,
      emissive: 0xff6bcb,
      emissiveIntensity: 1.0,
    });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = 0.72;
    group.add(tip);
    this._tipMat = tipMat;

    return group;
  }

  /** Set the position this companion should move toward */
  setTarget(position) {
    this.targetPosition.copy(position);
    this.targetPosition.x += this.followDistance * Math.sin(Date.now() * 0.001);
    this.targetPosition.z += this.followDistance * Math.cos(Date.now() * 0.001);
    this.targetPosition.y += 2;
  }

  /** Change the companion mood */
  setMood(mood) {
    if (this.moodColors[mood]) {
      this.mood = mood;
      const color = this.moodColors[mood];
      this.glowLight.color.setHex(color);
      this._visorMat.color.setHex(color);
      this._visorMat.emissive.setHex(color);
      this._tipMat.color.setHex(color);
      this._tipMat.emissive.setHex(color);
    }
  }

  update(dt) {
    this.time += dt;

    // Move toward target
    const dir = new THREE.Vector3()
      .subVectors(this.targetPosition, this.mesh.position);
    const dist = dir.length();

    if (dist > 0.5) {
      dir.normalize();
      const speed = Math.min(this.moveSpeed * dt, dist);
      this.mesh.position.add(dir.multiplyScalar(speed));
    }

    // Bobbing animation
    this.mesh.position.y += Math.sin(this.time * this.bobSpeed) * this.bobHeight * dt;

    // Gentle rotation
    this.mesh.rotation.y += dt * 0.5;

    // Look at target direction
    if (dist > 1) {
      const lookTarget = this.targetPosition.clone();
      lookTarget.y = this.mesh.position.y;
      this.mesh.lookAt(lookTarget);
    }

    // Pulse glow
    const pulse = 0.8 + Math.sin(this.time * 3) * 0.4;
    this.glowLight.intensity = pulse;
  }

  getPosition() {
    return this.mesh.position.clone();
  }

  dispose() {
    this.scene.remove(this.mesh);
  }
}
