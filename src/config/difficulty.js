// src/config/difficulty.js

export const DIFFICULTY = {
  EASY: {
    name: 'Easy',
    color: 0x00ff00,
    hearts: 5,
    eggSpeed: 240,
    bulletSpeed: 80,
    marchSpeedMultiplier: 0.7,
    shootChanceMultiplier: 0.5,
    dropRateMultiplier: 1.5,
    description: 'More hearts, slower enemies',
  },
  NORMAL: {
    name: 'Normal',
    color: 0xffff00,
    hearts: 3,
    eggSpeed: 280,
    bulletSpeed: 120,
    marchSpeedMultiplier: 1.0,
    shootChanceMultiplier: 1.0,
    dropRateMultiplier: 1.0,
    description: 'Standard experience',
  },
  HARD: {
    name: 'Hard',
    color: 0xff0000,
    hearts: 2,
    eggSpeed: 320,
    bulletSpeed: 160,
    marchSpeedMultiplier: 1.3,
    shootChanceMultiplier: 1.5,
    dropRateMultiplier: 0.7,
    description: 'Fewer hearts, faster enemies',
  },
};

export const DIFFICULTY_ORDER = ['EASY', 'NORMAL', 'HARD'];
