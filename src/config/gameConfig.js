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
