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
  LASER: {
    name: 'Dino Laser',
    label: 'LASR',
    color: 0xff0000,
    duration: 6000,
    description: 'Shoot lasers from paddle',
  },
  BOMB: {
    name: 'Meteor Strike',
    label: 'BOMB',
    color: 0xff6600,
    duration: null, // Instant use
    description: 'Explosion damages nearby dinos',
  },
};

export const MUTATIONS = {
  WIDTH: {
    name: 'T-Rex Tail Extension',
    label: 'W+',
    color: 0x00ff00,
    maxStacks: 3,
    perStack: 0.25, // +25% width
    description: '+25% paddle width per stack',
  },
  SPEED: {
    name: 'Jetpack Fins',
    label: 'S+',
    color: 0xffff00,
    maxStacks: 3,
    perStack: 0.20, // +20% speed
    description: '+20% paddle speed per stack',
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
    label: 'REF',
    color: 0xff00ff,
    maxStacks: 1,
    description: 'Reflects plasma spit upward',
  },
  MAGNET: {
    name: 'Ptero Magnet',
    label: 'MAG',
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
