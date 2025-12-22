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

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    // Get difficulty settings
    const difficultyKey = data?.difficulty || 'NORMAL';
    this.difficultyConfig = DIFFICULTY[difficultyKey];
    this.difficultyKey = difficultyKey;

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

    // Input
    this.input.keyboard.on('keydown-SPACE', () => this.launchEgg());
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

    // Combo
    this.comboText = this.add.text(GAME_WIDTH / 2, 50, '', {
      fontSize: '28px',
      fontFamily: 'Arial Black',
      color: '#ffff00',
    }).setOrigin(0.5);

    // Mutation meter
    this.createMutationMeter();
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

  launchEgg() {
    this.eggs.forEach(egg => {
      if (!egg.launched) {
        egg.launch();
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

    // Show combo text
    if (multiplier > 1) {
      this.comboText.setText(`${this.comboCount} COMBO! x${multiplier}`);
      this.comboText.setAlpha(1);
    }
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
    });
  }

  update(time, delta) {
    // Update starfield
    this.starfield.update(time, delta);

    // Update paddle
    this.paddle.update();

    // Update eggs
    this.eggs.forEach(egg => {
      if (!egg.launched) {
        egg.followPaddle(this.paddle);
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
    // Check if LASER powerup is active
    const laserActive = this.powerupManager.isActive('LASER');

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
