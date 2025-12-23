// src/scenes/BootScene.js
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Generate all game textures procedurally
    this.generateTextures();
  }

  create() {
    // Transition to menu
    this.scene.start('MenuScene');
  }

  generateTextures() {
    // Paddle - sleek spaceship shape
    this.generatePaddleTexture();

    // Egg/Ball - glowing meteor
    this.generateEggTexture();

    // Dinos
    this.generateDinoTextures();

    // Bumper
    this.generateBumperTexture();

    // Wormhole
    this.generateWormholeTexture();
  }

  generatePaddleTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const w = 120, h = 20;

    // Main body gradient effect
    g.fillStyle(0x00cc66);
    g.fillRoundedRect(0, 4, w, h - 8, 4);

    // Top highlight
    g.fillStyle(0x00ff88);
    g.fillRoundedRect(2, 2, w - 4, 8, 3);

    // Cockpit
    g.fillStyle(0x88ffcc);
    g.fillCircle(w / 2, h / 2, 6);

    // Side thrusters
    g.fillStyle(0x00aa55);
    g.fillRect(5, 6, 15, 8);
    g.fillRect(w - 20, 6, 15, 8);

    // Thruster glow
    g.fillStyle(0x00ffff);
    g.fillRect(8, 8, 4, 4);
    g.fillRect(w - 12, 8, 4, 4);

    g.generateTexture('paddle', w, h);
    g.destroy();
  }

  generateEggTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const r = 12;

    // Outer glow
    g.fillStyle(0xff8800, 0.3);
    g.fillCircle(r, r, r);

    // Main meteor body
    g.fillStyle(0xffcc00);
    g.fillCircle(r, r, r - 2);

    // Inner core
    g.fillStyle(0xffff88);
    g.fillCircle(r - 2, r - 2, r - 5);

    // Hot spot
    g.fillStyle(0xffffff);
    g.fillCircle(r - 3, r - 3, 3);

    g.generateTexture('egg', r * 2, r * 2);
    g.destroy();
  }

  generateDinoTextures() {
    // Raptor - red aggressive
    this.generateDinoTexture('dino_raptor', 0xff4444, 0xff6666, 'R');

    // Ptero - orange flyer
    this.generateDinoTexture('dino_ptero', 0xff8800, 0xffaa44, 'P');

    // Trike - blue tank
    this.generateDinoTexture('dino_trike', 0x4488ff, 0x66aaff, 'T');

    // Splitter - green that splits
    this.generateSplitterTexture('dino_splitter', 0x00ff88, 0x88ffcc, 55, 45);

    // Baby splitter - smaller
    this.generateSplitterTexture('dino_splitter_baby', 0x88ffbb, 0xbbffdd, 30, 25);

    // Bomber - pink explosive
    this.generateBomberTexture();
  }

  generateBomberTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const w = 50, h = 40;

    // Body - bomb shape
    g.fillStyle(0xff0088);
    g.fillRoundedRect(2, 8, w - 4, h - 12, 8);

    // Head
    g.fillStyle(0xff0088);
    g.fillCircle(w / 2, 12, 10);

    // Fuse/wick
    g.lineStyle(3, 0xffaa00);
    g.lineBetween(w / 2, 2, w / 2 + 8, 6);

    // Spark at end
    g.fillStyle(0xffff00);
    g.fillCircle(w / 2 + 8, 6, 4);
    g.fillStyle(0xffffff);
    g.fillCircle(w / 2 + 8, 5, 2);

    // Eyes - angry/determined
    g.fillStyle(0xffffff);
    g.fillCircle(w / 2 - 5, 12, 4);
    g.fillCircle(w / 2 + 5, 12, 4);

    // Pupils
    g.fillStyle(0x000000);
    g.fillCircle(w / 2 - 4, 13, 2);
    g.fillCircle(w / 2 + 6, 13, 2);

    // Warning stripes
    g.fillStyle(0xff88aa, 0.5);
    for (let i = 0; i < 3; i++) {
      g.fillRect(10 + i * 12, h - 10, 6, 6);
    }

    g.generateTexture('dino_bomber', w, h);
    g.destroy();
  }

  generateSplitterTexture(key, mainColor, highlightColor, w, h) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Body with split line
    g.fillStyle(mainColor);
    g.fillRoundedRect(2, 8, w - 4, h - 12, 6);

    // Head (two bumps to suggest splitting)
    g.fillStyle(mainColor);
    g.fillCircle(w / 3, 10, 8);
    g.fillCircle(w * 2 / 3, 10, 8);

    // Split line down middle
    g.lineStyle(2, 0xffffff, 0.5);
    g.lineBetween(w / 2, 4, w / 2, h - 4);

    // Eyes (two pairs)
    g.fillStyle(0xffffff);
    g.fillCircle(w / 3, 8, 3);
    g.fillCircle(w * 2 / 3, 8, 3);

    // Pupils
    g.fillStyle(0x000000);
    g.fillCircle(w / 3 + 1, 9, 1.5);
    g.fillCircle(w * 2 / 3 + 1, 9, 1.5);

    // Highlight
    g.fillStyle(highlightColor, 0.5);
    g.fillRoundedRect(6, 12, w - 12, 8, 3);

    g.generateTexture(key, w, h);
    g.destroy();
  }

  generateDinoTexture(key, mainColor, highlightColor, label) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const w = 50, h = 40;

    // Body
    g.fillStyle(mainColor);
    g.fillRoundedRect(2, 8, w - 4, h - 12, 6);

    // Head bump
    g.fillStyle(mainColor);
    g.fillCircle(w / 2, 10, 12);

    // Eyes
    g.fillStyle(0xffffff);
    g.fillCircle(w / 2 - 6, 8, 4);
    g.fillCircle(w / 2 + 6, 8, 4);

    // Pupils
    g.fillStyle(0x000000);
    g.fillCircle(w / 2 - 5, 9, 2);
    g.fillCircle(w / 2 + 7, 9, 2);

    // Teeth/spikes
    g.fillStyle(highlightColor);
    for (let i = 0; i < 5; i++) {
      g.fillTriangle(
        8 + i * 9, h - 4,
        12 + i * 9, h - 12,
        16 + i * 9, h - 4
      );
    }

    // Highlight
    g.fillStyle(highlightColor, 0.5);
    g.fillRoundedRect(6, 12, w - 12, 8, 3);

    g.generateTexture(key, w, h);
    g.destroy();
  }

  generateBumperTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const r = 35;

    // Outer ring
    g.lineStyle(4, 0xff00ff);
    g.strokeCircle(r, r, r - 2);

    // Inner fill
    g.fillStyle(0xff00ff, 0.6);
    g.fillCircle(r, r, r - 6);

    // Highlight
    g.fillStyle(0xff88ff);
    g.fillCircle(r - 8, r - 8, 10);

    // Center
    g.fillStyle(0xffffff);
    g.fillCircle(r, r, 8);

    g.generateTexture('bumper', r * 2, r * 2);
    g.destroy();
  }

  generateWormholeTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const r = 35;

    // Outer swirl
    g.lineStyle(3, 0x00ffff, 0.8);
    g.strokeCircle(r, r, r - 2);
    g.lineStyle(2, 0x00ffff, 0.5);
    g.strokeCircle(r, r, r - 8);
    g.lineStyle(2, 0x00ffff, 0.3);
    g.strokeCircle(r, r, r - 14);

    // Black hole center
    g.fillStyle(0x000022);
    g.fillCircle(r, r, r - 18);

    // Event horizon glow
    g.fillStyle(0x0088ff, 0.5);
    g.fillCircle(r, r, 8);

    g.generateTexture('wormhole', r * 2, r * 2);
    g.destroy();
  }
}
