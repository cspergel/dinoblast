// src/entities/Starfield.js
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

export class Starfield {
  constructor(scene) {
    this.scene = scene;
    this.stars = [];

    // Create multiple layers of stars
    this.createStarLayer(100, 0.5, 0x444466, 1); // Far, dim, slow
    this.createStarLayer(60, 1, 0x6666aa, 2);    // Mid layer
    this.createStarLayer(30, 2, 0xaaaaff, 3);    // Near, bright, fast

    // Occasional shooting star
    this.shootingStarTimer = 0;
  }

  createStarLayer(count, size, color, speed) {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * GAME_WIDTH;
      const y = Math.random() * GAME_HEIGHT;

      const star = this.scene.add.circle(x, y, size, color);
      star.setAlpha(0.3 + Math.random() * 0.7);
      star.setDepth(-10); // Behind everything

      // Store star data
      this.stars.push({
        graphic: star,
        speed: speed * 0.5,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinkleOffset: Math.random() * Math.PI * 2,
        baseAlpha: star.alpha,
      });
    }
  }

  update(time, delta) {
    // Update stars
    this.stars.forEach(star => {
      // Slow vertical drift
      star.graphic.y += star.speed * (delta / 16);

      // Wrap around
      if (star.graphic.y > GAME_HEIGHT + 5) {
        star.graphic.y = -5;
        star.graphic.x = Math.random() * GAME_WIDTH;
      }

      // Twinkle effect
      const twinkle = Math.sin(time * 0.001 * star.twinkleSpeed + star.twinkleOffset);
      star.graphic.setAlpha(star.baseAlpha * (0.7 + twinkle * 0.3));
    });

    // Shooting star
    this.shootingStarTimer -= delta;
    if (this.shootingStarTimer <= 0) {
      this.shootingStarTimer = 3000 + Math.random() * 7000; // 3-10 seconds
      this.createShootingStar();
    }
  }

  createShootingStar() {
    const startX = Math.random() * GAME_WIDTH;
    const startY = -10;

    const star = this.scene.add.rectangle(startX, startY, 3, 20, 0xffffff);
    star.setAlpha(0.8);
    star.setDepth(-9);
    star.setRotation(Math.PI / 4); // 45 degree angle

    // Animate the shooting star
    this.scene.tweens.add({
      targets: star,
      x: startX + 300,
      y: GAME_HEIGHT + 50,
      alpha: 0,
      duration: 800,
      ease: 'Linear',
      onComplete: () => star.destroy(),
    });
  }

  destroy() {
    this.stars.forEach(star => star.graphic.destroy());
    this.stars = [];
  }
}
