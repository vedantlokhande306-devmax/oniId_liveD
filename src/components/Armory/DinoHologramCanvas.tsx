import React, { useEffect, useRef } from 'react';
import { ArchetypeId, VisorTint, ThrusterDrive } from '../../types/game';

interface DinoHologramCanvasProps {
  archetypeId: ArchetypeId;
  visorTint: VisorTint;
  thrusterDrive: ThrusterDrive;
  interactive?: boolean;
}

export const DinoHologramCanvas: React.FC<DinoHologramCanvasProps> = ({
  archetypeId,
  visorTint,
  thrusterDrive
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getVisorColor = (tint: VisorTint) => {
    switch (tint) {
      case 'pink': return '#ff4b89';
      case 'lime': return '#3bff17';
      case 'gold': return '#f59e0b';
      case 'cyan':
      default: return '#00f5ff';
    }
  };

  const getThrusterColor = (drive: ThrusterDrive) => {
    switch (drive) {
      case 'plasma': return '#ff4b89';
      case 'afterburner': return '#f59e0b';
      case 'ion':
      default: return '#00f5ff';
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;
    const particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

    const render = () => {
      frame++;
      animId = requestAnimationFrame(render);

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Cyber Hologram Grid Floor
      const groundY = h - 60;
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.15)';
      ctx.lineWidth = 1;

      // Elliptical hologram platform
      ctx.beginPath();
      ctx.ellipse(w / 2, groundY + 15, w * 0.4, 25, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 245, 255, 0.05)';
      ctx.fill();
      ctx.stroke();

      // Rotating hologram rings
      const rotAngle = (frame * 0.02) % (Math.PI * 2);
      ctx.save();
      ctx.translate(w / 2, groundY + 15);
      ctx.rotate(rotAngle);
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.25)';
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.35, 20, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Idle breathing offset
      const breath = Math.sin(frame * 0.05) * 4;
      const dinoX = w / 2 - 40;
      const dinoY = groundY - 75 + breath;

      // Spawn thruster particles
      const flameColor = getThrusterColor(thrusterDrive);
      if (frame % 2 === 0) {
        particles.push({
          x: dinoX - 4,
          y: dinoY + 36,
          vx: -(Math.random() * 2 + 2),
          vy: (Math.random() - 0.5) * 2,
          life: 1.0,
          color: flameColor
        });
      }

      // Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life * 0.8;
        ctx.fillRect(p.x, p.y, 4, 4);
        ctx.globalAlpha = 1.0;
      }

      ctx.save();
      ctx.translate(dinoX, dinoY);

      const visorColor = getVisorColor(visorTint);

      // Archetype specific visual anatomy
      if (archetypeId === 'rex') {
        // Heavy Armor Titan Rex
        // Tail
        ctx.fillStyle = '#262a34';
        ctx.beginPath();
        ctx.moveTo(0, 40);
        ctx.lineTo(-30, 25);
        ctx.lineTo(10, 50);
        ctx.fill();

        // Main Heavy Body
        ctx.fillStyle = '#31353f';
        ctx.fillRect(10, 16, 68, 44);

        // Titanium Reinforced Plates
        ctx.fillStyle = '#dfe2ef';
        ctx.fillRect(18, 22, 54, 30);
        ctx.fillRect(50, 6, 36, 26);

        // Armor Back Spines
        ctx.fillStyle = '#ff4b89';
        ctx.beginPath();
        ctx.moveTo(25, 16);
        ctx.lineTo(30, 4);
        ctx.lineTo(35, 16);
        ctx.moveTo(42, 16);
        ctx.lineTo(47, 4);
        ctx.lineTo(52, 16);
        ctx.fill();

        // Heavy Head & Jaw
        ctx.fillStyle = '#dfe2ef';
        ctx.fillRect(72, 8, 24, 20);
        ctx.fillStyle = '#262a34';
        ctx.fillRect(74, 28, 20, 8);

        // Visor
        ctx.fillStyle = visorColor;
        ctx.shadowColor = visorColor;
        ctx.shadowBlur = 12;
        ctx.fillRect(80, 12, 16, 5);
        ctx.shadowBlur = 0;

        // Massive Heavy Legs
        ctx.fillStyle = '#63f7ff';
        const leg1 = Math.sin(frame * 0.06) * 4;
        ctx.fillRect(24, 60, 10, 22 + leg1);
        ctx.fillRect(20, 80 + leg1, 16, 6);

        ctx.fillRect(52, 60, 10, 22 - leg1);
        ctx.fillRect(48, 80 - leg1, 16, 6);

        // Dual Thruster Ports
        ctx.fillStyle = flameColor;
        ctx.fillRect(-2, 28, 10, 16);
        ctx.shadowColor = flameColor;
        ctx.shadowBlur = 10;
        ctx.fillRect(-12, 32, 10, 8);
        ctx.shadowBlur = 0;

      } else if (archetypeId === 'ptero') {
        // Aerodynamic Ptero Glider
        // Slender Body
        ctx.fillStyle = '#262a34';
        ctx.fillRect(12, 22, 56, 30);
        ctx.fillStyle = '#dfe2ef';
        ctx.fillRect(18, 26, 44, 22);

        // Sleek Head & Beak Visor
        ctx.fillStyle = '#dfe2ef';
        ctx.beginPath();
        ctx.moveTo(60, 20);
        ctx.lineTo(95, 28);
        ctx.lineTo(60, 38);
        ctx.fill();

        // Extended Glowing Cyber Wings
        ctx.fillStyle = 'rgba(255, 75, 137, 0.85)';
        ctx.shadowColor = '#ff4b89';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(25, 24);
        ctx.lineTo(5, -10 + Math.sin(frame * 0.08) * 8);
        ctx.lineTo(48, 22);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Visor
        ctx.fillStyle = visorColor;
        ctx.shadowColor = visorColor;
        ctx.shadowBlur = 12;
        ctx.fillRect(70, 24, 18, 4);
        ctx.shadowBlur = 0;

        // Sleek Legs
        ctx.fillStyle = '#63f7ff';
        ctx.fillRect(28, 52, 6, 26);
        ctx.fillRect(44, 52, 6, 26);

        // Thruster
        ctx.fillStyle = flameColor;
        ctx.fillRect(4, 28, 8, 12);
        ctx.shadowColor = flameColor;
        ctx.shadowBlur = 10;
        ctx.fillRect(-8, 31, 10, 6);
        ctx.shadowBlur = 0;

      } else {
        // Default Agile Raptor Scout
        // Tail
        ctx.fillStyle = '#262a34';
        ctx.beginPath();
        ctx.moveTo(5, 30);
        ctx.lineTo(-24, 20);
        ctx.lineTo(12, 42);
        ctx.fill();

        // Main Torso
        ctx.fillStyle = '#dfe2ef';
        ctx.fillRect(12, 18, 54, 34);

        // Dark Armor Plates
        ctx.fillStyle = '#262a34';
        ctx.fillRect(48, 8, 30, 24);

        // Aerodynamic Head
        ctx.fillStyle = '#dfe2ef';
        ctx.fillRect(66, 12, 22, 16);

        // Glowing Visor
        ctx.fillStyle = visorColor;
        ctx.shadowColor = visorColor;
        ctx.shadowBlur = 12;
        ctx.fillRect(72, 16, 14, 5);
        ctx.shadowBlur = 0;

        // Micro-piston Legs
        ctx.fillStyle = '#63f7ff';
        const leg1 = Math.sin(frame * 0.08) * 5;
        ctx.fillRect(24, 52, 6, 26 + leg1);
        ctx.fillRect(20, 76 + leg1, 12, 5);

        ctx.fillRect(46, 52, 6, 26 - leg1);
        ctx.fillRect(42, 76 - leg1, 12, 5);

        // Jet Engine
        ctx.fillStyle = flameColor;
        ctx.fillRect(4, 24, 8, 14);
        ctx.shadowColor = flameColor;
        ctx.shadowBlur = 10;
        ctx.fillRect(-8, 27, 10, 8);
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [archetypeId, visorTint, thrusterDrive]);

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={380}
        height={280}
        className="w-full h-full max-h-[340px] block pointer-events-none"
      />
    </div>
  );
};
