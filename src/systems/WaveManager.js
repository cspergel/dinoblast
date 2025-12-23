// src/systems/WaveManager.js
import { Dino } from '../entities/Dino.js';
import { GAME_WIDTH, GAME_HEIGHT, DINO, EARTH_LINE_Y } from '../config/gameConfig.js';
import waveData from '../data/waves.json';

export class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.dinos = [];
    this.currentWaveIndex = 0;
    this.currentWaveData = null;

    // Difficulty multipliers
    this.marchSpeedMultiplier = scene.difficultyConfig?.marchSpeedMultiplier || 1;
    this.shootChanceMultiplier = scene.difficultyConfig?.shootChanceMultiplier || 1;
    this.dropRateMultiplier = scene.difficultyConfig?.dropRateMultiplier || 1;

    // March state
    this.marchDirection = 1; // 1 = right, -1 = left
    this.marchTimer = 0;
    this.marchInterval = 1000; // ms between march steps

    // Grid bounds
    this.gridLeft = 0;
    this.gridRight = 0;
  }

  loadWave(waveNumber) {
    // Clear existing dinos
    this.dinos.forEach(dino => dino.destroy());
    this.dinos = [];

    // Get wave data
    this.currentWaveIndex = waveNumber - 1;
    this.currentWaveData = waveData.waves[this.currentWaveIndex];

    if (!this.currentWaveData) {
      console.error(`Wave ${waveNumber} not found`);
      return false;
    }

    // Handle boss wave separately
    if (this.currentWaveData.isBoss) {
      this.scene.startBossFight(this.currentWaveData);
      return true;
    }

    // Spawn dino grid
    this.spawnGrid();

    // Update march interval based on wave speed and difficulty
    const adjustedMarchSpeed = this.currentWaveData.marchSpeed * this.marchSpeedMultiplier;
    this.marchInterval = 1000 / (adjustedMarchSpeed / 30);

    return true;
  }

  spawnGrid() {
    const grid = this.currentWaveData.grid;
    const startX = (GAME_WIDTH - (grid.cols * (DINO.width + DINO.spacing))) / 2 + DINO.width / 2;
    const startY = 80;

    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const dinoType = grid.layout[row][col];
        if (dinoType) {
          const x = startX + col * (DINO.width + DINO.spacing);
          const y = startY + row * (DINO.height + DINO.spacing);

          const dino = new Dino(this.scene, x, y, dinoType);
          this.dinos.push(dino);
        }
      }
    }

    this.updateGridBounds();
  }

  updateGridBounds() {
    if (this.dinos.length === 0) return;

    this.gridLeft = Math.min(...this.dinos.map(d => d.x - DINO.width / 2));
    this.gridRight = Math.max(...this.dinos.map(d => d.x + DINO.width / 2));
  }

  update(time, delta) {
    // Update march timer
    this.marchTimer += delta;

    // Check for SLOW powerup
    let timeScale = 1;
    const slowPowerup = this.scene.activePowerups?.find(p => p.type === 'SLOW');
    if (slowPowerup) {
      timeScale = 0.7;
    }

    if (this.marchTimer >= this.marchInterval / timeScale) {
      this.marchTimer = 0;
      this.marchStep();
    }

    // Update individual dinos (shooting, etc.)
    this.dinos.forEach(dino => dino.update(delta));

    // Check if dinos reached earth line
    this.checkEarthLine();
  }

  marchStep() {
    if (this.dinos.length === 0) return;

    this.updateGridBounds();

    // Check if we need to change direction and descend
    const margin = 20;
    const needsReverse = (
      (this.marchDirection > 0 && this.gridRight >= GAME_WIDTH - margin) ||
      (this.marchDirection < 0 && this.gridLeft <= margin)
    );

    if (needsReverse) {
      // Descend and reverse
      this.dinos.forEach(dino => {
        dino.y += this.currentWaveData.descentRate;
      });
      this.marchDirection *= -1;
    } else {
      // Move horizontally
      const moveAmount = this.marchDirection * (this.currentWaveData.marchSpeed / 2);
      this.dinos.forEach(dino => {
        dino.x += moveAmount;
      });
    }
  }

  checkEarthLine() {
    const dinosAtEarth = this.dinos.filter(dino =>
      dino.y + DINO.height / 2 >= EARTH_LINE_Y
    );

    dinosAtEarth.forEach(dino => {
      this.removeDino(dino);
      this.scene.loseHeart();
    });
  }

  removeDino(dino) {
    const index = this.dinos.indexOf(dino);
    if (index !== -1) {
      // Explosion particles
      if (this.scene.particles) {
        this.scene.particles.explodeDino(dino.x, dino.y, dino.config?.color || 0xff4400);
      }

      // Chance to drop powerup
      this.scene.trySpawnDrop(dino.x, dino.y);

      // Floating score text
      const scoreValue = dino.getScoreValue();
      const scoreText = this.scene.add.text(dino.x, dino.y, `+${scoreValue}`, {
        fontSize: '14px',
        fontFamily: 'Arial Black',
        color: '#ffff00',
      }).setOrigin(0.5);

      this.scene.tweens.add({
        targets: scoreText,
        y: scoreText.y - 40,
        alpha: 0,
        duration: 600,
        onComplete: () => scoreText.destroy(),
      });

      // Add score
      this.scene.addScore(scoreValue);

      dino.destroy();
      this.dinos.splice(index, 1);
    }
  }

  hitDino(dino, fromExplosion = false) {
    const isDead = dino.hit();
    if (isDead) {
      // Check if this dino explodes (chain reaction)
      if (dino.config?.explodes && !fromExplosion) {
        this.chainExplosion(dino);
      }

      // Check if this dino splits
      if (dino.config?.splits) {
        this.spawnBabyDinos(dino);
      }

      this.removeDino(dino);
    }
    return isDead;
  }

  chainExplosion(bomber) {
    const radius = bomber.config.explosionRadius || 80;
    const x = bomber.x;
    const y = bomber.y;

    // Big explosion effect
    if (this.scene.particles) {
      this.scene.particles.bombExplosion(x, y);
    }

    // Screen shake
    this.scene.cameras.main.shake(200, 0.015);

    // Flash
    this.scene.cameras.main.flash(100, 255, 100, 100);

    // Find all dinos in explosion radius
    const dinosToHit = this.dinos.filter(dino => {
      if (dino === bomber) return false;
      const dx = dino.x - x;
      const dy = dino.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= radius;
    });

    // Delayed chain hits for dramatic effect
    dinosToHit.forEach((dino, index) => {
      this.scene.time.delayedCall(index * 50, () => {
        if (this.dinos.includes(dino)) {
          // Add bonus points for chain kills
          this.scene.addScore(25);
          this.scene.stats.dinosKilled++;
          this.hitDino(dino, true); // fromExplosion = true prevents infinite loops

          // Check wave cleared after each chain kill
          if (this.isWaveCleared()) {
            this.scene.onWaveCleared();
          }
        }
      });
    });

    // Show chain kill combo text
    if (dinosToHit.length > 0) {
      const comboText = this.scene.add.text(x, y - 30, `CHAIN x${dinosToHit.length}!`, {
        fontSize: '24px',
        fontFamily: 'Arial Black',
        color: '#ff4400',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);

      this.scene.tweens.add({
        targets: comboText,
        y: comboText.y - 60,
        alpha: 0,
        scale: 1.5,
        duration: 1000,
        onComplete: () => comboText.destroy(),
      });
    }
  }

  spawnBabyDinos(parentDino) {
    // Spawn 2 baby splitters that fly apart
    const offsets = [-25, 25];

    offsets.forEach((offset, i) => {
      const babyDino = new Dino(
        this.scene,
        parentDino.x + offset,
        parentDino.y,
        'splitter_baby'
      );

      this.dinos.push(babyDino);

      // Setup collision with eggs
      this.scene.eggs.forEach(egg => {
        this.scene.physics.add.overlap(
          egg.gameObject,
          babyDino.gameObject,
          (eggObj, dinoObj) => this.scene.onEggHitDino(egg, dinoObj.dinoRef),
          null,
          this.scene
        );
      });

      // Animate babies flying apart
      this.scene.tweens.add({
        targets: babyDino.gameObject,
        x: babyDino.x + offset * 1.5,
        duration: 300,
        ease: 'Back.out',
      });

      // Flash effect
      this.scene.tweens.add({
        targets: babyDino.gameObject,
        alpha: { from: 0.3, to: 1 },
        duration: 200,
      });
    });
  }

  isWaveCleared() {
    return this.dinos.length === 0;
  }

  getDropRates() {
    const baseRates = this.currentWaveData?.dropRates || { timedPowerup: 0.15, mutation: 0.05 };
    return {
      timedPowerup: baseRates.timedPowerup * this.dropRateMultiplier,
      mutation: baseRates.mutation * this.dropRateMultiplier,
    };
  }

  getDinoGroup() {
    return this.dinos.map(d => d.gameObject);
  }
}
