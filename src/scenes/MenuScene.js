// src/scenes/MenuScene.js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/gameConfig.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Title
    this.add.text(GAME_WIDTH / 2, 150, 'DINO RIFT DEFENDER', {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      color: '#00ff88',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 210, 'Protect Earth from Space Dinos!', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Play button
    const playButton = this.add.text(GAME_WIDTH / 2, 350, '[ PLAY ]', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffff00',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playButton.on('pointerover', () => playButton.setColor('#ffffff'));
    playButton.on('pointerout', () => playButton.setColor('#ffff00'));
    playButton.on('pointerdown', () => this.scene.start('GameScene'));

    // Keyboard shortcut
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });

    // Instructions
    this.add.text(GAME_WIDTH / 2, 500, 'Arrow Keys or A/D to move\nSpace to launch', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888',
      align: 'center',
    }).setOrigin(0.5);
  }
}
