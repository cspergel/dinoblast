// src/scenes/GameScene.js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, PADDLE, EGG } from '../config/gameConfig.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    // Game state
    this.hearts = 3;
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
  }

  create() {
    // Placeholder - will build out in subsequent tasks
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'GameScene - Building...', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // ESC to pause
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.launch('PauseScene');
      this.scene.pause();
    });
  }

  update(time, delta) {
    // Game loop - will build out
  }
}
