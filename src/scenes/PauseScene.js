// src/scenes/PauseScene.js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    // Semi-transparent overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

    // Paused text
    this.add.text(GAME_WIDTH / 2, 200, 'PAUSED', {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Resume button
    const resumeButton = this.add.text(GAME_WIDTH / 2, 320, '[ RESUME ]', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#00ff88',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    resumeButton.on('pointerover', () => resumeButton.setColor('#ffffff'));
    resumeButton.on('pointerout', () => resumeButton.setColor('#00ff88'));
    resumeButton.on('pointerdown', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });

    // Restart button
    const restartButton = this.add.text(GAME_WIDTH / 2, 380, '[ RESTART ]', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffaa00',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restartButton.on('pointerover', () => restartButton.setColor('#ffffff'));
    restartButton.on('pointerout', () => restartButton.setColor('#ffaa00'));
    restartButton.on('pointerdown', () => {
      this.scene.stop();
      this.scene.get('GameScene').scene.restart();
    });

    // Quit button
    const quitButton = this.add.text(GAME_WIDTH / 2, 440, '[ QUIT ]', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ff4444',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    quitButton.on('pointerover', () => quitButton.setColor('#ffffff'));
    quitButton.on('pointerout', () => quitButton.setColor('#ff4444'));
    quitButton.on('pointerdown', () => {
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    });

    // ESC to resume
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });
  }
}
