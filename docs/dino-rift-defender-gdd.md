# Dino Rift Defender — Master Game Design Document

*A kid-friendly mashup of Breakout + Space Invaders + Pinball chaos — with dinosaurs in space, stackable paddle mutations, and "meteor egg" physics.*

---

## 1) One-Sentence Pitch

**Bounce a meteor egg off your rocket-sled paddle to smash marching space-dinos before they reach Earth — while wormholes and asteroid bumpers create pinball moments and DNA capsules mutate your paddle into a ridiculous stacked super-weapon.**

---

## 2) Target Players + Design Goals

**Primary:** Kids ~6–12 (plays great with a parent)  
**Secondary:** Anyone who likes classic arcade loops

**Design Goals**

- Easy to learn in 10 seconds: move, bounce, survive
- Exciting surprises: portals, bumpers, powerups
- "Power fantasy" without complexity: upgrades are visual, stackable, and simple
- Short sessions: 2–6 minutes per run/wave
- Co-op optional, not required

---

## 3) Core Game Pillars

1. **Angle Skill (Breakout):** Paddle positioning matters; satisfying ricochets
2. **Rising Pressure (Invaders):** Enemies descend + shoot; urgency increases
3. **Pinball Spice:** Bumpers, portals, and gravity create "whoa!" saves
4. **Mutation Stacking:** Paddle evolves over a run into a goofy super-tool
5. **Readable Chaos:** Even with upgrades, the screen stays understandable

---

## 4) Core Loop (Moment-to-Moment)

1. **Launch** the meteor egg
2. **Deflect** egg with paddle to hit dinos
3. **Dodge** plasma spit (enemy bullets) while managing descending formation
4. **Collect** drops: timed powerups + permanent-ish paddle mutations
5. **Clear wave** → difficulty increases → repeat

**Win a wave:** All dinos destroyed  
**Lose:** Earth's Shield Energy (hearts) reaches zero

---

## 5) Controls + Accessibility

### Default Controls

| Action  | Keys              |
|---------|-------------------|
| Move    | Left/Right arrows (or A/D) |
| Launch  | Space             |
| Restart | R                 |

### Kid-Friendly Assists (Toggles)

- **Auto-catch:** Ball sticks to paddle on every hit; launch to aim
- **Slower mode:** Reduces overall speed by 15–25%
- **Big paddle mode:** Starts wider
- **Colorblind-friendly:** Drop shapes/icons distinguish powerups (not color-only)

---

## 6) World + Theme

**Setting:** The Rift opens over Earth. Space dinosaurs pour out riding asteroid armor.  
**Player:** A "Rocket Sled Ranger" defending Earth's shield line.

### Visual Mapping

| Game Element | Theme Translation         |
|--------------|---------------------------|
| Paddle       | Rocket Sled / Space Surfboard |
| Ball         | Meteor Egg (glowing)      |
| Invaders     | Astro-Raptors / Laser Triceratops / Ptero Drones |
| Bullets      | Plasma Spit               |
| Bumpers      | Asteroid Bumpers          |
| Portals      | Wormholes                 |
| Drops        | DNA Capsules / Fossils / Comet Cores |

---

## 7) Unified Loss System: Earth's Shield Energy

The game uses a single unified resource — **Hearts** — representing Earth's Shield Energy. This creates one clear thing to protect and removes confusion between multiple loss conditions.

### How Hearts Work

| Event                          | Effect           |
|--------------------------------|------------------|
| Start of game                  | 3 Hearts         |
| Plasma spit hits paddle        | −1 Heart         |
| Dino reaches Earth line        | −1 Heart (dino removed) |
| Hearts reach zero              | **Game Over**    |

### Difficulty Variants

**Normal Mode (Default)**
- Plasma spit hit = −1 Heart
- Dino reaches Earth = −1 Heart

**Dramatic Mode (Harder)**
- Plasma spit hit = −1 Heart
- Dino reaches Earth = −2 Hearts (makes the Earth line scarier)

**Easy Mode (Younger Players)**
- Plasma spit does NOT damage (dodging is just for positioning)
- Dino reaches Earth = −1 Heart
- Whole game becomes "don't let them get past you" — very clean mental model

---

## 8) Objects + Physics

### 8.1 Paddle Behavior

- Paddle reflects the egg with an angle based on impact point
- Optional **Catch-and-Aim:** Either once per bounce or always-on via mutation

### 8.2 Meteor Egg Behavior

Standard Breakout bounce physics, enhanced by pinball features:

| Feature       | Effect                                      |
|---------------|---------------------------------------------|
| Bumpers       | Strong bounce + score bonus                 |
| Wormholes     | Teleport from A → B (cooldown prevents loops) |
| Gravity wells | Slight curve for "space drift" moments (optional) |

---

## 9) Enemies (Space Dinos)

Keep enemy types readable: **3 core dinos** + 1 boss archetype.

### 9.1 Core Enemy Types

**Astro-Raptor (Basic)**
- HP: 1
- Shoots: Rarely
- Role: Filler, satisfying pops

**Ptero Spitter (Shooter)**
- HP: 1
- Shoots: Often
- Role: Forces movement/urgency

**Armored Trike (Tank)**
- HP: 2 (cracks after first hit)
- Shoots: Moderate
- Role: Slows clear speed; protects formation

### 9.2 Boss Types (End of Chapter)

**Mothership Rex**
- HP: 12–25 (scales with progression)
- Weak points open/close
- Drops multiple capsules on defeat
- Attack patterns: "spray," "burst," "aimed spit"

---

## 10) Drops: Two Categories

### A) Timed Powerups (Short Boosts)

Duration: 8–12 seconds. Collecting the same type refreshes the timer.

| Powerup               | Icon    | Effect                                    | Duration |
|-----------------------|---------|-------------------------------------------|----------|
| Triceratops Plow      | WIDE    | Paddle width increases                    | 10s      |
| Raptor Boost          | FAST    | Paddle speed increases                    | 10s      |
| Stego Shield          | SHIELD  | +1 shield pip (blocks 1 hit, max 3 pips)  | Until hit |
| Time Fossil           | SLOW    | Slows dinos + bullets + march speed       | 8s       |
| Comet Core            | FIRE    | Egg pierces dinos (no bounce on hit)      | 8s       |
| Spring Tail           | SPRING  | Extra bounce power, keeps egg lively      | 10s      |
| Multi-Egg Nest        | MULTI   | +1 egg in play (max 3 total)              | 8s       |

### B) Stackable Paddle Mutations (Persistent)

Persist for current run. Lose one random stack when you lose a heart.

| Mutation              | Symbol  | Effect                                    | Max Stacks |
|-----------------------|---------|-------------------------------------------|------------|
| T-Rex Tail Extension  | WIDTH+  | +15% paddle width per stack               | 3          |
| Jetpack Fins          | SPEED+  | +10% paddle speed per stack               | 3          |
| Ankylosaur Armor      | ARMOR+  | +1 permanent shield pip per stack         | 3          |
| Spiky Paddle          | REFLECT | Plasma spit bounces upward when hit       | 1          |
| Ptero Magnet          | MAGNET  | Egg sticks on every paddle hit            | 1          |
| Bunker Builder        | BUNKER  | +2 mini shield tiles above paddle         | 2          |

### Mutation Decay Rule

When you lose a heart, lose **one random mutation stack**. This keeps stakes without being brutal.

---

## 11) Scoring + Rewards

### Base Scoring

| Action                | Points  |
|-----------------------|---------|
| Basic dino (Raptor)   | +10     |
| Shooter dino (Ptero)  | +14     |
| Armored dino (Trike)  | +18     |
| Bumper hit            | +2      |
| Wormhole teleport     | +5      |

### Combo System

Consecutive dino hits within 2 seconds increase multiplier: x1 → x2 → x3

### End-of-Wave Bonuses

- **No Damage:** Cleared wave without losing hearts
- **Fast Clear:** Beat wave under time threshold
- **Clean Earth:** Dinos never crossed midline

### Meta Rewards (Optional)

Stars per wave (1–3) unlock cosmetics: sled skins, egg trails, dino hats.

---

## 12) Difficulty Curve

Difficulty ramps through:

- March speed + descent rate
- Bullet frequency + patterns
- More armored dinos
- More chaotic geometry (bumpers/portals)
- Fewer safe lanes

### Kid-Friendly Balancing Knobs

- Cap bullets on screen (e.g., max 6)
- Add "mercy slow" for 2 seconds after taking damage
- Guarantee a helpful drop if player is struggling (rubber-banding)

---

## 13) Level/Wave Design

### 13.1 Wave Definition

Each wave specifies:

- Dino grid layout (rows, columns, types)
- March speed + drop rate
- Pinball objects (bumpers, wormholes, gravity wells)
- Drop rates (timed vs mutations)
- Special wave gimmick (optional)

### 13.2 Example Progression (Waves 1–10)

| Wave | Name               | Features                                |
|------|--------------------|-----------------------------------------|
| 1    | Training Orbit     | Few shooters, 1 bumper                  |
| 2    | Asteroid Garden    | 3 bumpers, simple layout                |
| 3    | Wormhole Peekaboo  | Portals introduced                      |
| 4    | Spitter Rain       | More shooters                           |
| 5    | Armor Row          | Armored dinos, "crack" state introduced |
| 6    | Pinball Lane       | Bumpers arranged for wild ricochets     |
| 7    | Slow-Mo Fossil     | Higher SLOW drop chance                 |
| 8    | Multi-Egg Mayhem   | Multiball introduced                    |
| 9    | Gravity Drift      | Gentle gravity well (optional)          |
| 10   | **Boss: Mothership Rex** | Full boss fight                    |

---

## 14) Co-op Mode: Dino Drone

Optional second player mode (great for parent + kid).

**Player 1:** Controls paddle  
**Player 2:** Controls drone cursor

### Drone Abilities

- **Cooldown Zap:** Fire 1 shot every 2 seconds
- **Capsule Assist:** Hover over drops to guide them toward paddle

Co-op is a toggle; solo mode remains clean and fully playable.

---

## 15) UI/UX

### Screen Flow

```
Title Screen
    ├── Play (Solo)
    ├── Co-op
    └── Settings
            ├── Difficulty assists
            ├── Sound
            └── Controls

Wave Start Card → "Portal Panic!" (wave name + gimmick)

Pause Screen

Run Summary → Score, highest combo, mutations collected
```

### In-Game HUD (Minimal)

- Hearts (Earth Shield Energy)
- Shield pips (if any)
- Active timed effects (icons + timers)
- Mutation stack icons (near paddle, small + readable)

---

## 16) Art Direction

**Style:** Chunky, bright silhouettes on dark space background

### Animation Guidelines

- Dinos: 2-frame idle animation
- Armored dinos: Crack overlay after first hit
- Meteor egg: Glowing trail
- Wormholes: Shimmer effect
- Bumpers: Pulse on hit

### Readable Shape Language

- **Timed powerups:** Capsule shape with letter/icon
- **Mutations:** DNA helix shape with symbol (tail, fin, armor, spike, magnet, bunker)

---

## 17) Audio Direction

Kid-rewarding sound design with musical feedback.

| Event           | Sound                              |
|-----------------|------------------------------------|
| Paddle hit      | Soft "boop"                        |
| Dino hit        | Musical note (varies by row)       |
| Wormhole enter  | "Whoooop"                          |
| Powerup collect | "DNA ding!"                        |
| Damage taken    | Comedic "ouch!" + brief slowdown   |

---

## 18) Technical Implementation

### Recommended Tech Stack

**Prototype:** HTML5 Canvas + vanilla JavaScript  
**Full game:** Phaser 3 or similar

### Core Systems

- **State machine:** Menu / Playing / Pause / Win / Lose
- **Entity system:** Paddle, balls, dinos, bullets, bumpers, portals, drops
- **Collision detection:**
  - Circle vs rect (egg vs dinos/paddle)
  - Circle vs circle (egg vs bumpers)
  - Point vs rect (bullets vs paddle)
- **Data-driven waves:** JSON definitions for rapid content creation

### Save Data (Optional)

- Settings + assist preferences
- Cosmetics unlocked
- Best score per wave

---

## 19) Content Roadmap

### Milestone 1: Playable Core
- Paddle + egg + dino march + bullets + win/lose

### Milestone 2: Pinball Spice
- Bumpers + wormholes

### Milestone 3: Drops
- Timed powerups + drop UI

### Milestone 4: Stackable Mutations
- Mutation tracking + decay on heart loss + visuals

### Milestone 5: Polish + Boss
- Boss fight + wave names + sound + screenshake

### Milestone 6: Co-op + Cosmetics
- Drone mode + unlockable skins

---

## 20) Feature Checklist

### Core
- [ ] Paddle + meteor egg bounce
- [ ] Marching invader dinos + descent
- [ ] Enemy shooting (plasma spit)
- [ ] Unified heart system (Earth Shield Energy)
- [ ] Scoring + wave clear

### Pinball
- [ ] Asteroid bumpers
- [ ] Wormholes
- [ ] Gravity wells (optional)

### Drops
- [ ] Timed powerups (WIDE, FAST, SLOW, FIRE, SPRING, SHIELD, MULTI)
- [ ] Stackable mutations (WIDTH+, SPEED+, ARMOR+, REFLECT, MAGNET, BUNKER)
- [ ] Mutation decay on heart loss

### Modes
- [ ] Solo mode
- [ ] Co-op Drone mode (optional)

### UX
- [ ] Readable HUD icons + stack pips
- [ ] Difficulty assist toggles
- [ ] Wave start cards
- [ ] Run summary screen

---

## Appendix: Wave Data Schema (JSON)

```json
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
  "marchSpeed": 1.0,
  "descentRate": 0.5,
  "bulletFrequency": 0.3,
  "pinball": {
    "bumpers": [{ "x": 400, "y": 200 }],
    "wormholes": [],
    "gravityWells": []
  },
  "dropRates": {
    "timedPowerup": 0.15,
    "mutation": 0.05
  },
  "gimmick": null
}
```

---

*Document version 1.0 — Designed by a 6-year-old game designer with help from Dad*
