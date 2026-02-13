import * as CANNON from 'cannon-es';

/**
 * Physics engine wrapper around Cannon-es.
 * Manages the physics world, bodies, and step updates.
 */
export class PhysicsEngine {
  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0),
    });
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    this.world.defaultContactMaterial.friction = 0.3;
    this.world.defaultContactMaterial.restitution = 0.2;

    this.bodies = new Map(); // mesh uuid -> body
    this.fixedTimeStep = 1 / 60;
    this.maxSubSteps = 3;
  }

  /** Create and register a physics body linked to a Three.js mesh */
  addBody(mesh, options = {}) {
    const {
      mass = 0,
      shape = 'box',
      size,
      radius,
      friction = 0.3,
      restitution = 0.2,
    } = options;

    let cannonShape;
    if (shape === 'sphere') {
      cannonShape = new CANNON.Sphere(radius || 0.5);
    } else if (shape === 'cylinder') {
      cannonShape = new CANNON.Cylinder(
        radius || 0.5,
        radius || 0.5,
        size?.y || 2,
        8
      );
    } else {
      // Default box
      const s = size || { x: 1, y: 1, z: 1 };
      cannonShape = new CANNON.Box(
        new CANNON.Vec3(s.x / 2, s.y / 2, s.z / 2)
      );
    }

    const body = new CANNON.Body({
      mass,
      shape: cannonShape,
      position: new CANNON.Vec3(
        mesh.position.x,
        mesh.position.y,
        mesh.position.z
      ),
      material: new CANNON.Material({ friction, restitution }),
    });

    if (mesh.quaternion) {
      body.quaternion.set(
        mesh.quaternion.x,
        mesh.quaternion.y,
        mesh.quaternion.z,
        mesh.quaternion.w
      );
    }

    this.world.addBody(body);
    this.bodies.set(mesh.uuid, { mesh, body });
    return body;
  }

  /** Remove a physics body by mesh UUID */
  removeBody(meshUuid) {
    const entry = this.bodies.get(meshUuid);
    if (entry) {
      this.world.removeBody(entry.body);
      this.bodies.delete(meshUuid);
    }
  }

  /** Step the physics simulation and sync mesh positions */
  update(dt) {
    this.world.step(this.fixedTimeStep, dt, this.maxSubSteps);

    for (const { mesh, body } of this.bodies.values()) {
      if (body.mass > 0) {
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
      }
    }
  }

  /** Create a static ground plane */
  createGround() {
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: new CANNON.Material({ friction: 0.5, restitution: 0.1 }),
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);
    return groundBody;
  }

  /** Clean up */
  dispose() {
    this.bodies.clear();
  }
}
