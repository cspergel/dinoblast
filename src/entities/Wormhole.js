// src/entities/Wormhole.js
import Phaser from 'phaser';
import { soundManager } from '../systems/SoundManager.js';

export class Wormhole {
  constructor(scene, x1, y1, x2, y2) {
    this.scene = scene;
    this.cooldown = 0;
    this.cooldownTime = 1000; // 1 second
    this.radius = 35;

    // Create portal A using sprite
    this.portalA = scene.add.sprite(x1, y1, 'wormhole');
    scene.physics.add.existing(this.portalA, true);
    this.portalA.body.setCircle(this.radius);
    this.portalA.wormholeRef = this;
    this.portalA.isPortalA = true;

    // Create portal B using sprite
    this.portalB = scene.add.sprite(x2, y2, 'wormhole');
    scene.physics.add.existing(this.portalB, true);
    this.portalB.body.setCircle(this.radius);
    this.portalB.wormholeRef = this;
    this.portalB.isPortalA = false;

    // No inner circles needed with sprite
    this.portalAInner = null;
    this.portalBInner = null;

    // Visual connection line
    this.connectionLine = scene.add.line(
      0, 0, x1, y1, x2, y2, 0x00ffff, 0.2
    ).setOrigin(0, 0);

    // Pulse animation
    scene.tweens.add({
      targets: [this.portalA, this.portalB],
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }

  update(delta) {
    if (this.cooldown > 0) {
      this.cooldown -= delta;
    }
  }

  teleport(egg, enteredPortalA) {
    if (this.cooldown > 0) return false;

    // Sound effect
    soundManager.playWormhole();

    // Determine exit portal
    const exitPortal = enteredPortalA ? this.portalB : this.portalA;

    // Teleport egg
    egg.gameObject.x = exitPortal.x;
    egg.gameObject.y = exitPortal.y;

    // Start cooldown
    this.cooldown = this.cooldownTime;

    // Flash effect
    this.scene.tweens.add({
      targets: [this.portalA, this.portalB],
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 150,
      yoyo: true,
    });

    // Award points
    this.scene.addScore(5);

    // Track stats
    if (this.scene.stats) {
      this.scene.stats.wormholeTravels++;
    }

    return true;
  }

  destroy() {
    this.portalA.destroy();
    if (this.portalAInner) this.portalAInner.destroy();
    this.portalB.destroy();
    if (this.portalBInner) this.portalBInner.destroy();
    this.connectionLine.destroy();
  }
}
