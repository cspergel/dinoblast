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
      shootChance: 0.0002, // Reduced 10x for easier gameplay
    },
    ptero: {
      type: 'rect',
      color: 0xff8800,
      width: 50,
      height: 40,
      label: 'P',
      hp: 1,
      shootChance: 0.0008, // Reduced 10x for easier gameplay
    },
    trike: {
      type: 'rect',
      color: 0x4488ff,
      width: 50,
      height: 40,
      label: 'T',
      hp: 2,
      shootChance: 0.0004, // Reduced 10x for easier gameplay
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
    color: 0xff00ff, // Bright magenta
    radius: 35,
  },

  wormhole: {
    type: 'circle',
    color: 0x00ffff, // Bright cyan
    radius: 35,
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
