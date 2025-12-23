// src/systems/StorageManager.js
// Handles localStorage for high scores, settings, achievements, unlocks

const STORAGE_KEY = 'dinoblast_save';

const DEFAULT_DATA = {
  highScore: 0,
  highWave: 0,
  totalGames: 0,
  totalKills: 0,
  settings: {
    soundEnabled: true,
    screenShake: true,
    tutorialSeen: false,
  },
  achievements: {},
  unlockedSkins: ['default'],
  selectedSkin: 'default',
  dailyChallenge: {
    lastDate: null,
    bestScore: 0,
  },
};

class StorageManagerClass {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_DATA, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load save data:', e);
    }
    return { ...DEFAULT_DATA };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save data:', e);
    }
  }

  // High scores
  getHighScore() {
    return this.data.highScore;
  }

  getHighWave() {
    return this.data.highWave;
  }

  updateHighScore(score, wave) {
    let isNewHigh = false;
    if (score > this.data.highScore) {
      this.data.highScore = score;
      isNewHigh = true;
    }
    if (wave > this.data.highWave) {
      this.data.highWave = wave;
    }
    this.data.totalGames++;
    this.save();
    return isNewHigh;
  }

  addKills(count) {
    this.data.totalKills += count;
    this.save();
  }

  getTotalKills() {
    return this.data.totalKills;
  }

  getTotalGames() {
    return this.data.totalGames;
  }

  // Settings
  getSetting(key) {
    return this.data.settings[key];
  }

  setSetting(key, value) {
    this.data.settings[key] = value;
    this.save();
  }

  toggleSetting(key) {
    this.data.settings[key] = !this.data.settings[key];
    this.save();
    return this.data.settings[key];
  }

  // Achievements
  getAchievements() {
    return this.data.achievements;
  }

  unlockAchievement(id) {
    if (!this.data.achievements[id]) {
      this.data.achievements[id] = Date.now();
      this.save();
      return true; // New unlock
    }
    return false; // Already had it
  }

  hasAchievement(id) {
    return !!this.data.achievements[id];
  }

  // Skins
  getUnlockedSkins() {
    return this.data.unlockedSkins;
  }

  unlockSkin(skinId) {
    if (!this.data.unlockedSkins.includes(skinId)) {
      this.data.unlockedSkins.push(skinId);
      this.save();
      return true;
    }
    return false;
  }

  getSelectedSkin() {
    return this.data.selectedSkin;
  }

  selectSkin(skinId) {
    if (this.data.unlockedSkins.includes(skinId)) {
      this.data.selectedSkin = skinId;
      this.save();
      return true;
    }
    return false;
  }

  // Daily Challenge
  getDailyChallenge() {
    const today = new Date().toISOString().split('T')[0];
    if (this.data.dailyChallenge.lastDate !== today) {
      this.data.dailyChallenge.lastDate = today;
      this.data.dailyChallenge.bestScore = 0;
      this.save();
    }
    return {
      date: today,
      seed: this.dateToSeed(today),
      bestScore: this.data.dailyChallenge.bestScore,
    };
  }

  updateDailyScore(score) {
    const today = new Date().toISOString().split('T')[0];
    if (this.data.dailyChallenge.lastDate === today) {
      if (score > this.data.dailyChallenge.bestScore) {
        this.data.dailyChallenge.bestScore = score;
        this.save();
        return true;
      }
    }
    return false;
  }

  dateToSeed(dateStr) {
    // Convert date string to a numeric seed
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // Reset
  resetAll() {
    this.data = { ...DEFAULT_DATA };
    this.save();
  }
}

export const storageManager = new StorageManagerClass();
