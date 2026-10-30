import React from 'react';
import { SectorId } from '../../types/game';

interface SectorBiomePreviewProps {
  sectorId: SectorId;
  bgHorizonColor: string;
}

export const SectorBiomePreview: React.FC<SectorBiomePreviewProps> = ({
  sectorId,
  bgHorizonColor
}) => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0a0e17] flex items-center justify-center">
      {/* Sector 01: Neo Tokyo Grid (Cyan synthwave skyscrapers & laser cacti) */}
      {sectorId === '01' && (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="sky01" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a0e17" />
              <stop offset="100%" stopColor="#092834" />
            </linearGradient>
            <radialGradient id="sun01" cx="50%" cy="80%" r="60%">
              <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#ff4b89" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="320" height="180" fill="url(#sky01)" />
          <circle cx="160" cy="115" r="45" fill="url(#sun01)" />
          {/* Distant Skyscrapers */}
          <rect x="20" y="55" width="28" height="65" fill="#141720" />
          <rect x="52" y="38" width="36" height="82" fill="#181b25" />
          <rect x="94" y="65" width="22" height="55" fill="#141720" />
          <rect x="190" y="45" width="34" height="75" fill="#181b25" />
          <rect x="230" y="30" width="40" height="90" fill="#141720" />
          <rect x="276" y="60" width="30" height="60" fill="#181b25" />
          {/* Illuminated windows */}
          <rect x="58" y="48" width="4" height="4" fill="#00f5ff" opacity="0.6" />
          <rect x="70" y="64" width="4" height="4" fill="#00f5ff" opacity="0.6" />
          <rect x="238" y="42" width="4" height="4" fill="#63f7ff" opacity="0.7" />
          <rect x="254" y="58" width="4" height="4" fill="#00f5ff" opacity="0.5" />
          {/* Horizon & Perspective Grid */}
          <line x1="0" y1="120" x2="320" y2="120" stroke="#00f5ff" strokeWidth="2" filter="drop-shadow(0 0 6px #00f5ff)" />
          <path d="M 0 120 L 0 180 M 40 120 L 15 180 M 80 120 L 60 180 M 120 120 L 110 180 M 160 120 L 160 180 M 200 120 L 210 180 M 240 120 L 260 180 M 280 120 L 305 180 M 320 120 L 320 180" stroke="#00f5ff" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="0" y1="130" x2="320" y2="130" stroke="#00f5ff" strokeWidth="0.8" strokeOpacity="0.25" />
          <line x1="0" y1="145" x2="320" y2="145" stroke="#00f5ff" strokeWidth="0.8" strokeOpacity="0.25" />
          <line x1="0" y1="165" x2="320" y2="165" stroke="#00f5ff" strokeWidth="1" strokeOpacity="0.3" />
          {/* Laser Cacti Obstacles */}
          <rect x="130" y="98" width="4" height="22" fill="#ff4b89" filter="drop-shadow(0 0 4px #ff4b89)" />
          <rect x="126" y="104" width="12" height="3" fill="#ff4b89" />
          <rect x="215" y="92" width="5" height="28" fill="#ff4b89" filter="drop-shadow(0 0 4px #ff4b89)" />
          <rect x="210" y="100" width="15" height="3" fill="#ff4b89" />
        </svg>
      )}

      {/* Sector 02: Volcanic Core: Magma Wastes (Fiery orange-magenta volcanic fissures & falling meteors) */}
      {sectorId === '02' && (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="sky02" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c0710" />
              <stop offset="60%" stopColor="#450a1b" />
              <stop offset="100%" stopColor="#8a1130" />
            </linearGradient>
            <linearGradient id="lava" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff4b89" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ff4b89" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#sky02)" />
          {/* Obsidian Volcanic Spires */}
          <polygon points="10,120 40,35 70,120" fill="#18070d" />
          <polygon points="55,120 95,50 135,120" fill="#290b16" />
          <polygon points="175,120 220,30 265,120" fill="#18070d" />
          <polygon points="245,120 280,60 315,120" fill="#290b16" />
          {/* Falling Meteors */}
          <line x1="80" y1="15" x2="50" y2="45" stroke="#f59e0b" strokeWidth="2.5" filter="drop-shadow(0 0 6px #ff4b89)" />
          <line x1="260" y1="10" x2="225" y2="50" stroke="#ff4b89" strokeWidth="3" filter="drop-shadow(0 0 8px #ff4b89)" />
          {/* Molten Magma Floor */}
          <rect x="0" y="120" width="320" height="60" fill="#1c0710" />
          <line x1="0" y1="120" x2="320" y2="120" stroke="#ff4b89" strokeWidth="2.5" filter="drop-shadow(0 0 10px #ff4b89)" />
          {/* Glowing Lava Trenches */}
          <path d="M 0 145 Q 60 135 120 150 T 240 140 T 320 155" stroke="url(#lava)" strokeWidth="4" fill="none" filter="drop-shadow(0 0 8px #f59e0b)" />
          <path d="M 30 168 Q 90 160 170 172 T 290 165" stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.8" />
        </svg>
      )}

      {/* Sector 03: Orbital Zero-G Expanse (Deep cosmic nebula & orbiting satellite ring) */}
      {sectorId === '03' && (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="sky03" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#050814" />
              <stop offset="60%" stopColor="#0b1730" />
              <stop offset="100%" stopColor="#0f2648" />
            </linearGradient>
            <radialGradient id="nebula" cx="40%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#63f7ff" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="320" height="180" fill="url(#sky03)" />
          <circle cx="128" cy="54" r="90" fill="url(#nebula)" />
          {/* Floating Orbit Rings */}
          <ellipse cx="160" cy="80" rx="140" ry="35" fill="none" stroke="#63f7ff" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />
          <ellipse cx="160" cy="80" rx="110" ry="25" fill="none" stroke="#a855f7" strokeWidth="1.5" opacity="0.4" />
          {/* Floating Glitch Drones */}
          <polygon points="70,55 82,50 82,60" fill="#3bff17" filter="drop-shadow(0 0 4px #3bff17)" />
          <polygon points="240,65 252,60 252,70" fill="#3bff17" filter="drop-shadow(0 0 4px #3bff17)" />
          {/* Low-G Floating Platform Track */}
          <line x1="0" y1="120" x2="320" y2="120" stroke="#63f7ff" strokeWidth="2" filter="drop-shadow(0 0 8px #63f7ff)" />
          <rect x="0" y="122" width="320" height="58" fill="#080e1c" />
          <path d="M 0 120 L 0 180 M 50 120 L 25 180 M 100 120 L 85 180 M 160 120 L 160 180 M 220 120 L 235 180 M 270 120 L 295 180" stroke="#63f7ff" strokeWidth="1" strokeOpacity="0.25" />
        </svg>
      )}

      {/* Sector 04: Cyber Glitch Wastes (Matrix lime code rain & plasma spikes) */}
      {sectorId === '04' && (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="sky04" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#041206" />
              <stop offset="100%" stopColor="#07220b" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#sky04)" />
          {/* Matrix code vertical streams */}
          <line x1="30" y1="0" x2="30" y2="100" stroke="#3bff17" strokeWidth="1" strokeDasharray="3 7" opacity="0.5" />
          <line x1="75" y1="15" x2="75" y2="115" stroke="#3bff17" strokeWidth="1" strokeDasharray="4 6" opacity="0.7" />
          <line x1="130" y1="0" x2="130" y2="90" stroke="#79ff5b" strokeWidth="1.5" strokeDasharray="2 8" opacity="0.6" />
          <line x1="200" y1="10" x2="200" y2="110" stroke="#3bff17" strokeWidth="1" strokeDasharray="4 5" opacity="0.75" />
          <line x1="260" y1="0" x2="260" y2="85" stroke="#3bff17" strokeWidth="1" strokeDasharray="3 7" opacity="0.5" />
          <line x1="295" y1="20" x2="295" y2="115" stroke="#79ff5b" strokeWidth="1" strokeDasharray="2 9" opacity="0.6" />
          {/* Glowing Green Ground Floor */}
          <line x1="0" y1="120" x2="320" y2="120" stroke="#3bff17" strokeWidth="2" filter="drop-shadow(0 0 8px #3bff17)" />
          <rect x="0" y="122" width="320" height="58" fill="#061608" />
          {/* Plasma Crystal Spikes */}
          <polygon points="100,120 110,88 120,120" fill="#3bff17" filter="drop-shadow(0 0 6px #3bff17)" />
          <polygon points="115,120 122,94 130,120" fill="#79ff5b" />
          <polygon points="210,120 220,86 230,120" fill="#3bff17" filter="drop-shadow(0 0 6px #3bff17)" />
        </svg>
      )}

      {/* Sector 05: Hyper-Light Core (Gold relativistic superconductor speed lines) */}
      {sectorId === '05' && (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="sky05" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#150e04" />
              <stop offset="100%" stopColor="#2e1d08" />
            </linearGradient>
            <linearGradient id="goldBeam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#sky05)" />
          {/* Hyperspeed Light Streaks */}
          <line x1="10" y1="30" x2="240" y2="30" stroke="#f59e0b" strokeWidth="1.5" opacity="0.7" />
          <line x1="80" y1="50" x2="310" y2="50" stroke="#fef08a" strokeWidth="2" opacity="0.8" />
          <line x1="30" y1="75" x2="280" y2="75" stroke="#f59e0b" strokeWidth="2.5" opacity="0.85" />
          <line x1="0" y1="95" x2="250" y2="95" stroke="#fef08a" strokeWidth="1.5" opacity="0.7" />
          {/* Superconductor Rail Track */}
          <line x1="0" y1="120" x2="320" y2="120" stroke="url(#goldBeam)" strokeWidth="3" filter="drop-shadow(0 0 10px #f59e0b)" />
          <rect x="0" y="123" width="320" height="57" fill="#1c1206" />
          <path d="M 0 120 L 0 180 M 50 120 L 25 180 M 110 120 L 90 180 M 160 120 L 160 180 M 210 120 L 230 180 M 270 120 L 295 180" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.35" />
        </svg>
      )}
    </div>
  );
};
