import React, { useState, useRef, useEffect } from 'react';
import { GameCanvas } from './GameCanvas';
import {
  ArmoryState,
  DinoArchetype,
  Sector,
  SectorId,
  ViewMode,
  PlayerStats
} from '../../types/game';
import { soundEngine } from '../../services/sound';
import { StorageService, INITIAL_SECTORS, INITIAL_ARCHETYPES } from '../../services/storage';
import { DinoHologramCanvas } from '../Armory/DinoHologramCanvas';
import {
  Shield,
  Gauge,
  Flame,
  Volume2,
  Sliders,
  Play,
  RotateCcw,
  Trophy,
  Award,
  Sparkles,
  Hourglass,
  Layers,
  ChevronDown,
  Check
} from 'lucide-react';

interface ArenaViewProps {
  sector: Sector;
  archetype: DinoArchetype;
  armory: ArmoryState;
  onNavigate: (view: ViewMode) => void;
  playerStats: PlayerStats;
  onUpdatePlayerStats: (stats: PlayerStats) => void;
  onUpdateHiScore: (score: number) => void;
  globalHiScore: number;
  onSelectSector: (sectorId: SectorId) => void;
  onUpdateArmory: (armory: ArmoryState) => void;
}

export const ArenaView: React.FC<ArenaViewProps> = ({
  sector,
  archetype,
  armory,
  onNavigate,
  playerStats,
  onUpdatePlayerStats,
  onUpdateHiScore,
  globalHiScore,
  onSelectSector,
  onUpdateArmory
}) => {
  // Game states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverStats, setGameOverStats] = useState<{
    score: number;
    distance: number;
    nanoBits: number;
    maxStreak: number;
  }>({ score: 0, distance: 0, nanoBits: 0, maxStreak: 0 });

  // Custom runner tag input on game over
  const [runnerTagInput, setRunnerTagInput] = useState(playerStats.runnerTag || 'PLAYER_ZERO');
  const [scoreSaved, setScoreSaved] = useState(false);
  const [savedRank, setSavedRank] = useState<number | null>(null);

  // Sector dropdown selector in Arena
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);

  // Quick Archetype switcher in Arena
  const [showArchetypeModal, setShowArchetypeModal] = useState(false);

  // Settings
  const [opticsMode, setOpticsMode] = useState<'neon' | 'retro' | 'crt'>(armory.opticsShader || 'neon');
  const [sfxVolume, setSfxVolume] = useState(80);
  const [speedSensitivity, setSpeedSensitivity] = useState(1.0);

  // Live Telemetry from GameCanvas
  const [telemetry, setTelemetry] = useState({
    distance: 0,
    score: 0,
    velocityKmH: 180,
    nanoBits: 0,
    multiplier: 1.0,
    dodgeStreak: 0,
    shieldActive: true,
    droneDodgeCount: 0,
    chronoActive: false
  });

  // Skill cooldown displays
  const [cooldownDisplay, setCooldownDisplay] = useState({
    chrono: { remaining: 0, pct: 0 },
    emp: { remaining: 0, pct: 0 },
    shield: { remaining: 0, pct: 0 }
  });

  // Toast
  const [toast, setToast] = useState<{ msg: string; icon: string; visible: boolean }>({
    msg: '',
    icon: 'electric_bolt',
    visible: false
  });
  const toastTimeoutRef = useRef<any>(null);

  // EMP Flash
  const [empFlashActive, setEmpFlashActive] = useState(false);

  // Skill triggers reference
  const skillTriggersRef = useRef<{
    jump: () => void;
    duck: (active: boolean) => void;
    chrono: () => void;
    emp: () => void;
    shield: () => void;
  } | null>(null);

  // Cooldown timers calculation for UI buttons
  const lastUsedRef = useRef({
    chrono: -12000,
    emp: -15000,
    shield: -18000
  });

  const COOLDOWN_DURATIONS = {
    chrono: 12000,
    emp: 15000 - (armory.upgrades.empCooldown - 1) * 1500,
    shield: 18000
  };

  const showToast = (msg: string, icon = 'electric_bolt') => {
    setToast({ msg, icon, visible: true });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 1800);
  };

  const handleStartGame = () => {
    soundEngine.play('click');
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    setScoreSaved(false);
    setSavedRank(null);
    showToast(`DEPLOYED IN ${sector.name.toUpperCase()}`, 'sports_esports');
  };

  const handleGameOver = (stats: { score: number; distance: number; nanoBits: number; maxStreak: number }) => {
    setIsPlaying(false);
    setIsGameOver(true);
    setGameOverStats(stats);

    // Automatically check if new personal best
    if (stats.score > playerStats.allTimeBestScore) {
      onUpdateHiScore(stats.score);
    }
  };

  const handleSaveToLeaderboard = () => {
    soundEngine.play('click');
    const finalTag = runnerTagInput.trim().toUpperCase() || 'PLAYER_ZERO';
    const result = StorageService.addRunScore({
      runnerTag: finalTag,
      titleTag: playerStats.titleTag,
      score: gameOverStats.score,
      distance: gameOverStats.distance,
      sectorName: sector.name,
      sectorId: sector.id,
      loadout: `${archetype.name} // ${armory.thrusterDrive.toUpperCase()}`
    });

    setScoreSaved(true);
    setSavedRank(result.rank);

    // Update player profile
    const updatedProfile: PlayerStats = {
      ...playerStats,
      runnerTag: finalTag,
      runsPlayed: playerStats.runsPlayed + 1,
      totalNanoBits: playerStats.totalNanoBits + gameOverStats.nanoBits,
      allTimeBestScore: Math.max(playerStats.allTimeBestScore, gameOverStats.score),
      longestRunMeters: Math.max(playerStats.longestRunMeters, gameOverStats.distance),
      bestComboStreak: Math.max(playerStats.bestComboStreak, gameOverStats.maxStreak),
      dronesDestroyedOrDodged: playerStats.dronesDestroyedOrDodged + telemetry.droneDodgeCount
    };
    onUpdatePlayerStats(updatedProfile);

    if (result.isNewHighScore) {
      onUpdateHiScore(gameOverStats.score);
      showToast('NEW ALL-TIME APEX RECORD SET!', 'crown');
    } else {
      showToast(`RECORD STORED: RANK #${result.rank}`, 'military_tech');
    }
  };

  const triggerEMPFlash = () => {
    setEmpFlashActive(true);
    setTimeout(() => setEmpFlashActive(false), 160);
  };

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        if (!isPlaying && !isGameOver) {
          e.preventDefault();
          handleStartGame();
          return;
        }
        if (isGameOver) {
          e.preventDefault();
          handleStartGame();
          return;
        }
        e.preventDefault();
        skillTriggersRef.current?.jump();
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        skillTriggersRef.current?.duck(true);
      } else if (e.code === 'KeyQ') {
        e.preventDefault();
        const now = Date.now();
        if (now - lastUsedRef.current.chrono >= COOLDOWN_DURATIONS.chrono) {
          lastUsedRef.current.chrono = now;
          skillTriggersRef.current?.chrono();
        }
      } else if (e.code === 'KeyE') {
        e.preventDefault();
        const now = Date.now();
        if (now - lastUsedRef.current.emp >= COOLDOWN_DURATIONS.emp) {
          lastUsedRef.current.emp = now;
          skillTriggersRef.current?.emp();
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        const now = Date.now();
        if (now - lastUsedRef.current.shield >= COOLDOWN_DURATIONS.shield) {
          lastUsedRef.current.shield = now;
          skillTriggersRef.current?.shield();
        }
      } else if (e.code === 'Escape') {
        e.preventDefault();
        if (isPlaying && !isGameOver) {
          setIsPaused((prev) => !prev);
          soundEngine.play('click');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        skillTriggersRef.current?.duck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isGameOver]);

  // Update cooldown UI timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const calc = (lastUsed: number, dur: number) => {
        const elapsed = now - lastUsed;
        if (elapsed < dur) {
          const rem = Math.max(0, dur - elapsed) / 1000;
          const pct = Math.min(100, Math.max(0, ((dur - elapsed) / dur) * 100));
          return { remaining: parseFloat(rem.toFixed(1)), pct };
        }
        return { remaining: 0, pct: 0 };
      };

      setCooldownDisplay({
        chrono: calc(lastUsedRef.current.chrono, COOLDOWN_DURATIONS.chrono),
        emp: calc(lastUsedRef.current.emp, COOLDOWN_DURATIONS.emp),
        shield: calc(lastUsedRef.current.shield, COOLDOWN_DURATIONS.shield)
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Overdrive bars count
  const barsCount = Math.min(8, Math.floor(telemetry.multiplier));

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Telemetry Sub-Header & Live Status Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 bg-[#181b25] rounded-xl border border-[#3a494a]/30 shadow-lg relative">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick Sector Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSectorDropdown(!showSectorDropdown)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#0a0e17] hover:bg-[#1c1f29] rounded-lg border border-[#00f5ff]/40 shadow-[0_0_10px_rgba(0,245,255,0.2)] transition-all cursor-pointer"
              title="Click to Switch Active Sector"
            >
              <span className="w-2.5 h-2.5 bg-[#3bff17] shadow-[0_0_8px_#3bff17] rounded-full animate-ping"></span>
              <span className="font-mono text-xs text-[#e9feff] font-bold tracking-wider uppercase">
                SECTOR {sector.id}: {sector.name.toUpperCase()}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#00f5ff]" />
            </button>

            {/* Dropdown Menu */}
            {showSectorDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-72 bg-[#1c1f29] border border-[#00f5ff]/50 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 font-mono text-xs">
                <span className="text-[10px] text-[#849495] uppercase px-2 py-1 font-bold">SWITCH SECTOR BIOME:</span>
                {INITIAL_SECTORS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      soundEngine.play('click');
                      onSelectSector(s.id);
                      setShowSectorDropdown(false);
                      showToast(`SWITCHED TO SECTOR ${s.id}: ${s.name.toUpperCase()}`, 'compass');
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      sector.id === s.id
                        ? 'bg-[#00f5ff] text-[#003739] font-bold'
                        : 'text-[#dfe2ef] hover:bg-[#262a34]'
                    }`}
                  >
                    <div>
                      <div className="font-bold">SECTOR {s.id}: {s.name}</div>
                      <div className="text-[10px] opacity-75">{s.specialRules[0]} · {s.scoreMultiplier}x MULT</div>
                    </div>
                    {sector.id === s.id && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#262a34] rounded-lg text-[#b9caca] font-mono text-xs">
            <span className="text-[#63f7ff]">⚡</span>
            <span>60 FPS QUANTUM ENGINE</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#262a34] rounded-lg text-[#ffb1c3] font-mono text-xs">
            <Shield className="w-3.5 h-3.5 text-[#ff4b89]" />
            <span>GRAV {sector.gravity.toFixed(2)}G · MULT {sector.scoreMultiplier.toFixed(1)}x</span>
          </div>
        </div>

        {/* Live Telemetry Stream Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#0a0e17] px-3 py-1.5 rounded-lg border border-[#3a494a]/40 flex flex-col min-w-[100px]">
            <span className="font-mono text-[10px] text-[#b9caca] uppercase">DISTANCE</span>
            <span className="font-mono text-sm sm:text-base text-[#00f5ff] font-bold tabular-nums">
              {telemetry.distance.toString().padStart(4, '0')} m
            </span>
          </div>
          <div className="bg-[#0a0e17] px-3 py-1.5 rounded-lg border border-[#3a494a]/40 flex flex-col min-w-[100px]">
            <span className="font-mono text-[10px] text-[#b9caca] uppercase">VELOCITY</span>
            <span className="font-mono text-sm sm:text-base text-[#79ff5b] font-bold tabular-nums">
              {telemetry.velocityKmH} KM/H
            </span>
          </div>
          <div className="bg-[#0a0e17] px-3 py-1.5 rounded-lg border border-[#3a494a]/40 flex flex-col min-w-[100px]">
            <span className="font-mono text-[10px] text-[#b9caca] uppercase">NANO-BITS</span>
            <span className="font-mono text-sm sm:text-base text-[#ffb1c3] font-bold tabular-nums">
              {telemetry.nanoBits.toString().padStart(4, '0')}
            </span>
          </div>
          <div className="bg-[#0a0e17] px-3 py-1.5 rounded-lg border border-[#3a494a]/40 flex flex-col min-w-[100px]">
            <span className="font-mono text-[10px] text-[#b9caca] uppercase">SYNAPSE x</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-sm sm:text-base text-[#63f7ff] font-bold tabular-nums">
                {telemetry.multiplier.toFixed(1)}x
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f5ff] animate-pulse"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 12-Column Arcade Cockpit */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Stage: Game Arena Cabinet (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col gap-4 min-w-0">
          <div className="relative bg-[#0a0e17] rounded-2xl overflow-hidden shadow-2xl border border-[#3a494a]/50 p-1 bg-gradient-to-b from-[#63f7ff]/20 via-[#0a0e17] to-[#ff4b89]/20">
            {/* Monitor Top Frame */}
            <div className="px-4 py-2 bg-[#1c1f29] flex items-center justify-between border-b border-[#3a494a]/30">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#3bff17] animate-pulse' : 'bg-[#ff4b89]'}`}></span>
                <span className="font-mono text-xs text-[#e9feff] tracking-wider uppercase font-bold">
                  {isPlaying 
                    ? (isPaused ? 'SIMULATION PAUSED // COGNITIVE HOLD' : `SIMULATION ACTIVE // SECTOR ${sector.id} · ${archetype.name}`)
                    : `SIMULATION STANDBY // ${archetype.name} READY`}
                </span>
              </div>
              <div className="flex items-center gap-4 font-mono text-xs">
                <div className="flex items-center gap-1 text-[#b9caca]">
                  <span className="text-[#3bff17]">🔋</span>
                  <span>CELL: 98%</span>
                </div>
                <div className="flex items-center gap-1 text-[#00f5ff]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>
                    {telemetry.shieldActive 
                      ? (archetype.id === 'rex' ? 'SHIELD 2/2' : 'SHIELD ONLINE')
                      : 'SHIELD RECHARGING'}
                  </span>
                </div>
              </div>
            </div>

            {/* Canvas Host Surface */}
            <div className="relative w-full aspect-[16/9] min-h-[380px] sm:min-h-[440px] md:min-h-[480px] bg-[#0a0e17] overflow-hidden select-none">
              <GameCanvas
                isPlaying={isPlaying}
                isPaused={isPaused}
                sector={sector}
                archetype={archetype}
                armory={armory}
                speedSensitivity={speedSensitivity}
                onGameOver={handleGameOver}
                onUpdateTelemetry={setTelemetry}
                onShowToast={showToast}
                onEMPTriggered={triggerEMPFlash}
                refSkillTriggers={skillTriggersRef}
              />

              {/* Optics Scanline Overlays */}
              {opticsMode === 'crt' && <div className="pointer-events-none absolute inset-0 scanlines-crt opacity-25 z-10" />}
              {opticsMode === 'retro' && <div className="pointer-events-none absolute inset-0 scanlines-retro opacity-20 z-10" />}

              {/* EMP Flash Screen */}
              {empFlashActive && (
                <div className="pointer-events-none absolute inset-0 bg-[#ffd9e0]/80 mix-blend-screen transition-opacity duration-150 z-20" />
              )}

              {/* Chrono Slow Tint */}
              {telemetry.chronoActive && (
                <div className="pointer-events-none absolute inset-0 bg-[#00f5ff]/15 mix-blend-color-dodge transition-opacity duration-300 z-10" />
              )}

              {/* In-game Toast Notification */}
              {toast.visible && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1c1f29]/95 border border-[#00f5ff]/60 backdrop-blur-md px-4 py-1.5 rounded-full text-[#63f7ff] font-mono text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(0,245,255,0.4)] flex items-center gap-2 z-30 transition-all">
                  <Sparkles className="w-4 h-4 text-[#79ff5b]" />
                  <span>{toast.msg}</span>
                </div>
              )}

              {/* Initial Start Modal */}
              {!isPlaying && !isGameOver && (
                <div className="absolute inset-0 bg-[#0a0e17]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-30">
                  <div className="max-w-md w-full bg-[#1c1f29]/95 border border-[#00f5ff]/50 p-6 rounded-2xl shadow-[0_0_35px_rgba(0,245,255,0.25)] flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#00f5ff]/20 border border-[#00f5ff]/60 flex items-center justify-center text-[#00f5ff] shadow-[0_0_15px_#00f5ff]">
                      <Play className="w-7 h-7 ml-0.5" />
                    </div>

                    <div>
                      <h2 className="font-headline text-2xl text-[#e9feff] font-bold tracking-wider uppercase">
                        NEO-RUNNER ACTIVE
                      </h2>
                      <p className="font-mono text-xs text-[#b9caca] uppercase mt-1">
                        {archetype.name} RIG · SECTOR {sector.id} ({sector.name})
                      </p>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 text-left bg-[#181b25] p-3 rounded-lg text-xs font-mono text-[#b9caca] border border-[#3a494a]/40">
                      <div><span className="text-[#63f7ff] font-bold">SPACE / ↑ :</span> JUMP / 2x JUMP</div>
                      <div><span className="text-[#63f7ff] font-bold">S / ↓ :</span> SLIDE UNDER DRONES</div>
                      <div><span className="text-[#00f5ff] font-bold">Q :</span> CHRONO (SLOW-MO)</div>
                      <div><span className="text-[#ff4b89] font-bold">E :</span> EMP WAVE (CLEAR ALL)</div>
                      <div><span className="text-[#79ff5b] font-bold">R :</span> AEGIS BARRIER SHIELD</div>
                      <div><span className="text-[#e9feff] font-bold">ESC :</span> PAUSE ENGINE</div>
                    </div>

                    <button
                      onClick={handleStartGame}
                      className="w-full py-3.5 bg-[#00f5ff] text-[#003739] font-mono text-sm uppercase tracking-widest rounded-xl font-bold shadow-[0_0_20px_rgba(0,245,255,0.6)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-5 h-5" /> ENGAGE RUN [SPACE]
                    </button>
                  </div>
                </div>
              )}

              {/* Game Over Modal */}
              {isGameOver && (
                <div className="absolute inset-0 bg-[#0a0e17]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30">
                  <div className="max-w-md w-full bg-[#1c1f29] border border-[#ff4b89]/50 p-6 rounded-2xl shadow-[0_0_40px_rgba(255,75,137,0.35)] flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#93000a]/40 border border-[#ffb4ab]/60 flex items-center justify-center text-[#ffb4ab] shadow-[0_0_15px_#ffb4ab]">
                      <RotateCcw className="w-7 h-7" />
                    </div>

                    <div>
                      <span className="font-headline text-2xl text-[#ffb4ab] uppercase tracking-wider font-bold block">
                        SYSTEM CORRUPTED
                      </span>
                      <span className="font-mono text-xs text-[#b9caca] uppercase mt-1 block">
                        LETHAL IMPACT DETECTED // PROTOCOL TERMINATED
                      </span>
                    </div>

                    {/* Stats Matrix */}
                    <div className="grid grid-cols-2 gap-2.5 w-full bg-[#181b25] p-3 rounded-xl text-left border border-[#3a494a]/40">
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] text-[#b9caca] uppercase">DISTANCE RUN</span>
                        <span className="font-mono text-base text-[#00f5ff] font-bold tabular-nums">
                          {gameOverStats.distance.toLocaleString()} M
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] text-[#b9caca] uppercase">FINAL SCORE</span>
                        <span className="font-mono text-base text-[#ff4b89] font-bold tabular-nums">
                          {gameOverStats.score.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] text-[#b9caca] uppercase">BITS HARVESTED</span>
                        <span className="font-mono text-base text-[#79ff5b] font-bold tabular-nums">
                          +{gameOverStats.nanoBits}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] text-[#b9caca] uppercase">DODGE STREAK</span>
                        <span className="font-mono text-base text-[#63f7ff] font-bold tabular-nums">
                          {gameOverStats.maxStreak} COMBO
                        </span>
                      </div>
                    </div>

                    {/* Save to High Score Leaderboard Form */}
                    <div className="w-full bg-[#0a0e17] p-3 rounded-xl border border-[#00f5ff]/30 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#00f5ff] font-bold uppercase flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" /> ARCADE LEADERBOARD
                        </span>
                        {scoreSaved ? (
                          <span className="text-[#79ff5b] font-bold">
                            ✓ SAVED (RANK #{savedRank})
                          </span>
                        ) : (
                          <span className="text-[#b9caca]">ENTER CALLSIGN</span>
                        )}
                      </div>

                      {!scoreSaved ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={16}
                            value={runnerTagInput}
                            onChange={(e) => setRunnerTagInput(e.target.value.toUpperCase())}
                            placeholder="CALLSIGN (E.G. NEO_REX)"
                            className="flex-1 bg-[#1c1f29] border border-[#3a494a] rounded-lg px-3 py-1.5 font-mono text-xs text-[#e9feff] placeholder:text-[#849495] focus:outline-none focus:border-[#00f5ff]"
                          />
                          <button
                            onClick={handleSaveToLeaderboard}
                            className="px-4 py-1.5 bg-[#ff4b89] hover:bg-[#ff4b89]/90 text-white font-mono text-xs uppercase font-bold rounded-lg shadow-md transition-all cursor-pointer"
                          >
                            SAVE SCORE
                          </button>
                        </div>
                      ) : (
                        <div className="text-center font-mono text-xs text-[#79ff5b] py-1 bg-[#053900]/40 rounded border border-[#3bff17]/30">
                          SCORE SECURED IN LOCAL STORAGE HALL OF FAME
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2.5 w-full">
                      <button
                        onClick={handleStartGame}
                        className="flex-1 py-3 bg-[#00f5ff] text-[#003739] font-mono text-xs uppercase tracking-wider rounded-xl font-bold shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" /> DEPLOY AGAIN [SPACE]
                      </button>
                      <button
                        onClick={() => {
                          soundEngine.play('click');
                          onNavigate('leaderboard');
                        }}
                        className="py-3 px-4 bg-[#262a34] hover:bg-[#31353f] text-[#e9feff] font-mono text-xs uppercase tracking-wider rounded-xl font-bold border border-[#3a494a] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trophy className="w-4 h-4 text-[#f59e0b]" /> LEADERBOARD
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Integrated Cybernetic Skills Deck HUD */}
            <div className="p-3 bg-[#181b25] flex flex-wrap items-center justify-between gap-3 border-t border-[#3a494a]/30">
              <div className="flex items-center gap-2 text-[#b9caca] font-mono text-xs">
                <Gauge className="w-4 h-4 text-[#00f5ff]" />
                <span className="font-bold">SYSTEM HOTBAR</span>
              </div>

              {/* Hotkey Skill Trigger Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {/* Jump */}
                <button
                  onClick={() => skillTriggersRef.current?.jump()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#262a34] hover:bg-[#31353f] rounded-lg transition-all text-left border border-[#3a494a]/40 cursor-pointer"
                >
                  <kbd className="px-1.5 py-0.5 bg-[#1c1f29] rounded text-[#63f7ff] font-mono text-[10px] font-bold">SPACE</kbd>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-[#e9feff] font-bold leading-tight">CYBER JUMP</span>
                    <span className="font-mono text-[9px] text-[#b9caca]">DOUBLE THRUST</span>
                  </div>
                </button>

                {/* Duck / Slide */}
                <button
                  onMouseDown={() => skillTriggersRef.current?.duck(true)}
                  onMouseUp={() => skillTriggersRef.current?.duck(false)}
                  onTouchStart={(e) => { e.preventDefault(); skillTriggersRef.current?.duck(true); }}
                  onTouchEnd={(e) => { e.preventDefault(); skillTriggersRef.current?.duck(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#262a34] hover:bg-[#31353f] rounded-lg transition-all text-left border border-[#3a494a]/40 cursor-pointer"
                >
                  <kbd className="px-1.5 py-0.5 bg-[#1c1f29] rounded text-[#63f7ff] font-mono text-[10px] font-bold">S / ↓</kbd>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-[#e9feff] font-bold leading-tight">NANITE SLIDE</span>
                    <span className="font-mono text-[9px] text-[#b9caca]">EVADE DRONES</span>
                  </div>
                </button>

                {/* Q: Chrono */}
                <button
                  onClick={() => {
                    const now = Date.now();
                    if (now - lastUsedRef.current.chrono >= COOLDOWN_DURATIONS.chrono) {
                      lastUsedRef.current.chrono = now;
                      skillTriggersRef.current?.chrono();
                    }
                  }}
                  className="relative group flex items-center gap-2 px-3 py-1.5 bg-[#262a34] hover:bg-[#31353f] rounded-lg transition-all text-left overflow-hidden border border-[#3a494a]/40 cursor-pointer"
                >
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-[#00f5ff]/30 transition-all duration-100" 
                    style={{ height: `${cooldownDisplay.chrono.pct}%` }}
                  />
                  <kbd className="px-1.5 py-0.5 bg-[#1c1f29] rounded text-[#00f5ff] font-mono text-[10px] font-bold z-10">Q</kbd>
                  <div className="flex flex-col z-10">
                    <span className="font-mono text-xs text-[#00f5ff] font-bold leading-tight">CHRONO</span>
                    <span className="font-mono text-[9px] text-[#b9caca]">
                      {cooldownDisplay.chrono.remaining > 0 ? `${cooldownDisplay.chrono.remaining}s` : 'READY'}
                    </span>
                  </div>
                </button>

                {/* E: EMP */}
                <button
                  onClick={() => {
                    const now = Date.now();
                    if (now - lastUsedRef.current.emp >= COOLDOWN_DURATIONS.emp) {
                      lastUsedRef.current.emp = now;
                      skillTriggersRef.current?.emp();
                    }
                  }}
                  className="relative group flex items-center gap-2 px-3 py-1.5 bg-[#262a34] hover:bg-[#31353f] rounded-lg transition-all text-left overflow-hidden border border-[#3a494a]/40 cursor-pointer"
                >
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-[#ff4b89]/30 transition-all duration-100" 
                    style={{ height: `${cooldownDisplay.emp.pct}%` }}
                  />
                  <kbd className="px-1.5 py-0.5 bg-[#1c1f29] rounded text-[#ff4b89] font-mono text-[10px] font-bold z-10">E</kbd>
                  <div className="flex flex-col z-10">
                    <span className="font-mono text-xs text-[#ff4b89] font-bold leading-tight">EMP BLAST</span>
                    <span className="font-mono text-[9px] text-[#b9caca]">
                      {cooldownDisplay.emp.remaining > 0 ? `${cooldownDisplay.emp.remaining}s` : 'READY'}
                    </span>
                  </div>
                </button>

                {/* R: Shield */}
                <button
                  onClick={() => {
                    const now = Date.now();
                    if (now - lastUsedRef.current.shield >= COOLDOWN_DURATIONS.shield) {
                      lastUsedRef.current.shield = now;
                      skillTriggersRef.current?.shield();
                    }
                  }}
                  className="relative group flex items-center gap-2 px-3 py-1.5 bg-[#262a34] hover:bg-[#31353f] rounded-lg transition-all text-left overflow-hidden border border-[#3a494a]/40 cursor-pointer"
                >
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-[#3bff17]/30 transition-all duration-100" 
                    style={{ height: `${cooldownDisplay.shield.pct}%` }}
                  />
                  <kbd className="px-1.5 py-0.5 bg-[#1c1f29] rounded text-[#3bff17] font-mono text-[10px] font-bold z-10">R</kbd>
                  <div className="flex flex-col z-10">
                    <span className="font-mono text-xs text-[#3bff17] font-bold leading-tight">AEGIS</span>
                    <span className="font-mono text-[9px] text-[#b9caca]">
                      {cooldownDisplay.shield.remaining > 0 ? `${cooldownDisplay.shield.remaining}s` : (telemetry.shieldActive ? 'ONLINE' : 'READY')}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Simulation Settings Drawer */}
          <div className="bg-[#1c1f29] p-4 rounded-xl shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border border-[#3a494a]/30">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Optics Mode Toggle */}
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#b9caca] uppercase mb-1">OPTICS SHADER</span>
                <div className="flex bg-[#181b25] p-1 rounded-lg border border-[#3a494a]/30">
                  <button
                    onClick={() => setOpticsMode('neon')}
                    className={`px-3 py-1 rounded font-mono text-xs transition-colors cursor-pointer ${
                      opticsMode === 'neon' ? 'bg-[#262a34] text-[#00f5ff] font-bold' : 'text-[#b9caca] hover:text-[#dfe2ef]'
                    }`}
                  >
                    NEON
                  </button>
                  <button
                    onClick={() => setOpticsMode('retro')}
                    className={`px-3 py-1 rounded font-mono text-xs transition-colors cursor-pointer ${
                      opticsMode === 'retro' ? 'bg-[#262a34] text-[#00f5ff] font-bold' : 'text-[#b9caca] hover:text-[#dfe2ef]'
                    }`}
                  >
                    RETRO
                  </button>
                  <button
                    onClick={() => setOpticsMode('crt')}
                    className={`px-3 py-1 rounded font-mono text-xs transition-colors cursor-pointer ${
                      opticsMode === 'crt' ? 'bg-[#262a34] text-[#00f5ff] font-bold' : 'text-[#b9caca] hover:text-[#dfe2ef]'
                    }`}
                  >
                    CRT
                  </button>
                </div>
              </div>

              {/* Volume & Sensitivity */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-[#b9caca] uppercase mb-1">SYNTH SFX VOLUME</span>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#b9caca]" />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sfxVolume}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setSfxVolume(val);
                        soundEngine.setVolume(val / 100);
                      }}
                      className="w-24 accent-[#00f5ff] h-1.5 bg-[#31353f] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-[#b9caca] uppercase mb-1">THRUST ACCEL</span>
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#b9caca]" />
                    <input
                      type="range"
                      min={70}
                      max={130}
                      value={Math.round(speedSensitivity * 100)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) / 100;
                        setSpeedSensitivity(val);
                      }}
                      className="w-24 accent-[#ff4b89] h-1.5 bg-[#31353f] rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pause & Calibrate */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  if (isPlaying && !isGameOver) {
                    setIsPaused(!isPaused);
                    soundEngine.play('click');
                  }
                }}
                className="px-4 py-2 bg-[#262a34] hover:bg-[#31353f] text-[#dfe2ef] font-mono text-xs uppercase rounded-lg transition-colors flex items-center gap-1.5 border border-[#3a494a]/40 cursor-pointer"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-[#3bff17]" /> : <Hourglass className="w-3.5 h-3.5 text-[#63f7ff]" />}
                <span>{isPaused ? 'RESUME [ESC]' : 'PAUSE [ESC]'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Overdrive, Bounties, Live Rig Hologram Specs (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-4 min-w-0">
          {/* Overdrive Combo Streak Card */}
          <div className="bg-[#1c1f29] p-4 rounded-xl shadow-lg relative overflow-hidden border border-[#3a494a]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-[#ff4b89] uppercase font-bold tracking-widest flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#ff4b89]" /> SYNAPSE OVERDRIVE
              </span>
              <span className="font-mono text-xs text-[#00f5ff] font-bold tabular-nums">
                {telemetry.dodgeStreak} DODGES
              </span>
            </div>

            {/* Segmented Heat Gauge */}
            <div className="grid grid-cols-8 gap-1 h-3 mb-2 bg-[#0a0e17] p-0.5 rounded border border-[#3a494a]/30">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => {
                const filled = bar <= barsCount;
                let colorClass = 'bg-[#31353f]';
                if (filled) {
                  if (bar <= 3) colorClass = 'bg-[#00f5ff] shadow-[0_0_6px_#00f5ff]';
                  else if (bar <= 6) colorClass = 'bg-[#3bff17] shadow-[0_0_6px_#3bff17]';
                  else colorClass = 'bg-[#ff4b89] shadow-[0_0_6px_#ff4b89]';
                }
                return <div key={bar} className={`h-full rounded-sm transition-colors duration-200 ${colorClass}`} />;
              })}
            </div>

            <div className="flex justify-between items-center font-mono text-[10px] text-[#b9caca]">
              <span>TIER: {barsCount > 6 ? 'APEX RED' : barsCount > 3 ? 'SUPER LIME' : 'CYAN BOOST'}</span>
              <span className="text-[#3bff17] font-bold">+{Math.floor(telemetry.multiplier * 100)}% EXP BOOST</span>
            </div>
          </div>

          {/* Active Sector Bounties */}
          <div className="bg-[#1c1f29] p-4 rounded-xl shadow-lg flex flex-col gap-3 border border-[#3a494a]/30">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#e9feff] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#f59e0b]" /> SECTOR DIRECTIVES
              </span>
              <span className="font-mono text-[10px] text-[#b9caca]">CYCLE RESET: 04H</span>
            </div>

            {/* Bounty 1 */}
            <div className="bg-[#181b25] p-2.5 rounded-lg border border-[#3a494a]/30 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#dfe2ef]">AIRSPACE CLEARANCE</span>
                <span className="font-mono text-[10px] text-[#79ff5b]">+250 NANO-BITS</span>
              </div>
              <span className="text-[11px] text-[#b9caca]">Evade or destroy 15 Glitch Drones</span>
              <div className="w-full bg-[#31353f] h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-[#00f5ff] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.floor((telemetry.droneDodgeCount / 15) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between font-mono text-[9px] text-[#b9caca]">
                <span>PROGRESS</span>
                <span className="tabular-nums">{Math.min(15, telemetry.droneDodgeCount)} / 15</span>
              </div>
            </div>

            {/* Bounty 2 */}
            <div className="bg-[#181b25] p-2.5 rounded-lg border border-[#3a494a]/30 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#dfe2ef]">DATA HARVESTER</span>
                <span className="font-mono text-[10px] text-[#ffb1c3]">+1 QUANTUM CORE</span>
              </div>
              <span className="text-[11px] text-[#b9caca]">Collect 50 Nano-Bits in single run</span>
              <div className="w-full bg-[#31353f] h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-[#ff4b89] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.floor((telemetry.nanoBits / 50) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between font-mono text-[9px] text-[#b9caca]">
                <span>PROGRESS</span>
                <span className="tabular-nums">{Math.min(50, telemetry.nanoBits)} / 50</span>
              </div>
            </div>
          </div>

          {/* Equipped Rig Specs Card with Live Holographic Dino */}
          <div className="bg-[#1c1f29] p-4 rounded-xl shadow-lg flex flex-col gap-3 border border-[#3a494a]/30">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#00f5ff] uppercase font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#00f5ff]" /> EQUIPPED CHASSIS
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowArchetypeModal(true)}
                  className="font-mono text-[10px] px-2 py-0.5 bg-[#262a34] text-[#63f7ff] rounded hover:bg-[#31353f] transition-colors cursor-pointer border border-[#3a494a]/40"
                >
                  SWITCH CHASSIS
                </button>
                <button 
                  onClick={() => {
                    soundEngine.play('click');
                    onNavigate('armory');
                  }}
                  className="font-mono text-[10px] px-2 py-0.5 bg-[#00f5ff]/20 text-[#00f5ff] rounded hover:bg-[#00f5ff]/30 transition-colors cursor-pointer font-bold"
                >
                  UPGRADE
                </button>
              </div>
            </div>

            {/* Live Hologram Preview */}
            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-[#0a0e17] flex items-center justify-center border border-[#3a494a]/40 shadow-inner">
              <DinoHologramCanvas
                archetypeId={armory.selectedArchetype}
                visorTint={armory.visorTint}
                thrusterDrive={armory.thrusterDrive}
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#0a0e17]/80 px-2 py-0.5 rounded text-[10px] font-mono text-[#00f5ff] border border-[#00f5ff]/30">
                <span>{archetype.name}</span>
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#0a0e17]/80 px-2 py-0.5 rounded text-[10px] font-mono text-[#79ff5b]">
                <span>100% OPERATIONAL</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="bg-[#181b25] p-2 rounded-lg border border-[#3a494a]/30 flex flex-col">
                <span className="text-[10px] text-[#b9caca]">EXHAUST JETS</span>
                <span className="text-[#dfe2ef] font-bold uppercase">{armory.thrusterDrive} DRIVE</span>
              </div>
              <div className="bg-[#181b25] p-2 rounded-lg border border-[#3a494a]/30 flex flex-col">
                <span className="text-[10px] text-[#b9caca]">VISOR HUD</span>
                <span className="text-[#00f5ff] font-bold uppercase">{armory.visorTint} TINT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Chassis Selector Modal */}
      {showArchetypeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1c1f29] border border-[#00f5ff]/50 p-6 rounded-2xl shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#3a494a]/30 pb-3">
              <h3 className="font-headline text-lg font-bold text-[#e9feff]">
                SWITCH CYBER DINO RIG
              </h3>
              <button
                onClick={() => setShowArchetypeModal(false)}
                className="text-[#b9caca] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2.5 font-mono text-xs">
              {INITIAL_ARCHETYPES.map((arch) => (
                <button
                  key={arch.id}
                  onClick={() => {
                    soundEngine.play('click');
                    const updated = { ...armory, selectedArchetype: arch.id };
                    onUpdateArmory(updated);
                    StorageService.saveArmoryState(updated);
                    setShowArchetypeModal(false);
                    showToast(`EQUIPPED ${arch.name}`, 'shield');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    armory.selectedArchetype === arch.id
                      ? 'bg-[#262a34] border-[#00f5ff] text-[#00f5ff] shadow-[0_0_12px_rgba(0,245,255,0.25)]'
                      : 'bg-[#181b25] border-[#3a494a]/30 text-[#dfe2ef] hover:border-[#00f5ff]/40'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">{arch.name}</div>
                    <div className="text-[10px] text-[#b9caca] mt-0.5">{arch.description}</div>
                  </div>
                  {armory.selectedArchetype === arch.id && (
                    <Check className="w-5 h-5 text-[#00f5ff] shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
