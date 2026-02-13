import * as THREE from 'three';

/**
 * Procedural world generator that creates the futuristic
 * Japanese town with buildings, park, river, and gadget lab.
 */
export class WorldGenerator {
  constructor(scene, physicsEngine) {
    this.scene = scene;
    this.physics = physicsEngine;
    this.objects = [];

    /** Location markers for quest proximity checks */
    this.locations = [
      { id: 'school', x: -20, z: -15, radius: 8, questId: 'explore-town', objectiveId: 'visit-school' },
      { id: 'park', x: 15, z: -20, radius: 10, questId: 'explore-town', objectiveId: 'visit-park' },
      { id: 'river', x: 0, z: 25, radius: 8, questId: 'explore-town', objectiveId: 'visit-river' },
      { id: 'lab', x: -15, z: 15, radius: 6, questId: 'explore-town', objectiveId: 'visit-lab' },
    ];

    /** Crystal positions for collection quest */
    this.crystals = [];
  }

  /** Build the entire world */
  generate() {
    this._createGround();
    this._createSchool();
    this._createPark();
    this._createRiver();
    this._createGadgetLab();
    this._createHouses();
    this._createRoads();
    this._createCrystals();
    this._createDecorations();
  }

  _createGround() {
    const geo = new THREE.PlaneGeometry(120, 120, 20, 20);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x1a3322,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.objects.push(ground);

    this.physics.createGround();

    // Grid lines for futuristic feel
    const gridHelper = new THREE.GridHelper(120, 40, 0x00d4ff, 0x003344);
    gridHelper.position.y = 0.01;
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  _createSchool() {
    const group = new THREE.Group();
    group.position.set(-20, 0, -15);

    // Main building
    const buildGeo = new THREE.BoxGeometry(12, 8, 10);
    const buildMat = new THREE.MeshStandardMaterial({
      color: 0x445566,
      metalness: 0.3,
      roughness: 0.7,
    });
    const building = new THREE.Mesh(buildGeo, buildMat);
    building.position.y = 4;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);

    // Neon sign
    const signGeo = new THREE.BoxGeometry(6, 1, 0.2);
    const signMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.8,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 7, 5.1);
    group.add(sign);

    // Windows
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const winGeo = new THREE.BoxGeometry(1.5, 1.5, 0.1);
        const winMat = new THREE.MeshStandardMaterial({
          color: 0xaaddff,
          emissive: 0x334455,
          emissiveIntensity: 0.3,
          transparent: true,
          opacity: 0.7,
        });
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(-3 + i * 3, 3 + j * 3, 5.1);
        group.add(win);
      }
    }

    this.scene.add(group);
    this.objects.push(group);

    // Physics
    this.physics.addBody(building, {
      mass: 0,
      shape: 'box',
      size: { x: 12, y: 8, z: 10 },
    });
    // Adjust the physics body position
    const bodies = Array.from(this.physics.bodies.values());
    const lastBody = bodies[bodies.length - 1];
    if (lastBody) {
      lastBody.body.position.set(-20, 4, -15);
    }
  }

  _createPark() {
    const group = new THREE.Group();
    group.position.set(15, 0, -20);

    // Trees
    for (let i = 0; i < 8; i++) {
      const tree = this._createTree();
      tree.position.set(
        (Math.random() - 0.5) * 16,
        0,
        (Math.random() - 0.5) * 16
      );
      group.add(tree);
    }

    // Bench
    const benchGeo = new THREE.BoxGeometry(3, 0.6, 0.8);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x885522,
      roughness: 0.9,
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, 0.3, 0);
    bench.castShadow = true;
    group.add(bench);

    // Fountain
    const fountain = this._createFountain();
    fountain.position.set(3, 0, -5);
    group.add(fountain);

    this.scene.add(group);
    this.objects.push(group);
  }

  _createTree() {
    const group = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x664422 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    group.add(trunk);

    // Foliage (cherry blossom style)
    const foliageGeo = new THREE.SphereGeometry(1.5, 8, 8);
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0xff88aa,
      emissive: 0x220011,
      emissiveIntensity: 0.1,
    });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.y = 3.5;
    foliage.castShadow = true;
    group.add(foliage);

    return group;
  }

  _createFountain() {
    const group = new THREE.Group();

    // Base
    const baseGeo = new THREE.CylinderGeometry(2, 2.2, 0.5, 16);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x888899,
      metalness: 0.5,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.25;
    group.add(base);

    // Water
    const waterGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.3, 16);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.6,
      emissive: 0x003366,
      emissiveIntensity: 0.3,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 0.6;
    group.add(water);

    // Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0xaaaacc,
      metalness: 0.6,
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 1.5;
    group.add(pillar);

    return group;
  }

  _createRiver() {
    const group = new THREE.Group();

    // River path using extruded shape
    const riverGeo = new THREE.BoxGeometry(60, 0.3, 6);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x0055aa,
      transparent: true,
      opacity: 0.7,
      emissive: 0x002244,
      emissiveIntensity: 0.4,
      metalness: 0.3,
      roughness: 0.2,
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.position.set(0, 0.05, 25);
    river.receiveShadow = true;
    group.add(river);

    // Bridge
    const bridgeGeo = new THREE.BoxGeometry(4, 0.3, 8);
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: 0x886644,
      roughness: 0.8,
    });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.set(0, 0.5, 25);
    bridge.castShadow = true;
    group.add(bridge);

    // Railings
    for (const side of [-1, 1]) {
      const railGeo = new THREE.BoxGeometry(0.1, 1, 8);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x886644 });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(side * 2, 1, 25);
      group.add(rail);
    }

    this.scene.add(group);
    this.objects.push(group);
  }

  _createGadgetLab() {
    const group = new THREE.Group();
    group.position.set(-15, 0, 15);

    // Dome structure
    const domeGeo = new THREE.SphereGeometry(5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x334455,
      metalness: 0.6,
      roughness: 0.3,
      transparent: true,
      opacity: 0.8,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.castShadow = true;
    group.add(dome);

    // Base ring
    const ringGeo = new THREE.TorusGeometry(5, 0.3, 8, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.3;
    group.add(ring);

    // Glowing antenna on top
    const antennaGeo = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const antennaMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 0.8,
    });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.y = 6.5;
    group.add(antenna);

    // Light on antenna
    const labLight = new THREE.PointLight(0xa855f7, 3, 20);
    labLight.position.y = 8;
    group.add(labLight);

    this.scene.add(group);
    this.objects.push(group);
  }

  _createHouses() {
    const housePositions = [
      { x: 10, z: 5 },
      { x: 20, z: 10 },
      { x: -5, z: -25 },
      { x: 25, z: -5 },
      { x: -25, z: -5 },
    ];

    const colors = [0x445566, 0x554466, 0x446655, 0x665544, 0x445555];

    for (let i = 0; i < housePositions.length; i++) {
      const house = this._createHouse(colors[i]);
      house.position.set(housePositions[i].x, 0, housePositions[i].z);
      this.scene.add(house);
      this.objects.push(house);
    }
  }

  _createHouse(color) {
    const group = new THREE.Group();

    // Walls
    const wallGeo = new THREE.BoxGeometry(6, 5, 6);
    const wallMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
    });
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = 2.5;
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);

    // Roof
    const roofGeo = new THREE.ConeGeometry(5, 2.5, 4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x883322,
      roughness: 0.9,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 6.25;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // Door
    const doorGeo = new THREE.BoxGeometry(1.2, 2.5, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x553311 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 1.25, 3.05);
    group.add(door);

    // Window neon accents
    const accentGeo = new THREE.BoxGeometry(1.5, 0.1, 0.1);
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.5,
    });
    const accent = new THREE.Mesh(accentGeo, accentMat);
    accent.position.set(0, 5, 3.05);
    group.add(accent);

    return group;
  }

  _createRoads() {
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x222233,
      roughness: 0.9,
    });

    // Main road (north-south)
    const road1Geo = new THREE.BoxGeometry(4, 0.05, 80);
    const road1 = new THREE.Mesh(road1Geo, roadMat);
    road1.position.set(0, 0.03, 0);
    road1.receiveShadow = true;
    this.scene.add(road1);

    // Cross road (east-west)
    const road2Geo = new THREE.BoxGeometry(80, 0.05, 4);
    const road2 = new THREE.Mesh(road2Geo, roadMat);
    road2.position.set(0, 0.03, 0);
    road2.receiveShadow = true;
    this.scene.add(road2);

    // Neon road stripes
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.3,
    });
    for (let i = -35; i <= 35; i += 5) {
      const stripeGeo = new THREE.BoxGeometry(0.2, 0.06, 2);
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(0, 0.04, i);
      this.scene.add(stripe);
    }
  }

  _createCrystals() {
    const crystalPositions = [
      { x: 5, z: -10 },
      { x: -10, z: -20 },
      { x: 20, z: 15 },
      { x: -25, z: 10 },
      { x: 10, z: 30 },
    ];

    const crystalColors = [0x00d4ff, 0xa855f7, 0xff6bcb, 0x44ff88, 0xffdd44];

    for (let i = 0; i < crystalPositions.length; i++) {
      const crystal = this._createCrystal(crystalColors[i]);
      crystal.position.set(crystalPositions[i].x, 1, crystalPositions[i].z);
      this.scene.add(crystal);
      this.objects.push(crystal);

      this.crystals.push({
        mesh: crystal,
        x: crystalPositions[i].x,
        z: crystalPositions[i].z,
        radius: 2,
        questId: 'crystal-collector',
        objectiveId: `collect-${i + 1}`,
        collected: false,
      });
    }
  }

  _createCrystal(color) {
    const group = new THREE.Group();

    const geo = new THREE.OctahedronGeometry(0.5, 0);
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9,
      metalness: 0.5,
      roughness: 0.1,
    });
    const crystal = new THREE.Mesh(geo, mat);
    crystal.castShadow = true;
    group.add(crystal);

    // Glow light
    const light = new THREE.PointLight(color, 1, 5);
    light.position.y = 0.5;
    group.add(light);

    return group;
  }

  _createDecorations() {
    // Street lamps
    const lampPositions = [
      { x: 3, z: -10 },
      { x: 3, z: 0 },
      { x: 3, z: 10 },
      { x: -3, z: -10 },
      { x: -3, z: 0 },
      { x: -3, z: 10 },
    ];

    for (const pos of lampPositions) {
      const lamp = this._createStreetLamp();
      lamp.position.set(pos.x, 0, pos.z);
      this.scene.add(lamp);
    }
  }

  _createStreetLamp() {
    const group = new THREE.Group();

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 4, 8);
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x666677,
      metalness: 0.7,
    });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2;
    group.add(pole);

    // Light fixture
    const fixGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const fixMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 1.0,
    });
    const fixture = new THREE.Mesh(fixGeo, fixMat);
    fixture.position.y = 4.1;
    group.add(fixture);

    // Point light
    const light = new THREE.PointLight(0x00d4ff, 1, 10);
    light.position.y = 4.1;
    group.add(light);

    return group;
  }

  /** Animate world objects (crystals bobbing, etc.) */
  update(dt) {
    for (const crystal of this.crystals) {
      if (!crystal.collected && crystal.mesh) {
        crystal.mesh.rotation.y += dt * 2;
        crystal.mesh.position.y = 1 + Math.sin(Date.now() * 0.003) * 0.3;
      }
    }
  }

  /** Collect a crystal and remove it from the scene */
  collectCrystal(index) {
    const crystal = this.crystals[index];
    if (crystal && !crystal.collected) {
      crystal.collected = true;
      this.scene.remove(crystal.mesh);
    }
  }

  dispose() {
    for (const obj of this.objects) {
      this.scene.remove(obj);
      obj.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }
  }
}
