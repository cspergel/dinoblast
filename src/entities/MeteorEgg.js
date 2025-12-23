// src/entities/MeteorEgg.js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, EGG, PADDLE } from '../config/gameConfig.js';
import { storageManager } from '../systems/StorageManager.js';
import { EGG_SKINS } from '../config/achievements.js';

export class MeteorEgg {
  constructor(scene, x, y) {
    this.scene = scene;
    this.launched = false;
    this.piercing = false; // From Comet Core powerup
    this.stuck = false; // From Magnet mutation

    // Get selected skin
    this.skinId = storageManager.getSelectedSkin();
    this.skinConfig = EGG_SKINS[this.skinId] || EGG_SKINS.default;

    // Create egg sprite with selected skin
    const textureKey = `egg_${this.skinId}`;
    this.gameObject = scene.add.sprite(x, y, textureKey);

    // Rainbow skin special effect
    if (this.skinConfig.special === 'rainbow') {
      this.rainbowHue = 0;
    }

    // Enable physics
    scene.physics.add.existing(this.gameObject);
    this.gameObject.body.setCircle(EGG.radius);
    this.gameObject.body.setBounce(1, 1);
    this.gameObject.body.setCollideWorldBounds(true);
    this.gameObject.body.setMaxVelocity(400, 400); // Cap speed to prevent tunneling

    // Lose heart if ball goes off bottom (handled in GameScene)
    this.gameObject.body.onWorldBounds = true;
  }

  launch(angle = -90) {
    if (this.launched) return;

    this.launched = true;
    const speed = this.getCurrentSpeed();

    // Convert angle to velocity
    const radians = Phaser.Math.DegToRad(angle);
    const vx = Math.cos(radians) * speed;
    const vy = Math.sin(radians) * speed;

    this.gameObject.body.setVelocity(vx, vy);
  }

  powerLaunch(chargeRatio) {
    if (this.launched) return;

    this.launched = true;

    // Base speed boosted by charge
    const baseSpeed = this.getCurrentSpeed();
    const speed = baseSpeed * (1 + chargeRatio * 0.8); // Up to 80% faster

    // Temporary piercing for power shots
    if (chargeRatio > 0.7) {
      this.piercing = true;
      this.piercingTimer = 2000; // 2 seconds of piercing

      // Visual indicator - glowing effect
      this.gameObject.setTint(0x00ffff);
    }

    // Launch straight up with slight random angle
    const angleVariance = (Math.random() - 0.5) * 20;
    const angle = -90 + angleVariance;
    const radians = Phaser.Math.DegToRad(angle);

    this.gameObject.body.setVelocity(
      Math.cos(radians) * speed,
      Math.sin(radians) * speed
    );

    // Increase max velocity temporarily for power shots
    this.gameObject.body.setMaxVelocity(500, 500);
  }

  updatePowerShot(delta) {
    if (this.piercingTimer > 0) {
      this.piercingTimer -= delta;
      if (this.piercingTimer <= 0) {
        this.piercing = false;
        this.gameObject.clearTint();
        this.gameObject.body.setMaxVelocity(400, 400);
      }
    }
  }

  update(delta) {
    // Rainbow skin color cycling
    if (this.skinConfig.special === 'rainbow' && !this.piercing) {
      this.rainbowHue = (this.rainbowHue + delta * 0.2) % 360;
      const color = Phaser.Display.Color.HSLToColor(this.rainbowHue / 360, 1, 0.5);
      this.gameObject.setTint(color.color);
    }
  }

  getCurrentSpeed() {
    // Use difficulty-adjusted egg speed or default
    let speed = this.scene.difficultyConfig?.eggSpeed || EGG.speed;

    // Check for SPRING powerup
    const springPowerup = (this.scene.activePowerups || []).find(p => p.type === 'SPRING');
    if (springPowerup) {
      speed *= 1.3;
    }

    return speed;
  }

  stickToPaddle(paddle) {
    this.launched = false;
    this.stuck = true;
    this.gameObject.body.setVelocity(0, 0);
    this.gameObject.x = paddle.x;
    this.gameObject.y = paddle.y - PADDLE.height / 2 - EGG.radius - 5;
  }

  followPaddle(paddle) {
    if (!this.launched) {
      this.gameObject.x = paddle.x;
      this.gameObject.y = paddle.y - PADDLE.height / 2 - EGG.radius - 5;
    }
  }

  bounceOffPaddle(paddle) {
    // Calculate bounce angle based on where ball hit paddle
    const hitPosition = (this.gameObject.x - paddle.x) / (paddle.width / 2);
    // hitPosition: -1 (left edge) to 1 (right edge)

    // Angle range: -150 (far left) to -30 (far right)
    const angle = -90 + (hitPosition * 60);

    const speed = this.getCurrentSpeed();
    const radians = Phaser.Math.DegToRad(angle);

    this.gameObject.body.setVelocity(
      Math.cos(radians) * speed,
      Math.sin(radians) * speed
    );

    // Check for magnet mutation
    if (this.scene.mutations?.magnet > 0) {
      this.stickToPaddle(paddle);
    }
  }

  get x() { return this.gameObject.x; }
  get y() { return this.gameObject.y; }
  get body() { return this.gameObject.body; }

  destroy() {
    this.gameObject.destroy();
  }
}
