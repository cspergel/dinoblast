// src/scenes/MenuScene.js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { DIFFICULTY, DIFFICULTY_ORDER } from '../config/difficulty.js';
import { Starfield } from '../entities/Starfield.js';
import { soundManager } from '../systems/SoundManager.js';
import { storageManager } from '../systems/StorageManager.js';
import { EGG_SKINS, ACHIEVEMENTS } from '../config/achievements.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Starfield background
    this.starfield = new Starfield(this);

    // Selected difficulty
    this.selectedDifficulty = 'NORMAL';

    // Title with glow effect
    const title = this.add.text(GAME_WIDTH / 2, 120, 'DINO RIFT DEFENDER', {
      fontSize: '42px',
      fontFamily: 'Arial Black',
      color: '#00ff88',
    }).setOrigin(0.5);

    // Title pulse animation
    this.tweens.add({
      targets: title,
      scale: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 180, 'Protect Earth from Space Dinos!', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Difficulty selector
    this.add.text(GAME_WIDTH / 2, 260, 'SELECT DIFFICULTY', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#888888',
    }).setOrigin(0.5);

    this.difficultyButtons = [];
    this.createDifficultyButtons();

    // Play button
    const playButton = this.add.text(GAME_WIDTH / 2, 420, '[ START GAME ]', {
      fontSize: '28px',
      fontFamily: 'Arial Black',
      color: '#ffff00',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playButton.on('pointerover', () => {
      playButton.setColor('#ffffff');
      playButton.setScale(1.1);
    });
    playButton.on('pointerout', () => {
      playButton.setColor('#ffff00');
      playButton.setScale(1);
    });
    playButton.on('pointerdown', () => this.startGame());

    // Keyboard shortcut
    this.input.keyboard.on('keydown-SPACE', () => this.startGame());
    this.input.keyboard.on('keydown-ENTER', () => this.startGame());

    // Left/Right to change difficulty
    this.input.keyboard.on('keydown-LEFT', () => this.changeDifficulty(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.changeDifficulty(1));

    // Daily Challenge button
    const dailyBtn = this.add.text(GAME_WIDTH / 2, 470, '[ DAILY CHALLENGE ]', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ff8800',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    dailyBtn.on('pointerover', () => dailyBtn.setColor('#ffffff'));
    dailyBtn.on('pointerout', () => dailyBtn.setColor('#ff8800'));
    dailyBtn.on('pointerdown', () => this.startDailyChallenge());

    // High Score display
    const highScore = storageManager.getHighScore();
    const highWave = storageManager.getHighWave();
    this.add.text(GAME_WIDTH / 2, 520, `HIGH SCORE: ${highScore}  |  BEST WAVE: ${highWave}`, {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      color: '#ffcc00',
    }).setOrigin(0.5);

    // Instructions
    this.add.text(GAME_WIDTH / 2, 560, 'Arrow Keys / A,D = Move   |   Space = Launch   |   ESC = Pause', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#666666',
      align: 'center',
    }).setOrigin(0.5);

    // Sound toggle button (top right)
    this.createSoundToggle();

    // Egg skin selector
    this.createSkinSelector();

    // Floating dino decoration
    this.createFloatingDino();
  }

  createSoundToggle() {
    const soundOn = storageManager.getSetting('soundEnabled');
    this.soundBtn = this.add.text(GAME_WIDTH - 20, 20, soundOn ? '🔊' : '🔇', {
      fontSize: '28px',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    this.soundBtn.on('pointerdown', () => {
      const newState = storageManager.toggleSetting('soundEnabled');
      this.soundBtn.setText(newState ? '🔊' : '🔇');
      soundManager.setEnabled(newState);
    });
  }

  createSkinSelector() {
    const unlockedAchievements = storageManager.getUnlockedAchievements();
    const selectedSkin = storageManager.getSelectedSkin();
    const skinKeys = Object.keys(EGG_SKINS);

    // Position on left side
    const startX = 60;
    const startY = 200;

    this.add.text(startX, startY - 25, 'EGG SKIN', {
      fontSize: '14px',
      fontFamily: 'Arial Black',
      color: '#888888',
    });

    this.skinButtons = [];
    const iconSize = 32;
    const padding = 8;

    skinKeys.forEach((skinId, index) => {
      const skin = EGG_SKINS[skinId];
      const x = startX + (index % 3) * (iconSize + padding);
      const y = startY + Math.floor(index / 3) * (iconSize + padding);

      // Check if skin is unlocked
      const isUnlocked = skin.unlocked ||
        (skin.requirement && unlockedAchievements.includes(skin.requirement));
      const isSelected = skinId === selectedSkin;

      // Background circle
      const bg = this.add.circle(x, y, iconSize / 2 + 4, 0x333333);
      if (isSelected) {
        bg.setStrokeStyle(3, 0x00ff88);
      } else if (isUnlocked) {
        bg.setStrokeStyle(2, 0x666666);
      }

      // Egg preview (use generated texture)
      const textureKey = `egg_${skinId}`;
      const egg = this.add.sprite(x, y, textureKey);
      egg.setScale(1.2);

      // Lock overlay if not unlocked
      if (!isUnlocked) {
        egg.setAlpha(0.3);
        const lock = this.add.text(x, y, '🔒', {
          fontSize: '14px',
        }).setOrigin(0.5);
      }

      // Make interactive if unlocked
      if (isUnlocked) {
        bg.setInteractive({ useHandCursor: true });

        bg.on('pointerover', () => {
          if (skinId !== storageManager.getSelectedSkin()) {
            bg.setStrokeStyle(2, 0xffffff);
          }
          // Show skin name tooltip
          this.showSkinTooltip(x, y - 30, skin.name);
        });

        bg.on('pointerout', () => {
          if (skinId !== storageManager.getSelectedSkin()) {
            bg.setStrokeStyle(2, 0x666666);
          }
          this.hideSkinTooltip();
        });

        bg.on('pointerdown', () => {
          this.selectSkin(skinId);
          soundManager.init();
          soundManager.playPaddleHit();
        });
      } else {
        // Show requirement on hover for locked skins
        bg.setInteractive({ useHandCursor: false });
        bg.on('pointerover', () => {
          const req = ACHIEVEMENTS[skin.requirement];
          const tooltip = req ? `Unlock: ${req.name}` : 'Locked';
          this.showSkinTooltip(x, y - 30, tooltip);
        });
        bg.on('pointerout', () => {
          this.hideSkinTooltip();
        });
      }

      this.skinButtons.push({ bg, egg, skinId, isUnlocked });
    });
  }

  showSkinTooltip(x, y, text) {
    this.hideSkinTooltip();
    this.skinTooltip = this.add.text(x, y, text, {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5);
  }

  hideSkinTooltip() {
    if (this.skinTooltip) {
      this.skinTooltip.destroy();
      this.skinTooltip = null;
    }
  }

  selectSkin(skinId) {
    storageManager.selectSkin(skinId);

    // Update visual selection
    this.skinButtons.forEach(btn => {
      if (btn.skinId === skinId) {
        btn.bg.setStrokeStyle(3, 0x00ff88);
      } else if (btn.isUnlocked) {
        btn.bg.setStrokeStyle(2, 0x666666);
      }
    });
  }

  startDailyChallenge() {
    soundManager.init();
    soundManager.playPowerup();
    const daily = storageManager.getDailyChallenge();
    this.scene.start('GameScene', {
      difficulty: 'NORMAL',
      dailyChallenge: true,
      seed: daily.seed,
    });
  }

  createDifficultyButtons() {
    const startX = GAME_WIDTH / 2 - 150;
    const y = 320;

    DIFFICULTY_ORDER.forEach((key, index) => {
      const diff = DIFFICULTY[key];
      const x = startX + index * 150;

      const bg = this.add.rectangle(x, y, 120, 50, diff.color, 0.2);
      bg.setStrokeStyle(2, diff.color);

      const text = this.add.text(x, y - 5, diff.name, {
        fontSize: '18px',
        fontFamily: 'Arial Black',
        color: `#${diff.color.toString(16).padStart(6, '0')}`,
      }).setOrigin(0.5);

      const desc = this.add.text(x, y + 15, diff.description, {
        fontSize: '9px',
        fontFamily: 'Arial',
        color: '#888888',
      }).setOrigin(0.5);

      const button = { bg, text, desc, key };
      this.difficultyButtons.push(button);

      // Make interactive
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => this.selectDifficulty(key));
      bg.on('pointerover', () => {
        if (this.selectedDifficulty !== key) {
          bg.setFillStyle(diff.color, 0.3);
        }
      });
      bg.on('pointerout', () => {
        if (this.selectedDifficulty !== key) {
          bg.setFillStyle(diff.color, 0.2);
        }
      });
    });

    this.updateDifficultySelection();
  }

  selectDifficulty(key) {
    this.selectedDifficulty = key;
    this.updateDifficultySelection();
  }

  changeDifficulty(dir) {
    const currentIndex = DIFFICULTY_ORDER.indexOf(this.selectedDifficulty);
    const newIndex = Math.max(0, Math.min(DIFFICULTY_ORDER.length - 1, currentIndex + dir));
    this.selectedDifficulty = DIFFICULTY_ORDER[newIndex];
    this.updateDifficultySelection();
  }

  updateDifficultySelection() {
    this.difficultyButtons.forEach(btn => {
      const isSelected = btn.key === this.selectedDifficulty;
      const diff = DIFFICULTY[btn.key];

      btn.bg.setFillStyle(diff.color, isSelected ? 0.5 : 0.2);
      btn.bg.setStrokeStyle(isSelected ? 4 : 2, diff.color);
      btn.text.setScale(isSelected ? 1.1 : 1);
    });
  }

  createFloatingDino() {
    // Create a simple floating dino decoration
    const dino = this.add.ellipse(650, 150, 50, 40, 0x44ff44);
    const eye = this.add.circle(665, 145, 5, 0xffffff);
    const pupil = this.add.circle(667, 145, 2, 0x000000);

    // Group them
    const container = this.add.container(0, 0, [dino, eye, pupil]);

    // Float animation
    this.tweens.add({
      targets: container,
      y: 20,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Slight rotation
    this.tweens.add({
      targets: container,
      angle: 5,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  startGame() {
    // Initialize sound on first user interaction
    soundManager.init();
    soundManager.playPowerup(); // Play a startup chime
    this.scene.start('GameScene', { difficulty: this.selectedDifficulty });
  }

  update(time, delta) {
    this.starfield.update(time, delta);
  }
}
