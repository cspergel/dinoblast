// src/entities/SideVortex.js
import Phaser from 'phaser';
import { soundManager } from '../systems/SoundManager.js';

export class SideVortex {
  constructor(scene, x, y, isLeft) {
    this.scene = scene;
    this.isLeft = isLeft;
    this.radius = 40;
    this.rotation = 0;
    this.rotationSpeed = isLeft ? 3 : -3; // Opposite spin directions

    // Create container for rotating elements
    this.container = scene.add.container(x, y);

    // Outer swirl ring
    this.outerRing = scene.add.circle(0, 0, this.radius, 0x00ffff, 0.1);
    this.outerRing.setStrokeStyle(3, 0x00ffff, 0.8);
    this.container.add(this.outerRing);

    // Inner swirl ring
    this.innerRing = scene.add.circle(0, 0, this.radius * 0.6, 0x00ff88, 0.1);
    this.innerRing.setStrokeStyle(2, 0x00ff88, 0.6);
    this.container.add(this.innerRing);

    // Core
    this.core = scene.add.circle(0, 0, 8, 0xffffff, 0.9);
    this.container.add(this.core);

    // Spiral arms (4 of them)
    this.arms = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const arm = scene.add.line(
        0, 0,
        0, 0,
        Math.cos(angle) * this.radius * 0.8,
        Math.sin(angle) * this.radius * 0.8,
        0x00ffff, 0.6
      );
      arm.setLineWidth(2);
      this.arms.push(arm);
      this.container.add(arm);
    }

    // Collision body (invisible circle)
    this.collider = scene.add.circle(x, y, this.radius, 0x000000, 0);
    scene.physics.add.existing(this.collider, true);
    this.collider.body.setCircle(this.radius);
    this.collider.isLeft = isLeft;
    this.collider.vortexRef = this;

    // Particle effect timer
    this.particleTimer = 0;
  }

  update(delta) {
    // Rotate the container
    this.rotation += this.rotationSpeed * (delta / 1000) * Math.PI;
    this.container.setRotation(this.rotation);

    // Counter-rotate inner ring for effect
    this.innerRing.setRotation(-this.rotation * 2);

    // Pulse the core
    const pulse = 0.8 + Math.sin(Date.now() * 0.008) * 0.2;
    this.core.setScale(pulse);

    // Pulse the outer ring
    const ringPulse = 1 + Math.sin(Date.now() * 0.004) * 0.05;
    this.outerRing.setScale(ringPulse);

    // Spawn occasional particles
    this.particleTimer -= delta;
    if (this.particleTimer <= 0) {
      this.particleTimer = 150;
      this.spawnParticle();
    }
  }

  spawnParticle() {
    const angle = Math.random() * Math.PI * 2;
    const dist = this.radius * 0.8;
    const x = this.container.x + Math.cos(angle) * dist;
    const y = this.container.y + Math.sin(angle) * dist;

    const particle = this.scene.add.circle(x, y, 2, 0x00ffff, 0.8);

    // Spiral inward
    this.scene.tweens.add({
      targets: particle,
      x: this.container.x,
      y: this.container.y,
      scale: 0,
      alpha: 0,
      duration: 400,
      ease: 'Quad.easeIn',
      onComplete: () => particle.destroy(),
    });
  }

  onHit(egg) {
    // Sound effect
    soundManager.playBumper();

    // Visual feedback - flash
    this.scene.tweens.add({
      targets: [this.outerRing, this.innerRing, this.core],
      alpha: 1,
      duration: 100,
      yoyo: true,
    });

    // Speed boost
    this.scene.tweens.add({
      targets: this,
      rotationSpeed: this.rotationSpeed * 3,
      duration: 200,
      yoyo: true,
    });

    // Calculate bounce - pull toward center then fling upward and inward
    const body = egg.gameObject.body;
    const toCenter = this.isLeft ? 1 : -1;

    // Fling ball up and toward center of screen
    body.velocity.x = toCenter * (150 + Math.abs(body.velocity.x) * 0.5);
    body.velocity.y = -Math.abs(body.velocity.y) * 0.9 - 100;

    // Cap speed
    const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    const maxSpeed = 380;
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      body.velocity.x *= scale;
      body.velocity.y *= scale;
    }

    // Award points
    this.scene.addScore(3);
  }

  get x() { return this.container.x; }
  get y() { return this.container.y; }

  destroy() {
    this.container.destroy();
    this.collider.destroy();
  }
}
