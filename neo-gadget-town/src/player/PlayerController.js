import * as THREE from 'three';

/**
 * Third-person player controller with WASD movement,
 * jump, sprint, and stamina system.
 */
export class PlayerController {
  constructor(scene, physicsEngine) {
    this.scene = scene;
    this.physics = physicsEngine;

    // Stats
    this.health = 100;
    this.maxHealth = 100;
    this.stamina = 100;
    this.maxStamina = 100;
    this.staminaRegen = 15; // per second
    this.sprintCost = 25; // per second

    // Movement
    this.moveSpeed = 6;
    this.sprintMultiplier = 1.8;
    this.jumpForce = 8;
    this.isGrounded = true;
    this.isSprinting = false;

    // Input state
    this.keys = { w: false, a: false, s: false, d: false, space: false, shift: false };
    this.mobileInput = { x: 0, z: 0 };

    // Player mesh (capsule)
    this.mesh = this._createPlayerMesh();
    scene.add(this.mesh);

    // Physics body
    this.body = physicsEngine.addBody(this.mesh, {
      mass: 70,
      shape: 'cylinder',
      radius: 0.4,
      size: { y: 1.8 },
    });
    this.body.fixedRotation = true;
    this.body.updateMassProperties();
    this.body.linearDamping = 0.4;

    // Ground check via contact events
    this.body.addEventListener('collide', () => {
      this.isGrounded = true;
    });

    // Input listeners
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onKeyUp = this._handleKeyUp.bind(this);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  _createPlayerMesh() {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.CapsuleGeometry(0.4, 1.0, 8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x003344,
      emissiveIntensity: 0.3,
      metalness: 0.4,
      roughness: 0.6,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.9;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // Head
    const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffcc88,
      roughness: 0.8,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 1.8;
    headMesh.castShadow = true;
    group.add(headMesh);

    // Eyes (neon glow)
    const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 1.0,
    });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.1, 1.85, 0.25);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.1, 1.85, 0.25);
    group.add(rightEye);

    group.position.set(0, 1, 0);
    return group;
  }

  _handleKeyDown(e) {
    const key = e.key.toLowerCase();
    if (key in this.keys) this.keys[key] = true;
    if (key === ' ') this.keys.space = true;
  }

  _handleKeyUp(e) {
    const key = e.key.toLowerCase();
    if (key in this.keys) this.keys[key] = false;
    if (key === ' ') this.keys.space = false;
  }

  /** Set mobile joystick input (-1 to 1) */
  setMobileInput(x, z) {
    this.mobileInput.x = x;
    this.mobileInput.z = z;
  }

  /** Get position for camera follow */
  getPosition() {
    return this.mesh.position.clone();
  }

  update(dt) {
    // Build movement direction
    let moveX = 0;
    let moveZ = 0;

    if (this.keys.w) moveZ -= 1;
    if (this.keys.s) moveZ += 1;
    if (this.keys.a) moveX -= 1;
    if (this.keys.d) moveX += 1;

    // Add mobile input
    moveX += this.mobileInput.x;
    moveZ += this.mobileInput.z;

    // Normalize
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
      moveX /= len;
      moveZ /= len;
    }

    // Sprint
    this.isSprinting = this.keys.shift && this.stamina > 0 && len > 0;
    const speed = this.isSprinting
      ? this.moveSpeed * this.sprintMultiplier
      : this.moveSpeed;

    // Apply velocity
    this.body.velocity.x = moveX * speed;
    this.body.velocity.z = moveZ * speed;

    // Keep existing vertical velocity for gravity/jump
    // Rotate player to face movement direction
    if (len > 0) {
      const angle = Math.atan2(moveX, moveZ);
      this.mesh.rotation.y = angle;
    }

    // Jump
    if (this.keys.space && this.isGrounded) {
      this.body.velocity.y = this.jumpForce;
      this.isGrounded = false;
    }

    // Stamina management
    if (this.isSprinting) {
      this.stamina = Math.max(0, this.stamina - this.sprintCost * dt);
    } else {
      this.stamina = Math.min(
        this.maxStamina,
        this.stamina + this.staminaRegen * dt
      );
    }

    // Sync mesh position from physics
    this.mesh.position.copy(this.body.position);

    // Keep player above ground
    if (this.mesh.position.y < 0.9) {
      this.mesh.position.y = 0.9;
      this.body.position.y = 0.9;
      this.body.velocity.y = 0;
      this.isGrounded = true;
    }
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}
