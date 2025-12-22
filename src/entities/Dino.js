// src/entities/Dino.js
import Phaser from 'phaser';
import { SPRITES } from '../config/sprites.js';
import { DINO, BULLET } from '../config/gameConfig.js';

export class Dino {
  constructor(scene, x, y, type = 'raptor') {
    this.scene = scene;
    this.type = type;
    this.config = SPRITES.dinos[type];

    // HP based on type
    this.maxHp = this.config.hp;
    this.hp = this.maxHp;
    this.cracked = false; // For armored dinos showing damage

    // Create dino sprite
    const textureKey = `dino_${type}`;
    this.gameObject = scene.add.sprite(x, y, textureKey);

    // No label needed - sprite has visual identity
    this.label = null;

    // Enable physics
    scene.physics.add.existing(this.gameObject);
    this.gameObject.body.setSize(this.config.width, this.config.height);
    this.gameObject.body.setImmovable(true);

    // Shooting timer - apply difficulty multiplier
    this.shootTimer = 0;
    const shootMultiplier = scene.difficultyConfig?.shootChanceMultiplier || 1;
    this.shootChance = this.config.shootChance * shootMultiplier;

    // Store reference to this Dino on the game object for collision handling
    this.gameObject.dinoRef = this;
  }

  update(delta) {
    // Shooting logic
    if (Math.random() < this.shootChance) {
      this.shoot();
    }
  }

  shoot() {
    // Create bullet
    const bullet = this.scene.add.rectangle(
      this.gameObject.x,
      this.gameObject.y + this.config.height / 2 + 5,
      BULLET.width,
      BULLET.height,
      SPRITES.bullet.color
    );

    this.scene.physics.add.existing(bullet);

    // Use difficulty-adjusted bullet speed
    let bulletSpeed = this.scene.difficultyConfig?.bulletSpeed || BULLET.speed;

    // Apply SLOW powerup effect
    const slowPowerup = this.scene.activePowerups?.find(p => p.type === 'SLOW');
    if (slowPowerup) {
      bulletSpeed *= 0.5; // Halve bullet speed when SLOW is active
    }

    bullet.body.setVelocityY(bulletSpeed);

    // Add to scene's bullets array
    if (this.scene.bullets) {
      this.scene.bullets.push(bullet);
    }
  }

  hit() {
    this.hp--;

    if (this.hp > 0) {
      // Show cracked state for armored dinos
      this.cracked = true;
      this.gameObject.setAlpha(0.6);
      return false; // Not dead yet
    }

    return true; // Dead
  }

  getScoreValue() {
    switch (this.type) {
      case 'raptor': return 10;
      case 'ptero': return 14;
      case 'trike': return 18;
      default: return 10;
    }
  }

  destroy() {
    if (this.label) this.label.destroy();
    this.gameObject.destroy();
  }

  get x() { return this.gameObject.x; }
  get y() { return this.gameObject.y; }
  set x(val) { this.gameObject.x = val; }
  set y(val) { this.gameObject.y = val; }
  get body() { return this.gameObject.body; }
}
