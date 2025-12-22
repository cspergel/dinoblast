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
