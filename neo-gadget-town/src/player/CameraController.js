import * as THREE from 'three';

/**
 * Smooth orbit camera that follows the player.
 * Supports mouse-drag rotation and scroll zoom.
 */
export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Target to follow
    this.target = new THREE.Vector3(0, 2, 0);
    this.offset = new THREE.Vector3(0, 5, 12);

    // Orbit parameters
    this.distance = 12;
    this.minDistance = 4;
    this.maxDistance = 25;
    this.phi = Math.PI / 4; // vertical angle
    this.theta = 0; // horizontal angle
    this.smoothing = 5;

    // Mouse state
    this._isDragging = false;
    this._prevMouse = { x: 0, y: 0 };
    this.sensitivity = 0.003;

    // Event listeners
    this._onMouseDown = this._handleMouseDown.bind(this);
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onMouseUp = this._handleMouseUp.bind(this);
    this._onWheel = this._handleWheel.bind(this);
    this._onContextMenu = (e) => e.preventDefault();

    domElement.addEventListener('mousedown', this._onMouseDown);
    domElement.addEventListener('mousemove', this._onMouseMove);
    domElement.addEventListener('mouseup', this._onMouseUp);
    domElement.addEventListener('wheel', this._onWheel, { passive: true });
    domElement.addEventListener('contextmenu', this._onContextMenu);

    // Touch support
    this._touchStart = null;
    this._onTouchStart = this._handleTouchStart.bind(this);
    this._onTouchMove = this._handleTouchMove.bind(this);
    this._onTouchEnd = this._handleTouchEnd.bind(this);
    domElement.addEventListener('touchstart', this._onTouchStart, { passive: true });
    domElement.addEventListener('touchmove', this._onTouchMove, { passive: true });
    domElement.addEventListener('touchend', this._onTouchEnd);
  }

  _handleMouseDown(e) {
    if (e.button === 2) {
      this._isDragging = true;
      this._prevMouse.x = e.clientX;
      this._prevMouse.y = e.clientY;
    }
  }

  _handleMouseMove(e) {
    if (!this._isDragging) return;
    const dx = e.clientX - this._prevMouse.x;
    const dy = e.clientY - this._prevMouse.y;
    this.theta -= dx * this.sensitivity;
    this.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, this.phi - dy * this.sensitivity));
    this._prevMouse.x = e.clientX;
    this._prevMouse.y = e.clientY;
  }

  _handleMouseUp() {
    this._isDragging = false;
  }

  _handleWheel(e) {
    this.distance = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.distance + e.deltaY * 0.01)
    );
  }

  _handleTouchStart(e) {
    if (e.touches.length === 2) {
      const t = e.touches;
      this._touchStart = {
        x: (t[0].clientX + t[1].clientX) / 2,
        y: (t[0].clientY + t[1].clientY) / 2,
      };
    }
  }

  _handleTouchMove(e) {
    if (e.touches.length === 2 && this._touchStart) {
      const t = e.touches;
      const cx = (t[0].clientX + t[1].clientX) / 2;
      const cy = (t[0].clientY + t[1].clientY) / 2;
      const dx = cx - this._touchStart.x;
      const dy = cy - this._touchStart.y;
      this.theta -= dx * this.sensitivity * 2;
      this.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.1, this.phi - dy * this.sensitivity * 2)
      );
      this._touchStart.x = cx;
      this._touchStart.y = cy;
    }
  }

  _handleTouchEnd() {
    this._touchStart = null;
  }

  /** Set the target position (usually from player) */
  setTarget(pos) {
    this.target.copy(pos);
    this.target.y += 2; // look above player feet
  }

  update(dt) {
    // Compute desired camera position in spherical coordinates
    const desiredX =
      this.target.x + this.distance * Math.sin(this.phi) * Math.sin(this.theta);
    const desiredY = this.target.y + this.distance * Math.cos(this.phi);
    const desiredZ =
      this.target.z + this.distance * Math.sin(this.phi) * Math.cos(this.theta);

    // Smooth interpolation
    const lerpFactor = 1 - Math.exp(-this.smoothing * dt);
    this.camera.position.lerp(
      new THREE.Vector3(desiredX, desiredY, desiredZ),
      lerpFactor
    );

    // Look at target
    this.camera.lookAt(this.target);
  }

  dispose() {
    const el = this.domElement;
    el.removeEventListener('mousedown', this._onMouseDown);
    el.removeEventListener('mousemove', this._onMouseMove);
    el.removeEventListener('mouseup', this._onMouseUp);
    el.removeEventListener('wheel', this._onWheel);
    el.removeEventListener('contextmenu', this._onContextMenu);
    el.removeEventListener('touchstart', this._onTouchStart);
    el.removeEventListener('touchmove', this._onTouchMove);
    el.removeEventListener('touchend', this._onTouchEnd);
  }
}
