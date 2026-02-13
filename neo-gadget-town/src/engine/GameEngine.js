import * as THREE from 'three';

/**
 * Core game engine managing the Three.js render loop,
 * scene graph, and system updates.
 */
export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.systems = [];
    this.isRunning = false;
    this._animationId = null;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a);
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.008);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 20);

    // Lighting
    this._setupLighting();

    // Resize handling
    this._onResize = this._handleResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  _setupLighting() {
    // Ambient
    this.ambientLight = new THREE.AmbientLight(0x334466, 0.6);
    this.scene.add(this.ambientLight);

    // Directional (sun)
    this.sunLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    this.sunLight.position.set(50, 80, 30);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 200;
    this.sunLight.shadow.camera.left = -60;
    this.sunLight.shadow.camera.right = 60;
    this.sunLight.shadow.camera.top = 60;
    this.sunLight.shadow.camera.bottom = -60;
    this.scene.add(this.sunLight);

    // Hemisphere
    const hemiLight = new THREE.HemisphereLight(0x88aaff, 0x445533, 0.4);
    this.scene.add(hemiLight);

    // Neon accent lights
    const neonBlue = new THREE.PointLight(0x00d4ff, 2, 30);
    neonBlue.position.set(-10, 5, 0);
    this.scene.add(neonBlue);

    const neonPink = new THREE.PointLight(0xff6bcb, 2, 30);
    neonPink.position.set(10, 5, -10);
    this.scene.add(neonPink);
  }

  _handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /** Register a system with an update(dt) method */
  addSystem(system) {
    this.systems.push(system);
    return this;
  }

  /** Remove a previously registered system */
  removeSystem(system) {
    this.systems = this.systems.filter((s) => s !== system);
  }

  /** Start the render loop */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this._loop();
  }

  /** Stop the render loop */
  stop() {
    this.isRunning = false;
    if (this._animationId !== null) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
  }

  _loop() {
    if (!this.isRunning) return;
    this._animationId = requestAnimationFrame(() => this._loop());

    const dt = Math.min(this.clock.getDelta(), 0.05); // cap at 50 ms

    for (const system of this.systems) {
      system.update(dt);
    }

    this.renderer.render(this.scene, this.camera);
  }

  /** Update the day/night cycle lighting */
  setTimeOfDay(t) {
    // t in 0..1 where 0 = midnight, 0.5 = noon
    const sunAngle = t * Math.PI * 2 - Math.PI / 2;
    this.sunLight.position.set(
      Math.cos(sunAngle) * 80,
      Math.sin(sunAngle) * 80,
      30
    );

    const intensity = Math.max(0, Math.sin(sunAngle)) * 1.5;
    this.sunLight.intensity = intensity;
    this.ambientLight.intensity = 0.2 + intensity * 0.3;

    // Sky color blend
    const dayColor = new THREE.Color(0x88ccff);
    const nightColor = new THREE.Color(0x0a0a1a);
    const blend = Math.max(0, Math.sin(sunAngle));
    const sky = nightColor.clone().lerp(dayColor, blend);
    this.scene.background = sky;
    if (this.scene.fog) {
      this.scene.fog.color.copy(sky);
    }
  }

  /** Clean up all resources */
  dispose() {
    this.stop();
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }
}
