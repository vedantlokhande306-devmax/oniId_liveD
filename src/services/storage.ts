import {
  ArmoryState,
  LeaderboardEntry,
  PlayerStats,
  Sector,
  SectorId,
  DinoArchetype
} from '../types/game';

const LEADERBOARD_KEY = 'cyber_dino_leaderboard_v1';
const HISCORE_KEY = 'cyber_dino_hiscore_v1';
const PROFILE_KEY = 'cyber_dino_profile_v1';
const ARMORY_KEY = 'cyber_dino_armory_v1';
const SETTINGS_KEY = 'cyber_dino_settings_v1';
const SECTOR_KEY = 'cyber_dino_selected_sector_v1';

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    runnerTag: 'K4RMA_NULL',
    titleTag: 'ALL-TIME RECORD HOLDER',
    score: 2490150,
    distance: 31890,
    sectorName: 'NEO BABYLON',
    sectorId: '01',
    loadout: 'QUANTUM WARP // AEGIS',
    date: '2026-10-28',
    isPlayer: false
  },
  {
    id: 'seed-2',
    runnerTag: 'VEX_GLITCH',
    titleTag: 'TITAN RUNNER #8849-NA',
    score: 1842900,
    distance: 24310,
    sectorName: 'SECTOR 07',
    sectorId: '02',
    loadout: 'DASH // PULSE',
    date: '2026-10-29',
    isPlayer: false
  },
  {
    id: 'seed-3',
    runnerTag: 'SYNTH_STALKER',
    titleTag: 'VOID WALKER #0192-EU',
    score: 1620440,
    distance: 21080,
    sectorName: 'SECTOR 04',
    sectorId: '03',
    loadout: 'SHIELD // OVERLOAD',
    date: '2026-10-30',
    isPlayer: false
  },
  {
    id: 'seed-4',
    runnerTag: 'REX_CORP_99',
    titleTag: 'TITAN REAPER',
    score: 1410200,
    distance: 18450,
    sectorName: 'HYPER-LIGHT CORE',
    sectorId: '05',
    loadout: 'EMP // OVERCLOCK',
    date: '2026-10-27',
    isPlayer: false
  },
  {
    id: 'seed-5',
    runnerTag: 'NEON_FANG_X',
    titleTag: 'NEO PREDATOR',
    score: 1225800,
    distance: 16200,
    sectorName: 'VOLCANIC CORE',
    sectorId: '02',
    loadout: 'CHRONO // GLIDE',
    date: '2026-10-26',
    isPlayer: false
  },
  {
    id: 'seed-6',
    runnerTag: 'PULSE_CHASER',
    titleTag: 'LIGHTSPEED PILOT',
    score: 998420,
    distance: 14820,
    sectorName: 'ORBITAL ZERO-G',
    sectorId: '03',
    loadout: 'WARP // MAGNET',
    date: '2026-10-29',
    isPlayer: false
  },
  {
    id: 'seed-7',
    runnerTag: 'CYBER_VIPER',
    titleTag: 'NEO-DRIFTER',
    score: 875100,
    distance: 12400,
    sectorName: 'CYBER GLITCH',
    sectorId: '04',
    loadout: 'SHIELD // THRUST',
    date: '2026-10-25',
    isPlayer: false
  },
  {
    id: 'seed-8',
    runnerTag: 'VOID_WALKER_09',
    titleTag: 'SECTOR PIONEER',
    score: 742000,
    distance: 10980,
    sectorName: 'NEO TOKYO GRID',
    sectorId: '01',
    loadout: 'PULSE // RADAR',
    date: '2026-10-28',
    isPlayer: false
  }
];

export const INITIAL_SECTORS: Sector[] = [
  {
    id: '01',
    name: 'Neo Tokyo Grid',
    category: 'standard',
    description: 'High-frequency asphalt synth corridors with laser cacti arrays and steady magnetic traction.',
    gravity: 0.82,
    baseVelocityMultiplier: 1.0,
    scoreMultiplier: 1.0,
    hazardLevel: 1,
    image: '/assets/stitch/sectors.png',
    bgHorizonColor: '#00f5ff',
    bgGridColor: '#00f5ff22',
    skyTint: '#0a0e17',
    specialRules: ['+0% BASE MULT', '100% BASE VELOCITY', 'NO GRAVITY ANOMALY'],
    hiScore: 998420
  },
  {
    id: '02',
    name: 'Volcanic Core: Magma Wastes',
    category: 'daily',
    description: 'Sub-crustal magma trenches with upward thermal venting for extended gliding and kinetic meteor bursts.',
    gravity: 0.76,
    baseVelocityMultiplier: 1.15,
    scoreMultiplier: 1.5,
    hazardLevel: 3,
    image: '/assets/stitch/sectors.png',
    bgHorizonColor: '#ff4b89',
    bgGridColor: '#ff4b892a',
    skyTint: '#1c0a12',
    specialRules: ['THERMAL GLIDE BOOST', 'FALLING METEORS', '+50% XP BURST'],
    hiScore: 1410200
  },
  {
    id: '03',
    name: 'Orbital Zero-G Expanse',
    category: 'extreme',
    description: 'De-orbited solar satellite ring. Extreme float physics with dual-frequency floating drone swarms.',
    gravity: 0.52,
    baseVelocityMultiplier: 1.05,
    scoreMultiplier: 1.75,
    hazardLevel: 4,
    image: '/assets/stitch/sectors.png',
    bgHorizonColor: '#63f7ff',
    bgGridColor: '#63f7ff22',
    skyTint: '#080c16',
    specialRules: ['0.65G LOW GRAVITY', 'AERIAL DRONE SWARMS', 'FLOAT JUMP BOOST'],
    hiScore: 1620440
  },
  {
    id: '04',
    name: 'Cyber Glitch Wastes',
    category: 'standard',
    description: 'Unstable digital wasteland riddled with electromagnetic EMP storms and high-density plasma spikes.',
    gravity: 0.84,
    baseVelocityMultiplier: 1.25,
    scoreMultiplier: 1.4,
    hazardLevel: 3,
    image: '/assets/stitch/sectors.png',
    bgHorizonColor: '#3bff17',
    bgGridColor: '#3bff1722',
    skyTint: '#071607',
    specialRules: ['FAST SPIKE HAZARDS', 'EXTRA NANO-BITS', '+40% SCORE MULT'],
    hiScore: 1225800
  },
  {
    id: '05',
    name: 'Hyper-Light Core',
    category: 'extreme',
    description: 'Relativistic superconductor expressway. Extreme velocity above 240 KM/H for apex survivalists.',
    gravity: 0.88,
    baseVelocityMultiplier: 1.45,
    scoreMultiplier: 2.0,
    hazardLevel: 5,
    image: '/assets/stitch/sectors.png',
    bgHorizonColor: '#ffd9e0',
    bgGridColor: '#ffd9e028',
    skyTint: '#180f14',
    specialRules: ['2.0X MULTIPLIER', '220+ KM/H VELOCITY', 'APEX HAZARDS'],
    hiScore: 2490150
  }
];

export const INITIAL_ARCHETYPES: DinoArchetype[] = [
  {
    id: 'raptor',
    name: 'RAPTOR SCOUT',
    tagline: 'AGILE // +40% SPEED',
    description: 'Lightweight titanium exoskeleton with dual micro-thrusters, maximizing sprint acceleration and double-jump height.',
    speedRating: 92,
    armorRating: 58,
    jumpForce: -13.6,
    canGlide: false,
    maxShieldHits: 1,
    image: '/assets/stitch/armory.png'
  },
  {
    id: 'rex',
    name: 'TITAN REX',
    tagline: 'TANK // HEAVY ARMOR',
    description: 'Reinforced carbon-composite chassis built for brute survivability. Features prolonged kinetic absorption shield.',
    speedRating: 72,
    armorRating: 95,
    jumpForce: -12.4,
    canGlide: false,
    maxShieldHits: 2,
    image: '/assets/stitch/armory.png'
  },
  {
    id: 'ptero',
    name: 'PTERO GLIDER',
    tagline: 'AERIAL // SUSTAINED HOVER',
    description: 'Aerodynamic nanite wings with low-gravity glide thrusters, perfect for clearing wide hazard clusters.',
    speedRating: 84,
    armorRating: 64,
    jumpForce: -13.0,
    canGlide: true,
    maxShieldHits: 1,
    image: '/assets/stitch/armory.png'
  }
];

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  runnerTag: 'PLAYER_ZERO',
  titleTag: 'NEON GLITCHER',
  divisionTier: 'Apex Tier IV',
  allTimeBestScore: 0,
  longestRunMeters: 0,
  bestComboStreak: 0,
  totalNanoBits: 1250,
  totalQuantumCores: 4,
  runsPlayed: 0,
  dronesDestroyedOrDodged: 0
};

export const DEFAULT_ARMORY_STATE: ArmoryState = {
  selectedArchetype: 'raptor',
  visorTint: 'cyan',
  thrusterDrive: 'ion',
  opticsShader: 'neon',
  upgrades: {
    speedBoost: 1,
    shieldDuration: 1,
    empCooldown: 1,
    magnetRange: 1
  }
};

export class StorageService {
  public static getLeaderboard(): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(LEADERBOARD_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return this.rankEntries(parsed);
        }
      }
    } catch {
      // ignore
    }
    this.saveLeaderboard(INITIAL_LEADERBOARD);
    return this.rankEntries(INITIAL_LEADERBOARD);
  }

  public static saveLeaderboard(entries: LeaderboardEntry[]): void {
    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
    } catch {
      // ignore
    }
  }

  public static addRunScore(entry: Omit<LeaderboardEntry, 'id' | 'rank' | 'date'>): { entry: LeaderboardEntry; isNewHighScore: boolean; rank: number } {
    const list = this.getLeaderboard();
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: `run-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString().split('T')[0],
      isPlayer: true
    };

    list.push(newEntry);
    const ranked = this.rankEntries(list);
    this.saveLeaderboard(ranked);

    // Update player high score
    const currentBest = this.getGlobalHiScore();
    const isNewHighScore = newEntry.score > currentBest;
    if (isNewHighScore) {
      this.setGlobalHiScore(newEntry.score);
    }

    // Update profile stats
    const profile = this.getPlayerStats();
    profile.runsPlayed++;
    profile.totalNanoBits += Math.floor(newEntry.score / 50);
    if (newEntry.score > profile.allTimeBestScore) {
      profile.allTimeBestScore = newEntry.score;
    }
    if (newEntry.distance > profile.longestRunMeters) {
      profile.longestRunMeters = newEntry.distance;
    }
    this.savePlayerStats(profile);

    const rank = ranked.findIndex(r => r.id === newEntry.id) + 1;
    return { entry: newEntry, isNewHighScore, rank };
  }

  private static rankEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
    const sorted = [...entries].sort((a, b) => b.score - a.score);
    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }

  public static getGlobalHiScore(): number {
    try {
      const saved = localStorage.getItem(HISCORE_KEY);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch {
      // ignore
    }
    // Default to top of initial leaderboard
    return 998420;
  }

  public static setGlobalHiScore(score: number): void {
    try {
      localStorage.setItem(HISCORE_KEY, score.toString());
    } catch {
      // ignore
    }
  }

  public static getPlayerStats(): PlayerStats {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) {
        return { ...DEFAULT_PLAYER_STATS, ...JSON.parse(data) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_PLAYER_STATS;
  }

  public static savePlayerStats(stats: PlayerStats): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }

  public static getArmoryState(): ArmoryState {
    try {
      const data = localStorage.getItem(ARMORY_KEY);
      if (data) {
        return { ...DEFAULT_ARMORY_STATE, ...JSON.parse(data) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_ARMORY_STATE;
  }

  public static saveArmoryState(state: ArmoryState): void {
    try {
      localStorage.setItem(ARMORY_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }

  public static getSelectedSector(): SectorId {
    try {
      const s = localStorage.getItem(SECTOR_KEY) as SectorId;
      if (s && ['01', '02', '03', '04', '05'].includes(s)) return s;
    } catch {
      // ignore
    }
    return '01';
  }

  public static setSelectedSector(id: SectorId): void {
    try {
      localStorage.setItem(SECTOR_KEY, id);
    } catch {
      // ignore
    }
  }

  public static resetToFactoryDefaults(): void {
    try {
      localStorage.removeItem(LEADERBOARD_KEY);
      localStorage.removeItem(HISCORE_KEY);
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(ARMORY_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem(SECTOR_KEY);
    } catch {
      // ignore
    }
  }
}
