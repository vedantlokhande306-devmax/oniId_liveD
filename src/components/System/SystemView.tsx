import React, { useState } from 'react';
import { ArmoryState, PlayerStats, ViewMode } from '../../types/game';
import { StorageService } from '../../services/storage';
import { soundEngine } from '../../services/sound';
import {
  Sliders,
  Keyboard,
  RotateCcw,
  Volume2,
  Trash2,
  Download,
  Info,
  CheckCircle2,
  Shield,
  Zap,
  Play
} from 'lucide-react';

interface SystemViewProps {
  armory: ArmoryState;
  onUpdateArmory: (armory: ArmoryState) => void;
  playerStats: PlayerStats;
  onUpdatePlayerStats: (stats: PlayerStats) => void;
  onNavigate: (view: ViewMode) => void;
  onResetAllData: () => void;
}

export const SystemView: React.FC<SystemViewProps> = ({
  armory,
  onUpdateArmory,
  playerStats,
  onUpdatePlayerStats,
  onNavigate,
  onResetAllData
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleExportJSON = () => {
    soundEngine.play('click');
    const data = {
      timestamp: new Date().toISOString(),
      playerStats,
      armoryState: armory,
      leaderboard: StorageService.getLeaderboard()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyber_dino_telemetry_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top System Header */}
      <div className="w-full p-4 bg-[#181b25] rounded-xl border border-[#3a494a]/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs text-[#00f5ff] tracking-widest uppercase font-bold flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[#00f5ff]" />
            SYSTEM CALIBRATION // PROTOCOL [ZERO-DINO]
          </span>
          <h2 className="font-headline text-xl text-[#e9feff] font-bold mt-1">
            CONTROLS, SYNTH AUDIO & LOCAL STORAGE TELEMETRY
          </h2>
        </div>

        <button
          onClick={() => {
            soundEngine.play('click');
            onNavigate('arena');
          }}
          className="px-4 py-2 bg-[#00f5ff] text-[#003739] rounded-xl font-mono text-xs uppercase font-bold shadow-[0_0_12px_rgba(0,245,255,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>RETURN TO ARENA</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Keybindings & Mechanics (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Keybindings Card */}
          <div className="bg-[#181b25] p-5 rounded-2xl border border-[#3a494a]/30 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#3a494a]/30 pb-3">
              <Keyboard className="w-5 h-5 text-[#00f5ff]" />
              <h3 className="font-headline text-lg font-bold text-[#e9feff]">
                TACTICAL CONTROL MATRIX
              </h3>
            </div>

            <div className="flex flex-col gap-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 bg-[#1c1f29] rounded-xl border border-[#3a494a]/30">
                <span className="text-[#dfe2ef]">JUMP & DOUBLE JUMP</span>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-[#262a34] text-[#00f5ff] rounded font-bold">SPACE</kbd>
                  <kbd className="px-2 py-1 bg-[#262a34] text-[#00f5ff] rounded font-bold">↑</kbd>
                  <kbd className="px-2 py-1 bg-[#262a34] text-[#00f5ff] rounded font-bold">W</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#1c1f29] rounded-xl border border-[#3a494a]/30">
                <span className="text-[#dfe2ef]">NANITE DUCK & SLIDE</span>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-[#262a34] text-[#00f5ff] rounded font-bold">S</kbd>
                  <kbd className="px-2 py-1 bg-[#262a34] text-[#00f5ff] rounded font-bold">↓</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#1c1f29] rounded-xl border border-[#3a494a]/30">
                <span className="text-[#dfe2ef]">CHRONO-WARP DILATION</span>
                <kbd className="px-2.5 py-1 bg-[#262a34] text-[#00f5ff] rounded font-bold">Q</kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#1c1f29] rounded-xl border border-[#3a494a]/30">
                <span className="text-[#dfe2ef]">EMP SHOCKWAVE BLAST</span>
                <kbd className="px-2.5 py-1 bg-[#262a34] text-[#ff4b89] rounded font-bold">E</kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#1c1f29] rounded-xl border border-[#3a494a]/30">
                <span className="text-[#dfe2ef]">AEGIS BARRIER SHIELD</span>
                <kbd className="px-2.5 py-1 bg-[#262a34] text-[#79ff5b] rounded font-bold">R</kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#1c1f29] rounded-xl border border-[#3a494a]/30">
                <span className="text-[#dfe2ef]">SYNAPSE SPARK PULSE</span>
                <kbd className="px-2.5 py-1 bg-[#262a34] text-[#ffb1c3] rounded font-bold">SHIFT</kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#1c1f29] rounded-xl border border-[#3a494a]/30">
                <span className="text-[#dfe2ef]">PAUSE ENGINE</span>
                <kbd className="px-2.5 py-1 bg-[#262a34] text-[#b9caca] rounded font-bold">ESC</kbd>
              </div>
            </div>

            <p className="text-[11px] text-[#b9caca] bg-[#1c1f29] p-3 rounded-xl border border-[#3a494a]/30">
              💡 <strong>Mobile / Touch Support:</strong> Interactive hotbar buttons on the screen allow 100% full gameplay using taps and on-screen controls without a physical keyboard!
            </p>
          </div>
        </div>

        {/* Right Column: Local Storage & Audio Calibration (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Data Persistence & Export Card */}
          <div className="bg-[#181b25] p-5 rounded-2xl border border-[#3a494a]/30 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#3a494a]/30 pb-3">
              <Download className="w-5 h-5 text-[#00f5ff]" />
              <h3 className="font-headline text-lg font-bold text-[#e9feff]">
                PERSISTENT LOCAL STORAGE
              </h3>
            </div>

            <p className="text-xs text-[#b9caca] leading-relaxed">
              Your high scores, longest distance, personal bests, equipped rig chassis, custom visor tints, and unlocked chip upgrades are all continuously preserved inside browser <strong>localStorage</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleExportJSON}
                className="flex-1 py-2.5 bg-[#262a34] hover:bg-[#31353f] text-[#00f5ff] rounded-xl font-mono text-xs uppercase font-bold border border-[#00f5ff]/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#79ff5b]" />
                    <span className="text-[#79ff5b]">TELEMETRY EXPORTED!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>EXPORT HIGH SCORES (JSON)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowConfirmModal(true)}
                className="py-2.5 px-4 bg-[#93000a]/30 hover:bg-[#93000a]/50 text-[#ffb4ab] rounded-xl font-mono text-xs uppercase font-bold border border-[#ffb4ab]/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>FACTORY RESET</span>
              </button>
            </div>
          </div>

          {/* Sound & Synthesizer Info */}
          <div className="bg-[#181b25] p-5 rounded-2xl border border-[#3a494a]/30 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#3a494a]/30 pb-3">
              <Volume2 className="w-5 h-5 text-[#3bff17]" />
              <h3 className="font-headline text-lg font-bold text-[#e9feff]">
                AUDIO SYNTHESIS ARCHITECTURE
              </h3>
            </div>

            <p className="text-xs text-[#b9caca] leading-relaxed">
              Every laser pulse, ion thrust jump, EMP blast, time dilation sweep, and background cyber arpeggio is generated algorithmically through real-time <strong>Web Audio API oscillators</strong>. No external audio files are downloaded, guaranteeing immediate responsiveness and zero latency.
            </p>

            <div className="grid grid-cols-2 gap-2.5 font-mono text-xs pt-1">
              <button
                onClick={() => soundEngine.play('jump')}
                className="p-2 bg-[#1c1f29] hover:bg-[#262a34] text-[#00f5ff] rounded-lg border border-[#3a494a]/30 text-center cursor-pointer"
              >
                TEST JUMP
              </button>
              <button
                onClick={() => soundEngine.play('doubleJump')}
                className="p-2 bg-[#1c1f29] hover:bg-[#262a34] text-[#ff4b89] rounded-lg border border-[#3a494a]/30 text-center cursor-pointer"
              >
                TEST THRUST
              </button>
              <button
                onClick={() => soundEngine.play('emp')}
                className="p-2 bg-[#1c1f29] hover:bg-[#262a34] text-[#3bff17] rounded-lg border border-[#3a494a]/30 text-center cursor-pointer"
              >
                TEST EMP
              </button>
              <button
                onClick={() => soundEngine.play('chrono')}
                className="p-2 bg-[#1c1f29] hover:bg-[#262a34] text-[#f59e0b] rounded-lg border border-[#3a494a]/30 text-center cursor-pointer"
              >
                TEST CHRONO
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Factory Reset Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1c1f29] border border-[#ff4b89]/50 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 text-center">
            <h4 className="font-headline text-lg font-bold text-[#ffb4ab]">
              RESET ALL CYBER DINO DATA?
            </h4>
            <p className="text-xs text-[#b9caca]">
              This will wipe all player runs, custom high scores, upgrades, and settings from localStorage and restore initial arcade legend scores.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-[#262a34] text-[#dfe2ef] font-mono text-xs rounded-lg cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  soundEngine.play('click');
                  onResetAllData();
                  setShowConfirmModal(false);
                }}
                className="px-4 py-2 bg-[#ff4b89] text-white font-mono text-xs font-bold rounded-lg cursor-pointer"
              >
                CONFIRM FULL RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
