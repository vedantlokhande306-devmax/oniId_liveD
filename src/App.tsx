import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ArenaView } from './components/Arena/ArenaView';
import { LeaderboardView } from './components/Leaderboard/LeaderboardView';
import { SectorsView } from './components/Sectors/SectorsView';
import { ArmoryView } from './components/Armory/ArmoryView';
import { SystemView } from './components/System/SystemView';
import {
  ArmoryState,
  PlayerStats,
  SectorId,
  ViewMode
} from './types/game';
import {
  DEFAULT_ARMORY_STATE,
  DEFAULT_PLAYER_STATS,
  INITIAL_ARCHETYPES,
  INITIAL_SECTORS,
  StorageService
} from './services/storage';
import { soundEngine } from './services/sound';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('arena');
  const [selectedSectorId, setSelectedSectorId] = useState<SectorId>(() => StorageService.getSelectedSector());
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => StorageService.getPlayerStats());
  const [armoryState, setArmoryState] = useState<ArmoryState>(() => StorageService.getArmoryState());
  const [globalHiScore, setGlobalHiScore] = useState<number>(() => StorageService.getGlobalHiScore());

  // Audio states
  const [isMuted, setIsMuted] = useState(soundEngine.getIsMuted());
  const [isMusicPlaying, setIsMusicPlaying] = useState(soundEngine.getIsMusicPlaying());

  const currentSector = INITIAL_SECTORS.find((s) => s.id === selectedSectorId) || INITIAL_SECTORS[0];
  const currentArchetype = INITIAL_ARCHETYPES.find((a) => a.id === armoryState.selectedArchetype) || INITIAL_ARCHETYPES[0];

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleMusic = () => {
    const playing = soundEngine.toggleMusic();
    setIsMusicPlaying(playing);
  };

  const handleSelectSector = (id: SectorId) => {
    setSelectedSectorId(id);
    StorageService.setSelectedSector(id);
  };

  const handleDeployToArena = (sectorId?: SectorId) => {
    if (sectorId) {
      handleSelectSector(sectorId);
    }
    setCurrentView('arena');
  };

  const handleResetAllData = () => {
    StorageService.resetToFactoryDefaults();
    setSelectedSectorId('01');
    setPlayerStats(DEFAULT_PLAYER_STATS);
    setArmoryState(DEFAULT_ARMORY_STATE);
    setGlobalHiScore(998420);
    setCurrentView('arena');
  };

  return (
    <div className="min-h-screen bg-[#0f131c] text-[#dfe2ef] flex flex-col font-sans selection:bg-[#00f5ff] selection:text-[#003739]">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        hiScore={globalHiScore}
        credits={4}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusic}
      />

      {/* Main Content Viewport */}
      <main className="w-full pt-24 pb-12 flex-1">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          {currentView === 'arena' && (
            <ArenaView
              sector={currentSector}
              archetype={currentArchetype}
              armory={armoryState}
              onNavigate={setCurrentView}
              playerStats={playerStats}
              onUpdatePlayerStats={setPlayerStats}
              onUpdateHiScore={(newHi) => {
                setGlobalHiScore(newHi);
                StorageService.setGlobalHiScore(newHi);
              }}
              globalHiScore={globalHiScore}
              onSelectSector={handleSelectSector}
              onUpdateArmory={setArmoryState}
            />
          )}

          {currentView === 'leaderboard' && (
            <LeaderboardView
              onNavigate={setCurrentView}
              playerStats={playerStats}
              onSelectSectorAndPlay={(secId) => handleDeployToArena(secId as SectorId)}
            />
          )}

          {currentView === 'sectors' && (
            <SectorsView
              currentSectorId={selectedSectorId}
              onSelectSector={handleSelectSector}
              onDeployToArena={handleDeployToArena}
            />
          )}

          {currentView === 'armory' && (
            <ArmoryView
              armory={armoryState}
              onUpdateArmory={setArmoryState}
              playerStats={playerStats}
              onUpdatePlayerStats={setPlayerStats}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'system' && (
            <SystemView
              armory={armoryState}
              onUpdateArmory={setArmoryState}
              playerStats={playerStats}
              onUpdatePlayerStats={setPlayerStats}
              onNavigate={setCurrentView}
              onResetAllData={handleResetAllData}
            />
          )}
        </div>
      </main>

      {/* Persistent Footer */}
      <Footer />
    </div>
  );
}
