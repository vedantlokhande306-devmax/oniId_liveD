import React from 'react';
import { ViewMode } from '../types/game';
import { soundEngine } from '../services/sound';
import { Volume2, VolumeX, Music, User, Menu, X, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  hiScore: number;
  credits: number;
  isMuted: boolean;
  onToggleMute: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  hiScore,
  credits,
  isMuted,
  onToggleMute,
  isMusicPlaying,
  onToggleMusic
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: ViewMode; label: string }[] = [
    { id: 'arena', label: 'Arena' },
    { id: 'sectors', label: 'Sectors' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'armory', label: 'Upgrades' },
    { id: 'system', label: 'System' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e17]/95 backdrop-blur-xl border-b border-[#3a494a]/30 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="h-20 w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              soundEngine.play('click');
              onNavigate('arena');
            }}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-3.5 h-3.5 bg-[#00f5ff] rotate-45 shadow-[0_0_10px_#00f5ff] group-hover:scale-110 transition-transform"></div>
            <span className="font-headline text-lg sm:text-xl font-bold tracking-wider text-[#e9feff]">
              CYBER DINO
            </span>
            <span className="px-1.5 py-0.5 bg-[#ff4b89]/20 text-[#ffb1c3] font-mono text-[10px] tracking-wider border border-[#ff4b89]/40 rounded font-semibold uppercase">
              ZERO RUNNER
            </span>
          </button>

          {/* Credits & Hi-Score ticker */}
          <div className="hidden xl:flex items-center gap-2.5 px-3 py-1 bg-[#181b25] rounded border border-[#3a494a]/40 font-mono text-xs">
            <span className="text-[#b9caca] text-[10px] tracking-wider">CREDITS:</span>
            <span className="text-[#00f5ff] font-bold tabular-nums">{credits.toString().padStart(2, '0')}</span>
            <span className="text-[#3a494a]">|</span>
            <span className="text-[#b9caca] text-[10px] tracking-wider">HI-SCORE:</span>
            <span className="text-[#ffb1c3] font-bold tabular-nums">{hiScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEngine.play('click');
                  onNavigate(item.id);
                }}
                className={`font-mono text-xs uppercase px-4 py-2 rounded-md transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#262a34] text-[#00f5ff] border-b-2 border-[#00f5ff] font-bold shadow-[0_0_12px_rgba(0,245,255,0.2)]'
                    : 'text-[#b9caca] hover:text-[#dfe2ef] hover:bg-[#1c1f29]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Battery, Audio, Profile */}
        <div className="flex items-center gap-3">
          {/* Battery Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#181b25] rounded border border-[#3a494a]/30 font-mono text-[11px]">
            <span className="text-[#00dce5] text-xs">⚡</span>
            <div className="flex gap-0.5">
              <div className="w-1.5 h-3 bg-[#3bff17] shadow-[0_0_4px_#3bff17]"></div>
              <div className="w-1.5 h-3 bg-[#3bff17] shadow-[0_0_4px_#3bff17]"></div>
              <div className="w-1.5 h-3 bg-[#3bff17] shadow-[0_0_4px_#3bff17]"></div>
              <div className="w-1.5 h-3 bg-[#3bff17] shadow-[0_0_4px_#3bff17]"></div>
              <div className="w-1.5 h-3 bg-[#31353f]"></div>
            </div>
            <span className="text-[#79ff5b] font-bold ml-1">80%</span>
          </div>

          {/* Audio & Music Controls */}
          <div className="flex items-center gap-1 bg-[#181b25] p-1 rounded border border-[#3a494a]/40">
            <button
              onClick={onToggleMute}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors cursor-pointer ${
                isMuted
                  ? 'text-[#ffb4ab] hover:bg-[#93000a]/30'
                  : 'text-[#00f5ff] hover:text-[#e9feff] hover:bg-[#262a34]'
              }`}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              aria-label="Toggle Sound Effects"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onToggleMusic}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors cursor-pointer ${
                isMusicPlaying
                  ? 'text-[#ff4b89] bg-[#ff4b89]/20 shadow-[0_0_8px_rgba(255,75,137,0.4)]'
                  : 'text-[#b9caca] hover:text-[#ffb1c3] hover:bg-[#262a34]'
              }`}
              title={isMusicPlaying ? 'Stop Cyber Synth Ambience' : 'Play Cyber Synth Ambience'}
              aria-label="Toggle Cyber Synth Music"
            >
              <Music className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Avatar */}
          <button 
            onClick={() => {
              soundEngine.play('click');
              onNavigate('leaderboard');
            }}
            className="w-8 h-8 rounded-full bg-[#00f5ff] flex items-center justify-center shadow-[0_0_10px_rgba(0,245,255,0.4)] hover:brightness-110 transition-all cursor-pointer text-[#003739]"
            title="Player Dossier"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-[#b9caca] hover:text-[#00f5ff]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#181b25] border-t border-[#3a494a]/40 px-4 py-3 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundEngine.play('click');
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`font-mono text-left px-3 py-2 rounded text-xs uppercase tracking-wider ${
                currentView === item.id
                  ? 'bg-[#262a34] text-[#00f5ff] font-bold'
                  : 'text-[#b9caca] hover:text-[#dfe2ef]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-[#3a494a]/30 font-mono text-xs text-[#b9caca]">
            <span>HI-SCORE: <strong className="text-[#ffb1c3]">{hiScore.toLocaleString()}</strong></span>
            <span>CREDITS: <strong className="text-[#00f5ff]">{credits}</strong></span>
          </div>
        </div>
      )}
    </header>
  );
};
