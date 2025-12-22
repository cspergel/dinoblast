// src/entities/MeteorEgg.js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, EGG, PADDLE } from '../config/gameConfig.js';

export class MeteorEgg {
  constructor(scene, x, y) {
    this.scene = scene;
    this.launched = false;
    this.piercing = false; // From Comet Core powerup
    this.stuck = false; // From Magnet mutation

    // Create egg sprite
    this.gameObject = scene.add.sprite(x, y, 'egg');

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
