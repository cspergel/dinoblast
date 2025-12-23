// src/systems/PowerupManager.js
import { Drop } from '../entities/Drop.js';
import { TIMED_POWERUPS, MUTATIONS, POWERUP_TYPES, MUTATION_TYPES } from '../config/powerups.js';
import Phaser from 'phaser';
import { soundManager } from './SoundManager.js';

export class PowerupManager {
  constructor(scene) {
    this.scene = scene;
    this.drops = [];
    this.activePowerups = []; // { type, remainingTime, config }
  }

  trySpawnDrop(x, y, dropRates) {
    const roll = Math.random();

    if (roll < dropRates.mutation) {
      // Spawn mutation
      const type = Phaser.Utils.Array.GetRandom(MUTATION_TYPES);
      this.spawnDrop(x, y, type, true);
    } else if (roll < dropRates.mutation + dropRates.timedPowerup) {
      // Spawn timed powerup
      const type = Phaser.Utils.Array.GetRandom(POWERUP_TYPES);
      this.spawnDrop(x, y, type, false);
    }
  }

  spawnDrop(x, y, type, isMutation) {
    const drop = new Drop(this.scene, x, y, type, isMutation);
    this.drops.push(drop);
    this.setupDropCollision(drop);
  }

  setupDropCollision(drop) {
    this.scene.physics.add.overlap(
      drop.gameObject,
      this.scene.paddle.gameObject,
      () => drop.collect()
    );
  }

  activatePowerup(type) {
    const config = TIMED_POWERUPS[type];
    if (!config) return;

    // Handle special cases
    if (type === 'SHIELD') {
      this.scene.paddle.addShield(1);
      return;
    }

    if (type === 'BOMB') {
      // Instant explosion effect
      this.triggerBomb();
      return;
    }

    if (type === 'MULTI') {
      // Spawn extra egg if under max
      if (this.scene.eggs.length < 3) {
        this.scene.spawnEgg();
      }
    }

    // Check if already active - refresh timer
    const existing = this.activePowerups.find(p => p.type === type);
    if (existing) {
      existing.remainingTime = config.duration;
    } else {
      this.activePowerups.push({
        type,
        remainingTime: config.duration,
        config,
      });
    }

    // Apply immediate effects
    this.applyPowerupEffects();
  }

  triggerBomb() {
    // Sound effect
    soundManager.playExplosion();

    // Screen shake
    this.scene.cameras.main.shake(300, 0.02);

    // Create explosion visual at center
    const cx = this.scene.paddle.x;
    const cy = 300;

    // Particle explosion
    if (this.scene.particles) {
      this.scene.particles.bombExplosion(cx, cy);
    }

    const explosion = this.scene.add.circle(cx, cy, 10, 0xff6600);

    this.scene.tweens.add({
      targets: explosion,
      radius: 200,
      alpha: 0,
      duration: 500,
      onUpdate: () => {
        explosion.setScale(explosion.radius / 10);
      },
      onComplete: () => explosion.destroy(),
    });

    // Damage all dinos within radius
    const blastRadius = 200;
    this.scene.waveManager.dinos.forEach(dino => {
      const dist = Phaser.Math.Distance.Between(cx, cy, dino.x, dino.y);
      if (dist < blastRadius) {
        this.scene.waveManager.hitDino(dino);
        this.scene.stats.dinosKilled++;
      }
    });

    // Check wave cleared
    if (this.scene.waveManager.isWaveCleared()) {
      this.scene.onWaveCleared();
    }
  }

  applyPowerupEffects() {
    // Update paddle width
    this.scene.paddle.updateWidth();

    // Update egg piercing with visual
    const hasFire = this.activePowerups.some(p => p.type === 'FIRE');
    this.scene.eggs.forEach(egg => {
      egg.piercing = hasFire;
      if (hasFire) {
        egg.gameObject.setTint(0xff4400);
        egg.gameObject.setScale(1.3);
      } else if (!egg.piercingTimer) {
        egg.gameObject.clearTint();
        egg.gameObject.setScale(1);
      }
    });
  }

  update(delta) {
    // Update drops
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      if (!drop.update()) {
        this.drops.splice(i, 1);
      }
    }

    // Update active powerup timers
    for (let i = this.activePowerups.length - 1; i >= 0; i--) {
      const powerup = this.activePowerups[i];
      powerup.remainingTime -= delta;

      if (powerup.remainingTime <= 0) {
        this.activePowerups.splice(i, 1);
        this.onPowerupExpired(powerup.type);
      }
    }

    // Sync with scene
    this.scene.activePowerups = this.activePowerups;
  }

  onPowerupExpired(type) {
    // Handle expiration effects
    if (type === 'MULTI') {
      // Remove extra eggs (keep at least 1)
      while (this.scene.eggs.length > 1) {
        const egg = this.scene.eggs.pop();
        egg.destroy();
      }
    }

    this.applyPowerupEffects();
  }

  getActivePowerups() {
    return this.activePowerups;
  }

  isActive(type) {
    return this.activePowerups.some(p => p.type === type);
  }

  clearAll() {
    this.drops.forEach(d => d.destroy());
    this.drops = [];
    this.activePowerups = [];
  }
}
