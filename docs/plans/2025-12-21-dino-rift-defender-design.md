# Dino Rift Defender - Technical Design Document

*Companion to the Game Design Document - Implementation-focused*

---

## Goals & Constraints

- **Primary goal:** Learning experience for 6-year-old + ship a playable game
- **Scope:** Full vision (Milestones 1-5) - paddle, pinball, powerups, mutations, boss
- **Art approach:** Start with colored shapes, swap to sprites later
- **Tech stack:** Phaser 3 + Vite + vanilla JavaScript

---

## Project Structure

```
dino_rift_defender/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js                  # Entry point, Phaser config
│   ├── config/
│   │   └── sprites.js           # Asset definitions (swappable)
│   ├── scenes/
│   │   ├── BootScene.js         # Load assets
│   │   ├── MenuScene.js         # Title screen
│   │   ├── GameScene.js         # Main gameplay
│   │   ├── PauseScene.js        # Pause overlay
│   │   └── GameOverScene.js     # Score summary
│   ├── entities/
│   │   ├── Paddle.js
│   │   ├── MeteorEgg.js
│   │   ├── Dino.js
│   │   ├── Bumper.js
│   │   ├── Wormhole.js
│   │   ├── PlasmaSpit.js
│   │   └── Drop.js
│   ├── systems/
│   │   ├── WaveManager.js
│   │   ├── PowerupManager.js
│   │   ├── MutationManager.js
│   │   └── CollisionManager.js
│   ├── ui/
│   │   └── HUD.js
│   └── data/
│       └── waves.json           # Wave definitions
├── assets/
│   └── sounds/
└── docs/
    ├── dino-rift-defender-gdd.md
    └── plans/
        └── 2025-12-21-dino-rift-defender-design.md
```

---

## Scene Flow

```
BootScene (load assets)
    ↓
MenuScene (Play / Settings)
    ↓
GameScene (main gameplay loop)
    ↓ (pause)
PauseScene (overlay, resume/quit)
    ↓ (game over)
GameOverScene (score, mutations collected, play again)
```

---

## Core Game Loop (GameScene)

Each frame:
1. **Input** - Read paddle movement (arrow keys / A+D)
2. **Update entities** - Move egg, march dinos, move bullets
3. **Collisions** - Egg↔paddle, egg↔dinos, egg↔bumpers, bullets↔paddle, dinos↔earth-line
4. **Spawn/cleanup** - Spawn drops from dead dinos, remove off-screen bullets
5. **Check win/lose** - All dinos dead? Hearts at zero?
6. **Render** - Phaser handles automatically

---

## Manager Classes

| Manager | Responsibility |
|---------|----------------|
| `WaveManager` | Loads wave JSON, spawns dino grid, tracks wave clear |
| `PowerupManager` | Spawns drops, tracks active timed effects, handles expiration |
| `MutationManager` | Tracks stacked mutations, applies bonuses, handles decay on heart loss |
| `CollisionManager` | Sets up all Phaser collision handlers in one place |

---

## Game State (GameScene)

```javascript
{
  hearts: 3,
  score: 0,
  currentWave: 1,
  activePowerups: [],   // { type, remainingTime }
  mutations: {          // stack counts
    width: 0,
    speed: 0,
    armor: 0,
    reflect: 0,
    magnet: 0,
    bunker: 0
  }
}
```

---

## Core Entities

### Paddle (Rocket Sled)
- Rectangle at bottom center
- Properties: `width`, `speed`, `shieldPips`
- Movement clamped to screen edges
- Mutations modify width/speed directly

### Meteor Egg (Ball)
- Circle with physics velocity
- Bounces off walls, paddle, dinos, bumpers
- Paddle hit angle based on contact point
- Properties: `piercing`, `stuck` (for catch-and-aim)
- Max 3 eggs active (Multi-Egg powerup)

### Dinos (Enemies)
| Type | HP | Shoots | Role |
|------|-----|--------|------|
| AstroRaptor | 1 | Rarely | Filler |
| PteroSpitter | 1 | Often | Forces movement |
| ArmoredTrike | 2 | Moderate | Tank, cracks after first hit |

- Grid formation, march left/right + descend
- On death: chance to drop powerup or mutation

### Plasma Spit (Enemy Bullets)
- Circles moving downward
- Hit paddle → lose 1 heart (unless shielded)
- Spiky Paddle mutation reflects upward

### Drops
- Fall straight down from dead dinos
- Timed powerups: capsule shape
- Mutations: DNA helix shape

---

## Pinball Objects

### Asteroid Bumpers
- Static circles, defined per wave
- Strong bounce + score bonus (+2)
- Visual: pulse on hit

### Wormholes (Portal Pairs)
- Two linked circles (A ↔ B)
- Egg enters A → exits B, same velocity
- 1-second cooldown prevents loops

### Gravity Wells (Optional)
- Subtle circle, gently curves egg trajectory
- Light touch - surprise, not frustration

---

## Boss: Mothership Rex (Wave 10)

| Property | Value |
|----------|-------|
| HP | 15 |
| Size | ~1/3 screen width |
| Position | Top center, slight movement |

**Mechanics:**
- 3 weak points that open/close (hit only when open)
- Attack patterns: spray → burst → aimed spit
- Speeds up every 5 HP lost
- Drops 3-4 mutations on defeat

---

## Powerups & Mutations

### Timed Powerups (8-12 seconds)

| Powerup | Key | Effect |
|---------|-----|--------|
| Triceratops Plow | WIDE | +50% paddle width |
| Raptor Boost | FAST | +40% paddle speed |
| Stego Shield | SHIELD | +1 shield pip |
| Time Fossil | SLOW | 30% speed reduction |
| Comet Core | FIRE | Egg pierces dinos |
| Spring Tail | SPRING | Egg moves faster |
| Multi-Egg | MULTI | +1 egg (max 3) |

### Stackable Mutations

| Mutation | Per Stack | Max |
|----------|-----------|-----|
| T-Rex Tail (WIDTH+) | +15% width | 3 |
| Jetpack Fins (SPEED+) | +10% speed | 3 |
| Ankylosaur Armor (ARMOR+) | +1 shield pip | 3 |
| Spiky Paddle (REFLECT) | Reflects bullets | 1 |
| Ptero Magnet (MAGNET) | Egg sticks | 1 |
| Bunker Builder (BUNKER) | +2 shield tiles | 2 |

### Decay System
- Lose heart → lose 1 random mutation stack
- Creates stakes without brutal punishment

---

## Asset-Swappable Architecture

```javascript
// src/config/sprites.js - shapes for now
export const SPRITES = {
  paddle: { type: 'rect', color: 0x00ff00, width: 120, height: 20 },
  egg:    { type: 'circle', color: 0xffff00, radius: 10 },
  dinos: {
    raptor: { type: 'rect', color: 0xff0000, label: 'R' },
    ptero:  { type: 'rect', color: 0xff6600, label: 'P' },
    trike:  { type: 'rect', color: 0x0066ff, label: 'T' },
  },
};

// Later, swap to sprites:
export const SPRITES = {
  paddle: { type: 'sprite', key: 'rocket-sled' },
  egg:    { type: 'sprite', key: 'meteor-egg' },
  // ...
};
```

Entities use a factory function that reads config - change one file, entire game updates.

---

## HUD Layout

```
┌─────────────────────────────────────────┐
│ ♥♥♥        WAVE 3        SCORE: 1240   │  ← Top bar
│ [WIDE ████░░] [FIRE ██░░░░]            │  ← Active powerups
│                                         │
│           (game area)                   │
│                                         │
│     [W+][W+][S+][⚡]                    │  ← Mutations near paddle
└─────────────────────────────────────────┘
```

---

## Difficulty Assists

| Assist | Effect |
|--------|--------|
| Auto-catch | Egg sticks to paddle every hit |
| Slower mode | 25% speed reduction |
| Big paddle | +50% starting width |
| Easy mode | Plasma spit doesn't damage |

## Rubber-banding (Hidden)
- 2 hearts lost quickly → guaranteed helpful drop
- 2-second mercy slow after damage
- Max 6 bullets on screen

---

## Wave Progression

Difficulty scales across 10 waves:
- More dinos per row
- More Pteros and Trikes
- Faster march + descent
- More bullets
- More pinball objects

Wave 10 = Mothership Rex boss fight

---

*Design validated: 2025-12-21*
