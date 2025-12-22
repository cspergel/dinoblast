// src/ui/HUD.js
import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/gameConfig.js';
import { TIMED_POWERUPS, MUTATIONS } from '../config/powerups.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.powerupIcons = [];
    this.mutationIcons = [];
  }

  create() {
    // Hearts display
    this.heartsText = this.scene.add.text(20, 15, '', {
      fontSize: '28px',
      color: '#ff4444',
    });

    // Wave display
    this.waveText = this.scene.add.text(GAME_WIDTH / 2, 15, '', {
      fontSize: '18px',
      color: '#888888',
    }).setOrigin(0.5, 0);

    // Score display
    this.scoreText = this.scene.add.text(GAME_WIDTH - 20, 15, '', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(1, 0);

    // Combo display
    this.comboText = this.scene.add.text(GAME_WIDTH / 2, 45, '', {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: '#ffff00',
    }).setOrigin(0.5).setAlpha(0);

    // Powerup bar container (below top bar)
    this.powerupContainer = this.scene.add.container(20, 50);

    // Mutation container (above paddle)
    this.mutationContainer = this.scene.add.container(GAME_WIDTH / 2, 520);
  }

  update() {
    const scene = this.scene;

    // Update hearts
    const hearts = '♥'.repeat(scene.hearts) + '♡'.repeat(Math.max(0, 3 - scene.hearts));
    this.heartsText.setText(hearts);

    // Update wave
    this.waveText.setText(`Wave ${scene.currentWave}`);

    // Update score
    this.scoreText.setText(`${scene.score}`);

    // Update active powerups
    this.updatePowerupDisplay();

    // Update mutations
    this.updateMutationDisplay();
  }

  updatePowerupDisplay() {
    // Clear existing icons
    this.powerupContainer.removeAll(true);

    const activePowerups = this.scene.powerupManager?.getActivePowerups() || [];
    let xOffset = 0;

    activePowerups.forEach((powerup, index) => {
      const config = TIMED_POWERUPS[powerup.type];
      if (!config) return;

      // Background bar
      const barWidth = 80;
      const barHeight = 20;
      const fillPercent = powerup.remainingTime / config.duration;

      const bgBar = this.scene.add.rectangle(
        xOffset, 0, barWidth, barHeight, 0x333333
      ).setOrigin(0, 0);

      const fillBar = this.scene.add.rectangle(
        xOffset, 0, barWidth * fillPercent, barHeight, config.color
      ).setOrigin(0, 0);

      const label = this.scene.add.text(xOffset + 5, 2, config.label, {
        fontSize: '12px',
        color: '#000000',
      });

      this.powerupContainer.add([bgBar, fillBar, label]);
      xOffset += barWidth + 10;
    });
  }

  updateMutationDisplay() {
    // Clear existing icons
    this.mutationContainer.removeAll(true);

    const mutations = this.scene.mutations || {};
    let xOffset = 0;
    const iconSize = 24;
    const padding = 5;

    // Count total mutation icons
    let totalIcons = 0;
    Object.entries(mutations).forEach(([type, stacks]) => {
      if (stacks > 0) totalIcons += stacks;
    });

    // Center the icons
    const totalWidth = totalIcons * (iconSize + padding) - padding;
    xOffset = -totalWidth / 2;

    Object.entries(mutations).forEach(([type, stacks]) => {
      const config = MUTATIONS[type.toUpperCase()];
      if (!config || stacks <= 0) return;

      for (let i = 0; i < stacks; i++) {
        const icon = this.scene.add.rectangle(
          xOffset, 0, iconSize, iconSize, config.color
        ).setOrigin(0, 0.5);

        const label = this.scene.add.text(xOffset + iconSize / 2, 0, config.label, {
          fontSize: '10px',
          color: '#000000',
        }).setOrigin(0.5);

        this.mutationContainer.add([icon, label]);
        xOffset += iconSize + padding;
      }
    });
  }

  showCombo(count, multiplier) {
    if (multiplier > 1) {
      this.comboText.setText(`${count} COMBO! x${multiplier}`);
      this.comboText.setAlpha(1);
    }
  }

  hideCombo() {
    this.comboText.setAlpha(0);
  }

  showWaveCard(waveName) {
    const card = this.scene.add.text(GAME_WIDTH / 2, 250, waveName, {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#00ff88',
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: card,
      alpha: 0,
      duration: 2000,
      delay: 1000,
      onComplete: () => card.destroy(),
    });
  }
}
