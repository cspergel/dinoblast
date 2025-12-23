// src/entities/Paddle.js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PADDLE } from '../config/gameConfig.js';

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
    this.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    // Touch controls
    this.touchMoving = 0; // -1 left, 0 none, 1 right
    this.setupTouchControls();

    // Dash ability
    this.dashCooldown = 0;
    this.dashCooldownTime = 1500; // 1.5 second cooldown
    this.dashDuration = 150; // 150ms dash
    this.dashTimer = 0;
    this.isDashing = false;
    this.dashDirection = 0;
    this.dashSpeed = 1200; // Fast dash
    this.dashInvincible = false;
    this.dashTrails = [];

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

  update(delta = 16) {
    const body = this.gameObject.body;

    // Update dash cooldown
    if (this.dashCooldown > 0) {
      this.dashCooldown -= delta;
    }

    // Handle dashing
    if (this.isDashing) {
      this.dashTimer -= delta;

      // Create trail effect
      if (Math.random() < 0.5) {
        const trail = this.scene.add.rectangle(
          this.gameObject.x,
          this.gameObject.y,
          this.getCurrentWidth() * 0.8,
          PADDLE.height * 0.8,
          0x00ffff,
          0.6
        );
        this.dashTrails.push({ obj: trail, life: 150 });
      }

      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.dashInvincible = false;
        body.setVelocityX(0);
      }
    } else {
      // Normal movement (keyboard or touch)
      const currentSpeed = this.getCurrentSpeed();
      const movingLeft = this.cursors.left.isDown || this.wasd.left.isDown || this.touchMoving === -1;
      const movingRight = this.cursors.right.isDown || this.wasd.right.isDown || this.touchMoving === 1;

      // Check for dash input (Shift + direction)
      if (this.shiftKey.isDown && this.dashCooldown <= 0) {
        if (movingLeft) {
          this.startDash(-1);
        } else if (movingRight) {
          this.startDash(1);
        }
      } else {
        // Normal movement
        if (movingLeft) {
          body.setVelocityX(-currentSpeed);
        } else if (movingRight) {
          body.setVelocityX(currentSpeed);
        } else {
          body.setVelocityX(0);
        }
      }
    }

    // Update trail effects
    for (let i = this.dashTrails.length - 1; i >= 0; i--) {
      const trail = this.dashTrails[i];
      trail.life -= delta;
      trail.obj.setAlpha(trail.life / 150 * 0.6);
      if (trail.life <= 0) {
        trail.obj.destroy();
        this.dashTrails.splice(i, 1);
      }
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

  startDash(direction) {
    this.isDashing = true;
    this.dashTimer = this.dashDuration;
    this.dashDirection = direction;
    this.dashCooldown = this.dashCooldownTime;
    this.dashInvincible = true;

    // Apply dash velocity
    this.gameObject.body.setVelocityX(this.dashSpeed * direction);

    // Flash effect
    this.scene.tweens.add({
      targets: this.gameObject,
      alpha: 0.5,
      duration: 50,
      yoyo: true,
      repeat: 2,
    });

    // Screen effect
    this.scene.cameras.main.shake(50, 0.002);
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
    // Base speed + mutation bonuses (20% per stack) + powerup bonuses
    let speed = this.baseSpeed;
    const mutations = this.scene.mutations || {};
    speed *= (1 + (mutations.speed || 0) * 0.20);

    // Check for active FAST powerup
    if (this.scene.powerupManager?.isActive('FAST')) {
      speed *= 1.5;
    }

    return speed;
  }

  getCurrentWidth() {
    // Base width + mutations (25% per stack) + powerups
    let width = this.baseWidth;
    const mutations = this.scene.mutations || {};
    width *= (1 + (mutations.width || 0) * 0.25);

    // Check for active WIDE powerup
    if (this.scene.powerupManager?.isActive('WIDE')) {
      width *= 1.6;
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
    // Invincible during dash
    if (this.dashInvincible) {
      return false;
    }

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

  setupTouchControls() {
    const scene = this.scene;

    // Create invisible touch zones
    const zoneHeight = 150;
    const zoneWidth = GAME_WIDTH / 3;

    // Left touch zone
    this.leftZone = scene.add.rectangle(zoneWidth / 2, GAME_HEIGHT - zoneHeight / 2, zoneWidth, zoneHeight, 0x0000ff, 0)
      .setInteractive()
      .setDepth(100);

    // Right touch zone
    this.rightZone = scene.add.rectangle(GAME_WIDTH - zoneWidth / 2, GAME_HEIGHT - zoneHeight / 2, zoneWidth, zoneHeight, 0xff0000, 0)
      .setInteractive()
      .setDepth(100);

    // Center zone (for launch/dash)
    this.centerZone = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - zoneHeight / 2, zoneWidth, zoneHeight, 0x00ff00, 0)
      .setInteractive()
      .setDepth(100);

    // Visual indicators (semi-transparent)
    this.leftIndicator = scene.add.text(50, GAME_HEIGHT - 40, '◀', {
      fontSize: '40px',
      color: '#ffffff',
    }).setAlpha(0.3).setDepth(101);

    this.rightIndicator = scene.add.text(GAME_WIDTH - 70, GAME_HEIGHT - 40, '▶', {
      fontSize: '40px',
      color: '#ffffff',
    }).setAlpha(0.3).setDepth(101);

    this.centerIndicator = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 35, '▲', {
      fontSize: '32px',
      color: '#ffff00',
    }).setOrigin(0.5).setAlpha(0.3).setDepth(101);

    // Touch events
    this.leftZone.on('pointerdown', () => {
      this.touchMoving = -1;
      this.leftIndicator.setAlpha(0.8);
    });
    this.leftZone.on('pointerup', () => {
      this.touchMoving = 0;
      this.leftIndicator.setAlpha(0.3);
    });
    this.leftZone.on('pointerout', () => {
      this.touchMoving = 0;
      this.leftIndicator.setAlpha(0.3);
    });

    this.rightZone.on('pointerdown', () => {
      this.touchMoving = 1;
      this.rightIndicator.setAlpha(0.8);
    });
    this.rightZone.on('pointerup', () => {
      this.touchMoving = 0;
      this.rightIndicator.setAlpha(0.3);
    });
    this.rightZone.on('pointerout', () => {
      this.touchMoving = 0;
      this.rightIndicator.setAlpha(0.3);
    });

    // Center tap for launch
    this.centerZone.on('pointerdown', () => {
      this.centerIndicator.setAlpha(0.8);
      // Trigger launch in GameScene
      if (scene.launchEgg) {
        scene.launchEgg();
      }
    });
    this.centerZone.on('pointerup', () => {
      this.centerIndicator.setAlpha(0.3);
    });

    // Also allow dragging paddle directly
    scene.input.on('pointermove', (pointer) => {
      if (pointer.isDown && pointer.y > GAME_HEIGHT - 200) {
        // Move paddle toward touch X position
        const dx = pointer.x - this.gameObject.x;
        if (Math.abs(dx) > 10) {
          this.touchMoving = dx > 0 ? 1 : -1;
        }
      }
    });
  }

  get x() { return this.gameObject.x; }
  get y() { return this.gameObject.y; }
  get width() { return this.gameObject.width; }
  get body() { return this.gameObject.body; }
}
