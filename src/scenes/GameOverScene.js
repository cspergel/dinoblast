// src/scenes/GameOverScene.js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { MUTATIONS } from '../config/powerups.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.waveReached = data.wave || 1;
    this.won = data.won || false;
    this.stats = data.stats || {};
    this.mutations = data.mutations || {};
    this.isNewHigh = data.isNewHigh || false;
    this.isDailyChallenge = data.isDailyChallenge || false;
  }

  create() {
    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x111111);

    // Title
    const titleText = this.won ? 'VICTORY!' : 'GAME OVER';
    const titleColor = this.won ? '#00ff88' : '#ff4444';

    this.add.text(GAME_WIDTH / 2, 60, titleText, {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      color: titleColor,
    }).setOrigin(0.5);

    // Daily Challenge indicator
    if (this.isDailyChallenge) {
      this.add.text(GAME_WIDTH / 2, 95, '🏆 DAILY CHALLENGE', {
        fontSize: '16px',
        fontFamily: 'Arial Black',
        color: '#ff8800',
      }).setOrigin(0.5);
    }

    // Score (big)
    const scoreText = this.add.text(GAME_WIDTH / 2, 120, `SCORE: ${this.finalScore}`, {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
    }).setOrigin(0.5);

    // New High Score indicator
    if (this.isNewHigh) {
      const newHighText = this.add.text(GAME_WIDTH / 2, 155, '⭐ NEW HIGH SCORE! ⭐', {
        fontSize: '20px',
        fontFamily: 'Arial Black',
        color: '#ffcc00',
      }).setOrigin(0.5);

      // Pulse animation
      this.tweens.add({
        targets: [scoreText, newHighText],
        scale: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }

    // Wave reached
    this.add.text(GAME_WIDTH / 2, this.isNewHigh ? 185 : 160, `Wave ${this.waveReached}/10`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#888888',
    }).setOrigin(0.5);

    // Stats panel
    this.createStatsPanel();

    // Mutations panel
    this.createMutationsPanel();

    // Play again button
    const playAgainButton = this.add.text(GAME_WIDTH / 2, 500, '[ PLAY AGAIN ]', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffff00',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playAgainButton.on('pointerover', () => playAgainButton.setColor('#ffffff'));
    playAgainButton.on('pointerout', () => playAgainButton.setColor('#ffff00'));
    playAgainButton.on('pointerdown', () => this.scene.start('GameScene'));

    // Menu button
    const menuButton = this.add.text(GAME_WIDTH / 2, 550, '[ MENU ]', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#888888',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuButton.on('pointerover', () => menuButton.setColor('#ffffff'));
    menuButton.on('pointerout', () => menuButton.setColor('#888888'));
    menuButton.on('pointerdown', () => this.scene.start('MenuScene'));

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-SPACE', () => this.scene.start('GameScene'));
    this.input.keyboard.on('keydown-R', () => this.scene.start('GameScene'));

    // Victory sparkle effect
    if (this.won) {
      this.createVictoryEffect();
    }
  }

  createStatsPanel() {
    const startY = 200;
    const leftX = 60;
    const rightX = GAME_WIDTH / 2 + 40;

    this.add.text(GAME_WIDTH / 2, startY - 10, '--- RUN STATS ---', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#666666',
    }).setOrigin(0.5);

    const statsLeft = [
      { label: 'Dinos Killed', value: this.stats.dinosKilled || 0, color: '#ff6666' },
      { label: 'Max Combo', value: this.stats.maxCombo || 0, color: '#ffff00' },
      { label: 'Bumper Hits', value: this.stats.bumperHits || 0, color: '#ff00ff' },
    ];

    const statsRight = [
      { label: 'Powerups', value: this.stats.powerupsCollected || 0, color: '#00ffff' },
      { label: 'Mutations', value: this.stats.mutationsGained || 0, color: '#00ff00' },
      { label: 'Wormholes', value: this.stats.wormholeTravels || 0, color: '#9966ff' },
    ];

    statsLeft.forEach((stat, i) => {
      this.add.text(leftX, startY + 20 + i * 30, stat.label, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#aaaaaa',
      });
      this.add.text(leftX + 140, startY + 20 + i * 30, `${stat.value}`, {
        fontSize: '16px',
        fontFamily: 'Arial Black',
        color: stat.color,
      });
    });

    statsRight.forEach((stat, i) => {
      this.add.text(rightX, startY + 20 + i * 30, stat.label, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#aaaaaa',
      });
      this.add.text(rightX + 140, startY + 20 + i * 30, `${stat.value}`, {
        fontSize: '16px',
        fontFamily: 'Arial Black',
        color: stat.color,
      });
    });
  }

  createMutationsPanel() {
    const startY = 330;

    // Count total mutations
    const totalMutations = Object.values(this.mutations).reduce((a, b) => a + b, 0);

    if (totalMutations === 0) {
      this.add.text(GAME_WIDTH / 2, startY + 20, 'No mutations collected', {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#666666',
      }).setOrigin(0.5);
      return;
    }

    this.add.text(GAME_WIDTH / 2, startY, '--- FINAL MUTATIONS ---', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#666666',
    }).setOrigin(0.5);

    // Display mutation icons
    const mutationEntries = Object.entries(this.mutations).filter(([, stacks]) => stacks > 0);
    const iconSize = 30;
    const padding = 10;
    const totalWidth = mutationEntries.length * (iconSize + padding) - padding;
    let xOffset = GAME_WIDTH / 2 - totalWidth / 2;

    mutationEntries.forEach(([type, stacks]) => {
      const config = MUTATIONS[type.toUpperCase()];
      if (!config) return;

      // Icon background
      const icon = this.add.rectangle(
        xOffset + iconSize / 2, startY + 45, iconSize, iconSize, config.color
      );

      // Mutation label
      this.add.text(xOffset + iconSize / 2, startY + 45, config.label, {
        fontSize: '12px',
        fontFamily: 'Arial Black',
        color: '#000000',
      }).setOrigin(0.5);

      // Stack count
      if (stacks > 1) {
        this.add.text(xOffset + iconSize - 2, startY + 55, `x${stacks}`, {
          fontSize: '10px',
          fontFamily: 'Arial',
          color: '#ffffff',
        }).setOrigin(1, 0);
      }

      xOffset += iconSize + padding;
    });
  }

  createVictoryEffect() {
    // Create sparkle particles
    for (let i = 0; i < 20; i++) {
      this.time.delayedCall(i * 100, () => {
        const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
        const y = Phaser.Math.Between(50, 150);
        const star = this.add.text(x, y, '*', {
          fontSize: '24px',
          color: '#ffff00',
        }).setOrigin(0.5);

        this.tweens.add({
          targets: star,
          alpha: 0,
          scale: 2,
          duration: 800,
          onComplete: () => star.destroy(),
        });
      });
    }
  }
}
