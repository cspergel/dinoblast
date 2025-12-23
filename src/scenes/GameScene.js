// src/scenes/GameScene.js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PADDLE, EGG, EARTH_LINE_Y } from '../config/gameConfig.js';
import { Paddle } from '../entities/Paddle.js';
import { MeteorEgg } from '../entities/MeteorEgg.js';
import { WaveManager } from '../systems/WaveManager.js';
import { Bumper } from '../entities/Bumper.js';
import { Wormhole } from '../entities/Wormhole.js';
import { GravityWell } from '../entities/GravityWell.js';
import { PowerupManager } from '../systems/PowerupManager.js';
import { MUTATIONS } from '../config/powerups.js';
import { DIFFICULTY } from '../config/difficulty.js';
import { Boss } from '../entities/Boss.js';
import { Laser } from '../entities/Laser.js';
import { Starfield } from '../entities/Starfield.js';
import { ParticleManager } from '../systems/ParticleManager.js';
import { soundManager } from '../systems/SoundManager.js';
import { SideVortex } from '../entities/SideVortex.js';
import { storageManager } from '../systems/StorageManager.js';
import { ACHIEVEMENTS } from '../config/achievements.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    // Get difficulty settings
    const difficultyKey = data?.difficulty || 'NORMAL';
    this.difficultyConfig = DIFFICULTY[difficultyKey];
    this.difficultyKey = difficultyKey;

    // Daily challenge mode
    this.isDailyChallenge = data?.dailyChallenge || false;
    this.dailySeed = data?.seed || null;

    // Settings
    this.screenShakeEnabled = storageManager.getSetting('screenShake');
    this.tutorialSeen = storageManager.getSetting('tutorialSeen');

    // Game state
    this.hearts = this.difficultyConfig.hearts;
    this.score = 0;
    this.currentWave = 1;
    this.activePowerups = [];
    this.mutations = {
      width: 0,
      speed: 0,
      armor: 0,
      reflect: 0,
      magnet: 0,
      bunker: 0,
    };
    this.eggs = [];
    this.bullets = [];
    this.isWaveTransition = false;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.comboTimeout = 2000; // 2 seconds to maintain combo

    // Run stats for summary
    this.stats = {
      dinosKilled: 0,
      powerupsCollected: 0,
      mutationsGained: 0,
      maxCombo: 0,
      bumperHits: 0,
      wormholeTravels: 0,
      bossesDefeated: 0,
    };

    // Pinball objects
    this.bumpers = [];
    this.wormholes = [];
    this.gravityWells = [];

    // Side bumpers (permanent)
    this.sideBumpers = [];

    // Boss
    this.boss = null;

    // Lasers
    this.lasers = [];
    this.laserCooldown = 0;
    this.laserFireRate = 200; // Fire every 200ms when LASER active
  }

  create() {
    // Create starfield background
    this.starfield = new Starfield(this);

    // Create paddle
    this.paddle = new Paddle(this);

    // Create wave manager
    this.waveManager = new WaveManager(this);

    // Create powerup manager
    this.powerupManager = new PowerupManager(this);

    // Create particle manager
    this.particles = new ParticleManager(this);

    // Create initial egg
    this.spawnEgg();

    // Draw earth line (visual reference)
    this.add.line(0, EARTH_LINE_Y, 0, 0, GAME_WIDTH, 0, 0xff0000, 0.3)
      .setOrigin(0, 0);

    // Load first wave
    this.waveManager.loadWave(this.currentWave);

    // Spawn pinball objects for this wave
    this.spawnPinballObjects();

    // Setup collisions
    this.setupCollisions();

    // Setup dino collisions (must be after wave is loaded)
    this.setupDinoCollisions();

    // Create side bumpers (permanent pinball elements)
    this.createSideBumpers();

    // Power shot charging
    this.chargeTime = 0;
    this.maxChargeTime = 1500; // 1.5 seconds for full charge
    this.isCharging = false;
    this.chargeVisual = null;

    // Secret codes
    this.secretCodes = {
      konami: {
        code: ['UP', 'UP', 'DOWN', 'DOWN', 'LEFT', 'RIGHT', 'LEFT', 'RIGHT', 'ENTER'],
        index: 0,
        activated: false,
      },
      laser: {
        code: ['L', 'L', 'L', 'ENTER'],
        index: 0,
        activated: false,
      },
      god: {
        code: ['G', 'O', 'D', 'ENTER'],
        index: 0,
        activated: false,
      },
    };
    this.laserToggleEnabled = false;
    this.laserToggleOn = false;
    this.godModeEnabled = false;
    this.setupSecretCodeListener();

    // Input
    this.input.keyboard.on('keydown-SPACE', () => this.startCharge());
    this.input.keyboard.on('keyup-SPACE', () => this.releaseCharge());
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.launch('PauseScene');
      this.scene.pause();
    });
    this.input.keyboard.on('keydown-R', () => this.scene.restart());

    // HUD
    this.createHUD();

    // Show wave name
    this.showWaveCard();
  }

  createHUD() {
    // Hearts
    this.heartsText = this.add.text(20, 20, this.getHeartsDisplay(), {
      fontSize: '24px',
      color: '#ff4444',
    });

    // Wave
    this.waveText = this.add.text(GAME_WIDTH / 2, 20, `Wave ${this.currentWave}`, {
      fontSize: '20px',
      color: '#888888',
    }).setOrigin(0.5, 0);

    // Score
    this.scoreText = this.add.text(GAME_WIDTH - 20, 20, `${this.score}`, {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(1, 0);

    // Pause button
    this.pauseBtn = this.add.text(GAME_WIDTH - 20, 55, '⏸', {
      fontSize: '24px',
      color: '#888888',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    this.pauseBtn.on('pointerover', () => this.pauseBtn.setColor('#ffffff'));
    this.pauseBtn.on('pointerout', () => this.pauseBtn.setColor('#888888'));
    this.pauseBtn.on('pointerdown', () => {
      this.scene.launch('PauseScene');
      this.scene.pause();
    });

    // Reset button
    this.resetBtn = this.add.text(GAME_WIDTH - 50, 55, '↺', {
      fontSize: '24px',
      color: '#888888',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    this.resetBtn.on('pointerover', () => this.resetBtn.setColor('#ff4444'));
    this.resetBtn.on('pointerout', () => this.resetBtn.setColor('#888888'));
    this.resetBtn.on('pointerdown', () => {
      this.scene.restart();
    });

    // Combo
    this.comboText = this.add.text(GAME_WIDTH / 2, 50, '', {
      fontSize: '28px',
      fontFamily: 'Arial Black',
      color: '#ffff00',
    }).setOrigin(0.5);

    // Mutation meter
    this.createMutationMeter();

    // Powerup timer bars
    this.powerupBars = [];
    this.createPowerupTimerArea();

    // Sound toggle in game
    this.createSoundToggle();

    // Tutorial overlay (first time)
    if (!this.tutorialSeen) {
      this.showTutorial();
    }

    // Daily challenge indicator
    if (this.isDailyChallenge) {
      this.add.text(GAME_WIDTH / 2, 75, '🏆 DAILY CHALLENGE', {
        fontSize: '14px',
        fontFamily: 'Arial Black',
        color: '#ff8800',
      }).setOrigin(0.5);
    }
  }

  createSoundToggle() {
    const soundOn = storageManager.getSetting('soundEnabled');
    this.soundBtn = this.add.text(GAME_WIDTH - 60, 55, soundOn ? '🔊' : '🔇', {
      fontSize: '20px',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(50);

    this.soundBtn.on('pointerdown', () => {
      const newState = storageManager.toggleSetting('soundEnabled');
      this.soundBtn.setText(newState ? '🔊' : '🔇');
      soundManager.setEnabled(newState);
    });
  }

  createPowerupTimerArea() {
    // Area on the right side for powerup timer bars
    this.powerupTimerY = 100;
  }

  showTutorial() {
    // Semi-transparent overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8);
    overlay.setDepth(200);

    const title = this.add.text(GAME_WIDTH / 2, 150, 'HOW TO PLAY', {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#00ff88',
    }).setOrigin(0.5).setDepth(201);

    const instructions = [
      '← → or A/D = Move paddle',
      'SPACE = Launch egg',
      'Hold SPACE = Charged shot',
      'SHIFT + direction = Dash',
      '',
      'Destroy dinos before they reach Earth!',
      'Collect powerups for abilities',
      'Mutations are permanent upgrades',
    ];

    instructions.forEach((line, i) => {
      this.add.text(GAME_WIDTH / 2, 220 + i * 30, line, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
      }).setOrigin(0.5).setDepth(201);
    });

    const tapText = this.add.text(GAME_WIDTH / 2, 520, 'TAP OR PRESS ANY KEY TO START', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#ffff00',
    }).setOrigin(0.5).setDepth(201);

    // Pulse animation
    this.tweens.add({
      targets: tapText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Dismiss on any input
    const dismissTutorial = () => {
      storageManager.setSetting('tutorialSeen', true);
      this.tutorialSeen = true;
      overlay.destroy();
      title.destroy();
      tapText.destroy();
      instructions.forEach((_, i) => {
        // Clean up instruction texts
      });
      this.children.each(child => {
        if (child.depth === 201) child.destroy();
      });
    };

    this.input.keyboard.once('keydown', dismissTutorial);
    this.input.once('pointerdown', dismissTutorial);
  }

  // Screen shake helper that respects settings
  doScreenShake(duration, intensity) {
    if (this.screenShakeEnabled) {
      this.cameras.main.shake(duration, intensity);
    }
  }

  createMutationMeter() {
    // Container for mutation indicators on the left side
    const startY = 55;
    const mutationIcons = {
      width: { label: 'W', color: 0x00ff00 },
      speed: { label: 'S', color: 0xffff00 },
      armor: { label: 'A', color: 0x00ffff },
      reflect: { label: 'R', color: 0xff00ff },
      magnet: { label: 'M', color: 0xff8800 },
      bunker: { label: 'B', color: 0x888888 },
    };

    this.mutationIndicators = {};

    Object.entries(mutationIcons).forEach(([key, config], index) => {
      const y = startY + index * 22;

      // Background
      const bg = this.add.rectangle(25, y, 20, 18, config.color, 0.2);
      bg.setStrokeStyle(1, config.color);

      // Label
      const label = this.add.text(25, y, config.label, {
        fontSize: '12px',
        fontFamily: 'Arial Black',
        color: `#${config.color.toString(16).padStart(6, '0')}`,
      }).setOrigin(0.5);

      // Stack count
      const count = this.add.text(42, y, '', {
        fontSize: '10px',
        fontFamily: 'Arial',
        color: '#ffffff',
      }).setOrigin(0, 0.5);

      this.mutationIndicators[key] = { bg, label, count };
    });
  }

  updateMutationMeter() {
    if (!this.mutationIndicators) return;

    Object.entries(this.mutations).forEach(([key, stacks]) => {
      const indicator = this.mutationIndicators[key];
      if (!indicator) return;

      if (stacks > 0) {
        indicator.bg.setAlpha(1);
        indicator.label.setAlpha(1);
        indicator.count.setText(`x${stacks}`);
        indicator.count.setAlpha(1);
      } else {
        indicator.bg.setAlpha(0.3);
        indicator.label.setAlpha(0.3);
        indicator.count.setAlpha(0);
      }
    });
  }

  getHeartsDisplay() {
    const maxHearts = this.difficultyConfig.hearts;
    return '♥'.repeat(this.hearts) + '♡'.repeat(Math.max(0, maxHearts - this.hearts));
  }

  showWaveCard() {
    const waveName = this.waveManager.currentWaveData?.name || `Wave ${this.currentWave}`;

    const card = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, waveName, {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#00ff88',
    }).setOrigin(0.5).setAlpha(1);

    this.tweens.add({
      targets: card,
      alpha: 0,
      duration: 2000,
      delay: 1000,
      onComplete: () => card.destroy(),
    });
  }

  spawnEgg() {
    const egg = new MeteorEgg(
      this,
      this.paddle.x,
      this.paddle.y - PADDLE.height / 2 - EGG.radius - 5
    );
    this.eggs.push(egg);
    this.setupEggCollisions(egg);
    return egg;
  }

  startCharge() {
    // Only charge if we have unlaunched eggs
    const hasUnlaunched = this.eggs.some(e => !e.launched);
    if (!hasUnlaunched) return;

    this.isCharging = true;
    this.chargeTime = 0;

    // Create charge visual
    if (!this.chargeVisual) {
      this.chargeVisual = this.add.circle(this.paddle.x, this.paddle.y - 30, 5, 0xffff00, 0.8);
    }
  }

  releaseCharge() {
    if (!this.isCharging) {
      // Quick tap - normal launch
      this.launchEgg(false);
      return;
    }

    this.isCharging = false;
    const chargeRatio = Math.min(this.chargeTime / this.maxChargeTime, 1);

    // Destroy charge visual
    if (this.chargeVisual) {
      this.chargeVisual.destroy();
      this.chargeVisual = null;
    }

    // Launch with power based on charge
    if (chargeRatio > 0.3) {
      this.launchEgg(true, chargeRatio);
    } else {
      this.launchEgg(false);
    }
  }

  updateCharge(delta) {
    if (!this.isCharging) return;

    this.chargeTime += delta;
    const chargeRatio = Math.min(this.chargeTime / this.maxChargeTime, 1);

    // Update charge visual
    if (this.chargeVisual) {
      this.chargeVisual.x = this.paddle.x;
      this.chargeVisual.y = this.paddle.y - 30 - chargeRatio * 20;
      this.chargeVisual.setRadius(5 + chargeRatio * 15);

      // Color shifts from yellow to white to cyan
      if (chargeRatio < 0.5) {
        this.chargeVisual.setFillStyle(0xffff00, 0.8);
      } else if (chargeRatio < 0.8) {
        this.chargeVisual.setFillStyle(0xffffff, 0.9);
      } else {
        this.chargeVisual.setFillStyle(0x00ffff, 1);
        // Pulse at max charge
        const pulse = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;
        this.chargeVisual.setScale(pulse + 0.3);
      }

      // Screen shake buildup at high charge
      if (chargeRatio > 0.8) {
        this.cameras.main.shake(50, 0.002);
      }
    }
  }

  setupSecretCodeListener() {
    const keyMap = {
      'ArrowUp': 'UP',
      'ArrowDown': 'DOWN',
      'ArrowLeft': 'LEFT',
      'ArrowRight': 'RIGHT',
      'Enter': 'ENTER',
      'KeyL': 'L',
      'KeyG': 'G',
      'KeyO': 'O',
      'KeyD': 'D',
    };

    this.input.keyboard.on('keydown', (event) => {
      const key = keyMap[event.code];
      if (!key) return;

      // Check each secret code
      Object.entries(this.secretCodes).forEach(([name, data]) => {
        if (data.activated) return;

        if (key === data.code[data.index]) {
          data.index++;

          if (data.index === data.code.length) {
            this.activateSecretCode(name);
          }
        } else {
          // Reset if wrong key
          data.index = 0;
          // But check if this key starts the sequence
          if (key === data.code[0]) {
            data.index = 1;
          }
        }
      });
    });

    // L key toggle for laser (after LLL ENTER unlocked)
    this.input.keyboard.on('keydown-L', () => {
      if (this.laserToggleEnabled) {
        this.laserToggleOn = !this.laserToggleOn;
        this.showQuickMessage(this.laserToggleOn ? 'LASER ON' : 'LASER OFF',
          this.laserToggleOn ? '#ff0000' : '#888888');
      }
    });
  }

  activateSecretCode(name) {
    this.secretCodes[name].activated = true;

    switch (name) {
      case 'konami':
        this.activateKonamiCode();
        break;
      case 'laser':
        this.activateLaserCode();
        break;
      case 'god':
        this.activateGodMode();
        break;
    }
  }

  activateLaserCode() {
    this.laserToggleEnabled = true;
    this.laserToggleOn = true;

    soundManager.playPowerup();
    this.cameras.main.flash(300, 255, 0, 0);

    this.showQuickMessage('LASER UNLOCKED!', '#ff0000');
    this.showQuickMessage('Press L to toggle', '#ffaaaa', 40);
  }

  activateGodMode() {
    this.godModeEnabled = true;
    this.hearts = 99;
    this.heartsText.setText('♥99');

    soundManager.playVictory();
    this.cameras.main.flash(500, 255, 255, 255);

    this.showQuickMessage('GOD MODE', '#ffffff');

    // Rainbow paddle
    let hue = 0;
    this.time.addEvent({
      delay: 50,
      callback: () => {
        hue = (hue + 5) % 360;
        const color = Phaser.Display.Color.HSLToColor(hue / 360, 1, 0.5).color;
        this.paddle.gameObject.setTint(color);
      },
      loop: true,
    });
  }

  showQuickMessage(text, color, yOffset = 0) {
    const msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + yOffset, text, {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: color,
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: msg.y - 50,
      duration: 1500,
      onComplete: () => msg.destroy(),
    });
  }

  activateKonamiCode() {

    // Sound effect
    soundManager.playVictory();

    // Screen flash
    this.cameras.main.flash(500, 255, 215, 0);

    // Big announcement
    const text1 = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'KONAMI CODE!', {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const text2 = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'DINO PARTY MODE!', {
      fontSize: '32px',
      fontFamily: 'Arial Black',
      color: '#ff00ff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Animate text
    this.tweens.add({
      targets: [text1, text2],
      scale: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.out',
    });

    this.tweens.add({
      targets: [text1, text2],
      alpha: 0,
      delay: 2000,
      duration: 500,
      onComplete: () => {
        text1.destroy();
        text2.destroy();
      },
    });

    // Grant bonuses
    this.hearts = Math.min(this.hearts + 3, 9);
    this.heartsText.setText(this.getHeartsDisplay());

    // Give all mutations 1 stack
    Object.keys(this.mutations).forEach(key => {
      if (this.mutations[key] === 0) {
        this.mutations[key] = 1;
        this.stats.mutationsGained++;
      }
    });
    this.paddle.updateWidth();
    this.paddle.addShield(1);
    this.updateMutationMeter();

    // Party mode - make all dinos rainbow
    this.waveManager.dinos.forEach(dino => {
      this.tweens.add({
        targets: dino.gameObject,
        angle: 360,
        duration: 1000,
        repeat: -1,
      });

      // Rainbow tint cycle
      let hue = 0;
      this.time.addEvent({
        delay: 100,
        callback: () => {
          hue = (hue + 10) % 360;
          const color = Phaser.Display.Color.HSLToColor(hue / 360, 1, 0.5).color;
          dino.gameObject.setTint(color);
        },
        loop: true,
      });
    });

    // Confetti
    for (let i = 0; i < 50; i++) {
      const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x00ffff, 0xff00ff];
      const confetti = this.add.rectangle(
        Phaser.Math.Between(0, GAME_WIDTH),
        -20,
        Phaser.Math.Between(8, 16),
        Phaser.Math.Between(8, 16),
        Phaser.Utils.Array.GetRandom(colors)
      );

      this.tweens.add({
        targets: confetti,
        y: GAME_HEIGHT + 50,
        x: confetti.x + Phaser.Math.Between(-100, 100),
        angle: Phaser.Math.Between(0, 720),
        duration: Phaser.Math.Between(2000, 4000),
        onComplete: () => confetti.destroy(),
      });
    }

    // Add bonus score
    this.addScore(1000);
  }

  launchEgg(powered = false, chargeRatio = 0) {
    this.eggs.forEach(egg => {
      if (!egg.launched) {
        if (powered) {
          egg.powerLaunch(chargeRatio);
          soundManager.playExplosion();
          this.cameras.main.shake(100, 0.01);
          // Particle burst
          this.particles.bombExplosion(egg.x, egg.y);
        } else {
          egg.launch();
        }
      }
    });
  }

  spawnPinballObjects() {
    // Clear existing
    this.bumpers.forEach(b => b.destroy());
    this.bumpers = [];
    this.wormholes.forEach(w => w.destroy());
    this.wormholes = [];
    this.gravityWells.forEach(g => g.destroy());
    this.gravityWells = [];

    const pinball = this.waveManager.currentWaveData?.pinball;
    if (!pinball) return;

    // Spawn bumpers with random variation
    pinball.bumpers?.forEach(b => {
      const bumper = new Bumper(this, b.x, b.y, { randomOffset: true });
      this.bumpers.push(bumper);
    });

    // Spawn wormholes
    pinball.wormholes?.forEach(w => {
      const wormhole = new Wormhole(this, w.x1, w.y1, w.x2, w.y2);
      this.wormholes.push(wormhole);
    });

    // Spawn gravity wells
    pinball.gravityWells?.forEach(g => {
      const well = new GravityWell(this, g.x, g.y, g.strength);
      this.gravityWells.push(well);
    });

    // Setup pinball collisions with eggs
    this.setupBumperCollisions();
    this.setupWormholeCollisions();
  }

  createSideBumpers() {
    // Create spinning vortexes instead of triangle bumpers
    this.sideVortexes = [];

    // Left vortex
    const leftVortex = new SideVortex(this, 50, 480, true);
    this.sideVortexes.push(leftVortex);
    this.sideBumpers.push(leftVortex.collider);

    // Right vortex
    const rightVortex = new SideVortex(this, GAME_WIDTH - 50, 480, false);
    this.sideVortexes.push(rightVortex);
    this.sideBumpers.push(rightVortex.collider);

    // Setup collisions with eggs
    this.setupSideBumperCollisions();
  }

  setupSideBumperCollisions() {
    this.eggs.forEach(egg => {
      this.sideBumpers.forEach(bumper => {
        this.physics.add.collider(
          egg.gameObject,
          bumper,
          () => {
            // Use vortex's onHit method if available
            if (bumper.vortexRef) {
              bumper.vortexRef.onHit(egg);
            }
          }
        );
      });
    });
  }

  setupBumperCollisions() {
    this.eggs.forEach(egg => {
      this.bumpers.forEach(bumper => {
        this.physics.add.collider(
          egg.gameObject,
          bumper.gameObject,
          () => bumper.onHit(egg)
        );
      });
    });
  }

  setupWormholeCollisions() {
    this.eggs.forEach(egg => {
      this.wormholes.forEach(wormhole => {
        this.physics.add.overlap(
          egg.gameObject,
          wormhole.portalA,
          () => wormhole.teleport(egg, true)
        );
        this.physics.add.overlap(
          egg.gameObject,
          wormhole.portalB,
          () => wormhole.teleport(egg, false)
        );
      });
    });
  }

  setupCollisions() {
    // Ball hitting bottom
    this.physics.world.on('worldbounds', (body, up, down, left, right) => {
      if (down) {
        this.onEggLost(body.gameObject);
      }
    });
  }

  setupEggCollisions(egg) {
    // Egg vs paddle
    this.physics.add.collider(
      egg.gameObject,
      this.paddle.gameObject,
      () => {
        egg.bounceOffPaddle(this.paddle);
        soundManager.playPaddleHit();
      }
    );

    // Egg vs dinos - use overlap to support piercing
    this.waveManager.dinos.forEach(dino => {
      this.physics.add.overlap(
        egg.gameObject,
        dino.gameObject,
        (eggObj, dinoObj) => this.onEggHitDino(egg, dinoObj.dinoRef),
        null,
        this
      );
    });

    // Egg vs bumpers
    this.bumpers.forEach(bumper => {
      this.physics.add.collider(
        egg.gameObject,
        bumper.gameObject,
        () => bumper.onHit(egg)
      );
    });

    // Egg vs wormholes
    this.wormholes.forEach(wormhole => {
      this.physics.add.overlap(
        egg.gameObject,
        wormhole.portalA,
        () => wormhole.teleport(egg, true)
      );
      this.physics.add.overlap(
        egg.gameObject,
        wormhole.portalB,
        () => wormhole.teleport(egg, false)
      );
    });

    // Egg vs side vortexes
    this.sideBumpers.forEach(bumper => {
      this.physics.add.collider(
        egg.gameObject,
        bumper,
        () => {
          if (bumper.vortexRef) {
            bumper.vortexRef.onHit(egg);
          }
        }
      );
    });
  }

  onEggHitDino(egg, dino) {
    if (!dino) return;

    // Prevent multiple hits on same dino in same frame
    if (dino.hitThisFrame) return;
    dino.hitThisFrame = true;

    // Reset hit flag next frame
    this.time.delayedCall(100, () => {
      if (dino) dino.hitThisFrame = false;
    });

    // Bounce the egg if not piercing
    if (!egg.piercing) {
      const body = egg.gameObject.body;
      // Bounce away from dino
      const dx = egg.x - dino.x;
      body.velocity.y *= -1; // Reverse Y
      body.velocity.x += dx * 3 + Phaser.Math.Between(-30, 30); // Push away horizontally
    }

    const isDead = this.waveManager.hitDino(dino);

    // Screen shake on kill
    if (isDead) {
      this.cameras.main.shake(50, 0.003);
      this.stats.dinosKilled++;
      soundManager.playDinoHit();
    }

    // Check wave cleared
    if (this.waveManager.isWaveCleared()) {
      this.onWaveCleared();
    }
  }

  onEggLost(eggGameObject) {
    const eggIndex = this.eggs.findIndex(e => e.gameObject === eggGameObject);
    if (eggIndex !== -1) {
      this.eggs[eggIndex].destroy();
      this.eggs.splice(eggIndex, 1);
    }

    if (this.eggs.length === 0) {
      this.loseHeart();

      if (this.hearts > 0) {
        this.spawnEgg();
      }
    }
  }

  loseHeart() {
    this.hearts--;
    this.heartsText.setText(this.getHeartsDisplay());

    // Sound effect
    soundManager.playLoseHeart();

    // Flash screen red
    this.cameras.main.flash(200, 255, 0, 0);

    // Lose random mutation
    this.loseRandomMutation();

    if (this.hearts <= 0) {
      this.gameOver(false);
    }
  }

  loseRandomMutation() {
    const mutationKeys = Object.keys(this.mutations).filter(k => this.mutations[k] > 0);
    if (mutationKeys.length > 0) {
      const randomKey = Phaser.Utils.Array.GetRandom(mutationKeys);
      this.mutations[randomKey]--;
      this.paddle.updateWidth();
    }
  }

  addScore(points) {
    // Calculate multiplier
    let multiplier = 1;
    if (this.comboCount >= 2) multiplier = 2;
    if (this.comboCount >= 4) multiplier = 3;

    const finalPoints = points * multiplier;
    this.score += finalPoints;
    this.scoreText.setText(`${this.score}`);

    // Update combo
    this.comboCount++;
    this.comboTimer = this.comboTimeout;

    // Track max combo
    if (this.comboCount > this.stats.maxCombo) {
      this.stats.maxCombo = this.comboCount;
    }

    // Show combo text with better display
    if (this.comboCount >= 2) {
      this.comboText.setText(`🔥 ${this.comboCount} COMBO x${multiplier}`);
      this.comboText.setAlpha(1);
      this.comboText.setScale(1 + this.comboCount * 0.05);

      // Combo color based on count
      if (this.comboCount >= 10) {
        this.comboText.setColor('#ff00ff');
      } else if (this.comboCount >= 5) {
        this.comboText.setColor('#ff8800');
      } else {
        this.comboText.setColor('#ffff00');
      }

      // Screen shake on big combos
      if (this.comboCount >= 5 && this.comboCount % 5 === 0) {
        this.doScreenShake(100, 0.005);
      }
    }
  }

  updatePowerupTimerBars() {
    // Clear old bars
    this.powerupBars.forEach(bar => {
      bar.bg.destroy();
      bar.fill.destroy();
      bar.text.destroy();
    });
    this.powerupBars = [];

    // Create bars for active powerups
    const activePowerups = this.powerupManager.getActivePowerups();
    activePowerups.forEach((powerup, index) => {
      const y = this.powerupTimerY + index * 25;
      const barWidth = 80;
      const barHeight = 16;
      const x = GAME_WIDTH - 50;

      // Background
      const bg = this.add.rectangle(x, y, barWidth, barHeight, 0x333333);
      bg.setOrigin(0.5);

      // Fill based on remaining time
      const ratio = powerup.remainingTime / powerup.config.duration;
      const fillWidth = barWidth * ratio;
      const fill = this.add.rectangle(x - barWidth / 2 + fillWidth / 2, y, fillWidth, barHeight - 4, powerup.config.color);
      fill.setOrigin(0.5);

      // Label
      const text = this.add.text(x, y, powerup.config.label, {
        fontSize: '10px',
        fontFamily: 'Arial Black',
        color: '#ffffff',
      }).setOrigin(0.5);

      this.powerupBars.push({ bg, fill, text });
    });
  }

  trySpawnDrop(x, y) {
    const rates = this.waveManager.getDropRates();
    this.powerupManager.trySpawnDrop(x, y, rates);
  }

  applyPowerup(type) {
    this.powerupManager.activatePowerup(type);
    this.stats.powerupsCollected++;
  }

  applyMutation(type) {
    // Map mutation types to mutation keys
    const mutationMap = {
      'WIDTH': 'width',
      'SPEED': 'speed',
      'ARMOR': 'armor',
      'REFLECT': 'reflect',
      'MAGNET': 'magnet',
      'BUNKER': 'bunker',
    };

    const mutationKey = mutationMap[type];
    if (!mutationKey) return;

    const config = MUTATIONS[type];
    const currentStack = this.mutations[mutationKey] || 0;
    const maxStacks = config.maxStacks || 1;

    if (currentStack < maxStacks) {
      this.mutations[mutationKey] = currentStack + 1;
      this.stats.mutationsGained++;

      // Apply immediate effects
      if (type === 'ARMOR') {
        this.paddle.addShield(1);
      }
      if (type === 'BUNKER') {
        this.paddle.updateBunker();
      }
      this.paddle.updateWidth();
    }
  }

  onWaveCleared() {
    if (this.isWaveTransition) return;
    this.isWaveTransition = true;

    this.currentWave++;

    if (this.currentWave > 10) {
      // Victory!
      this.gameOver(true);
    } else {
      // Next wave
      this.waveText.setText(`Wave ${this.currentWave}`);

      // Brief pause before next wave
      this.time.delayedCall(1500, () => {
        this.waveManager.loadWave(this.currentWave);
        this.spawnPinballObjects();
        this.setupDinoCollisions();
        this.showWaveCard();
        this.isWaveTransition = false;
      });
    }
  }

  setupDinoCollisions() {
    // Setup collisions between eggs and new dinos (overlap for piercing support)
    this.eggs.forEach(egg => {
      this.waveManager.dinos.forEach(dino => {
        this.physics.add.overlap(
          egg.gameObject,
          dino.gameObject,
          (eggObj, dinoObj) => this.onEggHitDino(egg, dinoObj.dinoRef),
          null,
          this
        );
      });
    });
  }

  startBossFight(waveData) {
    this.boss = new Boss(this, waveData.boss);

    // Setup collisions
    this.setupBossCollisions();

    // Show boss intro
    this.showWaveCard();

    // Screen shake for dramatic effect
    this.cameras.main.shake(300, 0.01);
  }

  setupBossCollisions() {
    this.eggs.forEach(egg => {
      this.boss.weakPoints.forEach((wp, index) => {
        this.physics.add.overlap(
          egg.gameObject,
          wp,
          () => {
            if (this.boss && this.boss.hitWeakPoint(index)) {
              // Boss died
              this.boss = null;
            } else if (this.boss) {
              egg.gameObject.body.velocity.y *= -1;
            }
          }
        );
      });
    });
  }

  gameOver(won) {
    if (won && this.boss) {
      this.stats.bossesDefeated++;
    }

    // Save high score
    const isNewHigh = storageManager.updateHighScore(this.score, this.currentWave);
    storageManager.addKills(this.stats.dinosKilled);

    // Daily challenge score
    if (this.isDailyChallenge) {
      storageManager.updateDailyScore(this.score);
    }

    // Check achievements
    this.checkAchievements();

    // Play appropriate sound
    if (won) {
      soundManager.playVictory();
    } else {
      soundManager.playGameOver();
    }

    this.scene.start('GameOverScene', {
      score: this.score,
      wave: this.currentWave,
      won: won,
      stats: this.stats,
      mutations: { ...this.mutations },
      isNewHigh: isNewHigh,
      isDailyChallenge: this.isDailyChallenge,
    });
  }

  checkAchievements() {
    const stats = {
      totalKills: storageManager.getTotalKills(),
      highScore: storageManager.getHighScore(),
      highWave: storageManager.getHighWave(),
      totalGames: storageManager.getTotalGames(),
      maxCombo: this.stats.maxCombo,
      maxChain: this.stats.maxChain || 0,
      perfectWaves: this.stats.perfectWaves || 0,
      secretsFound: this.secretCodes ? Object.values(this.secretCodes).filter(s => s.activated).length : 0,
      maxMutations: Object.values(this.mutations).filter(v => v > 0).length,
    };

    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (!storageManager.hasAchievement(achievement.id)) {
        if (achievement.check(stats)) {
          this.unlockAchievement(achievement);
        }
      }
    });
  }

  unlockAchievement(achievement) {
    if (storageManager.unlockAchievement(achievement.id)) {
      // Show unlock notification
      soundManager.playAchievement();

      const popup = this.add.container(GAME_WIDTH / 2, -80);
      popup.setDepth(300);

      const bg = this.add.rectangle(0, 0, 280, 60, 0x222222, 0.95);
      bg.setStrokeStyle(2, 0xffcc00);

      const icon = this.add.text(-110, 0, achievement.icon, { fontSize: '32px' }).setOrigin(0.5);
      const title = this.add.text(10, -12, 'ACHIEVEMENT UNLOCKED!', {
        fontSize: '12px', fontFamily: 'Arial', color: '#ffcc00'
      }).setOrigin(0.5);
      const name = this.add.text(10, 10, achievement.name, {
        fontSize: '16px', fontFamily: 'Arial Black', color: '#ffffff'
      }).setOrigin(0.5);

      popup.add([bg, icon, title, name]);

      // Animate in and out
      this.tweens.add({
        targets: popup,
        y: 60,
        duration: 500,
        ease: 'Back.out',
        onComplete: () => {
          this.time.delayedCall(2000, () => {
            this.tweens.add({
              targets: popup,
              y: -80,
              duration: 300,
              onComplete: () => popup.destroy(),
            });
          });
        },
      });
    }
  }

  update(time, delta) {
    // Update starfield
    this.starfield.update(time, delta);

    // Update paddle
    this.paddle.update(delta);

    // Update charge visual
    this.updateCharge(delta);

    // Update eggs
    this.eggs.forEach(egg => {
      if (!egg.launched) {
        egg.followPaddle(this.paddle);
      }
      // Update power shot piercing timer
      if (egg.updatePowerShot) {
        egg.updatePowerShot(delta);
      }
    });

    // Update wave manager (dino marching, shooting)
    if (!this.isWaveTransition) {
      this.waveManager.update(time, delta);
    }

    // Update boss
    if (this.boss) {
      this.boss.update(time, delta);
    }

    // Update bullets
    this.updateBullets();

    // Update powerup manager
    this.powerupManager.update(delta);

    // Update powerup timer bars
    this.updatePowerupTimerBars();

    // Update combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
        this.comboText.setAlpha(0);
      }
    }

    // Update mutation meter display
    this.updateMutationMeter();

    // Update wormholes
    this.wormholes.forEach(w => w.update(delta));

    // Update bumpers (floating motion)
    this.bumpers.forEach(b => b.update(delta));

    // Update side vortexes
    if (this.sideVortexes) {
      this.sideVortexes.forEach(v => v.update(delta));
    }

    // Apply gravity wells
    this.gravityWells.forEach(well => {
      this.eggs.forEach(egg => {
        if (egg.launched) {
          well.applyForce(egg);
        }
      });
    });

    // Update lasers
    this.updateLasers(delta);

    // Update particles
    this.particles.update(delta);

    // Egg trail effects
    this.eggs.forEach(egg => {
      if (egg.launched && Math.random() < 0.3) {
        this.particles.eggTrail(egg.x, egg.y);
      }
    });
  }

  updateLasers(delta) {
    // Check if LASER powerup is active OR laser toggle is on
    const laserActive = this.powerupManager.isActive('LASER') || this.laserToggleOn;

    if (laserActive) {
      this.laserCooldown -= delta;

      if (this.laserCooldown <= 0) {
        this.laserCooldown = this.laserFireRate;
        this.fireLaser();
      }
    }

    // Update existing lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];

      if (!laser.update()) {
        this.lasers.splice(i, 1);
        continue;
      }

      // Check collision with dinos
      for (const dino of this.waveManager.dinos) {
        if (!dino.gameObject) continue;

        const dx = Math.abs(laser.x - dino.x);
        const dy = Math.abs(laser.y - dino.y);

        if (dx < 25 && dy < 25) {
          // Laser spark effect
          this.particles.laserSpark(laser.x, laser.y);

          const isDead = this.waveManager.hitDino(dino);
          if (isDead) {
            this.stats.dinosKilled++;
            this.addScore(50);
          }

          laser.destroy();
          this.lasers.splice(i, 1);

          if (this.waveManager.isWaveCleared()) {
            this.onWaveCleared();
          }
          break;
        }
      }
    }
  }

  fireLaser() {
    // Fire from both sides of paddle
    const leftLaser = new Laser(this, this.paddle.x - 30, this.paddle.y - 20);
    const rightLaser = new Laser(this, this.paddle.x + 30, this.paddle.y - 20);
    this.lasers.push(leftLaser, rightLaser);
    soundManager.playLaser();
  }

  updateBullets() {
    // Check bullets hitting paddle
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];

      // Check if off screen
      if (bullet.y > GAME_HEIGHT) {
        bullet.destroy();
        this.bullets.splice(i, 1);
        continue;
      }

      // Check collision with bunker tiles first
      let hitBunker = false;
      for (const tile of this.paddle.bunkerTiles) {
        if (this.physics.overlap(bullet, tile)) {
          this.paddle.hitBunkerTile(tile);
          bullet.destroy();
          this.bullets.splice(i, 1);
          hitBunker = true;
          break;
        }
      }
      if (hitBunker) continue;

      // Check collision with paddle
      if (this.physics.overlap(bullet, this.paddle.gameObject)) {
        // Check for reflect mutation - reflects without taking damage
        if (this.mutations.reflect > 0 && !bullet.reflected) {
          bullet.reflected = true;
          bullet.body.setVelocityY(-250);
          bullet.setFillStyle(0x00ffff); // Change color to show reflected
          soundManager.playBumper();
          continue; // Don't process further this frame
        }

        // Normal damage if no reflect or already reflected
        if (!bullet.reflected) {
          const damaged = this.paddle.hitByBullet();
          bullet.destroy();
          this.bullets.splice(i, 1);

          if (damaged) {
            this.loseHeart();
          }
        }
      }

      // Check if reflected bullets hit dinos
      if (bullet.reflected) {
        for (const dino of this.waveManager.dinos) {
          if (!dino.gameObject) continue;
          if (this.physics.overlap(bullet, dino.gameObject)) {
            const isDead = this.waveManager.hitDino(dino);
            if (isDead) {
              this.stats.dinosKilled++;
              this.addScore(30);
            }
            bullet.destroy();
            this.bullets.splice(i, 1);
            if (this.waveManager.isWaveCleared()) {
              this.onWaveCleared();
            }
            break;
          }
        }
      }
    }
  }
}
