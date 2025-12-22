# Dino Rift Defender Implementation Plan - Part 1

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a playable Breakout + Space Invaders + Pinball hybrid with dinosaurs in space

**Architecture:** Phaser 3 game with scene-based structure, manager classes for waves/powerups/mutations, and an asset-swappable config system for easy sprite upgrades later

**Tech Stack:** Phaser 3, Vite, vanilla JavaScript, HTML5 Canvas

**Repository:** https://github.com/cspergel/dinoblast.git

**Domain:** dinoblast.org

**Reference Docs:**
- GDD: `docs/dino-rift-defender-gdd.md`
- Technical Design: `docs/plans/2025-12-21-dino-rift-defender-design.md`

---

# PHASE 1: PLAYABLE CORE

> Reference: GDD Section 4 (Core Loop), Section 8 (Objects + Physics), Section 7 (Loss System)

## Task 1.1: Project Setup

**Goal:** Initialize Vite + Phaser 3 project with folder structure

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/config/gameConfig.js`
- Create: `src/config/sprites.js`

**Step 1: Initialize npm project**

```bash
npm init -y
```

**Step 2: Install dependencies**

```bash
npm install phaser
npm install -D vite
```

**Step 3: Create vite.config.js**

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

**Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dino Rift Defender</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
    }
    canvas { display: block; }
  </style>
</head>
<body>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**Step 5: Create src/config/gameConfig.js**

```javascript
// src/config/gameConfig.js
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const COLORS = {
  background: 0x0a0a1a,
  paddle: 0x00ff88,
  egg: 0xffff00,
  heart: 0xff0000,
  text: 0xffffff,
};

export const PADDLE = {
  width: 120,
  height: 20,
  speed: 400,
  y: 550, // distance from top
};

export const EGG = {
  radius: 10,
  speed: 300,
};

export const DINO = {
  width: 50,
  height: 40,
  spacing: 10,
  marchSpeed: 30,
  descentAmount: 30,
  shootChance: 0.005, // per frame per dino
};

export const BULLET = {
  width: 8,
  height: 16,
  speed: 200,
};

export const EARTH_LINE_Y = 560; // dinos lose heart if they reach here
```

**Step 6: Create src/config/sprites.js**

Reference: Technical Design "Asset-Swappable Architecture" section

```javascript
// src/config/sprites.js
// All visuals defined here - swap to sprite keys later

export const SPRITES = {
  paddle: {
    type: 'rect',
    color: 0x00ff88,
    width: 120,
    height: 20,
    glow: true,
  },

  egg: {
    type: 'circle',
    color: 0xffff00,
    radius: 10,
    trail: true,
  },

  dinos: {
    raptor: {
      type: 'rect',
      color: 0xff4444,
      width: 50,
      height: 40,
      label: 'R',
      hp: 1,
      shootChance: 0.002,
    },
    ptero: {
      type: 'rect',
      color: 0xff8800,
      width: 50,
      height: 40,
      label: 'P',
      hp: 1,
      shootChance: 0.008,
    },
    trike: {
      type: 'rect',
      color: 0x4488ff,
      width: 50,
      height: 40,
      label: 'T',
      hp: 2,
      shootChance: 0.004,
    },
  },

  bullet: {
    type: 'rect',
    color: 0xff00ff,
    width: 8,
    height: 16,
  },

  bumper: {
    type: 'circle',
    color: 0x888888,
    radius: 25,
  },

  wormhole: {
    type: 'circle',
    color: 0x8800ff,
    radius: 30,
  },

  drops: {
    powerup: {
      type: 'rect',
      color: 0x00ffff,
      width: 30,
      height: 20,
    },
    mutation: {
      type: 'rect',
      color: 0xff00ff,
      width: 30,
      height: 20,
    },
  },
};
```

**Step 7: Create src/main.js**

```javascript
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
    },
  },
  scene: [BootScene, MenuScene, GameScene, PauseScene, GameOverScene],
};

const game = new Phaser.Game(config);
```

**Step 8: Update package.json scripts**

```json
{
  "name": "dino-rift-defender",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "phaser": "^3.70.0"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

**Step 9: Verify setup runs**

```bash
npm run dev
```

Expected: Browser opens to localhost:3000, shows black screen (scenes not created yet), no console errors about missing modules.

**Step 10: Commit**

```bash
git add .
git commit -m "feat: initialize Vite + Phaser 3 project structure"
```

---

## Task 1.2: Create Scene Stubs

**Goal:** Create all 5 scene files with basic structure

**Files:**
- Create: `src/scenes/BootScene.js`
- Create: `src/scenes/MenuScene.js`
- Create: `src/scenes/GameScene.js`
- Create: `src/scenes/PauseScene.js`
- Create: `src/scenes/GameOverScene.js`

**Step 1: Create BootScene.js**

```javascript
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
```

**Step 2: Create MenuScene.js**

```javascript
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
```

**Step 3: Create GameScene.js (stub)**

```javascript
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
```

**Step 4: Create PauseScene.js**

```javascript
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

    // Quit button
    const quitButton = this.add.text(GAME_WIDTH / 2, 380, '[ QUIT ]', {
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
```

**Step 5: Create GameOverScene.js**

```javascript
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
```

**Step 6: Verify all scenes load**

```bash
npm run dev
```

Expected:
- App loads to MenuScene with title
- Clicking PLAY or pressing Space goes to GameScene
- Pressing ESC in GameScene shows PauseScene overlay
- Can resume or quit from pause

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add all game scenes with navigation"
```

---

## Task 1.3: Create Paddle Entity

**Goal:** Moveable paddle at bottom of screen

Reference: GDD Section 5 (Controls), Technical Design "Paddle" entity

**Files:**
- Create: `src/entities/Paddle.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create Paddle.js**

```javascript
// src/entities/Paddle.js
import Phaser from 'phaser';
import { GAME_WIDTH, PADDLE } from '../config/gameConfig.js';
import { SPRITES } from '../config/sprites.js';

export class Paddle {
  constructor(scene) {
    this.scene = scene;
    this.baseWidth = PADDLE.width;
    this.baseSpeed = PADDLE.speed;

    // Create paddle graphic
    const spriteConfig = SPRITES.paddle;
    this.gameObject = scene.add.rectangle(
      GAME_WIDTH / 2,
      PADDLE.y,
      spriteConfig.width,
      spriteConfig.height,
      spriteConfig.color
    );

    // Enable physics
    scene.physics.add.existing(this.gameObject);
    this.gameObject.body.setImmovable(true);
    this.gameObject.body.setCollideWorldBounds(true);

    // Input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Shield pips
    this.shieldPips = 0;
  }

  update() {
    const body = this.gameObject.body;

    // Calculate current speed (base + mutations + powerups)
    const currentSpeed = this.getCurrentSpeed();

    // Movement
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      body.setVelocityX(-currentSpeed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      body.setVelocityX(currentSpeed);
    } else {
      body.setVelocityX(0);
    }
  }

  getCurrentSpeed() {
    // Base speed + mutation bonuses (10% per stack) + powerup bonuses
    let speed = this.baseSpeed;
    const mutations = this.scene.mutations || {};
    speed *= (1 + (mutations.speed || 0) * 0.10);

    // Check for active FAST powerup
    const fastPowerup = (this.scene.activePowerups || []).find(p => p.type === 'FAST');
    if (fastPowerup) {
      speed *= 1.4;
    }

    return speed;
  }

  getCurrentWidth() {
    // Base width + mutations (15% per stack) + powerups
    let width = this.baseWidth;
    const mutations = this.scene.mutations || {};
    width *= (1 + (mutations.width || 0) * 0.15);

    // Check for active WIDE powerup
    const widePowerup = (this.scene.activePowerups || []).find(p => p.type === 'WIDE');
    if (widePowerup) {
      width *= 1.5;
    }

    return width;
  }

  updateWidth() {
    const newWidth = this.getCurrentWidth();
    this.gameObject.width = newWidth;
    this.gameObject.body.setSize(newWidth, PADDLE.height);
  }

  addShield(amount = 1) {
    this.shieldPips = Math.min(this.shieldPips + amount, 3);
  }

  hitByBullet() {
    if (this.shieldPips > 0) {
      this.shieldPips--;
      return false; // No damage taken
    }
    return true; // Damage taken
  }

  get x() { return this.gameObject.x; }
  get y() { return this.gameObject.y; }
  get width() { return this.gameObject.width; }
  get body() { return this.gameObject.body; }
}
```

**Step 2: Update GameScene.js to use Paddle**

```javascript
// src/scenes/GameScene.js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, PADDLE, EGG } from '../config/gameConfig.js';
import { Paddle } from '../entities/Paddle.js';

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
    // Create paddle
    this.paddle = new Paddle(this);

    // ESC to pause
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.launch('PauseScene');
      this.scene.pause();
    });

    // Temporary: show hearts
    this.heartsText = this.add.text(20, 20, `Hearts: ${this.hearts}`, {
      fontSize: '20px',
      color: '#ff0000',
    });

    this.scoreText = this.add.text(GAME_WIDTH - 150, 20, `Score: ${this.score}`, {
      fontSize: '20px',
      color: '#ffffff',
    });
  }

  update(time, delta) {
    // Update paddle
    this.paddle.update();
  }
}
```

**Step 3: Verify paddle moves**

```bash
npm run dev
```

Expected:
- Green paddle visible at bottom of screen
- Left/Right arrows move paddle
- A/D keys also move paddle
- Paddle stops at screen edges

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add moveable paddle with mutation/powerup speed support"
```

---

## Task 1.4: Create Meteor Egg (Ball)

**Goal:** Bouncing ball that launches from paddle

Reference: GDD Section 8.2 (Meteor Egg Behavior)

**Files:**
- Create: `src/entities/MeteorEgg.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create MeteorEgg.js**

```javascript
// src/entities/MeteorEgg.js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, EGG, PADDLE } from '../config/gameConfig.js';
import { SPRITES } from '../config/sprites.js';

export class MeteorEgg {
  constructor(scene, x, y) {
    this.scene = scene;
    this.launched = false;
    this.piercing = false; // From Comet Core powerup
    this.stuck = false; // From Magnet mutation

    // Create egg graphic
    const spriteConfig = SPRITES.egg;
    this.gameObject = scene.add.circle(x, y, spriteConfig.radius, spriteConfig.color);

    // Enable physics
    scene.physics.add.existing(this.gameObject);
    this.gameObject.body.setCircle(spriteConfig.radius);
    this.gameObject.body.setBounce(1, 1);
    this.gameObject.body.setCollideWorldBounds(true);

    // Lose heart if ball goes off bottom (handled in GameScene)
    this.gameObject.body.onWorldBounds = true;
  }

  launch(angle = -90) {
    if (this.launched) return;

    this.launched = true;
    const speed = this.getCurrentSpeed();

    // Convert angle to velocity
    const radians = Phaser.Math.DegToRad(angle);
    const vx = Math.cos(radians) * speed;
    const vy = Math.sin(radians) * speed;

    this.gameObject.body.setVelocity(vx, vy);
  }

  getCurrentSpeed() {
    let speed = EGG.speed;

    // Check for SPRING powerup
    const springPowerup = (this.scene.activePowerups || []).find(p => p.type === 'SPRING');
    if (springPowerup) {
      speed *= 1.3;
    }

    return speed;
  }

  stickToPaddle(paddle) {
    this.launched = false;
    this.stuck = true;
    this.gameObject.body.setVelocity(0, 0);
    this.gameObject.x = paddle.x;
    this.gameObject.y = paddle.y - PADDLE.height / 2 - EGG.radius - 5;
  }

  followPaddle(paddle) {
    if (!this.launched) {
      this.gameObject.x = paddle.x;
      this.gameObject.y = paddle.y - PADDLE.height / 2 - EGG.radius - 5;
    }
  }

  bounceOffPaddle(paddle) {
    // Calculate bounce angle based on where ball hit paddle
    const hitPosition = (this.gameObject.x - paddle.x) / (paddle.width / 2);
    // hitPosition: -1 (left edge) to 1 (right edge)

    // Angle range: -150 (far left) to -30 (far right)
    const angle = -90 + (hitPosition * 60);

    const speed = this.getCurrentSpeed();
    const radians = Phaser.Math.DegToRad(angle);

    this.gameObject.body.setVelocity(
      Math.cos(radians) * speed,
      Math.sin(radians) * speed
    );

    // Check for magnet mutation
    if (this.scene.mutations?.magnet > 0) {
      this.stickToPaddle(paddle);
    }
  }

  get x() { return this.gameObject.x; }
  get y() { return this.gameObject.y; }
  get body() { return this.gameObject.body; }

  destroy() {
    this.gameObject.destroy();
  }
}
```

**Step 2: Update GameScene.js for egg**

```javascript
// src/scenes/GameScene.js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, PADDLE, EGG } from '../config/gameConfig.js';
import { Paddle } from '../entities/Paddle.js';
import { MeteorEgg } from '../entities/MeteorEgg.js';

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
    this.eggs = [];
  }

  create() {
    // Create paddle
    this.paddle = new Paddle(this);

    // Create initial egg
    this.spawnEgg();

    // Setup collisions
    this.setupCollisions();

    // Input for launching
    this.input.keyboard.on('keydown-SPACE', () => this.launchEgg());

    // ESC to pause
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.launch('PauseScene');
      this.scene.pause();
    });

    // Temporary HUD
    this.heartsText = this.add.text(20, 20, `Hearts: ${this.hearts}`, {
      fontSize: '20px',
      color: '#ff0000',
    });

    this.scoreText = this.add.text(GAME_WIDTH - 150, 20, `Score: ${this.score}`, {
      fontSize: '20px',
      color: '#ffffff',
    });
  }

  spawnEgg() {
    const egg = new MeteorEgg(
      this,
      this.paddle.x,
      this.paddle.y - PADDLE.height / 2 - EGG.radius - 5
    );
    this.eggs.push(egg);
    return egg;
  }

  launchEgg() {
    this.eggs.forEach(egg => {
      if (!egg.launched) {
        egg.launch();
      }
    });
  }

  setupCollisions() {
    // Ball vs paddle
    this.eggs.forEach(egg => {
      this.physics.add.collider(
        egg.gameObject,
        this.paddle.gameObject,
        (eggObj, paddleObj) => {
          egg.bounceOffPaddle(this.paddle);
        }
      );
    });

    // Ball hitting bottom of world
    this.physics.world.on('worldbounds', (body, up, down, left, right) => {
      if (down) {
        this.onEggLost(body.gameObject);
      }
    });
  }

  onEggLost(eggGameObject) {
    // Find and remove the egg
    const eggIndex = this.eggs.findIndex(e => e.gameObject === eggGameObject);
    if (eggIndex !== -1) {
      this.eggs[eggIndex].destroy();
      this.eggs.splice(eggIndex, 1);
    }

    // If no eggs left, lose a heart
    if (this.eggs.length === 0) {
      this.loseHeart();

      if (this.hearts > 0) {
        // Spawn new egg
        this.spawnEgg();
        this.setupCollisions(); // Re-setup collisions for new egg
      }
    }
  }

  loseHeart() {
    this.hearts--;
    this.heartsText.setText(`Hearts: ${this.hearts}`);

    // Lose random mutation stack
    this.loseRandomMutation();

    if (this.hearts <= 0) {
      this.gameOver(false);
    }
  }

  loseRandomMutation() {
    const mutationKeys = Object.keys(this.mutations).filter(k => this.mutations[k] > 0);
    if (mutationKeys.length > 0) {
      const randomKey = Phaser.Utils.Array.GetRandom(mutationKeys);
      this.mutations[randomKey]--;
      this.paddle.updateWidth();
    }
  }

  gameOver(won) {
    this.scene.start('GameOverScene', {
      score: this.score,
      wave: this.currentWave,
      won: won,
    });
  }

  update(time, delta) {
    // Update paddle
    this.paddle.update();

    // Make unlaunched eggs follow paddle
    this.eggs.forEach(egg => {
      if (!egg.launched) {
        egg.followPaddle(this.paddle);
      }
    });
  }
}
```

**Step 3: Verify egg works**

```bash
npm run dev
```

Expected:
- Yellow egg sits on paddle
- Pressing Space launches egg upward
- Egg bounces off walls and paddle
- Egg hitting bottom loses a heart
- New egg spawns after losing one
- Game over at 0 hearts

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add meteor egg with paddle bounce physics"
```

---

## Task 1.5: Create Dino Entity

**Goal:** Single dino class supporting all 3 types

Reference: GDD Section 9 (Enemies)

**Files:**
- Create: `src/entities/Dino.js`

**Step 1: Create Dino.js**

```javascript
// src/entities/Dino.js
import Phaser from 'phaser';
import { SPRITES } from '../config/sprites.js';
import { DINO, BULLET } from '../config/gameConfig.js';

export class Dino {
  constructor(scene, x, y, type = 'raptor') {
    this.scene = scene;
    this.type = type;
    this.config = SPRITES.dinos[type];

    // HP based on type
    this.maxHp = this.config.hp;
    this.hp = this.maxHp;
    this.cracked = false; // For armored dinos showing damage

    // Create dino graphic
    this.gameObject = scene.add.rectangle(
      x, y,
      this.config.width,
      this.config.height,
      this.config.color
    );

    // Add label
    this.label = scene.add.text(x, y, this.config.label, {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Enable physics
    scene.physics.add.existing(this.gameObject);
    this.gameObject.body.setImmovable(true);

    // Shooting timer
    this.shootTimer = 0;
    this.shootChance = this.config.shootChance;

    // Store reference to this Dino on the game object for collision handling
    this.gameObject.dinoRef = this;
  }

  update(delta) {
    // Update label position
    this.label.x = this.gameObject.x;
    this.label.y = this.gameObject.y;

    // Shooting logic
    if (Math.random() < this.shootChance) {
      this.shoot();
    }
  }

  shoot() {
    // Create bullet
    const bullet = this.scene.add.rectangle(
      this.gameObject.x,
      this.gameObject.y + this.config.height / 2 + 5,
      BULLET.width,
      BULLET.height,
      SPRITES.bullet.color
    );

    this.scene.physics.add.existing(bullet);
    bullet.body.setVelocityY(BULLET.speed);

    // Add to scene's bullets array
    if (this.scene.bullets) {
      this.scene.bullets.push(bullet);
    }
  }

  hit() {
    this.hp--;

    if (this.hp > 0) {
      // Show cracked state for armored dinos
      this.cracked = true;
      this.gameObject.setAlpha(0.6);
      return false; // Not dead yet
    }

    return true; // Dead
  }

  getScoreValue() {
    switch (this.type) {
      case 'raptor': return 10;
      case 'ptero': return 14;
      case 'trike': return 18;
      default: return 10;
    }
  }

  destroy() {
    this.label.destroy();
    this.gameObject.destroy();
  }

  get x() { return this.gameObject.x; }
  get y() { return this.gameObject.y; }
  set x(val) { this.gameObject.x = val; }
  set y(val) { this.gameObject.y = val; }
  get body() { return this.gameObject.body; }
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add Dino entity with types (raptor, ptero, trike)"
```

---

## Task 1.6: Create Wave Manager

**Goal:** Spawn and manage dino grid, handle marching

Reference: GDD Section 13 (Level/Wave Design), Appendix (Wave Data Schema)

**Files:**
- Create: `src/systems/WaveManager.js`
- Create: `src/data/waves.json`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create waves.json**

```json
{
  "waves": [
    {
      "waveId": 1,
      "name": "Training Orbit",
      "grid": {
        "rows": 3,
        "cols": 8,
        "layout": [
          ["raptor", "raptor", "raptor", "raptor", "raptor", "raptor", "raptor", "raptor"],
          ["raptor", "raptor", "ptero", "raptor", "raptor", "ptero", "raptor", "raptor"],
          ["raptor", "raptor", "raptor", "raptor", "raptor", "raptor", "raptor", "raptor"]
        ]
      },
      "marchSpeed": 30,
      "descentRate": 30,
      "bulletFrequency": 0.3,
      "pinball": {
        "bumpers": [],
        "wormholes": []
      },
      "dropRates": {
        "timedPowerup": 0.15,
        "mutation": 0.05
      }
    },
    {
      "waveId": 2,
      "name": "Asteroid Garden",
      "grid": {
        "rows": 3,
        "cols": 8,
        "layout": [
          ["raptor", "ptero", "raptor", "raptor", "raptor", "raptor", "ptero", "raptor"],
          ["raptor", "raptor", "raptor", "trike", "trike", "raptor", "raptor", "raptor"],
          ["ptero", "raptor", "raptor", "raptor", "raptor", "raptor", "raptor", "ptero"]
        ]
      },
      "marchSpeed": 35,
      "descentRate": 30,
      "bulletFrequency": 0.4,
      "pinball": {
        "bumpers": [
          { "x": 200, "y": 250 },
          { "x": 400, "y": 200 },
          { "x": 600, "y": 250 }
        ],
        "wormholes": []
      },
      "dropRates": {
        "timedPowerup": 0.18,
        "mutation": 0.06
      }
    },
    {
      "waveId": 3,
      "name": "Wormhole Peekaboo",
      "grid": {
        "rows": 4,
        "cols": 8,
        "layout": [
          ["raptor", "raptor", "ptero", "raptor", "raptor", "ptero", "raptor", "raptor"],
          ["raptor", "trike", "raptor", "raptor", "raptor", "raptor", "trike", "raptor"],
          ["ptero", "raptor", "raptor", "ptero", "ptero", "raptor", "raptor", "ptero"],
          ["raptor", "raptor", "raptor", "raptor", "raptor", "raptor", "raptor", "raptor"]
        ]
      },
      "marchSpeed": 40,
      "descentRate": 35,
      "bulletFrequency": 0.45,
      "pinball": {
        "bumpers": [
          { "x": 300, "y": 280 }
        ],
        "wormholes": [
          { "x1": 100, "y1": 300, "x2": 700, "y2": 300 }
        ]
      },
      "dropRates": {
        "timedPowerup": 0.20,
        "mutation": 0.08
      }
    },
    {
      "waveId": 4,
      "name": "Spitter Rain",
      "grid": {
        "rows": 4,
        "cols": 8,
        "layout": [
          ["ptero", "ptero", "ptero", "ptero", "ptero", "ptero", "ptero", "ptero"],
          ["raptor", "raptor", "raptor", "raptor", "raptor", "raptor", "raptor", "raptor"],
          ["ptero", "raptor", "ptero", "raptor", "raptor", "ptero", "raptor", "ptero"],
          ["raptor", "raptor", "raptor", "raptor", "raptor", "raptor", "raptor", "raptor"]
        ]
      },
      "marchSpeed": 45,
      "descentRate": 35,
      "bulletFrequency": 0.6,
      "pinball": {
        "bumpers": [
          { "x": 400, "y": 320 }
        ],
        "wormholes": []
      },
      "dropRates": {
        "timedPowerup": 0.22,
        "mutation": 0.08
      }
    },
    {
      "waveId": 5,
      "name": "Armor Row",
      "grid": {
        "rows": 4,
        "cols": 8,
        "layout": [
          ["trike", "trike", "trike", "trike", "trike", "trike", "trike", "trike"],
          ["raptor", "ptero", "raptor", "raptor", "raptor", "raptor", "ptero", "raptor"],
          ["raptor", "raptor", "ptero", "raptor", "raptor", "ptero", "raptor", "raptor"],
          ["ptero", "raptor", "raptor", "raptor", "raptor", "raptor", "raptor", "ptero"]
        ]
      },
      "marchSpeed": 45,
      "descentRate": 40,
      "bulletFrequency": 0.5,
      "pinball": {
        "bumpers": [
          { "x": 200, "y": 350 },
          { "x": 600, "y": 350 }
        ],
        "wormholes": []
      },
      "dropRates": {
        "timedPowerup": 0.20,
        "mutation": 0.10
      }
    },
    {
      "waveId": 6,
      "name": "Pinball Lane",
      "grid": {
        "rows": 3,
        "cols": 8,
        "layout": [
          ["raptor", "raptor", "trike", "raptor", "raptor", "trike", "raptor", "raptor"],
          ["ptero", "raptor", "raptor", "ptero", "ptero", "raptor", "raptor", "ptero"],
          ["raptor", "trike", "raptor", "raptor", "raptor", "raptor", "trike", "raptor"]
        ]
      },
      "marchSpeed": 50,
      "descentRate": 40,
      "bulletFrequency": 0.5,
      "pinball": {
        "bumpers": [
          { "x": 150, "y": 280 },
          { "x": 300, "y": 350 },
          { "x": 500, "y": 350 },
          { "x": 650, "y": 280 }
        ],
        "wormholes": [
          { "x1": 100, "y1": 400, "x2": 700, "y2": 400 }
        ]
      },
      "dropRates": {
        "timedPowerup": 0.22,
        "mutation": 0.10
      }
    },
    {
      "waveId": 7,
      "name": "Slow-Mo Fossil",
      "grid": {
        "rows": 4,
        "cols": 8,
        "layout": [
          ["raptor", "ptero", "raptor", "trike", "trike", "raptor", "ptero", "raptor"],
          ["ptero", "raptor", "ptero", "raptor", "raptor", "ptero", "raptor", "ptero"],
          ["raptor", "raptor", "raptor", "ptero", "ptero", "raptor", "raptor", "raptor"],
          ["trike", "raptor", "raptor", "raptor", "raptor", "raptor", "raptor", "trike"]
        ]
      },
      "marchSpeed": 55,
      "descentRate": 45,
      "bulletFrequency": 0.55,
      "pinball": {
        "bumpers": [
          { "x": 400, "y": 300 }
        ],
        "wormholes": []
      },
      "dropRates": {
        "timedPowerup": 0.30,
        "mutation": 0.10
      },
      "specialDrops": ["SLOW"]
    },
    {
      "waveId": 8,
      "name": "Multi-Egg Mayhem",
      "grid": {
        "rows": 4,
        "cols": 8,
        "layout": [
          ["ptero", "raptor", "ptero", "raptor", "raptor", "ptero", "raptor", "ptero"],
          ["raptor", "trike", "raptor", "ptero", "ptero", "raptor", "trike", "raptor"],
          ["ptero", "raptor", "raptor", "raptor", "raptor", "raptor", "raptor", "ptero"],
          ["raptor", "raptor", "trike", "raptor", "raptor", "trike", "raptor", "raptor"]
        ]
      },
      "marchSpeed": 55,
      "descentRate": 45,
      "bulletFrequency": 0.6,
      "pinball": {
        "bumpers": [
          { "x": 250, "y": 320 },
          { "x": 550, "y": 320 }
        ],
        "wormholes": [
          { "x1": 150, "y1": 380, "x2": 650, "y2": 380 }
        ]
      },
      "dropRates": {
        "timedPowerup": 0.28,
        "mutation": 0.12
      },
      "specialDrops": ["MULTI"]
    },
    {
      "waveId": 9,
      "name": "Gravity Drift",
      "grid": {
        "rows": 5,
        "cols": 8,
        "layout": [
          ["trike", "raptor", "ptero", "raptor", "raptor", "ptero", "raptor", "trike"],
          ["raptor", "ptero", "raptor", "trike", "trike", "raptor", "ptero", "raptor"],
          ["ptero", "raptor", "raptor", "raptor", "raptor", "raptor", "raptor", "ptero"],
          ["raptor", "raptor", "ptero", "raptor", "raptor", "ptero", "raptor", "raptor"],
          ["trike", "raptor", "raptor", "ptero", "ptero", "raptor", "raptor", "trike"]
        ]
      },
      "marchSpeed": 60,
      "descentRate": 50,
      "bulletFrequency": 0.65,
      "pinball": {
        "bumpers": [
          { "x": 200, "y": 350 },
          { "x": 400, "y": 280 },
          { "x": 600, "y": 350 }
        ],
        "wormholes": [
          { "x1": 100, "y1": 420, "x2": 700, "y2": 420 }
        ],
        "gravityWells": [
          { "x": 400, "y": 350, "strength": 50 }
        ]
      },
      "dropRates": {
        "timedPowerup": 0.25,
        "mutation": 0.12
      }
    },
    {
      "waveId": 10,
      "name": "Mothership Rex",
      "isBoss": true,
      "boss": {
        "type": "mothershipRex",
        "hp": 15,
        "weakPoints": 3,
        "phases": [
          { "hpThreshold": 15, "pattern": "spray", "speed": 1.0 },
          { "hpThreshold": 10, "pattern": "burst", "speed": 1.2 },
          { "hpThreshold": 5, "pattern": "aimed", "speed": 1.5 }
        ]
      },
      "pinball": {
        "bumpers": [
          { "x": 200, "y": 400 },
          { "x": 600, "y": 400 }
        ],
        "wormholes": []
      },
      "dropRates": {
        "timedPowerup": 0.20,
        "mutation": 0.15
      }
    }
  ]
}
```

**Step 2: Create WaveManager.js**

```javascript
// src/systems/WaveManager.js
import { Dino } from '../entities/Dino.js';
import { GAME_WIDTH, GAME_HEIGHT, DINO, EARTH_LINE_Y } from '../config/gameConfig.js';
import waveData from '../data/waves.json';

export class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.dinos = [];
    this.currentWaveIndex = 0;
    this.currentWaveData = null;

    // March state
    this.marchDirection = 1; // 1 = right, -1 = left
    this.marchTimer = 0;
    this.marchInterval = 1000; // ms between march steps

    // Grid bounds
    this.gridLeft = 0;
    this.gridRight = 0;
  }

  loadWave(waveNumber) {
    // Clear existing dinos
    this.dinos.forEach(dino => dino.destroy());
    this.dinos = [];

    // Get wave data
    this.currentWaveIndex = waveNumber - 1;
    this.currentWaveData = waveData.waves[this.currentWaveIndex];

    if (!this.currentWaveData) {
      console.error(`Wave ${waveNumber} not found`);
      return false;
    }

    // Handle boss wave separately
    if (this.currentWaveData.isBoss) {
      this.scene.startBossFight(this.currentWaveData);
      return true;
    }

    // Spawn dino grid
    this.spawnGrid();

    // Update march interval based on wave speed
    this.marchInterval = 1000 / (this.currentWaveData.marchSpeed / 30);

    return true;
  }

  spawnGrid() {
    const grid = this.currentWaveData.grid;
    const startX = (GAME_WIDTH - (grid.cols * (DINO.width + DINO.spacing))) / 2 + DINO.width / 2;
    const startY = 80;

    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const dinoType = grid.layout[row][col];
        if (dinoType) {
          const x = startX + col * (DINO.width + DINO.spacing);
          const y = startY + row * (DINO.height + DINO.spacing);

          const dino = new Dino(this.scene, x, y, dinoType);
          this.dinos.push(dino);
        }
      }
    }

    this.updateGridBounds();
  }

  updateGridBounds() {
    if (this.dinos.length === 0) return;

    this.gridLeft = Math.min(...this.dinos.map(d => d.x - DINO.width / 2));
    this.gridRight = Math.max(...this.dinos.map(d => d.x + DINO.width / 2));
  }

  update(time, delta) {
    // Update march timer
    this.marchTimer += delta;

    // Check for SLOW powerup
    let timeScale = 1;
    const slowPowerup = this.scene.activePowerups?.find(p => p.type === 'SLOW');
    if (slowPowerup) {
      timeScale = 0.7;
    }

    if (this.marchTimer >= this.marchInterval / timeScale) {
      this.marchTimer = 0;
      this.marchStep();
    }

    // Update individual dinos (shooting, etc.)
    this.dinos.forEach(dino => dino.update(delta));

    // Check if dinos reached earth line
    this.checkEarthLine();
  }

  marchStep() {
    if (this.dinos.length === 0) return;

    this.updateGridBounds();

    // Check if we need to change direction and descend
    const margin = 20;
    const needsReverse = (
      (this.marchDirection > 0 && this.gridRight >= GAME_WIDTH - margin) ||
      (this.marchDirection < 0 && this.gridLeft <= margin)
    );

    if (needsReverse) {
      // Descend and reverse
      this.dinos.forEach(dino => {
        dino.y += this.currentWaveData.descentRate;
      });
      this.marchDirection *= -1;
    } else {
      // Move horizontally
      const moveAmount = this.marchDirection * (this.currentWaveData.marchSpeed / 2);
      this.dinos.forEach(dino => {
        dino.x += moveAmount;
      });
    }
  }

  checkEarthLine() {
    const dinosAtEarth = this.dinos.filter(dino =>
      dino.y + DINO.height / 2 >= EARTH_LINE_Y
    );

    dinosAtEarth.forEach(dino => {
      this.removeDino(dino);
      this.scene.loseHeart();
    });
  }

  removeDino(dino) {
    const index = this.dinos.indexOf(dino);
    if (index !== -1) {
      // Chance to drop powerup
      this.scene.trySpawnDrop(dino.x, dino.y);

      // Add score
      this.scene.addScore(dino.getScoreValue());

      dino.destroy();
      this.dinos.splice(index, 1);
    }
  }

  hitDino(dino) {
    const isDead = dino.hit();
    if (isDead) {
      this.removeDino(dino);
    }
    return isDead;
  }

  isWaveCleared() {
    return this.dinos.length === 0;
  }

  getDropRates() {
    return this.currentWaveData?.dropRates || { timedPowerup: 0.15, mutation: 0.05 };
  }

  getDinoGroup() {
    return this.dinos.map(d => d.gameObject);
  }
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add WaveManager with 10 wave definitions"
```

---

## Task 1.7: Integrate Wave Manager into GameScene

**Goal:** Spawn dinos, handle collisions, complete core loop

**Files:**
- Modify: `src/scenes/GameScene.js`

**Step 1: Update GameScene.js with full integration**

```javascript
// src/scenes/GameScene.js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PADDLE, EGG, EARTH_LINE_Y } from '../config/gameConfig.js';
import { Paddle } from '../entities/Paddle.js';
import { MeteorEgg } from '../entities/MeteorEgg.js';
import { WaveManager } from '../systems/WaveManager.js';

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
    this.eggs = [];
    this.bullets = [];
    this.isWaveTransition = false;
  }

  create() {
    // Create paddle
    this.paddle = new Paddle(this);

    // Create wave manager
    this.waveManager = new WaveManager(this);

    // Create initial egg
    this.spawnEgg();

    // Draw earth line (visual reference)
    this.add.line(0, EARTH_LINE_Y, 0, 0, GAME_WIDTH, 0, 0xff0000, 0.3)
      .setOrigin(0, 0);

    // Load first wave
    this.waveManager.loadWave(this.currentWave);

    // Setup collisions
    this.setupCollisions();

    // Input
    this.input.keyboard.on('keydown-SPACE', () => this.launchEgg());
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.launch('PauseScene');
      this.scene.pause();
    });
    this.input.keyboard.on('keydown-R', () => this.scene.restart());

    // HUD
    this.createHUD();

    // Show wave name
    this.showWaveCard();
  }

  createHUD() {
    // Hearts
    this.heartsText = this.add.text(20, 20, this.getHeartsDisplay(), {
      fontSize: '24px',
      color: '#ff4444',
    });

    // Wave
    this.waveText = this.add.text(GAME_WIDTH / 2, 20, `Wave ${this.currentWave}`, {
      fontSize: '20px',
      color: '#888888',
    }).setOrigin(0.5, 0);

    // Score
    this.scoreText = this.add.text(GAME_WIDTH - 20, 20, `${this.score}`, {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(1, 0);
  }

  getHeartsDisplay() {
    return '♥'.repeat(this.hearts) + '♡'.repeat(3 - this.hearts);
  }

  showWaveCard() {
    const waveName = this.waveManager.currentWaveData?.name || `Wave ${this.currentWave}`;

    const card = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, waveName, {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#00ff88',
    }).setOrigin(0.5).setAlpha(1);

    this.tweens.add({
      targets: card,
      alpha: 0,
      duration: 2000,
      delay: 1000,
      onComplete: () => card.destroy(),
    });
  }

  spawnEgg() {
    const egg = new MeteorEgg(
      this,
      this.paddle.x,
      this.paddle.y - PADDLE.height / 2 - EGG.radius - 5
    );
    this.eggs.push(egg);
    this.setupEggCollisions(egg);
    return egg;
  }

  launchEgg() {
    this.eggs.forEach(egg => {
      if (!egg.launched) {
        egg.launch();
      }
    });
  }

  setupCollisions() {
    // Ball hitting bottom
    this.physics.world.on('worldbounds', (body, up, down, left, right) => {
      if (down) {
        this.onEggLost(body.gameObject);
      }
    });
  }

  setupEggCollisions(egg) {
    // Egg vs paddle
    this.physics.add.collider(
      egg.gameObject,
      this.paddle.gameObject,
      () => egg.bounceOffPaddle(this.paddle)
    );

    // Egg vs dinos
    this.waveManager.dinos.forEach(dino => {
      this.physics.add.overlap(
        egg.gameObject,
        dino.gameObject,
        (eggObj, dinoObj) => this.onEggHitDino(egg, dinoObj.dinoRef),
        null,
        this
      );
    });
  }

  onEggHitDino(egg, dino) {
    if (!dino) return;

    const isDead = this.waveManager.hitDino(dino);

    // Bounce unless piercing
    if (!egg.piercing) {
      egg.gameObject.body.velocity.y *= -1;
    }

    // Check wave cleared
    if (this.waveManager.isWaveCleared()) {
      this.onWaveCleared();
    }
  }

  onEggLost(eggGameObject) {
    const eggIndex = this.eggs.findIndex(e => e.gameObject === eggGameObject);
    if (eggIndex !== -1) {
      this.eggs[eggIndex].destroy();
      this.eggs.splice(eggIndex, 1);
    }

    if (this.eggs.length === 0) {
      this.loseHeart();

      if (this.hearts > 0) {
        this.spawnEgg();
      }
    }
  }

  loseHeart() {
    this.hearts--;
    this.heartsText.setText(this.getHeartsDisplay());

    // Flash screen red
    this.cameras.main.flash(200, 255, 0, 0);

    // Lose random mutation
    this.loseRandomMutation();

    if (this.hearts <= 0) {
      this.gameOver(false);
    }
  }

  loseRandomMutation() {
    const mutationKeys = Object.keys(this.mutations).filter(k => this.mutations[k] > 0);
    if (mutationKeys.length > 0) {
      const randomKey = Phaser.Utils.Array.GetRandom(mutationKeys);
      this.mutations[randomKey]--;
      this.paddle.updateWidth();
    }
  }

  addScore(points) {
    this.score += points;
    this.scoreText.setText(`${this.score}`);
  }

  trySpawnDrop(x, y) {
    // Placeholder - will implement in Phase 3
    const rates = this.waveManager.getDropRates();
    // TODO: Spawn drops based on rates
  }

  onWaveCleared() {
    if (this.isWaveTransition) return;
    this.isWaveTransition = true;

    this.currentWave++;

    if (this.currentWave > 10) {
      // Victory!
      this.gameOver(true);
    } else {
      // Next wave
      this.waveText.setText(`Wave ${this.currentWave}`);

      // Brief pause before next wave
      this.time.delayedCall(1500, () => {
        this.waveManager.loadWave(this.currentWave);
        this.setupDinoCollisions();
        this.showWaveCard();
        this.isWaveTransition = false;
      });
    }
  }

  setupDinoCollisions() {
    // Setup collisions between eggs and new dinos
    this.eggs.forEach(egg => {
      this.waveManager.dinos.forEach(dino => {
        this.physics.add.overlap(
          egg.gameObject,
          dino.gameObject,
          (eggObj, dinoObj) => this.onEggHitDino(egg, dinoObj.dinoRef),
          null,
          this
        );
      });
    });
  }

  startBossFight(bossData) {
    // Placeholder - will implement in Phase 5
    console.log('Boss fight starting!', bossData);
  }

  gameOver(won) {
    this.scene.start('GameOverScene', {
      score: this.score,
      wave: this.currentWave,
      won: won,
    });
  }

  update(time, delta) {
    // Update paddle
    this.paddle.update();

    // Update eggs
    this.eggs.forEach(egg => {
      if (!egg.launched) {
        egg.followPaddle(this.paddle);
      }
    });

    // Update wave manager (dino marching, shooting)
    if (!this.isWaveTransition) {
      this.waveManager.update(time, delta);
    }

    // Update bullets
    this.updateBullets();
  }

  updateBullets() {
    // Check bullets hitting paddle
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];

      // Check if off screen
      if (bullet.y > GAME_HEIGHT) {
        bullet.destroy();
        this.bullets.splice(i, 1);
        continue;
      }

      // Check collision with paddle
      if (this.physics.overlap(bullet, this.paddle.gameObject)) {
        const damaged = this.paddle.hitByBullet();

        // Check for reflect mutation
        if (this.mutations.reflect > 0) {
          bullet.body.setVelocityY(-200);
        } else {
          bullet.destroy();
          this.bullets.splice(i, 1);

          if (damaged) {
            this.loseHeart();
          }
        }
      }
    }
  }
}
```

**Step 2: Verify full core loop**

```bash
npm run dev
```

Expected:
- Game starts, shows wave card "Training Orbit"
- Dinos appear in grid formation
- Dinos march left/right and descend
- Pressing Space launches egg
- Egg hitting dinos destroys them (1 hit for raptor, 2 for trike)
- Score increases
- Dinos shoot plasma spit at paddle
- Getting hit loses hearts
- Dinos reaching earth line loses hearts
- Clearing wave shows next wave card
- Game over at 0 hearts
- Victory message after wave 10

**Step 3: Commit**

```bash
git add .
git commit -m "feat: integrate WaveManager with full core game loop"
```

---

## Task 1.8: Add Combo System

**Goal:** Consecutive hits increase score multiplier

Reference: GDD Section 11 (Scoring + Rewards)

**Files:**
- Modify: `src/scenes/GameScene.js`

**Step 1: Add combo tracking to GameScene**

Add these properties to `init()`:
```javascript
this.comboCount = 0;
this.comboTimer = 0;
this.comboTimeout = 2000; // 2 seconds to maintain combo
```

Add combo HUD element in `createHUD()`:
```javascript
this.comboText = this.add.text(GAME_WIDTH / 2, 50, '', {
  fontSize: '28px',
  fontFamily: 'Arial Black',
  color: '#ffff00',
}).setOrigin(0.5);
```

Update `addScore()` method:
```javascript
addScore(points) {
  // Calculate multiplier
  let multiplier = 1;
  if (this.comboCount >= 2) multiplier = 2;
  if (this.comboCount >= 4) multiplier = 3;

  const finalPoints = points * multiplier;
  this.score += finalPoints;
  this.scoreText.setText(`${this.score}`);

  // Update combo
  this.comboCount++;
  this.comboTimer = this.comboTimeout;

  // Show combo text
  if (multiplier > 1) {
    this.comboText.setText(`${this.comboCount} COMBO! x${multiplier}`);
    this.comboText.setAlpha(1);
  }
}
```

Add to `update()`:
```javascript
// Update combo timer
if (this.comboTimer > 0) {
  this.comboTimer -= delta;
  if (this.comboTimer <= 0) {
    this.comboCount = 0;
    this.comboText.setAlpha(0);
  }
}
```

**Step 2: Verify combo works**

```bash
npm run dev
```

Expected:
- Hitting dinos quickly shows combo counter
- Multiplier increases at 2+ and 4+ hits
- Combo resets after 2 seconds of no hits

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add combo system with score multiplier"
```

---

# PHASE 2: PINBALL SPICE

> Reference: GDD Section 8 (Objects + Physics) - Bumpers, Wormholes, Gravity Wells

## Task 2.1: Create Bumper Entity

**Goal:** Bouncy bumpers that deflect the egg

Reference: GDD Section 8.2 - "Bumpers: Strong bounce + score bonus"

**Files:**
- Create: `src/entities/Bumper.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create Bumper.js**

```javascript
// src/entities/Bumper.js
import Phaser from 'phaser';
import { SPRITES } from '../config/sprites.js';

export class Bumper {
  constructor(scene, x, y) {
    this.scene = scene;
    this.bounceForce = 1.5; // Multiplier for bounce

    const config = SPRITES.bumper;

    // Create bumper graphic
    this.gameObject = scene.add.circle(x, y, config.radius, config.color);

    // Add glow ring
    this.glowRing = scene.add.circle(x, y, config.radius + 5, config.color, 0.3);

    // Enable physics
    scene.physics.add.existing(this.gameObject, true); // static body
    this.gameObject.body.setCircle(config.radius);

    // Store reference
    this.gameObject.bumperRef = this;
  }

  onHit(egg) {
    // Flash effect
    this.scene.tweens.add({
      targets: [this.gameObject, this.glowRing],
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
    });

    // Boost egg velocity
    const body = egg.gameObject.body;
    body.velocity.x *= this.bounceForce;
    body.velocity.y *= this.bounceForce;

    // Ensure minimum speed
    const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    const minSpeed = 300;
    if (speed < minSpeed) {
      const scale = minSpeed / speed;
      body.velocity.x *= scale;
      body.velocity.y *= scale;
    }

    // Cap max speed
    const maxSpeed = 600;
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      body.velocity.x *= scale;
      body.velocity.y *= scale;
    }

    // Award points
    this.scene.addScore(2);
  }

  destroy() {
    this.glowRing.destroy();
    this.gameObject.destroy();
  }

  get x() { return this.gameObject.x; }
  get y() { return this.gameObject.y; }
}
```

**Step 2: Add bumpers to GameScene**

Add to `init()`:
```javascript
this.bumpers = [];
```

Add new method:
```javascript
spawnPinballObjects() {
  // Clear existing
  this.bumpers.forEach(b => b.destroy());
  this.bumpers = [];
  this.wormholes.forEach(w => w.destroy());
  this.wormholes = [];

  const pinball = this.waveManager.currentWaveData?.pinball;
  if (!pinball) return;

  // Spawn bumpers
  pinball.bumpers?.forEach(b => {
    const bumper = new Bumper(this, b.x, b.y);
    this.bumpers.push(bumper);
  });

  // Setup bumper collisions with eggs
  this.setupBumperCollisions();
}

setupBumperCollisions() {
  this.eggs.forEach(egg => {
    this.bumpers.forEach(bumper => {
      this.physics.add.collider(
        egg.gameObject,
        bumper.gameObject,
        () => bumper.onHit(egg)
      );
    });
  });
}
```

Call `spawnPinballObjects()` after loading each wave in `create()` and `onWaveCleared()`.

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add asteroid bumpers with bounce physics"
```

---

## Task 2.2: Create Wormhole (Portal) Entity

**Goal:** Paired portals that teleport the egg

Reference: GDD Section 8.2 - "Wormholes: Teleport from A → B (cooldown prevents loops)"

**Files:**
- Create: `src/entities/Wormhole.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create Wormhole.js**

```javascript
// src/entities/Wormhole.js
import Phaser from 'phaser';
import { SPRITES } from '../config/sprites.js';

export class Wormhole {
  constructor(scene, x1, y1, x2, y2) {
    this.scene = scene;
    this.cooldown = 0;
    this.cooldownTime = 1000; // 1 second

    const config = SPRITES.wormhole;

    // Create portal A
    this.portalA = scene.add.circle(x1, y1, config.radius, config.color, 0.7);
    this.portalAInner = scene.add.circle(x1, y1, config.radius * 0.6, 0x000000);
    scene.physics.add.existing(this.portalA, true);
    this.portalA.body.setCircle(config.radius);
    this.portalA.wormholeRef = this;
    this.portalA.isPortalA = true;

    // Create portal B
    this.portalB = scene.add.circle(x2, y2, config.radius, config.color, 0.7);
    this.portalBInner = scene.add.circle(x2, y2, config.radius * 0.6, 0x000000);
    scene.physics.add.existing(this.portalB, true);
    this.portalB.body.setCircle(config.radius);
    this.portalB.wormholeRef = this;
    this.portalB.isPortalA = false;

    // Visual connection line
    this.connectionLine = scene.add.line(
      0, 0, x1, y1, x2, y2, config.color, 0.2
    ).setOrigin(0, 0);

    // Shimmer animation
    scene.tweens.add({
      targets: [this.portalA, this.portalB],
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }

  update(delta) {
    if (this.cooldown > 0) {
      this.cooldown -= delta;
    }
  }

  teleport(egg, enteredPortalA) {
    if (this.cooldown > 0) return false;

    // Determine exit portal
    const exitPortal = enteredPortalA ? this.portalB : this.portalA;

    // Teleport egg
    egg.gameObject.x = exitPortal.x;
    egg.gameObject.y = exitPortal.y;

    // Start cooldown
    this.cooldown = this.cooldownTime;

    // Flash effect
    this.scene.tweens.add({
      targets: [this.portalA, this.portalB],
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 150,
      yoyo: true,
    });

    // Award points
    this.scene.addScore(5);

    return true;
  }

  destroy() {
    this.portalA.destroy();
    this.portalAInner.destroy();
    this.portalB.destroy();
    this.portalBInner.destroy();
    this.connectionLine.destroy();
  }
}
```

**Step 2: Add wormholes to GameScene**

Add to `init()`:
```javascript
this.wormholes = [];
```

Update `spawnPinballObjects()`:
```javascript
// Spawn wormholes
pinball.wormholes?.forEach(w => {
  const wormhole = new Wormhole(this, w.x1, w.y1, w.x2, w.y2);
  this.wormholes.push(wormhole);
});

// Setup wormhole collisions
this.setupWormholeCollisions();
```

Add method:
```javascript
setupWormholeCollisions() {
  this.eggs.forEach(egg => {
    this.wormholes.forEach(wormhole => {
      this.physics.add.overlap(
        egg.gameObject,
        wormhole.portalA,
        () => wormhole.teleport(egg, true)
      );
      this.physics.add.overlap(
        egg.gameObject,
        wormhole.portalB,
        () => wormhole.teleport(egg, false)
      );
    });
  });
}
```

Update `update()` to update wormholes:
```javascript
this.wormholes.forEach(w => w.update(delta));
```

**Step 3: Verify wormholes work**

```bash
npm run dev
```

Expected:
- Wormholes appear on Wave 3+
- Egg entering one portal exits the other
- 1 second cooldown prevents instant re-entry
- +5 points per teleport

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add wormhole portals with teleportation"
```

---

## Task 2.3: Create Gravity Well (Optional Feature)

**Goal:** Subtle gravitational pull on the egg

Reference: GDD Section 8.2 - "Gravity wells: Slight curve for 'space drift' moments"

**Files:**
- Create: `src/entities/GravityWell.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create GravityWell.js**

```javascript
// src/entities/GravityWell.js
import Phaser from 'phaser';

export class GravityWell {
  constructor(scene, x, y, strength = 50) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.strength = strength;
    this.radius = 100; // Effect radius

    // Subtle visual indicator
    this.visual = scene.add.circle(x, y, this.radius, 0x4444ff, 0.1);

    // Swirl animation
    scene.tweens.add({
      targets: this.visual,
      angle: 360,
      duration: 3000,
      repeat: -1,
    });
  }

  applyForce(egg) {
    const dx = this.x - egg.x;
    const dy = this.y - egg.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.radius || distance < 10) return;

    // Calculate gravitational pull (inverse square, capped)
    const force = this.strength / (distance * 0.5);

    // Apply force toward center
    const angle = Math.atan2(dy, dx);
    egg.gameObject.body.velocity.x += Math.cos(angle) * force;
    egg.gameObject.body.velocity.y += Math.sin(angle) * force;
  }

  destroy() {
    this.visual.destroy();
  }
}
```

**Step 2: Add gravity wells to GameScene**

Add to `init()`:
```javascript
this.gravityWells = [];
```

Update `spawnPinballObjects()`:
```javascript
// Spawn gravity wells
pinball.gravityWells?.forEach(g => {
  const well = new GravityWell(this, g.x, g.y, g.strength);
  this.gravityWells.push(well);
});
```

Update `update()`:
```javascript
// Apply gravity wells
this.gravityWells.forEach(well => {
  this.eggs.forEach(egg => {
    if (egg.launched) {
      well.applyForce(egg);
    }
  });
});
```

Clear gravity wells in `spawnPinballObjects()`:
```javascript
this.gravityWells.forEach(g => g.destroy());
this.gravityWells = [];
```

**Step 3: Verify gravity wells work**

```bash
npm run dev
```

Expected:
- Gravity well appears on Wave 9
- Egg curves slightly when passing near
- Creates interesting "space drift" trajectories

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add gravity wells with subtle pull effect"
```

---

## Task 2.4: Phase 1-2 Integration Test & Polish

**Goal:** Ensure all core + pinball features work together

**Files:**
- Modify: Various files for bug fixes

**Step 1: Test checklist**

Run through manually:
- [ ] Paddle moves smoothly
- [ ] Egg launches and bounces correctly
- [ ] Dinos spawn in correct formation
- [ ] Dinos march and descend
- [ ] Dinos shoot at paddle
- [ ] Egg destroys dinos (1 hit raptor, 2 hit trike)
- [ ] Score increases with combo multiplier
- [ ] Heart loss triggers mutation decay
- [ ] Wave transitions work
- [ ] Bumpers bounce egg with visual feedback
- [ ] Wormholes teleport egg with cooldown
- [ ] Gravity wells gently curve egg trajectory
- [ ] Game over screen shows correctly
- [ ] Victory after Wave 10

**Step 2: Fix any issues found**

Document and fix bugs as encountered.

**Step 3: Commit**

```bash
git add .
git commit -m "fix: polish and bug fixes for phases 1-2"
```

**Step 4: Push to GitHub**

```bash
git push -u origin master
```

---

# END OF PART 1

**Phases 1-2 Complete!**

At this point you have:
- Playable core game loop
- 10 waves of dino formations
- Paddle with mutation/powerup support
- Meteor egg with Breakout physics
- 3 dino types (raptor, ptero, trike)
- Combo scoring system
- Asteroid bumpers
- Wormhole portals
- Gravity wells

**Continue to Part 2 for:**
- Phase 3: Timed Powerups (7 types)
- Phase 4: Stackable Mutations (6 types)
- Phase 5: Boss Fight + Polish
