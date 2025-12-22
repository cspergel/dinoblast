// src/scenes/BootScene.js
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load assets here later
    // For now, we're using generated graphics
  }

  create() {
    // Transition to menu
    this.scene.start('MenuScene');
  }
}
