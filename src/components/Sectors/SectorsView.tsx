import React, { useState, useEffect } from 'react';
import { Sector, SectorId } from '../../types/game';
import { INITIAL_SECTORS } from '../../services/storage';
import { soundEngine } from '../../services/sound';
import { SectorBiomePreview } from './SectorBiomePreview';
import {
  Satellite,
  Compass,
  Zap,
  Star,
  CheckCircle2,
  Play
} from 'lucide-react';

interface SectorsViewProps {
  currentSectorId: SectorId;
  onSelectSector: (sectorId: SectorId) => void;
  onDeployToArena: (sectorId: SectorId) => void;
}

export const SectorsView: React.FC<SectorsViewProps> = ({
  currentSectorId,
  onSelectSector,
  onDeployToArena
}) => {
  const [filter, setFilter] = useState<'all' | 'standard' | 'extreme' | 'daily'>('all');
  const [selectedId, setSelectedId] = useState<SectorId>(currentSectorId);

  // Keep selectedId synced with currentSectorId prop
  useEffect(() => {
    setSelectedId(currentSectorId);
  }, [currentSectorId]);

  const filteredSectors = INITIAL_SECTORS.filter((s) => {
    if (filter === 'all') return true;
    return s.category === filter;
  });

  const activeSector = INITIAL_SECTORS.find((s) => s.id === selectedId) || INITIAL_SECTORS[0];

  const handleSelectCard = (id: SectorId) => {
    soundEngine.play('click');
    setSelectedId(id);
    onSelectSector(id);
  };

  const handleDeploy = (id: SectorId, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEngine.play('click');
    onSelectSector(id);
    onDeployToArena(id);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Tactical Status Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 bg-[#181b25] rounded-xl border border-[#3a494a]/30 shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0a0e17] px-3.5 py-1.5 rounded-lg border border-[#3a494a]/40">
            <span className="w-2 h-2 rounded-full bg-[#3bff17] shadow-[0_0_8px_#3bff17] animate-pulse"></span>
            <span className="font-mono text-xs text-[#79ff5b] font-bold">RADAR LOCK: ONLINE</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#b9caca] font-mono text-xs">
            <Satellite className="w-4 h-4 text-[#00f5ff]" />
            <span>ORBITAL SECTOR ATLAS v4.09</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs bg-[#1c1f29] px-3 py-1 rounded border border-[#3a494a]/30">
            <span className="text-[#849495]">ACTIVE PROTOCOL:</span>
            <span className="text-[#ff4b89] font-bold">TACTICAL_EXPLORATION</span>
          </div>
        </div>

        {/* Sector Filter Switches */}
        <div className="flex flex-wrap items-center gap-1 bg-[#0a0e17] p-1 rounded-xl border border-[#3a494a]/30">
          <button
            onClick={() => {
              soundEngine.play('click');
              setFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#00f5ff] text-[#003739] font-bold shadow-[0_0_10px_rgba(0,245,255,0.4)]'
                : 'text-[#b9caca] hover:text-[#dfe2ef]'
            }`}
          >
            All (05)
          </button>
          <button
            onClick={() => {
              soundEngine.play('click');
              setFilter('standard');
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase transition-all cursor-pointer ${
              filter === 'standard'
                ? 'bg-[#00f5ff] text-[#003739] font-bold shadow-[0_0_10px_rgba(0,245,255,0.4)]'
                : 'text-[#b9caca] hover:text-[#dfe2ef]'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => {
              soundEngine.play('click');
              setFilter('extreme');
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase transition-all cursor-pointer ${
              filter === 'extreme'
                ? 'bg-[#00f5ff] text-[#003739] font-bold shadow-[0_0_10px_rgba(0,245,255,0.4)]'
                : 'text-[#b9caca] hover:text-[#dfe2ef]'
            }`}
          >
            Extreme
          </button>
          <button
            onClick={() => {
              soundEngine.play('click');
              setFilter('daily');
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase transition-all cursor-pointer ${
              filter === 'daily'
                ? 'bg-[#ff4b89] text-white font-bold shadow-[0_0_10px_rgba(255,75,137,0.4)]'
                : 'text-[#ffb1c3] hover:text-white'
            }`}
          >
            Daily Op
          </button>
        </div>
      </div>

      {/* Main Command Deck: Sector Grid (8 Cols) + Right Inspection (4 Cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Sector Cards List */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {filteredSectors.map((sec) => {
            const isEquipped = currentSectorId === sec.id;
            const isSelected = selectedId === sec.id;

            return (
              <div
                key={sec.id}
                onClick={() => handleSelectCard(sec.id)}
                className={`group relative bg-[#181b25] rounded-2xl overflow-hidden shadow-xl transition-all duration-300 border cursor-pointer ${
                  isEquipped
                    ? 'border-[#00f5ff] shadow-[0_0_24px_rgba(0,245,255,0.25)] ring-1 ring-[#00f5ff]/40'
                    : isSelected
                    ? 'border-[#63f7ff]/60'
                    : 'border-[#3a494a]/30 hover:border-[#00f5ff]/40'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[200px]">
                  {/* Left Visual Preview Banner with Unique Biome Art */}
                  <div className="md:col-span-5 relative overflow-hidden h-44 md:h-auto bg-[#0a0e17]">
                    <SectorBiomePreview
                      sectorId={sec.id}
                      bgHorizonColor={sec.bgHorizonColor}
                    />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#0a0e17]/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#3a494a]/40 shadow-sm z-10">
                      <span className="w-1.5 h-1.5 bg-[#00f5ff] rounded-full" />
                      <span className="font-mono text-[10px] text-[#63f7ff] font-bold">SECTOR {sec.id}</span>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-[#0a0e17]/90 px-2.5 py-0.5 rounded border border-[#3a494a]/40 shadow-sm z-10">
                      <span className="font-mono text-[10px] text-[#79ff5b] font-bold tracking-wider">
                        {sec.category === 'daily' ? 'DAILY OP ACTIVE' : `GRAV: ${sec.gravity.toFixed(2)}G`}
                      </span>
                    </div>
                  </div>

                  {/* Right Details & Action */}
                  <div className="md:col-span-7 p-4 sm:p-5 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-headline text-lg sm:text-xl font-bold text-[#e9feff]">
                              {sec.name}
                            </h3>
                            <span className="font-mono text-[10px] text-[#ff4b89] font-bold bg-[#ff4b89]/20 px-2 py-0.5 rounded">
                              [{sec.scoreMultiplier.toFixed(1)}x MULT]
                            </span>
                          </div>
                          <p className="text-xs text-[#b9caca] mt-1 line-clamp-2">
                            {sec.description}
                          </p>
                        </div>

                        {/* Hazard Level Stars */}
                        <div className="flex flex-col items-end shrink-0">
                          <span className="font-mono text-[9px] text-[#849495] uppercase">HAZARD</span>
                          <div className="flex items-center text-[#00f5ff]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= sec.hazardLevel ? 'fill-current text-[#00f5ff]' : 'text-[#31353f]'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Modifiers tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {sec.specialRules.map((rule, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-[#1c1f29] text-[#b9caca] font-mono text-[10px] border border-[#3a494a]/30 flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3 text-[#63f7ff]" /> {rule}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Row: Record & Launch */}
                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#3a494a]/30">
                      <div className="flex flex-col">
                        <span className="font-mono text-[9px] text-[#849495] uppercase">RECORD TELEMETRY</span>
                        <span className="font-mono text-sm text-[#ffb1c3] font-bold tabular-nums">
                          {sec.hiScore.toLocaleString()} <span className="text-[10px] text-[#849495]">PTS</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEquipped ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-[#3bff17]/20 text-[#79ff5b] font-mono text-xs font-bold rounded-lg border border-[#3bff17]/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> CURRENT
                            </span>
                            <button
                              onClick={(e) => handleDeploy(sec.id, e)}
                              className="px-3.5 py-1.5 bg-[#00f5ff] text-[#003739] rounded-lg font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(0,245,255,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" /> PLAY
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleDeploy(sec.id, e)}
                            className="px-4 py-2 bg-[#262a34] hover:bg-[#00f5ff] hover:text-[#003739] text-[#63f7ff] rounded-lg font-mono text-xs uppercase tracking-wider font-bold border border-[#00f5ff]/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" /> EQUIP & RUN
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Sector Inspection Dossier (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-[#181b25] p-5 rounded-2xl border border-[#3a494a]/40 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#3a494a]/30 pb-3">
              <span className="font-mono text-xs text-[#00f5ff] uppercase font-bold flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#00f5ff]" /> ORBITAL INTEL BRIEF
              </span>
              <span className="font-mono text-[10px] text-[#79ff5b]">SECTOR {activeSector.id}</span>
            </div>

            <div className="w-full h-28 rounded-xl overflow-hidden border border-[#3a494a]/40 shadow-inner">
              <SectorBiomePreview
                sectorId={activeSector.id}
                bgHorizonColor={activeSector.bgHorizonColor}
              />
            </div>

            <div>
              <h3 className="font-headline text-xl font-bold text-[#e9feff]">
                {activeSector.name}
              </h3>
              <p className="text-xs text-[#b9caca] mt-1.5 leading-relaxed">
                {activeSector.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
              <div className="bg-[#1c1f29] p-2.5 rounded-xl border border-[#3a494a]/30 flex flex-col">
                <span className="text-[10px] text-[#849495]">GRAVITY FIELD</span>
                <span className="text-[#00f5ff] font-bold text-sm">{activeSector.gravity.toFixed(2)}G</span>
              </div>
              <div className="bg-[#1c1f29] p-2.5 rounded-xl border border-[#3a494a]/30 flex flex-col">
                <span className="text-[10px] text-[#849495]">SCORE MULT</span>
                <span className="text-[#ff4b89] font-bold text-sm">{activeSector.scoreMultiplier.toFixed(1)}x</span>
              </div>
              <div className="bg-[#1c1f29] p-2.5 rounded-xl border border-[#3a494a]/30 flex flex-col">
                <span className="text-[10px] text-[#849495]">VELOCITY BASE</span>
                <span className="text-[#79ff5b] font-bold text-sm">
                  {Math.round(activeSector.baseVelocityMultiplier * 100)}%
                </span>
              </div>
              <div className="bg-[#1c1f29] p-2.5 rounded-xl border border-[#3a494a]/30 flex flex-col">
                <span className="text-[10px] text-[#849495]">DANGER TIER</span>
                <span className="text-[#ffb1c3] font-bold text-sm">LVL {activeSector.hazardLevel}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-[#3a494a]/30">
              <span className="font-mono text-[10px] text-[#849495] uppercase">TACTICAL BIOME INTEL</span>
              <ul className="text-xs text-[#dfe2ef] space-y-1.5 list-disc list-inside">
                <li>Atmospheric density dynamically alters jump hangtime and glide thrusters.</li>
                <li>Environmental multipliers apply on top of Synapse streak multipliers.</li>
                <li>Nano-Bits magnet range is augmented by 20% in high-frequency sectors.</li>
              </ul>
            </div>

            <button
              onClick={() => handleDeploy(activeSector.id)}
              className="w-full py-3 bg-[#00f5ff] text-[#003739] rounded-xl font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(0,245,255,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {currentSectorId === activeSector.id
                  ? `LAUNCH INTO ${activeSector.name.toUpperCase()}`
                  : `EQUIP & LAUNCH (${activeSector.name.toUpperCase()})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
