// src/systems/ParticleManager.js
import Phaser from 'phaser';

export class ParticleManager {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  // Dino explosion effect
  explodeDino(x, y, color = 0xff4400) {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 80 + Math.random() * 60;
      const size = 4 + Math.random() * 4;

      const particle = this.scene.add.circle(x, y, size, color);
      particle.setDepth(5);

      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.particles.push({
        graphic: particle,
        vx,
        vy,
        life: 500 + Math.random() * 300,
        maxLife: 500 + Math.random() * 300,
        gravity: 100,
      });
    }
  }

  // Bomb explosion effect
  bombExplosion(x, y) {
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 150 + Math.random() * 100;

      const colors = [0xff4400, 0xff6600, 0xffff00, 0xff0000];
      const color = Phaser.Utils.Array.GetRandom(colors);

      const particle = this.scene.add.circle(x, y, 6 + Math.random() * 6, color);
      particle.setDepth(5);

      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.particles.push({
        graphic: particle,
        vx,
        vy,
        life: 600 + Math.random() * 400,
        maxLife: 600 + Math.random() * 400,
        gravity: 50,
      });
    }

    // Add ring effect
    const ring = this.scene.add.circle(x, y, 20, 0xff6600, 0);
    ring.setStrokeStyle(4, 0xff6600);
    ring.setDepth(4);

    this.scene.tweens.add({
      targets: ring,
      radius: 200,
      alpha: 0,
      duration: 400,
      onUpdate: () => ring.setScale(ring.radius / 20),
      onComplete: () => ring.destroy(),
    });
  }

  // Powerup pickup sparkle
  powerupSparkle(x, y, color) {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 60 + Math.random() * 40;

      const particle = this.scene.add.star(x, y, 4, 2, 5, color);
      particle.setDepth(5);

      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.particles.push({
        graphic: particle,
        vx,
        vy,
        life: 400,
        maxLife: 400,
        gravity: -20, // Float up
        spin: 0.1,
      });
    }
  }

  // Egg trail effect
  eggTrail(x, y) {
    const particle = this.scene.add.circle(x, y, 3, 0xffff00);
    particle.setAlpha(0.6);
    particle.setDepth(-1);

    this.particles.push({
      graphic: particle,
      vx: 0,
      vy: 0,
      life: 200,
      maxLife: 200,
      gravity: 0,
      shrink: true,
    });
  }

  // Laser hit spark
  laserSpark(x, y) {
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 30;

      const particle = this.scene.add.circle(x, y, 2, 0xff0000);
      particle.setDepth(5);

      this.particles.push({
        graphic: particle,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 200,
        maxLife: 200,
        gravity: 0,
      });
    }
  }

  update(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Update position
      p.graphic.x += p.vx * (delta / 1000);
      p.graphic.y += p.vy * (delta / 1000);

      // Apply gravity
      if (p.gravity) {
        p.vy += p.gravity * (delta / 1000);
      }

      // Apply spin
      if (p.spin) {
        p.graphic.rotation += p.spin;
      }

      // Update life
      p.life -= delta;

      // Fade and shrink
      const lifeRatio = p.life / p.maxLife;
      p.graphic.setAlpha(lifeRatio);

      if (p.shrink) {
        p.graphic.setScale(lifeRatio);
      }

      // Remove dead particles
      if (p.life <= 0) {
        p.graphic.destroy();
        this.particles.splice(i, 1);
      }
    }
  }

  clear() {
    this.particles.forEach(p => p.graphic.destroy());
    this.particles = [];
  }
}
