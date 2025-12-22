// src/main.js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './config/gameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.background,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      fps: 120, // Higher physics rate to prevent tunneling
    },
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  scene: [BootScene, MenuScene, GameScene, PauseScene, GameOverScene],
};

const game = new Phaser.Game(config);
