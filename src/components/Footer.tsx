import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0a0e17]/95 backdrop-blur-md py-3.5 border-t border-[#3a494a]/30 mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#b9caca]">
        {/* Hotkey Guide */}
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="text-[#00f5ff] uppercase font-bold tracking-wider">[HOTKEYS]</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-[#1c1f29] rounded text-[#63f7ff] border border-[#3a494a]/40 text-[10px]">SPACE</kbd>
            <span>JUMP / 2x</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-[#1c1f29] rounded text-[#63f7ff] border border-[#3a494a]/40 text-[10px]">DOWN / S</kbd>
            <span>SLIDE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-[#1c1f29] rounded text-[#ff4b89] border border-[#3a494a]/40 text-[10px]">Q · E · R</kbd>
            <span>SKILLS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-[#1c1f29] rounded text-[#e9feff] border border-[#3a494a]/40 text-[10px]">ESC</kbd>
            <span>PAUSE</span>
          </div>
        </div>

        {/* Live Network & Versioning */}
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-[#79ff5b] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3bff17] animate-ping"></span>
            NET: 60 FPS // ZERO JITTER
          </span>
          <span className="text-[#849495]">© 2088 ZERO RUNNER PROTOCOL</span>
        </div>
      </div>
    </footer>
  );
};
