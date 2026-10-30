import React, { useState } from 'react';
import {
  ArchetypeId,
  ArmoryState,
  PlayerStats,
  ThrusterDrive,
  ViewMode,
  VisorTint
} from '../../types/game';
import { INITIAL_ARCHETYPES, StorageService } from '../../services/storage';
import { soundEngine } from '../../services/sound';
import { DinoHologramCanvas } from './DinoHologramCanvas';
import {
  Shield,
  Gauge,
  Flame,
  Zap,
  Play,
  Sparkles,
  ArrowUpCircle,
  Clock,
  Compass,
  CheckCircle2,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

interface ArmoryViewProps {
  armory: ArmoryState;
  onUpdateArmory: (armory: ArmoryState) => void;
  playerStats: PlayerStats;
  onUpdatePlayerStats: (stats: PlayerStats) => void;
  onNavigate: (view: ViewMode) => void;
}

export const ArmoryView: React.FC<ArmoryViewProps> = ({
  armory,
  onUpdateArmory,
  playerStats,
  onUpdatePlayerStats,
  onNavigate
}) => {
  const [activeSlotDetail, setActiveSlotDetail] = useState<string | null>(null);

  const currentArchetype = INITIAL_ARCHETYPES.find((a) => a.id === armory.selectedArchetype) || INITIAL_ARCHETYPES[0];

  const handleSelectArchetype = (id: ArchetypeId) => {
    soundEngine.play('click');
    const updated = { ...armory, selectedArchetype: id };
    onUpdateArmory(updated);
    StorageService.saveArmoryState(updated);
  };

  const handleSelectTint = (tint: VisorTint) => {
    soundEngine.play('click');
    const updated = { ...armory, visorTint: tint };
    onUpdateArmory(updated);
    StorageService.saveArmoryState(updated);
  };

  const handleSelectDrive = (drive: ThrusterDrive) => {
    soundEngine.play('click');
    const updated = { ...armory, thrusterDrive: drive };
    onUpdateArmory(updated);
    StorageService.saveArmoryState(updated);
  };

  const handleGrantBonusBits = () => {
    soundEngine.play('upgrade');
    const updated = {
      ...playerStats,
      totalNanoBits: playerStats.totalNanoBits + 1000,
      totalQuantumCores: playerStats.totalQuantumCores + 1
    };
    onUpdatePlayerStats(updated);
    StorageService.savePlayerStats(updated);
  };

  const handleUpgrade = (skillKey: keyof ArmoryState['upgrades'], cost: number) => {
    if (playerStats.totalNanoBits < cost) {
      soundEngine.play('hit');
      return;
    }
    soundEngine.play('upgrade');

    const updatedStats = {
      ...playerStats,
      totalNanoBits: playerStats.totalNanoBits - cost
    };
    onUpdatePlayerStats(updatedStats);
    StorageService.savePlayerStats(updatedStats);

    const updatedArmory = {
      ...armory,
      upgrades: {
        ...armory.upgrades,
        [skillKey]: Math.min(5, armory.upgrades[skillKey] + 1)
      }
    };
    onUpdateArmory(updatedArmory);
    StorageService.saveArmoryState(updatedArmory);
  };

  const getUpgradeCost = (lvl: number) => {
    return lvl * 300;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Sub-Header / Currency & Cockpit Status Bar */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-[#181b25] rounded-xl border border-[#3a494a]/30 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-xs text-[#00f5ff] tracking-widest uppercase flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#00f5ff] shadow-[0_0_8px_#00f5ff]"></span>
              ARMORY SUITE // MK-VIII BAY 04
            </span>
            <span className="font-headline text-xl text-[#e9feff] font-bold tracking-tight">
              CYBERNETIC TECH MATRIX & HANGAR
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#1c1f29] rounded-lg font-mono text-xs text-[#79ff5b] border border-[#3a494a]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CALIBRATION: OPTIMAL</span>
          </div>
        </div>

        {/* Currency Wallet & Simulator Launcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Nano-Bits Wallet */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#1c1f29] rounded-xl border border-[#3a494a]/30">
            <Zap className="w-4 h-4 text-[#00f5ff]" />
            <div className="flex flex-col font-mono">
              <span className="text-[9px] text-[#b9caca] uppercase leading-none">NANO-BITS</span>
              <span className="text-sm text-[#00f5ff] font-bold leading-tight tabular-nums">
                {playerStats.totalNanoBits.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Grant Bonus Bits button for easy sandbox testing */}
          <button
            onClick={handleGrantBonusBits}
            className="px-3 py-1.5 bg-[#262a34] hover:bg-[#31353f] text-[#79ff5b] rounded-xl font-mono text-xs font-bold border border-[#3bff17]/40 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            title="Claim 1,000 Salvage Nano-Bits"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+1,000 BITS</span>
          </button>

          {/* Quantum Cores Wallet */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#1c1f29] rounded-xl border border-[#3a494a]/30">
            <Sparkles className="w-4 h-4 text-[#ff4b89]" />
            <div className="flex flex-col font-mono">
              <span className="text-[9px] text-[#b9caca] uppercase leading-none">QUANTUM CORES</span>
              <span className="text-sm text-[#ff4b89] font-bold leading-tight tabular-nums">
                {playerStats.totalQuantumCores}
              </span>
            </div>
          </div>

          {/* Test Simulator Launch CTA */}
          <button
            onClick={() => {
              soundEngine.play('click');
              onNavigate('arena');
            }}
            className="px-5 py-2.5 bg-[#00f5ff] text-[#003739] rounded-xl font-mono text-xs tracking-wider uppercase font-bold flex items-center gap-2 shadow-[0_0_18px_rgba(0,245,255,0.45)] hover:shadow-[0_0_26px_rgba(0,245,255,0.8)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>DEPLOY IN ARENA</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Hangar Specs & Right Upgrade Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {/* Left Column: Dino Hangar & Customizer (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Archetype Selector Tabs */}
          <div className="bg-[#181b25] p-1.5 rounded-xl border border-[#3a494a]/30 flex items-center justify-between gap-1 shadow-md">
            {INITIAL_ARCHETYPES.map((arch) => {
              const isSelected = armory.selectedArchetype === arch.id;
              return (
                <button
                  key={arch.id}
                  onClick={() => handleSelectArchetype(arch.id)}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-center transition-all flex flex-col items-center cursor-pointer ${
                    isSelected
                      ? 'bg-[#262a34] text-[#00f5ff] shadow-[0_0_12px_rgba(0,245,255,0.25)] border border-[#00f5ff]/40 font-bold'
                      : 'text-[#b9caca] hover:bg-[#1c1f29] hover:text-[#dfe2ef]'
                  }`}
                >
                  <span className="font-mono text-xs">{arch.name}</span>
                  <span className="font-mono text-[9px] opacity-75">{arch.tagline}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Live Hologram Bay Canvas */}
          <div className="relative w-full h-[360px] sm:h-[400px] rounded-2xl overflow-hidden bg-[#0a0e17] border border-[#3a494a]/40 shadow-2xl flex flex-col justify-between p-4">
            {/* Top Telemetry */}
            <div className="relative z-20 flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 bg-[#0a0e17]/90 backdrop-blur px-3 py-1 rounded-md border border-[#3a494a]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3bff17] animate-pulse"></span>
                <span className="font-mono text-xs text-[#79ff5b] font-bold">
                  {currentArchetype.name} // RIG ENGAGED
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#00f5ff] bg-[#0a0e17]/90 px-2 py-0.5 rounded border border-[#00f5ff]/30 font-bold">
                {armory.visorTint.toUpperCase()} VISOR · {armory.thrusterDrive.toUpperCase()}
              </span>
            </div>

            {/* Live Holographic Dino Preview Canvas */}
            <div className="relative w-full flex-1 flex items-center justify-center my-2">
              <DinoHologramCanvas
                archetypeId={armory.selectedArchetype}
                visorTint={armory.visorTint}
                thrusterDrive={armory.thrusterDrive}
                interactive={true}
              />
            </div>

            {/* Dynamic Spec Bars */}
            <div className="relative z-20 w-full bg-[#0a0e17]/90 backdrop-blur-md p-3.5 rounded-xl border border-[#3a494a]/30 flex flex-col gap-2">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="flex items-center gap-1 text-[#dfe2ef]">
                  <Gauge className="w-3.5 h-3.5 text-[#00f5ff]" /> VELOCITY PROFILE
                </span>
                <span className="text-[#00f5ff] font-bold">{currentArchetype.speedRating} KPH MAX</span>
              </div>
              <div className="w-full h-1.5 bg-[#262a34] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00f5ff] shadow-[0_0_8px_#00f5ff] transition-all duration-500"
                  style={{ width: `${currentArchetype.speedRating}%` }}
                />
              </div>

              <div className="flex justify-between items-center font-mono text-xs mt-1">
                <span className="flex items-center gap-1 text-[#dfe2ef]">
                  <Shield className="w-3.5 h-3.5 text-[#ff4b89]" /> CHASSIS ARMOR & SHIELD HITS
                </span>
                <span className="text-[#ff4b89] font-bold">
                  {currentArchetype.armorRating} HP ({currentArchetype.maxShieldHits} ABSORBS)
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#262a34] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff4b89] shadow-[0_0_8px_#ff4b89] transition-all duration-500"
                  style={{ width: `${currentArchetype.armorRating}%` }}
                />
              </div>
            </div>
          </div>

          {/* Customization: Visor Tint & Thruster Drive */}
          <div className="bg-[#181b25] p-4 rounded-2xl border border-[#3a494a]/30 shadow-lg flex flex-col gap-4">
            {/* Visor Tint Selector */}
            <div>
              <span className="font-mono text-[10px] text-[#b9caca] uppercase tracking-wider block mb-2 font-bold">
                NEON VISOR HUD OPTIC TINT (UPDATES LIVE)
              </span>
              <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                <button
                  onClick={() => handleSelectTint('cyan')}
                  className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    armory.visorTint === 'cyan'
                      ? 'bg-[#262a34] border-[#00f5ff] text-[#00f5ff] font-bold shadow-[0_0_10px_rgba(0,245,255,0.4)]'
                      : 'bg-[#1c1f29] border-[#3a494a]/30 text-[#b9caca] hover:border-[#00f5ff]/40'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00f5ff] shadow-[0_0_6px_#00f5ff]"></span>
                  <span>CYAN</span>
                </button>
                <button
                  onClick={() => handleSelectTint('pink')}
                  className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    armory.visorTint === 'pink'
                      ? 'bg-[#262a34] border-[#ff4b89] text-[#ff4b89] font-bold shadow-[0_0_10px_rgba(255,75,137,0.4)]'
                      : 'bg-[#1c1f29] border-[#3a494a]/30 text-[#b9caca] hover:border-[#ff4b89]/40'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff4b89] shadow-[0_0_6px_#ff4b89]"></span>
                  <span>PINK</span>
                </button>
                <button
                  onClick={() => handleSelectTint('lime')}
                  className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    armory.visorTint === 'lime'
                      ? 'bg-[#262a34] border-[#3bff17] text-[#3bff17] font-bold shadow-[0_0_10px_rgba(59,255,23,0.4)]'
                      : 'bg-[#1c1f29] border-[#3a494a]/30 text-[#b9caca] hover:border-[#3bff17]/40'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3bff17] shadow-[0_0_6px_#3bff17]"></span>
                  <span>LIME</span>
                </button>
                <button
                  onClick={() => handleSelectTint('gold')}
                  className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    armory.visorTint === 'gold'
                      ? 'bg-[#262a34] border-[#f59e0b] text-[#f59e0b] font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                      : 'bg-[#1c1f29] border-[#3a494a]/30 text-[#b9caca] hover:border-[#f59e0b]/40'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]"></span>
                  <span>GOLD</span>
                </button>
              </div>
            </div>

            {/* Thruster Drive Selector */}
            <div>
              <span className="font-mono text-[10px] text-[#b9caca] uppercase tracking-wider block mb-2 font-bold">
                JETPACK THRUSTER ENGINE DRIVE
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {(['ion', 'plasma', 'afterburner'] as ThrusterDrive[]).map((drive) => {
                  const isSelected = armory.thrusterDrive === drive;
                  return (
                    <button
                      key={drive}
                      onClick={() => handleSelectDrive(drive)}
                      className={`py-2 px-2 rounded-lg uppercase tracking-wider transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#262a34] border-[#00f5ff] text-[#00f5ff] font-bold shadow-[0_0_8px_rgba(0,245,255,0.25)]'
                          : 'bg-[#1c1f29] border-[#3a494a]/30 text-[#b9caca] hover:text-[#dfe2ef]'
                      }`}
                    >
                      {drive === 'ion' ? 'ION PULSE' : drive === 'plasma' ? 'PLASMA CORE' : 'AFTERBURNER'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Upgrade Matrix Station & Loadout Dock (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Interactive Loadout Dock */}
          <div className="bg-[#181b25] p-5 rounded-2xl border border-[#3a494a]/30 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#00f5ff] uppercase font-bold tracking-wider">
                ACTIVE LOADOUT DOCK (5 SLOTS EQUIPPED)
              </span>
              <span className="font-mono text-[10px] text-[#79ff5b]">HOTKEYS ACTIVE</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
              <button
                onClick={() => setActiveSlotDetail('chrono')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                  activeSlotDetail === 'chrono'
                    ? 'bg-[#262a34] border-[#00f5ff] text-[#00f5ff]'
                    : 'bg-[#1c1f29] border-[#3a494a]/30 text-[#dfe2ef] hover:border-[#00f5ff]/40'
                }`}
              >
                <Clock className="w-5 h-5 text-[#00f5ff]" />
                <span className="font-bold text-[11px]">CHRONO [Q]</span>
                <span className="text-[9px] text-[#b9caca]">0.4x DILATION</span>
              </button>

              <button
                onClick={() => setActiveSlotDetail('emp')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                  activeSlotDetail === 'emp'
                    ? 'bg-[#262a34] border-[#ff4b89] text-[#ff4b89]'
                    : 'bg-[#1c1f29] border-[#3a494a]/30 text-[#dfe2ef] hover:border-[#ff4b89]/40'
                }`}
              >
                <Zap className="w-5 h-5 text-[#ff4b89]" />
                <span className="font-bold text-[11px]">EMP NOVA [E]</span>
                <span className="text-[9px] text-[#b9caca]">CLEAR SCREEN</span>
              </button>

              <button
                onClick={() => setActiveSlotDetail('shield')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                  activeSlotDetail === 'shield'
                    ? 'bg-[#262a34] border-[#3bff17] text-[#3bff17]'
                    : 'bg-[#1c1f29] border-[#3a494a]/30 text-[#dfe2ef] hover:border-[#3bff17]/40'
                }`}
              >
                <Shield className="w-5 h-5 text-[#3bff17]" />
                <span className="font-bold text-[11px]">AEGIS [R]</span>
                <span className="text-[9px] text-[#b9caca]">ABSORB HIT</span>
              </button>

              <button
                onClick={() => setActiveSlotDetail('magnet')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                  activeSlotDetail === 'magnet'
                    ? 'bg-[#262a34] border-[#63f7ff] text-[#63f7ff]'
                    : 'bg-[#1c1f29] border-[#3a494a]/30 text-[#dfe2ef] hover:border-[#63f7ff]/40'
                }`}
              >
                <Compass className="w-5 h-5 text-[#63f7ff]" />
                <span className="font-bold text-[11px]">MAGNET</span>
                <span className="text-[9px] text-[#b9caca]">HARVEST BITS</span>
              </button>

              <button
                onClick={() => setActiveSlotDetail('thrust')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                  activeSlotDetail === 'thrust'
                    ? 'bg-[#262a34] border-[#f59e0b] text-[#f59e0b]'
                    : 'bg-[#1c1f29] border-[#3a494a]/30 text-[#dfe2ef] hover:border-[#f59e0b]/40'
                }`}
              >
                <Flame className="w-5 h-5 text-[#f59e0b]" />
                <span className="font-bold text-[11px]">THRUST</span>
                <span className="text-[9px] text-[#b9caca]">DOUBLE JUMP</span>
              </button>
            </div>

            {/* Active Slot Description Callout */}
            {activeSlotDetail && (
              <div className="p-3 bg-[#1c1f29] rounded-xl border border-[#00f5ff]/30 text-xs text-[#b9caca]">
                {activeSlotDetail === 'chrono' && (
                  <p><strong className="text-[#00f5ff]">Chrono-Warp (Q):</strong> Distorts spacetime, slowing incoming drones and laser pylons to 0.4x speed for 3.6 seconds, giving you surgical dodging precision.</p>
                )}
                {activeSlotDetail === 'emp' && (
                  <p><strong className="text-[#ff4b89]">EMP Nova (E):</strong> Discharges a high-voltage electromagnetic blast that obliterates all obstacles currently on screen into scoring particle sparks.</p>
                )}
                {activeSlotDetail === 'shield' && (
                  <p><strong className="text-[#3bff17]">Kinetic Aegis (R):</strong> Deploys a nanite forcefield around the dino that completely absorbs fatal impacts without losing your run.</p>
                )}
                {activeSlotDetail === 'magnet' && (
                  <p><strong className="text-[#63f7ff]">Magnetic Nano-Attractor:</strong> Passively draws nearby Nano-Bits and Quantum Cores straight into your chassis from up to 100px away.</p>
                )}
                {activeSlotDetail === 'thrust' && (
                  <p><strong className="text-[#f59e0b]">Dual Ion Thruster (Space x2):</strong> Tucks legs and fires an aerial burst to perform an effortless double-jump to clear double-height drones.</p>
                )}
              </div>
            )}
          </div>

          {/* Upgrades Station */}
          <div className="bg-[#181b25] p-5 rounded-2xl border border-[#3a494a]/30 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#3a494a]/30 pb-3">
              <span className="font-mono text-xs text-[#00f5ff] uppercase font-bold flex items-center gap-1.5">
                <ArrowUpCircle className="w-4 h-4 text-[#00f5ff]" /> PERMANENT CHIP UPGRADES
              </span>
              <span className="font-mono text-xs text-[#79ff5b] font-bold">
                BALANCE: {playerStats.totalNanoBits.toLocaleString()} BITS
              </span>
            </div>

            {/* Upgrade 1: Speed Overclock */}
            <div className="p-4 bg-[#1c1f29] rounded-xl border border-[#3a494a]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00f5ff]/15 flex items-center justify-center text-[#00f5ff]">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-mono text-sm font-bold text-[#e9feff]">THRUSTER VELOCITY OVERCLOCK</h4>
                  <p className="text-xs text-[#b9caca]">Increases max base acceleration & top speed by +5% per chip tier.</p>
                  <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-[#00f5ff]">
                    <span>TIER: LVL {armory.upgrades.speedBoost}/5</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-3 h-1.5 rounded-sm ${
                            lvl <= armory.upgrades.speedBoost ? 'bg-[#00f5ff]' : 'bg-[#31353f]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                disabled={armory.upgrades.speedBoost >= 5 || playerStats.totalNanoBits < getUpgradeCost(armory.upgrades.speedBoost)}
                onClick={() => handleUpgrade('speedBoost', getUpgradeCost(armory.upgrades.speedBoost))}
                className={`px-4 py-2 rounded-lg font-mono text-xs uppercase font-bold transition-all shrink-0 cursor-pointer ${
                  armory.upgrades.speedBoost >= 5
                    ? 'bg-[#31353f] text-[#849495] cursor-not-allowed'
                    : playerStats.totalNanoBits >= getUpgradeCost(armory.upgrades.speedBoost)
                    ? 'bg-[#00f5ff] text-[#003739] hover:brightness-110 shadow-[0_0_10px_rgba(0,245,255,0.4)]'
                    : 'bg-[#262a34] text-[#849495] cursor-not-allowed'
                }`}
              >
                {armory.upgrades.speedBoost >= 5 ? 'MAXED' : `UPGRADE (${getUpgradeCost(armory.upgrades.speedBoost)} BITS)`}
              </button>
            </div>

            {/* Upgrade 2: Shield Duration */}
            <div className="p-4 bg-[#1c1f29] rounded-xl border border-[#3a494a]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#3bff17]/15 flex items-center justify-center text-[#3bff17]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-mono text-sm font-bold text-[#e9feff]">AEGIS BARRIER CONDENSER</h4>
                  <p className="text-xs text-[#b9caca]">Extends passive kinetic shield absorption timer by +1.5 seconds.</p>
                  <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-[#79ff5b]">
                    <span>TIER: LVL {armory.upgrades.shieldDuration}/5</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-3 h-1.5 rounded-sm ${
                            lvl <= armory.upgrades.shieldDuration ? 'bg-[#3bff17]' : 'bg-[#31353f]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                disabled={armory.upgrades.shieldDuration >= 5 || playerStats.totalNanoBits < getUpgradeCost(armory.upgrades.shieldDuration)}
                onClick={() => handleUpgrade('shieldDuration', getUpgradeCost(armory.upgrades.shieldDuration))}
                className={`px-4 py-2 rounded-lg font-mono text-xs uppercase font-bold transition-all shrink-0 cursor-pointer ${
                  armory.upgrades.shieldDuration >= 5
                    ? 'bg-[#31353f] text-[#849495] cursor-not-allowed'
                    : playerStats.totalNanoBits >= getUpgradeCost(armory.upgrades.shieldDuration)
                    ? 'bg-[#3bff17] text-[#053900] hover:brightness-110 shadow-[0_0_10px_rgba(59,255,23,0.4)]'
                    : 'bg-[#262a34] text-[#849495] cursor-not-allowed'
                }`}
              >
                {armory.upgrades.shieldDuration >= 5 ? 'MAXED' : `UPGRADE (${getUpgradeCost(armory.upgrades.shieldDuration)} BITS)`}
              </button>
            </div>

            {/* Upgrade 3: EMP Supercapacitor */}
            <div className="p-4 bg-[#1c1f29] rounded-xl border border-[#3a494a]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ff4b89]/15 flex items-center justify-center text-[#ff4b89]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-mono text-sm font-bold text-[#e9feff]">EMP SUPERCAPACITOR</h4>
                  <p className="text-xs text-[#b9caca]">Reduces recharge cycle cooldown on the EMP shockwave by 1.5 seconds.</p>
                  <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-[#ffb1c3]">
                    <span>TIER: LVL {armory.upgrades.empCooldown}/5</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-3 h-1.5 rounded-sm ${
                            lvl <= armory.upgrades.empCooldown ? 'bg-[#ff4b89]' : 'bg-[#31353f]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                disabled={armory.upgrades.empCooldown >= 5 || playerStats.totalNanoBits < getUpgradeCost(armory.upgrades.empCooldown)}
                onClick={() => handleUpgrade('empCooldown', getUpgradeCost(armory.upgrades.empCooldown))}
                className={`px-4 py-2 rounded-lg font-mono text-xs uppercase font-bold transition-all shrink-0 cursor-pointer ${
                  armory.upgrades.empCooldown >= 5
                    ? 'bg-[#31353f] text-[#849495] cursor-not-allowed'
                    : playerStats.totalNanoBits >= getUpgradeCost(armory.upgrades.empCooldown)
                    ? 'bg-[#ff4b89] text-white hover:brightness-110 shadow-[0_0_10px_rgba(255,75,137,0.4)]'
                    : 'bg-[#262a34] text-[#849495] cursor-not-allowed'
                }`}
              >
                {armory.upgrades.empCooldown >= 5 ? 'MAXED' : `UPGRADE (${getUpgradeCost(armory.upgrades.empCooldown)} BITS)`}
              </button>
            </div>

            {/* Upgrade 4: Magnet Range */}
            <div className="p-4 bg-[#1c1f29] rounded-xl border border-[#3a494a]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/15 flex items-center justify-center text-[#f59e0b]">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-mono text-sm font-bold text-[#e9feff]">MAGNETIC NANO-ATTRACTOR</h4>
                  <p className="text-xs text-[#b9caca]">Widens magnetic pull radius for automatic Nano-Bit harvesting.</p>
                  <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-[#f59e0b]">
                    <span>TIER: LVL {armory.upgrades.magnetRange}/5</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-3 h-1.5 rounded-sm ${
                            lvl <= armory.upgrades.magnetRange ? 'bg-[#f59e0b]' : 'bg-[#31353f]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                disabled={armory.upgrades.magnetRange >= 5 || playerStats.totalNanoBits < getUpgradeCost(armory.upgrades.magnetRange)}
                onClick={() => handleUpgrade('magnetRange', getUpgradeCost(armory.upgrades.magnetRange))}
                className={`px-4 py-2 rounded-lg font-mono text-xs uppercase font-bold transition-all shrink-0 cursor-pointer ${
                  armory.upgrades.magnetRange >= 5
                    ? 'bg-[#31353f] text-[#849495] cursor-not-allowed'
                    : playerStats.totalNanoBits >= getUpgradeCost(armory.upgrades.magnetRange)
                    ? 'bg-[#f59e0b] text-white hover:brightness-110 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'bg-[#262a34] text-[#849495] cursor-not-allowed'
                }`}
              >
                {armory.upgrades.magnetRange >= 5 ? 'MAXED' : `UPGRADE (${getUpgradeCost(armory.upgrades.magnetRange)} BITS)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
