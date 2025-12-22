// src/entities/Drop.js
import Phaser from 'phaser';
import { GAME_HEIGHT } from '../config/gameConfig.js';
import { TIMED_POWERUPS, MUTATIONS } from '../config/powerups.js';
import { soundManager } from '../systems/SoundManager.js';

export class Drop {
  constructor(scene, x, y, type, isMutation = false) {
    this.scene = scene;
    this.type = type;
    this.isMutation = isMutation;
    this.collected = false;

    const config = isMutation ? MUTATIONS[type] : TIMED_POWERUPS[type];
    this.config = config;

    // Create drop graphic
    const width = 40;
    const height = isMutation ? 30 : 25;

    // Background shape
    if (isMutation) {
      // DNA helix shape (simplified as hexagon)
      this.gameObject = scene.add.polygon(x, y, [
        -15, 0, -10, -12, 10, -12, 15, 0, 10, 12, -10, 12
      ], config.color, 0.9);
    } else {
      // Capsule shape (rounded rect approximation)
      this.gameObject = scene.add.rectangle(x, y, width, height, config.color, 0.9);
    }

    // Label text
    this.label = scene.add.text(x, y, config.label, {
      fontSize: '12px',
      fontFamily: 'Arial Black',
      color: '#000000',
    }).setOrigin(0.5);

    // Enable physics
    scene.physics.add.existing(this.gameObject);
    this.gameObject.body.setVelocityY(80); // Fall speed

    // Store reference
    this.gameObject.dropRef = this;

    // Glow animation
    scene.tweens.add({
      targets: this.gameObject,
      alpha: 0.6,
      duration: 300,
      yoyo: true,
      repeat: -1,
    });
  }

  update() {
    // Update label position
    this.label.x = this.gameObject.x;
    this.label.y = this.gameObject.y;

    // Destroy if off screen
    if (this.gameObject.y > GAME_HEIGHT + 20) {
      this.destroy();
      return false;
    }
    return true;
  }

  collect() {
    if (this.collected) return;
    this.collected = true;

    // Sound effect
    soundManager.playPowerup();

    // Sparkle particles
    if (this.scene.particles) {
      this.scene.particles.powerupSparkle(this.gameObject.x, this.gameObject.y, this.config.color);
    }

    // Floating text feedback
    const feedbackText = this.isMutation ? `+${this.config.label}` : this.config.label;
    const feedbackColor = this.isMutation ? '#00ff00' : '#00ffff';
    const floatText = this.scene.add.text(this.gameObject.x, this.gameObject.y - 20, feedbackText, {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      color: feedbackColor,
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: floatText,
      y: floatText.y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => floatText.destroy(),
    });

    // Flash effect
    this.scene.tweens.add({
      targets: [this.gameObject, this.label],
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => this.destroy(),
    });

    // Apply effect
    if (this.isMutation) {
      this.scene.applyMutation(this.type);
    } else {
      this.scene.applyPowerup(this.type);
    }
  }

  destroy() {
    if (this.label) this.label.destroy();
    if (this.gameObject) this.gameObject.destroy();
  }

  get x() { return this.gameObject.x; }
  get y() { return this.gameObject.y; }
}
