export type ViewMode = 'arena' | 'sectors' | 'leaderboard' | 'armory' | 'system';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export type SectorId = '01' | '02' | '03' | '04' | '05';

export interface Sector {
  id: SectorId;
  name: string;
  category: 'standard' | 'extreme' | 'daily';
  description: string;
  gravity: number; // 1.0 is standard
  baseVelocityMultiplier: number;
  scoreMultiplier: number;
  hazardLevel: number; // 1-5
  image: string;
  bgHorizonColor: string;
  bgGridColor: string;
  skyTint: string;
  specialRules: string[];
  hiScore: number;
}

export type ArchetypeId = 'raptor' | 'rex' | 'ptero';

export interface DinoArchetype {
  id: ArchetypeId;
  name: string;
  tagline: string;
  description: string;
  speedRating: number; // 1-100
  armorRating: number; // 1-100
  jumpForce: number;
  canGlide: boolean;
  maxShieldHits: number;
  image: string;
}

export type VisorTint = 'cyan' | 'pink' | 'lime' | 'gold';
export type ThrusterDrive = 'ion' | 'plasma' | 'afterburner';
export type OpticsShader = 'neon' | 'retro' | 'crt';

export interface ArmoryState {
  selectedArchetype: ArchetypeId;
  visorTint: VisorTint;
  thrusterDrive: ThrusterDrive;
  opticsShader: OpticsShader;
  upgrades: {
    speedBoost: number; // lvl 1-5
    shieldDuration: number; // lvl 1-5
    empCooldown: number; // lvl 1-5
    magnetRange: number; // lvl 1-5
  };
}

export interface LeaderboardEntry {
  id: string;
  rank?: number;
  runnerTag: string;
  titleTag: string;
  score: number;
  distance: number;
  sectorName: string;
  sectorId: SectorId;
  loadout: string;
  date: string;
  isPlayer?: boolean;
}

export interface PlayerStats {
  runnerTag: string;
  titleTag: string;
  divisionTier: string;
  allTimeBestScore: number;
  longestRunMeters: number;
  bestComboStreak: number;
  totalNanoBits: number;
  totalQuantumCores: number;
  runsPlayed: number;
  dronesDestroyedOrDodged: number;
}

export interface ActiveBounty {
  id: string;
  title: string;
  rewardText: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
}

export interface Obstacle {
  id: number;
  type: 'LASER_PYLON' | 'GLITCH_DRONE' | 'PLASMA_SPIKE' | 'METEOR_SHARD';
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  pulse?: number;
  wingPhase?: number;
  vx?: number;
  vy?: number;
  passed?: boolean;
}

export interface Collectible {
  id: number;
  type: 'NANO_BIT' | 'QUANTUM_CORE';
  x: number;
  y: number;
  r: number;
  phase: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  decay: number;
  size: number;
}
