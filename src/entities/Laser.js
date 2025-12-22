// src/entities/Laser.js
import Phaser from 'phaser';

export class Laser {
  constructor(scene, x, y) {
    this.scene = scene;

    // Create laser beam visual
    this.gameObject = scene.add.rectangle(x, y, 4, 20, 0xff0000);
    scene.physics.add.existing(this.gameObject);

    // Move upward
    this.gameObject.body.setVelocityY(-500);

    // Add glow effect
    this.gameObject.setAlpha(0.9);

    // Store reference
    this.gameObject.laserRef = this;
  }

  get x() {
    return this.gameObject.x;
  }

  get y() {
    return this.gameObject.y;
  }

  update() {
    // Remove if off screen
    if (this.gameObject.y < -20) {
      this.destroy();
      return false;
    }
    return true;
  }

  destroy() {
    if (this.gameObject) {
      this.gameObject.destroy();
      this.gameObject = null;
    }
  }
}
