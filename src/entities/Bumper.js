// src/entities/Bumper.js
import Phaser from 'phaser';
import { soundManager } from '../systems/SoundManager.js';

export class Bumper {
  constructor(scene, x, y, options = {}) {
    this.scene = scene;
    this.bounceForce = 1.5; // Multiplier for bounce

    // Random size variation (0.7x to 1.3x)
    const sizeMultiplier = options.sizeMultiplier || (0.7 + Math.random() * 0.6);
    this.radius = Math.floor(35 * sizeMultiplier);

    // Random position offset
    const offsetX = options.randomOffset ? (Math.random() - 0.5) * 60 : 0;
    const offsetY = options.randomOffset ? (Math.random() - 0.5) * 40 : 0;
    this.baseX = x + offsetX;
    this.baseY = y + offsetY;

    // Movement pattern
    this.floatOffset = Math.random() * Math.PI * 2; // Random phase
    this.floatSpeed = 1.5 + Math.random() * 1; // Varying speeds
    this.floatRadius = 8 + Math.random() * 12; // How far it moves

    // Random color from palette
    const colors = [0xff00ff, 0x00ffff, 0xff8800, 0x88ff00, 0xff0088];
    this.color = options.color || Phaser.Utils.Array.GetRandom(colors);

    // Create bumper sprite
    this.gameObject = scene.add.sprite(this.baseX, this.baseY, 'bumper');
    this.gameObject.setScale(sizeMultiplier);
    this.gameObject.setTint(this.color);

    // Add glow ring
    this.glowRing = scene.add.circle(this.baseX, this.baseY, this.radius + 8, this.color, 0.2);

    // Enable physics
    scene.physics.add.existing(this.gameObject, true); // static body
    this.gameObject.body.setCircle(this.radius);

    // Store reference
    this.gameObject.bumperRef = this;

    // Rotation animation
    this.rotationSpeed = (Math.random() - 0.5) * 2;
  }

  update(delta) {
    // Floating/bobbing motion
    const time = Date.now() * 0.001;
    const floatX = Math.cos(time * this.floatSpeed + this.floatOffset) * this.floatRadius;
    const floatY = Math.sin(time * this.floatSpeed * 0.7 + this.floatOffset) * this.floatRadius * 0.6;

    this.gameObject.x = this.baseX + floatX;
    this.gameObject.y = this.baseY + floatY;
    this.glowRing.x = this.gameObject.x;
    this.glowRing.y = this.gameObject.y;

    // Update physics body position
    this.gameObject.body.position.x = this.gameObject.x - this.radius;
    this.gameObject.body.position.y = this.gameObject.y - this.radius;

    // Slow rotation
    this.gameObject.rotation += this.rotationSpeed * (delta / 1000);
  }

  onHit(egg) {
    // Sound effect
    soundManager.playBumper();

    // Flash effect
    this.scene.tweens.add({
      targets: [this.gameObject, this.glowRing],
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
    });

    // Boost egg velocity
    const body = egg.gameObject.body;
    body.velocity.x *= this.bounceForce;
    body.velocity.y *= this.bounceForce;

    // Cap speed to prevent tunneling
    const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    const maxSpeed = 380; // Keep under maxVelocity
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      body.velocity.x *= scale;
      body.velocity.y *= scale;
    }

    // Ensure minimum speed
    const minSpeed = 250;
    if (speed < minSpeed) {
      const scale = minSpeed / speed;
      body.velocity.x *= scale;
      body.velocity.y *= scale;
    }

    // Award points
    this.scene.addScore(2);

    // Track stats
    if (this.scene.stats) {
      this.scene.stats.bumperHits++;
    }
  }

  destroy() {
    this.glowRing.destroy();
    if (this.label) this.label.destroy();
    this.gameObject.destroy();
  }

  get x() { return this.gameObject.x; }
  get y() { return this.gameObject.y; }
}
