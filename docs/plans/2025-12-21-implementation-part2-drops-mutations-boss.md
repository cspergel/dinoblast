# Dino Rift Defender Implementation Plan - Part 2

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Continues from:** `docs/plans/2025-12-21-implementation-part1-core-and-pinball.md`

**Reference Docs:**
- GDD: `docs/dino-rift-defender-gdd.md`
- Technical Design: `docs/plans/2025-12-21-dino-rift-defender-design.md`

---

# PHASE 3: DROPS (Timed Powerups)

> Reference: GDD Section 10 (Drops: Two Categories) - Part A (Timed Powerups)

## Task 3.1: Create Drop Entity

**Goal:** Base drop class that falls from dead dinos

**Files:**
- Create: `src/entities/Drop.js`
- Create: `src/config/powerups.js`

**Step 1: Create powerups.js configuration**

```javascript
// src/config/powerups.js

export const TIMED_POWERUPS = {
  WIDE: {
    name: 'Triceratops Plow',
    label: 'WIDE',
    color: 0x00ff00,
    duration: 10000,
    description: '+50% paddle width',
  },
  FAST: {
    name: 'Raptor Boost',
    label: 'FAST',
    color: 0xffff00,
    duration: 10000,
    description: '+40% paddle speed',
  },
  SHIELD: {
    name: 'Stego Shield',
    label: 'SHLD',
    color: 0x00ffff,
    duration: null, // Until hit
    description: '+1 shield pip',
  },
  SLOW: {
    name: 'Time Fossil',
    label: 'SLOW',
    color: 0x8888ff,
    duration: 8000,
    description: 'Slows dinos and bullets',
  },
  FIRE: {
    name: 'Comet Core',
    label: 'FIRE',
    color: 0xff4400,
    duration: 8000,
    description: 'Egg pierces dinos',
  },
  SPRING: {
    name: 'Spring Tail',
    label: 'SPRG',
    color: 0xff88ff,
    duration: 10000,
    description: 'Faster egg',
  },
  MULTI: {
    name: 'Multi-Egg Nest',
    label: 'MULT',
    color: 0xffff88,
    duration: 8000,
    description: '+1 egg in play',
  },
};

export const MUTATIONS = {
  WIDTH: {
    name: 'T-Rex Tail Extension',
    label: 'W+',
    color: 0x00ff00,
    maxStacks: 3,
    perStack: 0.15, // +15% width
    description: '+15% paddle width per stack',
  },
  SPEED: {
    name: 'Jetpack Fins',
    label: 'S+',
    color: 0xffff00,
    maxStacks: 3,
    perStack: 0.10, // +10% speed
    description: '+10% paddle speed per stack',
  },
  ARMOR: {
    name: 'Ankylosaur Armor',
    label: 'A+',
    color: 0x00ffff,
    maxStacks: 3,
    perStack: 1, // +1 shield pip
    description: '+1 permanent shield pip per stack',
  },
  REFLECT: {
    name: 'Spiky Paddle',
    label: '⚡',
    color: 0xff00ff,
    maxStacks: 1,
    description: 'Reflects plasma spit upward',
  },
  MAGNET: {
    name: 'Ptero Magnet',
    label: '🧲',
    color: 0xff8800,
    maxStacks: 1,
    description: 'Egg sticks to paddle',
  },
  BUNKER: {
    name: 'Bunker Builder',
    label: 'B+',
    color: 0x888888,
    maxStacks: 2,
    perStack: 2, // +2 shield tiles
    description: '+2 shield tiles above paddle',
  },
};

export const POWERUP_TYPES = Object.keys(TIMED_POWERUPS);
export const MUTATION_TYPES = Object.keys(MUTATIONS);
```

**Step 2: Create Drop.js**

```javascript
// src/entities/Drop.js
import Phaser from 'phaser';
import { GAME_HEIGHT } from '../config/gameConfig.js';
import { TIMED_POWERUPS, MUTATIONS } from '../config/powerups.js';

export class Drop {
  constructor(scene, x, y, type, isMutation = false) {
    this.scene = scene;
    this.type = type;
    this.isMutation = isMutation;
    this.collected = false;

    const config = isMutation ? MUTATIONS[type] : TIMED_POWERUPS[type];
    this.config = config;

    // Create drop graphic
    const width = 40;
    const height = isMutation ? 30 : 25;

    // Background shape
    if (isMutation) {
      // DNA helix shape (simplified as hexagon)
      this.gameObject = scene.add.polygon(x, y, [
        -15, 0, -10, -12, 10, -12, 15, 0, 10, 12, -10, 12
      ], config.color, 0.9);
    } else {
      // Capsule shape (rounded rect approximation)
      this.gameObject = scene.add.rectangle(x, y, width, height, config.color, 0.9);
    }

    // Label text
    this.label = scene.add.text(x, y, config.label, {
      fontSize: '12px',
      fontFamily: 'Arial Black',
      color: '#000000',
    }).setOrigin(0.5);

    // Enable physics
    scene.physics.add.existing(this.gameObject);
    this.gameObject.body.setVelocityY(80); // Fall speed

    // Store reference
    this.gameObject.dropRef = this;

    // Glow animation
    scene.tweens.add({
      targets: this.gameObject,
      alpha: 0.6,
      duration: 300,
      yoyo: true,
      repeat: -1,
    });
  }

  update() {
    // Update label position
    this.label.x = this.gameObject.x;
    this.label.y = this.gameObject.y;

    // Destroy if off screen
    if (this.gameObject.y > GAME_HEIGHT + 20) {
      this.destroy();
      return false;
    }
    return true;
  }

  collect() {
    if (this.collected) return;
    this.collected = true;

    // Flash effect
    this.scene.tweens.add({
      targets: [this.gameObject, this.label],
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => this.destroy(),
    });

    // Apply effect
    if (this.isMutation) {
      this.scene.applyMutation(this.type);
    } else {
      this.scene.applyPowerup(this.type);
    }
  }

  destroy() {
    if (this.label) this.label.destroy();
    if (this.gameObject) this.gameObject.destroy();
  }

  get x() { return this.gameObject.x; }
  get y() { return this.gameObject.y; }
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add Drop entity with powerup and mutation configs"
```

---

## Task 3.2: Create PowerupManager

**Goal:** Manage spawning drops and tracking active effects

**Files:**
- Create: `src/systems/PowerupManager.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create PowerupManager.js**

```javascript
// src/systems/PowerupManager.js
import { Drop } from '../entities/Drop.js';
import { TIMED_POWERUPS, MUTATIONS, POWERUP_TYPES, MUTATION_TYPES } from '../config/powerups.js';
import Phaser from 'phaser';

export class PowerupManager {
  constructor(scene) {
    this.scene = scene;
    this.drops = [];
    this.activePowerups = []; // { type, remainingTime, config }
  }

  trySpawnDrop(x, y, dropRates) {
    const roll = Math.random();

    if (roll < dropRates.mutation) {
      // Spawn mutation
      const type = Phaser.Utils.Array.GetRandom(MUTATION_TYPES);
      this.spawnDrop(x, y, type, true);
    } else if (roll < dropRates.mutation + dropRates.timedPowerup) {
      // Spawn timed powerup
      const type = Phaser.Utils.Array.GetRandom(POWERUP_TYPES);
      this.spawnDrop(x, y, type, false);
    }
  }

  spawnDrop(x, y, type, isMutation) {
    const drop = new Drop(this.scene, x, y, type, isMutation);
    this.drops.push(drop);
    this.setupDropCollision(drop);
  }

  setupDropCollision(drop) {
    this.scene.physics.add.overlap(
      drop.gameObject,
      this.scene.paddle.gameObject,
      () => drop.collect()
    );
  }

  activatePowerup(type) {
    const config = TIMED_POWERUPS[type];
    if (!config) return;

    // Handle special cases
    if (type === 'SHIELD') {
      this.scene.paddle.addShield(1);
      return;
    }

    if (type === 'MULTI') {
      // Spawn extra egg if under max
      if (this.scene.eggs.length < 3) {
        this.scene.spawnEgg();
      }
    }

    // Check if already active - refresh timer
    const existing = this.activePowerups.find(p => p.type === type);
    if (existing) {
      existing.remainingTime = config.duration;
    } else {
      this.activePowerups.push({
        type,
        remainingTime: config.duration,
        config,
      });
    }

    // Apply immediate effects
    this.applyPowerupEffects();
  }

  applyPowerupEffects() {
    // Update paddle width
    this.scene.paddle.updateWidth();

    // Update egg piercing
    const hasFire = this.activePowerups.some(p => p.type === 'FIRE');
    this.scene.eggs.forEach(egg => {
      egg.piercing = hasFire;
    });
  }

  update(delta) {
    // Update drops
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      if (!drop.update()) {
        this.drops.splice(i, 1);
      }
    }

    // Update active powerup timers
    for (let i = this.activePowerups.length - 1; i >= 0; i--) {
      const powerup = this.activePowerups[i];
      powerup.remainingTime -= delta;

      if (powerup.remainingTime <= 0) {
        this.activePowerups.splice(i, 1);
        this.onPowerupExpired(powerup.type);
      }
    }

    // Sync with scene
    this.scene.activePowerups = this.activePowerups;
  }

  onPowerupExpired(type) {
    // Handle expiration effects
    if (type === 'MULTI') {
      // Remove extra eggs (keep at least 1)
      while (this.scene.eggs.length > 1) {
        const egg = this.scene.eggs.pop();
        egg.destroy();
      }
    }

    this.applyPowerupEffects();
  }

  getActivePowerups() {
    return this.activePowerups;
  }

  isActive(type) {
    return this.activePowerups.some(p => p.type === type);
  }

  clearAll() {
    this.drops.forEach(d => d.destroy());
    this.drops = [];
    this.activePowerups = [];
  }
}
```

**Step 2: Integrate into GameScene**

Add to imports:
```javascript
import { PowerupManager } from '../systems/PowerupManager.js';
```

In `create()`:
```javascript
this.powerupManager = new PowerupManager(this);
```

Update `trySpawnDrop()`:
```javascript
trySpawnDrop(x, y) {
  const rates = this.waveManager.getDropRates();
  this.powerupManager.trySpawnDrop(x, y, rates);
}
```

Add methods:
```javascript
applyPowerup(type) {
  this.powerupManager.activatePowerup(type);
}

applyMutation(type) {
  this.mutationManager.addMutation(type);
}
```

Update `update()`:
```javascript
this.powerupManager.update(delta);
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add PowerupManager for drops and active effects"
```

---

## Task 3.3: Create Powerup HUD

**Goal:** Display active powerups with countdown bars

Reference: Technical Design "HUD Layout" section

**Files:**
- Create: `src/ui/HUD.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create HUD.js**

```javascript
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
```

**Step 2: Integrate HUD into GameScene**

Replace the manual HUD creation with:
```javascript
import { HUD } from '../ui/HUD.js';

// In create():
this.hud = new HUD(this);
this.hud.create();

// In update():
this.hud.update();

// Replace addScore:
addScore(points) {
  let multiplier = 1;
  if (this.comboCount >= 2) multiplier = 2;
  if (this.comboCount >= 4) multiplier = 3;

  const finalPoints = points * multiplier;
  this.score += finalPoints;

  this.comboCount++;
  this.comboTimer = this.comboTimeout;

  if (multiplier > 1) {
    this.hud.showCombo(this.comboCount, multiplier);
  }
}

// In update() for combo timer:
if (this.comboTimer > 0) {
  this.comboTimer -= delta;
  if (this.comboTimer <= 0) {
    this.comboCount = 0;
    this.hud.hideCombo();
  }
}

// Replace showWaveCard:
showWaveCard() {
  const waveName = this.waveManager.currentWaveData?.name || `Wave ${this.currentWave}`;
  this.hud.showWaveCard(waveName);
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add HUD with powerup bars and mutation icons"
```

---

## Task 3.4: Implement All 7 Timed Powerups

**Goal:** Ensure each powerup has its effect implemented

Reference: GDD Section 10A (Timed Powerups)

**Files:**
- Modify: `src/entities/Paddle.js`
- Modify: `src/entities/MeteorEgg.js`
- Modify: `src/systems/WaveManager.js`

**Step 1: Update Paddle.js for WIDE and FAST**

Already implemented in Task 1.3, verify:
```javascript
getCurrentSpeed() {
  let speed = this.baseSpeed;
  const mutations = this.scene.mutations || {};
  speed *= (1 + (mutations.speed || 0) * 0.10);

  // FAST powerup: +40% speed
  if (this.scene.powerupManager?.isActive('FAST')) {
    speed *= 1.4;
  }
  return speed;
}

getCurrentWidth() {
  let width = this.baseWidth;
  const mutations = this.scene.mutations || {};
  width *= (1 + (mutations.width || 0) * 0.15);

  // WIDE powerup: +50% width
  if (this.scene.powerupManager?.isActive('WIDE')) {
    width *= 1.5;
  }
  return width;
}
```

**Step 2: Update MeteorEgg.js for FIRE (piercing) and SPRING (speed)**

```javascript
getCurrentSpeed() {
  let speed = EGG.speed;

  // SPRING powerup: +30% speed
  if (this.scene.powerupManager?.isActive('SPRING')) {
    speed *= 1.3;
  }
  return speed;
}

// piercing property is set by PowerupManager
```

**Step 3: Update WaveManager.js for SLOW**

In `update()`:
```javascript
update(time, delta) {
  this.marchTimer += delta;

  // SLOW powerup: 30% slower
  let timeScale = 1;
  if (this.scene.powerupManager?.isActive('SLOW')) {
    timeScale = 0.7;
  }

  if (this.marchTimer >= this.marchInterval / timeScale) {
    this.marchTimer = 0;
    this.marchStep();
  }

  // Update dino shooting with slow effect
  this.dinos.forEach(dino => {
    if (timeScale < 1 && Math.random() > timeScale) {
      // Skip shooting sometimes when slowed
      return;
    }
    dino.update(delta);
  });

  this.checkEarthLine();
}
```

**Step 4: Slow bullets in GameScene**

Update `updateBullets()`:
```javascript
updateBullets() {
  const slowActive = this.powerupManager?.isActive('SLOW');
  const bulletSpeed = slowActive ? 140 : 200;

  for (let i = this.bullets.length - 1; i >= 0; i--) {
    const bullet = this.bullets[i];
    bullet.body.setVelocityY(bulletSpeed);

    // ... rest of collision logic
  }
}
```

**Step 5: Verify all powerups work**

```bash
npm run dev
```

Expected:
- WIDE: Paddle gets wider
- FAST: Paddle moves faster
- SHIELD: Adds shield pip
- SLOW: Dinos and bullets move slower
- FIRE: Egg passes through dinos
- SPRING: Egg moves faster
- MULTI: Extra egg spawns

**Step 6: Commit**

```bash
git add .
git commit -m "feat: implement all 7 timed powerup effects"
```

---

# PHASE 4: STACKABLE MUTATIONS

> Reference: GDD Section 10B (Stackable Paddle Mutations)

## Task 4.1: Create MutationManager

**Goal:** Track mutation stacks, apply bonuses, handle decay

**Files:**
- Create: `src/systems/MutationManager.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create MutationManager.js**

```javascript
// src/systems/MutationManager.js
import { MUTATIONS } from '../config/powerups.js';
import Phaser from 'phaser';

export class MutationManager {
  constructor(scene) {
    this.scene = scene;

    // Mutation stacks
    this.stacks = {
      width: 0,
      speed: 0,
      armor: 0,
      reflect: 0,
      magnet: 0,
      bunker: 0,
    };
  }

  addMutation(type) {
    const typeLower = type.toLowerCase();
    const config = MUTATIONS[type];

    if (!config) {
      console.warn(`Unknown mutation type: ${type}`);
      return false;
    }

    // Check max stacks
    if (this.stacks[typeLower] >= config.maxStacks) {
      // Already at max - maybe give points instead?
      this.scene.addScore(50);
      return false;
    }

    // Add stack
    this.stacks[typeLower]++;

    // Apply immediate effects
    this.applyMutationEffects();

    // Visual feedback
    this.showMutationGain(config);

    return true;
  }

  removeRandomStack() {
    const mutationKeys = Object.keys(this.stacks).filter(k => this.stacks[k] > 0);

    if (mutationKeys.length === 0) return null;

    const randomKey = Phaser.Utils.Array.GetRandom(mutationKeys);
    this.stacks[randomKey]--;

    this.applyMutationEffects();

    return randomKey;
  }

  applyMutationEffects() {
    const scene = this.scene;

    // Update paddle dimensions
    scene.paddle.updateWidth();

    // Apply armor mutation (permanent shield pips)
    const armorPips = this.stacks.armor;
    scene.paddle.permanentShields = armorPips;

    // Sync with scene.mutations
    scene.mutations = { ...this.stacks };
  }

  showMutationGain(config) {
    const text = this.scene.add.text(
      this.scene.paddle.x,
      this.scene.paddle.y - 50,
      `+${config.name}!`,
      {
        fontSize: '16px',
        fontFamily: 'Arial Black',
        color: `#${config.color.toString(16).padStart(6, '0')}`,
      }
    ).setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    });
  }

  getStacks() {
    return { ...this.stacks };
  }

  hasReflect() {
    return this.stacks.reflect > 0;
  }

  hasMagnet() {
    return this.stacks.magnet > 0;
  }

  getBunkerCount() {
    return this.stacks.bunker * 2; // 2 tiles per stack
  }

  reset() {
    this.stacks = {
      width: 0,
      speed: 0,
      armor: 0,
      reflect: 0,
      magnet: 0,
      bunker: 0,
    };
  }
}
```

**Step 2: Update Paddle.js for permanent shields**

Add property:
```javascript
constructor(scene) {
  // ... existing code
  this.permanentShields = 0;
}

// Update shield methods:
getTotalShields() {
  return this.shieldPips + this.permanentShields;
}

hitByBullet() {
  const totalShields = this.getTotalShields();
  if (totalShields > 0) {
    if (this.shieldPips > 0) {
      this.shieldPips--;
    }
    // Permanent shields don't decrease
    return false;
  }
  return true;
}
```

**Step 3: Integrate MutationManager into GameScene**

```javascript
import { MutationManager } from '../systems/MutationManager.js';

// In create():
this.mutationManager = new MutationManager(this);

// Update applyMutation:
applyMutation(type) {
  this.mutationManager.addMutation(type);
}

// Update loseRandomMutation:
loseRandomMutation() {
  const lost = this.mutationManager.removeRandomStack();
  if (lost) {
    // Show which mutation was lost
    const text = this.add.text(
      this.paddle.x,
      this.paddle.y - 40,
      `-${lost.toUpperCase()}`,
      { fontSize: '14px', color: '#ff4444' }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: text.y - 20,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy(),
    });
  }
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add MutationManager with stack tracking and decay"
```

---

## Task 4.2: Implement Reflect Mutation

**Goal:** Spiky Paddle reflects plasma spit upward

**Files:**
- Modify: `src/scenes/GameScene.js`

**Step 1: Update bullet collision in updateBullets()**

```javascript
updateBullets() {
  const slowActive = this.powerupManager?.isActive('SLOW');
  const bulletSpeed = slowActive ? 140 : 200;

  for (let i = this.bullets.length - 1; i >= 0; i--) {
    const bullet = this.bullets[i];

    if (bullet.y > GAME_HEIGHT) {
      bullet.destroy();
      this.bullets.splice(i, 1);
      continue;
    }

    // Check collision with paddle
    if (this.physics.overlap(bullet, this.paddle.gameObject)) {
      // Check for reflect mutation
      if (this.mutationManager.hasReflect()) {
        // Reflect bullet upward
        bullet.body.setVelocityY(-bulletSpeed);
        bullet.setFillStyle(0x00ff00); // Change color to show reflected

        // Check if reflected bullet hits dinos
        this.waveManager.dinos.forEach(dino => {
          if (this.physics.overlap(bullet, dino.gameObject)) {
            this.waveManager.hitDino(dino);
            bullet.destroy();
            this.bullets.splice(i, 1);
          }
        });
      } else {
        const damaged = this.paddle.hitByBullet();
        bullet.destroy();
        this.bullets.splice(i, 1);

        if (damaged) {
          this.loseHeart();
        }
      }
    }
  }
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: implement Spiky Paddle reflect mutation"
```

---

## Task 4.3: Implement Magnet Mutation

**Goal:** Egg sticks to paddle on every hit

**Files:**
- Modify: `src/entities/MeteorEgg.js`

**Step 1: Update MeteorEgg.bounceOffPaddle()**

Already implemented, verify it checks for magnet:
```javascript
bounceOffPaddle(paddle) {
  // Calculate bounce angle
  const hitPosition = (this.gameObject.x - paddle.x) / (paddle.width / 2);
  const angle = -90 + (hitPosition * 60);

  const speed = this.getCurrentSpeed();
  const radians = Phaser.Math.DegToRad(angle);

  this.gameObject.body.setVelocity(
    Math.cos(radians) * speed,
    Math.sin(radians) * speed
  );

  // Check for magnet mutation
  if (this.scene.mutationManager?.hasMagnet()) {
    this.stickToPaddle(paddle);
  }
}

stickToPaddle(paddle) {
  this.launched = false;
  this.stuck = true;
  this.gameObject.body.setVelocity(0, 0);
  this.gameObject.x = paddle.x;
  this.gameObject.y = paddle.y - PADDLE.height / 2 - EGG.radius - 5;
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: implement Ptero Magnet mutation"
```

---

## Task 4.4: Implement Bunker Mutation

**Goal:** Shield tiles above paddle that block bullets

**Files:**
- Create: `src/entities/BunkerTile.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create BunkerTile.js**

```javascript
// src/entities/BunkerTile.js
import Phaser from 'phaser';

export class BunkerTile {
  constructor(scene, x, y) {
    this.scene = scene;
    this.hp = 2;

    this.gameObject = scene.add.rectangle(x, y, 30, 15, 0x888888);
    scene.physics.add.existing(this.gameObject, true);

    this.gameObject.bunkerRef = this;
  }

  hit() {
    this.hp--;

    if (this.hp <= 0) {
      this.destroy();
      return true; // Destroyed
    }

    // Show damage
    this.gameObject.setAlpha(0.5);
    return false;
  }

  destroy() {
    this.gameObject.destroy();
  }
}
```

**Step 2: Add bunker management to GameScene**

```javascript
import { BunkerTile } from '../entities/BunkerTile.js';

// In init():
this.bunkerTiles = [];

// Add method:
updateBunkers() {
  const targetCount = this.mutationManager.getBunkerCount();
  const currentCount = this.bunkerTiles.length;

  if (targetCount > currentCount) {
    // Add tiles
    for (let i = currentCount; i < targetCount; i++) {
      const offsetX = (i - targetCount / 2) * 35;
      const tile = new BunkerTile(
        this,
        this.paddle.x + offsetX,
        this.paddle.y - 40
      );
      this.bunkerTiles.push(tile);
    }
  } else if (targetCount < currentCount) {
    // Remove tiles
    while (this.bunkerTiles.length > targetCount) {
      const tile = this.bunkerTiles.pop();
      tile.destroy();
    }
  }

  // Update positions to follow paddle
  this.bunkerTiles.forEach((tile, i) => {
    const offsetX = (i - this.bunkerTiles.length / 2) * 35;
    tile.gameObject.x = this.paddle.x + offsetX;
  });
}

// In update():
this.updateBunkers();

// In updateBullets(), add bunker collision:
for (const tile of this.bunkerTiles) {
  if (this.physics.overlap(bullet, tile.gameObject)) {
    const destroyed = tile.hit();
    if (destroyed) {
      const index = this.bunkerTiles.indexOf(tile);
      if (index !== -1) this.bunkerTiles.splice(index, 1);
    }
    bullet.destroy();
    this.bullets.splice(i, 1);
    break;
  }
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: implement Bunker Builder mutation with shield tiles"
```

---

# PHASE 5: POLISH + BOSS

> Reference: GDD Section 9.2 (Boss Types), Section 17 (Audio Direction)

## Task 5.1: Create Boss Entity

**Goal:** Mothership Rex boss for Wave 10

Reference: GDD Section 9.2 - "Mothership Rex"

**Files:**
- Create: `src/entities/Boss.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create Boss.js**

```javascript
// src/entities/Boss.js
import Phaser from 'phaser';
import { GAME_WIDTH, BULLET } from '../config/gameConfig.js';

export class Boss {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;

    this.maxHp = config.hp;
    this.hp = this.maxHp;
    this.phase = 0;
    this.attackTimer = 0;
    this.moveDirection = 1;

    // Main body
    this.width = 250;
    this.height = 80;
    this.gameObject = scene.add.rectangle(
      GAME_WIDTH / 2,
      80,
      this.width,
      this.height,
      0xff0000
    );
    scene.physics.add.existing(this.gameObject);
    this.gameObject.body.setImmovable(true);

    // Boss label
    this.label = scene.add.text(GAME_WIDTH / 2, 80, 'MOTHERSHIP REX', {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
    }).setOrigin(0.5);

    // HP bar
    this.hpBarBg = scene.add.rectangle(GAME_WIDTH / 2, 130, 200, 15, 0x333333);
    this.hpBar = scene.add.rectangle(GAME_WIDTH / 2 - 100, 130, 200, 15, 0x00ff00).setOrigin(0, 0.5);

    // Weak points (3)
    this.weakPoints = [];
    this.weakPointCooldowns = [];
    for (let i = 0; i < config.weakPoints; i++) {
      const offsetX = (i - 1) * 80;
      const wp = scene.add.circle(
        GAME_WIDTH / 2 + offsetX,
        80,
        20,
        0xffff00
      );
      scene.physics.add.existing(wp);
      wp.body.setCircle(20);
      wp.weakPointIndex = i;
      wp.bossRef = this;
      this.weakPoints.push(wp);
      this.weakPointCooldowns.push(0);
    }

    // Store reference
    this.gameObject.bossRef = this;
  }

  update(time, delta) {
    // Move side to side
    const moveSpeed = 50 + (this.phase * 20);
    this.gameObject.x += this.moveDirection * moveSpeed * (delta / 1000);

    // Bounce off edges
    if (this.gameObject.x > GAME_WIDTH - this.width / 2 - 20) {
      this.moveDirection = -1;
    } else if (this.gameObject.x < this.width / 2 + 20) {
      this.moveDirection = 1;
    }

    // Update weak point positions
    this.weakPoints.forEach((wp, i) => {
      const offsetX = (i - 1) * 80;
      wp.x = this.gameObject.x + offsetX;

      // Update cooldown
      if (this.weakPointCooldowns[i] > 0) {
        this.weakPointCooldowns[i] -= delta;
        wp.setFillStyle(0x666666); // Closed
      } else {
        wp.setFillStyle(0xffff00); // Open
      }
    });

    // Update label and HP bar positions
    this.label.x = this.gameObject.x;
    this.hpBarBg.x = this.gameObject.x;
    this.hpBar.x = this.gameObject.x - 100;
    this.hpBar.width = 200 * (this.hp / this.maxHp);

    // Attack pattern
    this.attackTimer += delta;
    const attackInterval = 2000 - (this.phase * 300);
    if (this.attackTimer >= attackInterval) {
      this.attackTimer = 0;
      this.attack();
    }

    // Update phase based on HP
    this.updatePhase();
  }

  updatePhase() {
    const phases = this.config.phases;
    for (let i = phases.length - 1; i >= 0; i--) {
      if (this.hp <= phases[i].hpThreshold) {
        if (this.phase !== i) {
          this.phase = i;
          this.onPhaseChange();
        }
        break;
      }
    }
  }

  onPhaseChange() {
    // Visual feedback
    this.scene.cameras.main.shake(200, 0.01);

    // Change color based on phase
    const colors = [0xff0000, 0xff6600, 0xff00ff];
    this.gameObject.setFillStyle(colors[this.phase] || 0xff0000);
  }

  attack() {
    const pattern = this.config.phases[this.phase]?.pattern || 'spray';

    switch (pattern) {
      case 'spray':
        this.attackSpray();
        break;
      case 'burst':
        this.attackBurst();
        break;
      case 'aimed':
        this.attackAimed();
        break;
    }
  }

  attackSpray() {
    // 5 bullets in a fan
    for (let i = -2; i <= 2; i++) {
      const bullet = this.scene.add.rectangle(
        this.gameObject.x + i * 30,
        this.gameObject.y + this.height / 2,
        BULLET.width,
        BULLET.height,
        0xff00ff
      );
      this.scene.physics.add.existing(bullet);
      bullet.body.setVelocity(i * 30, BULLET.speed);
      this.scene.bullets.push(bullet);
    }
  }

  attackBurst() {
    // 3 quick bullets straight down
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 150, () => {
        const bullet = this.scene.add.rectangle(
          this.gameObject.x,
          this.gameObject.y + this.height / 2,
          BULLET.width,
          BULLET.height,
          0xff00ff
        );
        this.scene.physics.add.existing(bullet);
        bullet.body.setVelocityY(BULLET.speed * 1.5);
        this.scene.bullets.push(bullet);
      });
    }
  }

  attackAimed() {
    // Bullet aimed at paddle
    const dx = this.scene.paddle.x - this.gameObject.x;
    const dy = this.scene.paddle.y - this.gameObject.y;
    const angle = Math.atan2(dy, dx);
    const speed = BULLET.speed * 1.2;

    const bullet = this.scene.add.rectangle(
      this.gameObject.x,
      this.gameObject.y + this.height / 2,
      BULLET.width,
      BULLET.height,
      0xff00ff
    );
    this.scene.physics.add.existing(bullet);
    bullet.body.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
    this.scene.bullets.push(bullet);
  }

  hitWeakPoint(index) {
    if (this.weakPointCooldowns[index] > 0) return false;

    this.hp--;
    this.weakPointCooldowns[index] = 3000; // 3 second cooldown

    // Flash effect
    this.scene.tweens.add({
      targets: this.gameObject,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
    });

    // Screen shake
    this.scene.cameras.main.shake(100, 0.005);

    // Add score
    this.scene.addScore(25);

    // Check death
    if (this.hp <= 0) {
      this.onDeath();
      return true;
    }

    return false;
  }

  onDeath() {
    // Big explosion effect
    this.scene.cameras.main.shake(500, 0.02);

    // Drop multiple mutations
    for (let i = 0; i < 4; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        const x = this.gameObject.x + Phaser.Math.Between(-50, 50);
        this.scene.powerupManager.trySpawnDrop(x, this.gameObject.y, {
          mutation: 0.8,
          timedPowerup: 0.2,
        });
      });
    }

    // Big score bonus
    this.scene.addScore(500);

    // Destroy boss
    this.destroy();

    // Victory!
    this.scene.time.delayedCall(1500, () => {
      this.scene.gameOver(true);
    });
  }

  destroy() {
    this.gameObject.destroy();
    this.label.destroy();
    this.hpBarBg.destroy();
    this.hpBar.destroy();
    this.weakPoints.forEach(wp => wp.destroy());
  }
}
```

**Step 2: Integrate boss into GameScene**

```javascript
import { Boss } from '../entities/Boss.js';

// In init():
this.boss = null;

// Update startBossFight():
startBossFight(waveData) {
  this.boss = new Boss(this, waveData.boss);

  // Setup collisions
  this.setupBossCollisions();

  // Show boss intro
  this.hud.showWaveCard('BOSS: MOTHERSHIP REX');
}

setupBossCollisions() {
  this.eggs.forEach(egg => {
    this.boss.weakPoints.forEach((wp, index) => {
      this.physics.add.overlap(
        egg.gameObject,
        wp,
        () => {
          if (this.boss.hitWeakPoint(index)) {
            // Boss died
            this.boss = null;
          }
          egg.gameObject.body.velocity.y *= -1;
        }
      );
    });
  });
}

// In update():
if (this.boss) {
  this.boss.update(time, delta);
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add Mothership Rex boss fight"
```

---

## Task 5.2: Add Screen Shake Effects

**Goal:** Impactful feedback for hits and events

**Files:**
- Modify: `src/scenes/GameScene.js`

**Step 1: Add shake helper**

```javascript
shake(intensity = 0.01, duration = 100) {
  this.cameras.main.shake(duration, intensity);
}
```

**Step 2: Add shakes to events**

In `onEggHitDino()`:
```javascript
this.shake(0.003, 50);
```

In `loseHeart()`:
```javascript
this.shake(0.015, 200);
```

In combo (for x3 multiplier):
```javascript
if (multiplier >= 3) {
  this.shake(0.005, 80);
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add screen shake effects for impacts"
```

---

## Task 5.3: Add Sound Effects (Placeholder)

**Goal:** Setup sound infrastructure with placeholder beeps

**Files:**
- Create: `src/systems/AudioManager.js`
- Modify: `src/scenes/BootScene.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create AudioManager.js**

```javascript
// src/systems/AudioManager.js
export class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.enabled = true;

    // Will use Web Audio API for generated sounds
    this.audioContext = null;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio not supported');
      this.enabled = false;
    }
  }

  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  paddleHit() {
    this.playTone(440, 0.1, 'sine'); // Soft boop
  }

  dinoHit() {
    this.playTone(600, 0.1, 'square'); // Musical pop
  }

  dinoDestroy() {
    this.playTone(800, 0.15, 'sawtooth'); // Satisfying destroy
  }

  powerupCollect() {
    this.playTone(880, 0.1, 'sine');
    setTimeout(() => this.playTone(1100, 0.15, 'sine'), 100); // DNA ding
  }

  mutationCollect() {
    this.playTone(440, 0.1, 'sine');
    setTimeout(() => this.playTone(660, 0.1, 'sine'), 100);
    setTimeout(() => this.playTone(880, 0.15, 'sine'), 200);
  }

  damage() {
    this.playTone(200, 0.3, 'sawtooth'); // Ouch
  }

  wormhole() {
    // Whooop sound
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.playTone(300 + i * 50, 0.05, 'sine');
      }, i * 30);
    }
  }

  bumperHit() {
    this.playTone(500, 0.1, 'triangle'); // Boing
  }

  combo(level) {
    const baseFreq = 440 + (level * 100);
    this.playTone(baseFreq, 0.1, 'square');
  }

  victory() {
    const notes = [523, 659, 784, 1047]; // C E G C
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sine'), i * 150);
    });
  }

  gameOver() {
    const notes = [440, 392, 349, 330]; // A G F E (descending)
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.4, 'sawtooth'), i * 200);
    });
  }
}
```

**Step 2: Integrate audio into GameScene**

```javascript
import { AudioManager } from '../systems/AudioManager.js';

// In create():
this.audio = new AudioManager(this);

// Add sounds to events:
// In onEggHitDino():
this.audio.dinoHit();
if (isDead) this.audio.dinoDestroy();

// In paddle bounce:
this.audio.paddleHit();

// In powerup collect:
this.audio.powerupCollect();

// In mutation collect:
this.audio.mutationCollect();

// In loseHeart:
this.audio.damage();

// In wormhole teleport:
this.audio.wormhole();

// In bumper hit:
this.audio.bumperHit();

// In combo:
this.audio.combo(multiplier);

// In gameOver:
if (won) this.audio.victory();
else this.audio.gameOver();
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add procedural sound effects"
```

---

## Task 5.4: Add Difficulty Assists

**Goal:** Toggle-able assists for younger players

Reference: GDD Section 5 (Controls + Accessibility)

**Files:**
- Modify: `src/scenes/MenuScene.js`
- Modify: `src/scenes/GameScene.js`
- Create: `src/config/settings.js`

**Step 1: Create settings.js**

```javascript
// src/config/settings.js
export const DEFAULT_SETTINGS = {
  autoCatch: false,      // Ball sticks to paddle
  slowerMode: false,     // 25% speed reduction
  bigPaddle: false,      // +50% starting width
  easyMode: false,       // Plasma spit doesn't damage
};

// Load/save to localStorage
export function loadSettings() {
  try {
    const saved = localStorage.getItem('dinoRiftSettings');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings) {
  try {
    localStorage.setItem('dinoRiftSettings', JSON.stringify(settings));
  } catch (e) {}
}
```

**Step 2: Add settings menu to MenuScene**

```javascript
import { loadSettings, saveSettings } from '../config/settings.js';

// In create():
this.settings = loadSettings();

// Add settings section
this.add.text(GAME_WIDTH / 2, 380, 'Kid-Friendly Assists:', {
  fontSize: '18px',
  color: '#888888',
}).setOrigin(0.5);

const assists = [
  { key: 'autoCatch', label: 'Auto-Catch Ball' },
  { key: 'slowerMode', label: 'Slower Speed' },
  { key: 'bigPaddle', label: 'Big Paddle' },
  { key: 'easyMode', label: 'Easy Mode (no bullet damage)' },
];

assists.forEach((assist, index) => {
  const y = 410 + index * 30;
  const checkbox = this.add.text(GAME_WIDTH / 2 - 100, y,
    this.settings[assist.key] ? '[X]' : '[ ]',
    { fontSize: '16px', color: '#00ff88' }
  ).setInteractive({ useHandCursor: true });

  const label = this.add.text(GAME_WIDTH / 2 - 70, y, assist.label, {
    fontSize: '16px',
    color: '#ffffff',
  });

  checkbox.on('pointerdown', () => {
    this.settings[assist.key] = !this.settings[assist.key];
    checkbox.setText(this.settings[assist.key] ? '[X]' : '[ ]');
    saveSettings(this.settings);
  });
});

// Pass settings to GameScene
playButton.on('pointerdown', () => {
  this.scene.start('GameScene', { settings: this.settings });
});
```

**Step 3: Apply settings in GameScene**

```javascript
init(data) {
  this.settings = data?.settings || loadSettings();
  // ... rest of init
}

// In Paddle creation:
if (this.settings.bigPaddle) {
  this.paddle.baseWidth *= 1.5;
  this.paddle.updateWidth();
}

// In MeteorEgg bounce:
if (this.settings.autoCatch || this.mutationManager?.hasMagnet()) {
  egg.stickToPaddle(this.paddle);
}

// In updateBullets():
if (this.settings.easyMode) {
  // Bullets don't damage, just destroy them
  bullet.destroy();
  this.bullets.splice(i, 1);
  continue; // Skip damage
}

// Global speed modifier in update():
const speedScale = this.settings.slowerMode ? 0.75 : 1;
// Apply to march speed, bullet speed, egg speed
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add kid-friendly difficulty assists"
```

---

## Task 5.5: Add Run Summary Screen

**Goal:** Detailed end-of-run stats

Reference: GDD Section 15 (UI/UX) - "Run Summary"

**Files:**
- Modify: `src/scenes/GameOverScene.js`

**Step 1: Enhance GameOverScene**

```javascript
init(data) {
  this.finalScore = data.score || 0;
  this.waveReached = data.wave || 1;
  this.won = data.won || false;
  this.highestCombo = data.highestCombo || 0;
  this.mutationsCollected = data.mutationsCollected || 0;
  this.dinosDestroyed = data.dinosDestroyed || 0;
}

create() {
  const centerX = GAME_WIDTH / 2;

  // Title
  const titleText = this.won ? 'VICTORY!' : 'GAME OVER';
  const titleColor = this.won ? '#00ff88' : '#ff4444';

  this.add.text(centerX, 80, titleText, {
    fontSize: '48px',
    fontFamily: 'Arial Black',
    color: titleColor,
  }).setOrigin(0.5);

  // Stats card
  const cardY = 180;
  this.add.rectangle(centerX, cardY + 80, 300, 200, 0x222222, 0.8);

  const stats = [
    { label: 'Final Score', value: this.finalScore.toLocaleString() },
    { label: 'Wave Reached', value: `${this.waveReached} / 10` },
    { label: 'Dinos Destroyed', value: this.dinosDestroyed },
    { label: 'Highest Combo', value: `${this.highestCombo}x` },
    { label: 'Mutations Collected', value: this.mutationsCollected },
  ];

  stats.forEach((stat, index) => {
    const y = cardY + 20 + index * 35;

    this.add.text(centerX - 120, y, stat.label, {
      fontSize: '16px',
      color: '#888888',
    });

    this.add.text(centerX + 120, y, stat.value.toString(), {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(1, 0);
  });

  // Buttons
  const playAgainButton = this.add.text(centerX, 420, '[ PLAY AGAIN ]', {
    fontSize: '28px',
    color: '#ffff00',
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });

  playAgainButton.on('pointerdown', () => this.scene.start('GameScene'));

  const menuButton = this.add.text(centerX, 470, '[ MENU ]', {
    fontSize: '20px',
    color: '#888888',
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });

  menuButton.on('pointerdown', () => this.scene.start('MenuScene'));

  // Input
  this.input.keyboard.on('keydown-SPACE', () => this.scene.start('GameScene'));
  this.input.keyboard.on('keydown-R', () => this.scene.start('GameScene'));
}
```

**Step 2: Track stats in GameScene**

```javascript
// In init():
this.highestCombo = 0;
this.mutationsCollected = 0;
this.dinosDestroyed = 0;

// In addScore (update highest combo):
this.highestCombo = Math.max(this.highestCombo, this.comboCount);

// In WaveManager.removeDino:
this.scene.dinosDestroyed++;

// In MutationManager.addMutation:
this.scene.mutationsCollected++;

// In gameOver:
gameOver(won) {
  this.scene.start('GameOverScene', {
    score: this.score,
    wave: this.currentWave,
    won: won,
    highestCombo: this.highestCombo,
    mutationsCollected: this.mutationsCollected,
    dinosDestroyed: this.dinosDestroyed,
  });
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add detailed run summary screen"
```

---

## Task 5.6: Final Polish & Testing

**Goal:** Complete integration test and bug fixes

**Files:**
- Various bug fixes

**Step 1: Full playthrough checklist**

- [ ] Menu loads, settings toggles work
- [ ] Game starts with settings applied
- [ ] All 10 waves play correctly
- [ ] All 7 powerups work
- [ ] All 6 mutations work
- [ ] Mutation decay on heart loss
- [ ] Bumpers bounce with sound
- [ ] Wormholes teleport with cooldown
- [ ] Gravity wells curve egg
- [ ] Boss fight works (3 phases)
- [ ] Victory triggers after boss
- [ ] Game over shows stats
- [ ] Sounds play correctly
- [ ] Screen shake on impacts
- [ ] Combo system awards multiplier
- [ ] Kid assists all function

**Step 2: Fix any issues found**

Document and fix bugs.

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: final polish and bug fixes"
```

**Step 4: Push to GitHub**

```bash
git push origin master
```

---

# DEPLOYMENT

## Task 6.1: Build for Production

**Step 1: Build**

```bash
npm run build
```

**Step 2: Test build locally**

```bash
npm run preview
```

**Step 3: Deploy to dinoblast.org**

Options:
- **Netlify:** Drag `dist` folder to netlify.com
- **Vercel:** `npx vercel --prod`
- **GitHub Pages:** Push `dist` to `gh-pages` branch

---

# END OF PART 2

**All Phases Complete!**

You now have a fully playable Dino Rift Defender with:
- 10 waves of increasing difficulty
- 3 dino types + Mothership Rex boss
- 7 timed powerups
- 6 stackable mutations
- Pinball chaos (bumpers, wormholes, gravity wells)
- Combo scoring system
- Kid-friendly difficulty assists
- Procedural sound effects
- Screen shake feedback
- Run summary stats

**Ready to play with your 6-year-old!**

---

## Future Enhancements (Optional)

If you want to keep building:
- Phase 6: Co-op Drone mode (second player controls a helper)
- Phase 7: Cosmetics (sled skins, egg trails, dino hats)
- Phase 8: More waves and bosses
- Phase 9: Mobile touch controls
- Phase 10: Leaderboards
