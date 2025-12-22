// src/entities/GravityWell.js
import Phaser from 'phaser';

export class GravityWell {
  constructor(scene, x, y, strength = 50) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.strength = strength;
    this.radius = 100; // Effect radius

    // Subtle visual indicator
    this.visual = scene.add.circle(x, y, this.radius, 0x4444ff, 0.1);

    // Swirl animation
    scene.tweens.add({
      targets: this.visual,
      angle: 360,
      duration: 3000,
      repeat: -1,
    });
  }

  applyForce(egg) {
    const dx = this.x - egg.x;
    const dy = this.y - egg.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.radius || distance < 10) return;

    // Calculate gravitational pull (inverse square, capped)
    const force = this.strength / (distance * 0.5);

    // Apply force toward center
    const angle = Math.atan2(dy, dx);
    egg.gameObject.body.velocity.x += Math.cos(angle) * force;
    egg.gameObject.body.velocity.y += Math.sin(angle) * force;
  }

  destroy() {
    this.visual.destroy();
  }
}
