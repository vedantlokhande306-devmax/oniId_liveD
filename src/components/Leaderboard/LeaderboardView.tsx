import React, { useState, useMemo } from 'react';
import { LeaderboardEntry, PlayerStats, ViewMode } from '../../types/game';
import { StorageService } from '../../services/storage';
import { soundEngine } from '../../services/sound';
import {
  Trophy,
  Medal,
  Crown,
  Search,
  Filter,
  Share2,
  Play,
  RotateCcw,
  Sparkles,
  User,
  CheckCircle2,
  Trash2,
  Eye,
  X
} from 'lucide-react';

interface LeaderboardViewProps {
  onNavigate: (view: ViewMode) => void;
  playerStats: PlayerStats;
  onSelectSectorAndPlay: (sectorId: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  onNavigate,
  playerStats,
  onSelectSectorAndPlay
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => StorageService.getLeaderboard());
  const [activeTab, setActiveTab] = useState<'alltime' | 'daily' | 'weekly' | 'friends'>('alltime');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [selectedGhost, setSelectedGhost] = useState<LeaderboardEntry | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter & Search Logic
  const filteredEntries = useMemo(() => {
    let list = [...entries];

    // Category filtering
    if (activeTab === 'daily') {
      list = list.slice(0, 10);
    } else if (activeTab === 'weekly') {
      list = list.slice(0, 15);
    } else if (activeTab === 'friends') {
      list = list.filter(e => e.isPlayer || ['K4RMA_NULL', 'VEX_GLITCH', 'SYNTH_STALKER'].includes(e.runnerTag));
    }

    // Sector filtering
    if (sectorFilter !== 'all') {
      list = list.filter(e => e.sectorId === sectorFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        e =>
          e.runnerTag.toLowerCase().includes(q) ||
          e.sectorName.toLowerCase().includes(q) ||
          e.loadout.toLowerCase().includes(q)
      );
    }

    return list;
  }, [entries, activeTab, sectorFilter, searchQuery]);

  // Top 3 Podium Entries
  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  // Calculate current player's highest rank
  const playerRankIndex = entries.findIndex(e => e.isPlayer);
  const playerRankDisplay = playerRankIndex >= 0 ? `#${playerRankIndex + 1}` : 'UNRANKED';

  const handleResetLeaderboard = () => {
    soundEngine.play('click');
    StorageService.saveLeaderboard(StorageService.getLeaderboard().filter(e => !e.isPlayer));
    setEntries(StorageService.getLeaderboard());
    setShowClearConfirm(false);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Tournament Directive Banner */}
      <div className="relative overflow-hidden rounded-xl bg-[#1c1f29] p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-[#3a494a]/30 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff4b89]/15 via-[#00f5ff]/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-[#ff4b89] text-white flex items-center justify-center shadow-[0_0_12px_#ff4b89]">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-[10px] text-[#ffb1c3] uppercase tracking-widest bg-[#ff4b89]/20 px-2 py-0.5 rounded border border-[#ff4b89]/30 font-bold">
              BOUNTY DIRECTIVE
            </span>
            <span className="font-mono text-xs sm:text-sm text-[#e9feff] font-bold">
              TODAY'S EVENT: ZERO-G ORBIT GAUNTLET
            </span>
            <span className="text-[#849495]">/</span>
            <span className="text-xs text-[#b9caca]">
              Top 10 Survivors Claim <strong className="text-[#79ff5b] font-mono">Cyber Gold Rex Prototype</strong> Skin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#b9caca]">
            <span>RESET IN:</span>
            <strong className="text-[#00f5ff] tabular-nums">04:18:22</strong>
          </div>
          <button
            onClick={() => {
              soundEngine.play('click');
              onSelectSectorAndPlay('03');
            }}
            className="bg-[#00f5ff] text-[#003739] px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(0,245,255,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>ENLIST NOW</span>
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>

      {/* Top 3 Hall of Fame Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
        {/* Rank 2: Silver Podium */}
        {top2 && (
          <div className="order-2 md:order-1 flex flex-col bg-[#1c1f29] rounded-2xl p-5 relative shadow-xl border border-[#3a494a]/40 hover:-translate-y-1 transition-transform">
            <div className="absolute -top-3.5 left-4 bg-[#31353f] px-3 py-1 rounded font-mono text-[11px] text-[#dfe2ef] tracking-wider flex items-center gap-1.5 border border-[#849495]/30">
              <Medal className="w-3.5 h-3.5 text-[#b9caca]" />
              <span>RANK 02 / SILVER</span>
            </div>

            <div className="relative w-full h-36 rounded-xl overflow-hidden mb-4 bg-[#0a0e17] mt-1">
              <img
                src="/assets/stitch/arena.png"
                alt={top2.runnerTag}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1f29] via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 flex items-center gap-1">
                <span className="px-2 py-0.5 rounded bg-[#0a0e17]/90 text-[#ffb1c3] font-mono text-[10px] font-bold">
                  {top2.titleTag}
                </span>
              </div>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-headline text-lg font-bold text-[#e9feff] flex items-center gap-1.5">
                  {top2.runnerTag}
                  {top2.isPlayer && (
                    <span className="bg-[#00f5ff]/20 text-[#00f5ff] text-[10px] font-mono px-1.5 py-0.5 rounded">
                      YOU
                    </span>
                  )}
                </h3>
                <p className="font-mono text-xs text-[#b9caca]">{top2.sectorName}</p>
              </div>
              <span className="font-mono text-xs text-[#79ff5b] bg-[#181b25] px-2 py-1 rounded">
                SECTOR {top2.sectorId}
              </span>
            </div>

            <div className="mt-3 bg-[#181b25] rounded-lg p-3 flex flex-col gap-0.5 border border-[#3a494a]/30">
              <span className="font-mono text-[10px] text-[#b9caca] uppercase">SCORE RECORD</span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xl text-[#00f5ff] font-bold tabular-nums">
                  {top2.score.toLocaleString()}
                </span>
                <span className="font-mono text-xs text-[#b9caca] tabular-nums">
                  {top2.distance.toLocaleString()}m
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[#b9caca] font-mono text-xs">
              <span className="truncate max-w-[160px]">{top2.loadout}</span>
              <button
                onClick={() => setSelectedGhost(top2)}
                className="text-[#63f7ff] hover:text-[#00f5ff] flex items-center gap-1 font-bold cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>GHOST</span>
              </button>
            </div>
          </div>
        )}

        {/* Rank 1: Gold Podium (Apex Champion) */}
        {top1 && (
          <div className="order-1 md:order-2 flex flex-col bg-[#262a34] rounded-2xl p-5 relative shadow-[0_0_35px_rgba(0,245,255,0.25)] border-2 border-[#00f5ff]/60 md:-mt-6 hover:-translate-y-1 transition-transform">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00f5ff] text-[#003739] px-4 py-1 rounded font-mono text-xs tracking-wider flex items-center gap-1.5 font-bold shadow-[0_0_10px_#00f5ff]">
              <Crown className="w-4 h-4 fill-current" />
              <span>#1 APEX CHAMPION</span>
            </div>

            <div className="relative w-full h-44 rounded-xl overflow-hidden mb-4 bg-[#0a0e17] mt-1">
              <img
                src="/assets/stitch/leaderboard.png"
                alt={top1.runnerTag}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#262a34] via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#0a0e17]/90 text-[#00f5ff] font-mono text-[10px] font-bold">
                  {top1.titleTag}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#3bff17] text-[#053900] font-mono text-[10px] font-bold">
                  UNDEFEATED
                </span>
              </div>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-headline text-2xl font-bold text-[#e9feff] flex items-center gap-2">
                  {top1.runnerTag}
                  {top1.isPlayer && (
                    <span className="bg-[#00f5ff] text-[#003739] text-xs font-mono px-2 py-0.5 rounded font-bold">
                      YOU
                    </span>
                  )}
                </h2>
                <p className="font-mono text-xs text-[#b9caca]">{top1.sectorName}</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-[#79ff5b] block bg-[#0a0e17] px-2 py-0.5 rounded">
                  SECTOR {top1.sectorId}
                </span>
                <span className="font-mono text-[10px] text-[#b9caca] mt-0.5 block">RECORD RUN</span>
              </div>
            </div>

            <div className="mt-3 bg-[#0a0e17] rounded-xl p-3.5 flex flex-col gap-1 border border-[#00f5ff]/30 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#ffb1c3] uppercase tracking-wider font-bold">
                  ALL-TIME BEST
                </span>
                <span className="font-mono text-[10px] text-[#79ff5b] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3bff17] animate-pulse"></span> LIVE VALIDATED
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-2xl text-[#00f5ff] font-bold tabular-nums tracking-tight">
                  {top1.score.toLocaleString()}
                </span>
                <span className="font-mono text-sm text-[#e9feff] tabular-nums">
                  {top1.distance.toLocaleString()}m
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between font-mono text-xs">
              <span className="text-[#b9caca] truncate max-w-[180px]">{top1.loadout}</span>
              <button
                onClick={() => setSelectedGhost(top1)}
                className="bg-[#00f5ff]/20 text-[#00f5ff] hover:bg-[#00f5ff] hover:text-[#003739] px-3 py-1 rounded transition-colors flex items-center gap-1 font-bold cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>TELEMETRY</span>
              </button>
            </div>
          </div>
        )}

        {/* Rank 3: Bronze Podium */}
        {top3 && (
          <div className="order-3 flex flex-col bg-[#1c1f29] rounded-2xl p-5 relative shadow-xl border border-[#3a494a]/40 hover:-translate-y-1 transition-transform">
            <div className="absolute -top-3.5 left-4 bg-[#31353f] px-3 py-1 rounded font-mono text-[11px] text-[#f59e0b] tracking-wider flex items-center gap-1.5 border border-[#849495]/30">
              <Medal className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>RANK 03 / BRONZE</span>
            </div>

            <div className="relative w-full h-36 rounded-xl overflow-hidden mb-4 bg-[#0a0e17] mt-1">
              <img
                src="/assets/stitch/armory.png"
                alt={top3.runnerTag}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1f29] via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 flex items-center gap-1">
                <span className="px-2 py-0.5 rounded bg-[#0a0e17]/90 text-[#f59e0b] font-mono text-[10px] font-bold">
                  {top3.titleTag}
                </span>
              </div>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-headline text-lg font-bold text-[#e9feff] flex items-center gap-1.5">
                  {top3.runnerTag}
                  {top3.isPlayer && (
                    <span className="bg-[#00f5ff]/20 text-[#00f5ff] text-[10px] font-mono px-1.5 py-0.5 rounded">
                      YOU
                    </span>
                  )}
                </h3>
                <p className="font-mono text-xs text-[#b9caca]">{top3.sectorName}</p>
              </div>
              <span className="font-mono text-xs text-[#79ff5b] bg-[#181b25] px-2 py-1 rounded">
                SECTOR {top3.sectorId}
              </span>
            </div>

            <div className="mt-3 bg-[#181b25] rounded-lg p-3 flex flex-col gap-0.5 border border-[#3a494a]/30">
              <span className="font-mono text-[10px] text-[#b9caca] uppercase">SCORE RECORD</span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xl text-[#00f5ff] font-bold tabular-nums">
                  {top3.score.toLocaleString()}
                </span>
                <span className="font-mono text-xs text-[#b9caca] tabular-nums">
                  {top3.distance.toLocaleString()}m
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[#b9caca] font-mono text-xs">
              <span className="truncate max-w-[160px]">{top3.loadout}</span>
              <button
                onClick={() => setSelectedGhost(top3)}
                className="text-[#63f7ff] hover:text-[#00f5ff] flex items-center gap-1 font-bold cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>GHOST</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Player Dossier Summary Card (Bento Row from Stitch) */}
      <div className="bg-[#181b25] rounded-2xl p-5 flex flex-col lg:flex-row items-center justify-between gap-6 border border-[#3a494a]/40 shadow-xl">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-xl bg-[#262a34] flex items-center justify-center text-[#00f5ff] shadow-md border border-[#00f5ff]/30">
              <User className="w-7 h-7" />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-[#3bff17] text-[#053900] text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
              P1
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm sm:text-base text-[#e9feff] font-bold">
                {playerStats.runnerTag}
              </span>
              <span className="font-mono text-[10px] text-[#00f5ff] bg-[#1c1f29] px-2 py-0.5 rounded border border-[#00f5ff]/30">
                {playerStats.titleTag}
              </span>
            </div>
            <p className="text-xs text-[#b9caca] mt-0.5">
              Personal Telemetry Dossier · Current Division: <strong className="text-[#79ff5b]">{playerStats.divisionTier}</strong>
            </p>
          </div>
        </div>

        {/* Live Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          <div className="bg-[#1c1f29] px-4 py-2 rounded-xl border border-[#3a494a]/30 flex flex-col">
            <span className="font-mono text-[10px] text-[#b9caca] uppercase">RANK TIER</span>
            <span className="font-mono text-base font-bold text-[#ffb1c3] tabular-nums">
              {playerRankDisplay} <span className="text-[10px] text-[#849495] font-normal">GLOBAL</span>
            </span>
          </div>

          <div className="bg-[#1c1f29] px-4 py-2 rounded-xl border border-[#3a494a]/30 flex flex-col">
            <span className="font-mono text-[10px] text-[#b9caca] uppercase">BEST RUN</span>
            <span className="font-mono text-base font-bold text-[#00f5ff] tabular-nums">
              {playerStats.longestRunMeters.toLocaleString()}m
            </span>
          </div>

          <div className="bg-[#1c1f29] px-4 py-2 rounded-xl border border-[#3a494a]/30 flex flex-col">
            <span className="font-mono text-[10px] text-[#b9caca] uppercase">JUMP STREAK</span>
            <span className="font-mono text-base font-bold text-[#79ff5b] tabular-nums">
              {playerStats.bestComboStreak} COMBO
            </span>
          </div>

          <div className="bg-[#1c1f29] px-4 py-2 rounded-xl border border-[#3a494a]/30 flex flex-col">
            <span className="font-mono text-[10px] text-[#b9caca] uppercase">NANO-BITS</span>
            <span className="font-mono text-base font-bold text-[#63f7ff] tabular-nums">
              {playerStats.totalNanoBits.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              soundEngine.play('click');
              onNavigate('arena');
            }}
            className="bg-[#ff4b89] hover:bg-[#ff4b89]/90 text-white px-4 py-2.5 rounded-xl font-mono text-xs tracking-wider uppercase font-bold shadow-[0_0_15px_rgba(255,75,137,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>DEPLOY RUN</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-2.5 bg-[#262a34] hover:bg-[#31353f] text-[#ffb4ab] rounded-xl border border-[#3a494a]/40 transition-colors cursor-pointer"
            title="Reset Local High Scores"
            aria-label="Reset Local High Scores"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1c1f29] border border-[#ff4b89]/50 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 text-center">
            <h4 className="font-headline text-lg font-bold text-[#ffb4ab]">
              RESET LEADERBOARD SCORES?
            </h4>
            <p className="text-xs text-[#b9caca]">
              This will remove player high score entries from your browser's local storage and restore default factory legend scores.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-[#262a34] text-[#dfe2ef] font-mono text-xs rounded-lg cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={handleResetLeaderboard}
                className="px-4 py-2 bg-[#ff4b89] text-white font-mono text-xs font-bold rounded-lg cursor-pointer"
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Data Table Section */}
      <div className="bg-[#181b25] rounded-2xl p-5 flex flex-col gap-5 border border-[#3a494a]/40 shadow-xl">
        {/* Header Bar: Tabs & Search Filter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#1c1f29] p-1 rounded-xl border border-[#3a494a]/30 overflow-x-auto">
            <button
              onClick={() => {
                soundEngine.play('click');
                setActiveTab('alltime');
              }}
              className={`px-4 py-1.5 rounded-lg font-mono text-xs uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'alltime'
                  ? 'bg-[#262a34] text-[#00f5ff] font-bold shadow-[0_0_8px_rgba(0,245,255,0.3)]'
                  : 'text-[#b9caca] hover:text-[#dfe2ef]'
              }`}
            >
              All-Time Legends
            </button>
            <button
              onClick={() => {
                soundEngine.play('click');
                setActiveTab('daily');
              }}
              className={`px-4 py-1.5 rounded-lg font-mono text-xs uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-[#262a34] text-[#00f5ff] font-bold shadow-[0_0_8px_rgba(0,245,255,0.3)]'
                  : 'text-[#b9caca] hover:text-[#dfe2ef]'
              }`}
            >
              Global Daily
            </button>
            <button
              onClick={() => {
                soundEngine.play('click');
                setActiveTab('weekly');
              }}
              className={`px-4 py-1.5 rounded-lg font-mono text-xs uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'weekly'
                  ? 'bg-[#262a34] text-[#00f5ff] font-bold shadow-[0_0_8px_rgba(0,245,255,0.3)]'
                  : 'text-[#b9caca] hover:text-[#dfe2ef]'
              }`}
            >
              Weekly Championship
            </button>
            <button
              onClick={() => {
                soundEngine.play('click');
                setActiveTab('friends');
              }}
              className={`px-4 py-1.5 rounded-lg font-mono text-xs uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'friends'
                  ? 'bg-[#262a34] text-[#00f5ff] font-bold shadow-[0_0_8px_rgba(0,245,255,0.3)]'
                  : 'text-[#b9caca] hover:text-[#dfe2ef]'
              }`}
            >
              Personal & Rivals
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="FILTER RUNNER OR TAG..."
                className="w-full bg-[#1c1f29] border border-[#3a494a]/40 px-3.5 py-1.5 pr-8 rounded-lg text-xs font-mono text-[#e9feff] placeholder:text-[#849495] focus:outline-none focus:border-[#00f5ff]"
              />
              <Search className="w-4 h-4 text-[#849495] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="bg-[#1c1f29] border border-[#3a494a]/40 px-3 py-1.5 rounded-lg text-xs font-mono text-[#b9caca] focus:outline-none focus:border-[#00f5ff] cursor-pointer"
              >
                <option value="all">ALL SECTORS</option>
                <option value="01">SECTOR 01 (TOKYO)</option>
                <option value="02">SECTOR 02 (VOLCANO)</option>
                <option value="03">SECTOR 03 (ZERO-G)</option>
                <option value="04">SECTOR 04 (GLITCH)</option>
                <option value="05">SECTOR 05 (HYPER-LIGHT)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-[#1c1f29] text-[#b9caca] uppercase tracking-wider border-b border-[#3a494a]/40">
                <th className="py-3 px-4">RANK</th>
                <th className="py-3 px-4">RUNNER TAG</th>
                <th className="py-3 px-4">SECTOR MAP</th>
                <th className="py-3 px-4">DISTANCE</th>
                <th className="py-3 px-4">MAX SCORE</th>
                <th className="py-3 px-4">LOADOUT MATRIX</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1f29]">
              {filteredEntries.map((row) => {
                const isTop3 = row.rank && row.rank <= 3;
                let rankColor = 'text-[#b9caca]';
                if (row.rank === 1) rankColor = 'text-[#00f5ff] font-bold';
                else if (row.rank === 2) rankColor = 'text-[#dfe2ef] font-bold';
                else if (row.rank === 3) rankColor = 'text-[#f59e0b] font-bold';

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors hover:bg-[#1c1f29]/80 ${
                      row.isPlayer ? 'bg-[#00f5ff]/5 border-l-2 border-[#00f5ff]' : ''
                    }`}
                  >
                    <td className={`py-3 px-4 tabular-nums ${rankColor}`}>
                      #{row.rank ? row.rank.toString().padStart(2, '0') : '--'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#262a34] flex items-center justify-center text-[10px] font-bold text-[#00f5ff]">
                          {row.runnerTag.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-[#e9feff] flex items-center gap-1.5">
                            {row.runnerTag}
                            {row.isPlayer && (
                              <span className="bg-[#00f5ff] text-[#003739] text-[9px] px-1 py-0.2 rounded font-bold">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#849495]">{row.titleTag}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#79ff5b]">
                      <span className="px-2 py-0.5 bg-[#0a0e17] rounded border border-[#3a494a]/30">
                        {row.sectorName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#dfe2ef] tabular-nums">
                      {row.distance.toLocaleString()}m
                    </td>
                    <td className="py-3 px-4 font-bold text-[#00f5ff] tabular-nums text-sm">
                      {row.score.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-[#b9caca] text-[11px] truncate max-w-[200px]">
                      {row.loadout}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedGhost(row)}
                        className="px-2.5 py-1 bg-[#262a34] hover:bg-[#00f5ff] hover:text-[#003739] text-[#63f7ff] rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>REPLAY</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#849495] font-mono text-xs">
                    NO RUNNER TELEMETRY MATCHES THE CURRENT CRITERIA
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ghost Replay / Telemetry Inspector Modal */}
      {selectedGhost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#1c1f29] border border-[#00f5ff]/60 p-6 rounded-2xl shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#3a494a]/40 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#00f5ff]" />
                <h3 className="font-headline text-lg font-bold text-[#e9feff]">
                  RUN TELEMETRY // {selectedGhost.runnerTag}
                </h3>
              </div>
              <button
                onClick={() => setSelectedGhost(null)}
                className="w-7 h-7 flex items-center justify-center text-[#b9caca] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-[#181b25] p-3 rounded-lg border border-[#3a494a]/30">
                <span className="text-[10px] text-[#b9caca] block">SECTOR DEPLOYMENT</span>
                <span className="font-bold text-[#79ff5b] text-sm">{selectedGhost.sectorName}</span>
              </div>
              <div className="bg-[#181b25] p-3 rounded-lg border border-[#3a494a]/30">
                <span className="text-[10px] text-[#b9caca] block">SCORE PEAK</span>
                <span className="font-bold text-[#00f5ff] text-sm tabular-nums">
                  {selectedGhost.score.toLocaleString()} PTS
                </span>
              </div>
              <div className="bg-[#181b25] p-3 rounded-lg border border-[#3a494a]/30">
                <span className="text-[10px] text-[#b9caca] block">DISTANCE ACHIEVED</span>
                <span className="font-bold text-[#dfe2ef] text-sm tabular-nums">
                  {selectedGhost.distance.toLocaleString()} METERS
                </span>
              </div>
              <div className="bg-[#181b25] p-3 rounded-lg border border-[#3a494a]/30">
                <span className="text-[10px] text-[#b9caca] block">RUN TIMESTAMP</span>
                <span className="font-bold text-[#b9caca] text-sm">{selectedGhost.date}</span>
              </div>
            </div>

            <div className="bg-[#181b25] p-3 rounded-lg border border-[#3a494a]/30 font-mono text-xs">
              <span className="text-[10px] text-[#b9caca] block mb-1">EQUIPPED RIG MATRIX</span>
              <span className="text-[#63f7ff] font-bold">{selectedGhost.loadout}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  soundEngine.play('click');
                  onSelectSectorAndPlay(selectedGhost.sectorId);
                  setSelectedGhost(null);
                }}
                className="flex-1 py-2.5 bg-[#00f5ff] text-[#003739] font-mono text-xs uppercase font-bold rounded-lg shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>RIVAL GHOST IN SECTOR {selectedGhost.sectorId}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
