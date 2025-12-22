// src/scenes/GameOverScene.js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.waveReached = data.wave || 1;
    this.won = data.won || false;
  }

  create() {
    // Title
    const titleText = this.won ? 'VICTORY!' : 'GAME OVER';
    const titleColor = this.won ? '#00ff88' : '#ff4444';

    this.add.text(GAME_WIDTH / 2, 150, titleText, {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      color: titleColor,
    }).setOrigin(0.5);

    // Score
    this.add.text(GAME_WIDTH / 2, 250, `Score: ${this.finalScore}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Wave reached
    this.add.text(GAME_WIDTH / 2, 300, `Wave: ${this.waveReached}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#888888',
    }).setOrigin(0.5);

    // Play again button
    const playAgainButton = this.add.text(GAME_WIDTH / 2, 420, '[ PLAY AGAIN ]', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffff00',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playAgainButton.on('pointerover', () => playAgainButton.setColor('#ffffff'));
    playAgainButton.on('pointerout', () => playAgainButton.setColor('#ffff00'));
    playAgainButton.on('pointerdown', () => this.scene.start('GameScene'));

    // Menu button
    const menuButton = this.add.text(GAME_WIDTH / 2, 480, '[ MENU ]', {
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
  }
}
