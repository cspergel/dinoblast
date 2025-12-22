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
