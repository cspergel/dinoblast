// src/entities/Paddle.js
import Phaser from 'phaser';
import { GAME_WIDTH, PADDLE } from '../config/gameConfig.js';

export class Paddle {
  constructor(scene) {
    this.scene = scene;
    this.baseWidth = PADDLE.width;
    this.baseSpeed = PADDLE.speed;

    // Create paddle sprite
    this.gameObject = scene.add.sprite(
      GAME_WIDTH / 2,
      PADDLE.y,
      'paddle'
    );

    // Enable physics
    scene.physics.add.existing(this.gameObject);
    this.gameObject.body.setImmovable(true);
    this.gameObject.body.setCollideWorldBounds(true);

    // Input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Shield pips
    this.shieldPips = 0;
    this.shieldVisuals = [];

    // Bunker tiles (from BUNKER mutation)
    this.bunkerTiles = [];

    // Glow effect for mutations/powerups
    this.glowGraphic = scene.add.ellipse(
      GAME_WIDTH / 2,
      PADDLE.y,
      PADDLE.width + 20,
      PADDLE.height + 20,
      0x00ff88,
      0
    );
    this.glowGraphic.setDepth(-1);
    this.currentGlowColor = 0x00ff88;
    this.glowIntensity = 0;
  }

  update() {
    const body = this.gameObject.body;

    // Calculate current speed (base + mutations + powerups)
    const currentSpeed = this.getCurrentSpeed();

    // Movement
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      body.setVelocityX(-currentSpeed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      body.setVelocityX(currentSpeed);
    } else {
      body.setVelocityX(0);
    }

    // Update shield visual positions
    const totalWidth = this.shieldVisuals.length * 16;
    this.shieldVisuals.forEach((pip, i) => {
      pip.x = this.gameObject.x - totalWidth / 2 + i * 16 + 8;
      pip.y = this.gameObject.y - 20;
    });

    // Update glow effect
    this.updateGlow();
  }

  updateGlow() {
    const mutations = this.scene.mutations || {};
    const powerupManager = this.scene.powerupManager;

    // Calculate total mutation stacks
    const totalMutations = Object.values(mutations).reduce((sum, val) => sum + val, 0);

    // Determine glow color based on active effects
    let glowColor = 0x00ff88; // Default green
    let intensity = 0;

    // Powerup effects take priority for color
    if (powerupManager?.isActive('FIRE')) {
      glowColor = 0xff4400; // Fire orange
      intensity = 0.5;
    } else if (powerupManager?.isActive('LASER')) {
      glowColor = 0xff0000; // Laser red
      intensity = 0.5;
    } else if (powerupManager?.isActive('FAST')) {
      glowColor = 0xffff00; // Speed yellow
      intensity = 0.4;
    } else if (powerupManager?.isActive('WIDE')) {
      glowColor = 0x00ff00; // Wide green
      intensity = 0.4;
    } else if (totalMutations > 0) {
      // Mutation glow - intensity based on total stacks
      intensity = Math.min(0.4, totalMutations * 0.08);
      // Blend color based on mutations
      if (mutations.width > 0) glowColor = 0x00ff00;
      if (mutations.speed > 0) glowColor = 0xffff00;
      if (mutations.armor > 0) glowColor = 0x00ffff;
      if (mutations.reflect > 0) glowColor = 0xff00ff;
    }

    // Update glow graphic
    this.glowGraphic.x = this.gameObject.x;
    this.glowGraphic.y = this.gameObject.y;
    this.glowGraphic.width = this.getCurrentWidth() + 30;
    this.glowGraphic.setFillStyle(glowColor, intensity);

    // Pulse effect
    const pulse = Math.sin(Date.now() * 0.005) * 0.1;
    this.glowGraphic.setAlpha(intensity + pulse);
  }

  getCurrentSpeed() {
    // Base speed + mutation bonuses (10% per stack) + powerup bonuses
    let speed = this.baseSpeed;
    const mutations = this.scene.mutations || {};
    speed *= (1 + (mutations.speed || 0) * 0.10);

    // Check for active FAST powerup
    if (this.scene.powerupManager?.isActive('FAST')) {
      speed *= 1.4;
    }

    return speed;
  }

  getCurrentWidth() {
    // Base width + mutations (15% per stack) + powerups
    let width = this.baseWidth;
    const mutations = this.scene.mutations || {};
    width *= (1 + (mutations.width || 0) * 0.15);

    // Check for active WIDE powerup
    if (this.scene.powerupManager?.isActive('WIDE')) {
      width *= 1.5;
    }

    return width;
  }

  updateWidth() {
    const newWidth = this.getCurrentWidth();
    this.gameObject.width = newWidth;
    this.gameObject.body.setSize(newWidth, PADDLE.height);
  }

  addShield(amount = 1) {
    this.shieldPips = Math.min(this.shieldPips + amount, 3);
    this.updateShieldVisuals();
  }

  updateShieldVisuals() {
    // Clear existing visuals
    this.shieldVisuals.forEach(v => v.destroy());
    this.shieldVisuals = [];

    // Create new shield pip visuals above paddle
    for (let i = 0; i < this.shieldPips; i++) {
      const pip = this.scene.add.circle(0, -20, 6, 0x00ffff);
      this.shieldVisuals.push(pip);
    }
  }

  hitByBullet() {
    if (this.shieldPips > 0) {
      this.shieldPips--;
      this.updateShieldVisuals();
      return false; // No damage taken
    }
    return true; // Damage taken
  }

  updateBunker() {
    // Clear existing bunker tiles
    this.bunkerTiles.forEach(tile => tile.destroy());
    this.bunkerTiles = [];

    const bunkerStacks = this.scene.mutations?.bunker || 0;
    if (bunkerStacks === 0) return;

    // Create bunker tiles (2 per stack)
    const tileCount = bunkerStacks * 2;
    const tileWidth = 30;
    const tileHeight = 10;
    const totalWidth = tileCount * (tileWidth + 5) - 5;
    const startX = this.gameObject.x - totalWidth / 2;

    for (let i = 0; i < tileCount; i++) {
      const tile = this.scene.add.rectangle(
        startX + i * (tileWidth + 5) + tileWidth / 2,
        this.gameObject.y - 35,
        tileWidth,
        tileHeight,
        0x888888
      );
      this.scene.physics.add.existing(tile);
      tile.body.setImmovable(true);
      tile.hp = 1;
      this.bunkerTiles.push(tile);
    }
  }

  hitBunkerTile(tile) {
    tile.hp--;
    if (tile.hp <= 0) {
      const index = this.bunkerTiles.indexOf(tile);
      if (index !== -1) {
        this.bunkerTiles.splice(index, 1);
      }
      tile.destroy();
      return true; // Tile destroyed
    }
    return false;
  }

  get x() { return this.gameObject.x; }
  get y() { return this.gameObject.y; }
  get width() { return this.gameObject.width; }
  get body() { return this.gameObject.body; }
}
