import React, { useEffect, useRef } from 'react';
import {
  ArmoryState,
  DinoArchetype,
  Obstacle,
  Collectible,
  Particle,
  Sector
} from '../../types/game';
import { soundEngine } from '../../services/sound';

interface GameCanvasProps {
  isPlaying: boolean;
  isPaused: boolean;
  sector: Sector;
  archetype: DinoArchetype;
  armory: ArmoryState;
  speedSensitivity: number; // 0.5 to 1.5
  onGameOver: (stats: { score: number; distance: number; nanoBits: number; maxStreak: number }) => void;
  onUpdateTelemetry: (data: {
    distance: number;
    score: number;
    velocityKmH: number;
    nanoBits: number;
    multiplier: number;
    dodgeStreak: number;
    shieldActive: boolean;
    droneDodgeCount: number;
    chronoActive: boolean;
  }) => void;
  onShowToast: (msg: string, icon?: string) => void;
  onEMPTriggered?: () => void;
  refSkillTriggers: React.MutableRefObject<{
    jump: () => void;
    duck: (active: boolean) => void;
    chrono: () => void;
    emp: () => void;
    shield: () => void;
  } | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isPlaying,
  isPaused,
  sector,
  archetype,
  armory,
  speedSensitivity,
  onGameOver,
  onUpdateTelemetry,
  onShowToast,
  onEMPTriggered,
  refSkillTriggers
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Engine state kept in refs for 60fps performance without re-render loop
  const engineRef = useRef({
    score: 0,
    distanceMeters: 0,
    nanoBitsCollected: 0,
    multiplier: 1.0,
    dodgeStreak: 0,
    maxStreak: 0,
    droneDodgeCount: 0,
    adrenalineSeconds: 0,
    screenShake: 0,
    baseRunSpeed: 6.2 * sector.baseVelocityMultiplier,
    speedScale: 1.0,
    
    // Skills
    cooldowns: {
      chrono: { duration: 12000, lastUsed: -12000 },
      emp: { duration: 15000 - (armory.upgrades.empCooldown - 1) * 1500, lastUsed: -15000 },
      shield: { duration: 18000, lastUsed: -18000 }
    },
    kineticShield: true,
    shieldHitsRemaining: archetype.maxShieldHits,
    shieldExpireTimer: 360 + (armory.upgrades.shieldDuration - 1) * 60,
    chronoActive: false,
    chronoTimer: 0,

    // Dino Kinematics
    dino: {
      x: 75,
      y: 0,
      baseY: 0,
      width: 44,
      height: 50,
      duckHeight: 26,
      vy: 0,
      gravity: sector.gravity,
      jumpForce: archetype.jumpForce,
      isJumping: false,
      canDoubleJump: true,
      isDucking: false,
      isGliding: false,
      legPhase: 0,
      trail: [] as { x: number; y: number; duck: boolean; life: number }[]
    },

    // Entity collections
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    stars: [] as { x: number; y: number; size: number; speed: number; color: string }[],
    skyline: [] as { x: number; w: number; h: number; hasAntenna: boolean; windows: boolean }[],
    groundGridX: 0,
    obstacleTimer: 0,
    itemTimer: 0,
    nextObstacleId: 1,
    nextItemId: 1,
    logicalWidth: 800,
    logicalHeight: 450
  });

  // Keep references updated when sector, archetype, or armory upgrades change
  useEffect(() => {
    const e = engineRef.current;
    e.dino.gravity = sector.gravity;
    e.dino.jumpForce = archetype.jumpForce;
    e.shieldHitsRemaining = archetype.maxShieldHits;
    e.baseRunSpeed = 6.2 * sector.baseVelocityMultiplier;
    e.cooldowns.emp.duration = 15000 - (armory.upgrades.empCooldown - 1) * 1500;

    // Refresh star colors for the new sector theme
    if (e.stars.length > 0) {
      e.stars.forEach((s) => {
        s.color = Math.random() > 0.3 ? sector.bgHorizonColor : '#ffb1c3';
      });
    }
  }, [sector, archetype, armory]);

  // Helper color mappings
  const getVisorColor = () => {
    switch (armory.visorTint) {
      case 'pink': return '#ff4b89';
      case 'lime': return '#3bff17';
      case 'gold': return '#f59e0b';
      case 'cyan':
      default: return '#00f5ff';
    }
  };

  const getThrusterFlameColor = () => {
    switch (armory.thrusterDrive) {
      case 'plasma': return '#ff4b89';
      case 'afterburner': return '#f59e0b';
      case 'ion':
      default: return '#00f5ff';
    }
  };

  const spawnParticles = (x: number, y: number, color: string, count = 12, speed = 4) => {
    const e = engineRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const mag = Math.random() * speed + 1;
      e.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * mag,
        vy: Math.sin(angle) * mag,
        color: color,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02,
        size: Math.random() * 3 + 1.5
      });
    }
  };

  // Wire skill triggers to parent ref
  useEffect(() => {
    const e = engineRef.current;

    const doJump = () => {
      if (!isPlaying || isPaused) return;
      const d = e.dino;
      const speedMultiplier = speedSensitivity;

      if (!d.isJumping) {
        d.vy = d.jumpForce * speedMultiplier;
        d.isJumping = true;
        d.canDoubleJump = true;
        soundEngine.play('jump');
        spawnParticles(d.x + 12, d.baseY, getVisorColor(), 8, 2.5);
      } else if (d.canDoubleJump) {
        d.vy = d.jumpForce * 0.88 * speedMultiplier;
        d.canDoubleJump = false;
        soundEngine.play('doubleJump');
        spawnParticles(d.x + 8, d.y + (d.isDucking ? d.duckHeight : d.height), getThrusterFlameColor(), 14, 4);
        onShowToast("DOUBLE THRUST JUMP ACTIVATED!", "rocket_launch");
      } else if (archetype.canGlide && d.vy > 0) {
        // Ptero Glider Sustained Hover
        d.isGliding = true;
        d.vy = Math.min(d.vy, 1.4);
        spawnParticles(d.x + 4, d.y + 15, '#ff4b89', 3, 1.5);
      }
    };

    const doDuck = (active: boolean) => {
      if (!isPlaying || isPaused) return;
      if (active && !e.dino.isDucking && !e.dino.isJumping) {
        soundEngine.play('slide');
        spawnParticles(e.dino.x + 20, e.dino.baseY, '#63f7ff', 5, 2);
      }
      e.dino.isDucking = active;
    };

    const doChrono = () => {
      if (!isPlaying || isPaused) return;
      const now = Date.now();
      if (now - e.cooldowns.chrono.lastUsed < e.cooldowns.chrono.duration) return;
      e.cooldowns.chrono.lastUsed = now;
      e.chronoActive = true;
      e.chronoTimer = 220; // ~3.6s
      soundEngine.play('chrono');
      onShowToast("CHRONO-WARP ACTIVE (0.4X DILATION)", "hourglass_empty");
    };

    const doEMP = () => {
      if (!isPlaying || isPaused) return;
      const now = Date.now();
      if (now - e.cooldowns.emp.lastUsed < e.cooldowns.emp.duration) return;
      e.cooldowns.emp.lastUsed = now;
      e.screenShake = 14;
      soundEngine.play('emp');

      if (onEMPTriggered) onEMPTriggered();

      const count = e.obstacles.length;
      e.obstacles.forEach((o) => {
        spawnParticles(o.x + o.w / 2, o.y + o.h / 2, '#ff4b89', 24, 6);
      });
      e.obstacles = [];
      e.score += count * 250;
      e.multiplier = Math.min(8.0, e.multiplier + 0.5);
      onShowToast(`EMP BLAST: ${count} THREATS VAPORIZED!`, "bolt");
    };

    const doShield = () => {
      if (!isPlaying || isPaused) return;
      const now = Date.now();
      if (e.kineticShield) return; // already active
      if (now - e.cooldowns.shield.lastUsed < e.cooldowns.shield.duration) return;
      e.cooldowns.shield.lastUsed = now;
      e.kineticShield = true;
      e.shieldHitsRemaining = archetype.maxShieldHits;
      e.shieldExpireTimer = 300 + (armory.upgrades.shieldDuration - 1) * 60;
      soundEngine.play('shield');
      onShowToast(`AEGIS BARRIER ONLINE (${archetype.maxShieldHits} HITS)`, "shield");
    };

    refSkillTriggers.current = {
      jump: doJump,
      duck: doDuck,
      chrono: doChrono,
      emp: doEMP,
      shield: doShield
    };

    return () => {
      refSkillTriggers.current = null;
    };
  }, [isPlaying, isPaused, speedSensitivity, archetype, armory, sector]);

  // Reset engine only on isPlaying transition to true
  const prevPlayingRef = useRef(false);
  useEffect(() => {
    if (isPlaying && !prevPlayingRef.current) {
      const e = engineRef.current;
      e.score = 0;
      e.distanceMeters = 0;
      e.nanoBitsCollected = 0;
      e.multiplier = 1.0;
      e.dodgeStreak = 0;
      e.maxStreak = 0;
      e.droneDodgeCount = 0;
      e.adrenalineSeconds = 0;
      e.speedScale = 1.0;
      e.screenShake = 0;
      e.kineticShield = true;
      e.shieldHitsRemaining = archetype.maxShieldHits;
      e.shieldExpireTimer = 360 + (armory.upgrades.shieldDuration - 1) * 60;
      e.chronoActive = false;
      e.chronoTimer = 0;
      e.obstacles = [];
      e.collectibles = [];
      e.particles = [];
      e.dino.trail = [];
      e.dino.isJumping = false;
      e.dino.canDoubleJump = true;
      e.dino.isDucking = false;
      e.dino.isGliding = false;
      e.dino.vy = 0;
    }
    prevPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const e = engineRef.current;

    // Initialize stars & skyline if empty
    if (e.stars.length === 0) {
      for (let i = 0; i < 52; i++) {
        e.stars.push({
          x: Math.random() * 1200,
          y: Math.random() * 260,
          size: Math.random() * 2 + 0.6,
          speed: Math.random() * 0.35 + 0.1,
          color: Math.random() > 0.3 ? sector.bgHorizonColor : '#ffb1c3'
        });
      }
    }
    if (e.skyline.length === 0) {
      let curX = 0;
      while (curX < 2000) {
        const w = Math.floor(Math.random() * 50 + 35);
        e.skyline.push({
          x: curX,
          w: w,
          h: Math.floor(Math.random() * 120 + 45),
          hasAntenna: Math.random() > 0.5,
          windows: Math.random() > 0.3
        });
        curX += w + Math.floor(Math.random() * 10);
      }
    }

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      e.logicalWidth = rect.width;
      e.logicalHeight = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);

      const w = e.logicalWidth;
      const h = e.logicalHeight;
      const groundY = h - 55;
      e.dino.baseY = groundY;

      // Ensure grounded when game is idle / ready to start
      if (!isPlaying) {
        const curH = e.dino.isDucking ? e.dino.duckHeight : e.dino.height;
        e.dino.y = groundY - curH;
        e.dino.vy = 0;
      }

      ctx.save();
      if (e.screenShake > 0) {
        const sx = (Math.random() - 0.5) * e.screenShake;
        const sy = (Math.random() - 0.5) * e.screenShake;
        ctx.translate(sx, sy);
        e.screenShake = Math.max(0, e.screenShake - 0.7);
      }

      // Background Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, sector.skyTint);
      skyGrad.addColorStop(1, '#0a0e17');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Speed calculation
      let currentSpeed = e.baseRunSpeed * e.speedScale * speedSensitivity;
      currentSpeed *= 1 + (armory.upgrades.speedBoost - 1) * 0.05;

      if (e.chronoActive) {
        currentSpeed *= 0.4;
        e.chronoTimer--;
        if (e.chronoTimer <= 0) {
          e.chronoActive = false;
        }
      }

      // Parallax Stars
      e.stars.forEach((s) => {
        if (isPlaying && !isPaused) {
          s.x -= s.speed * (currentSpeed * 0.25);
          if (s.x < 0) s.x = w;
        }
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Distant Cyber Cityscape Skyline
      ctx.fillStyle = '#141720';
      e.skyline.forEach((b) => {
        if (isPlaying && !isPaused) {
          b.x -= 0.5 * (currentSpeed / 6);
          if (b.x + b.w < 0) b.x = w + 40;
        }
        ctx.fillRect(b.x, groundY - b.h, b.w, b.h);
        if (b.hasAntenna) {
          ctx.strokeStyle = `${sector.bgHorizonColor}44`;
          ctx.beginPath();
          ctx.moveTo(b.x + b.w / 2, groundY - b.h);
          ctx.lineTo(b.x + b.w / 2, groundY - b.h - 16);
          ctx.stroke();
        }
        if (b.windows) {
          ctx.fillStyle = `${sector.bgHorizonColor}22`;
          ctx.fillRect(b.x + 4, groundY - b.h + 10, 4, 4);
          ctx.fillRect(b.x + 14, groundY - b.h + 24, 4, 4);
          ctx.fillRect(b.x + 4, groundY - b.h + 38, 4, 4);
          ctx.fillStyle = '#141720';
        }
      });

      // Horizon Glowing Beam
      ctx.strokeStyle = sector.bgHorizonColor;
      ctx.shadowColor = sector.bgHorizonColor;
      ctx.shadowBlur = 10;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Animated 3D Ground Perspective Grid Lines
      if (isPlaying && !isPaused) {
        e.groundGridX = (e.groundGridX + currentSpeed) % 40;
      }
      ctx.strokeStyle = sector.bgGridColor;
      ctx.lineWidth = 1.5;
      for (let gx = -e.groundGridX; gx < w + 80; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, groundY);
        ctx.lineTo(gx - 55, h);
        ctx.stroke();
      }
      for (let gy = groundY + 12; gy < h; gy += 14) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      // Simulation Updates
      if (isPlaying && !isPaused) {
        const d = e.dino;
        d.vy += d.gravity;
        d.y += d.vy;

        const currentH = d.isDucking ? d.duckHeight : d.height;
        if (d.y + currentH >= groundY) {
          d.y = groundY - currentH;
          d.vy = 0;
          d.isJumping = false;
          d.isGliding = false;
        }

        d.legPhase += currentSpeed * 0.14;
        e.distanceMeters += currentSpeed * 0.05;
        e.score += Math.floor(currentSpeed * e.multiplier * sector.scoreMultiplier * 0.8);
        e.speedScale = Math.min(2.8, 1.0 + e.distanceMeters / 750);

        if (!e.chronoActive) {
          e.adrenalineSeconds += 1 / 60;
        }

        // Shield expiration
        if (e.kineticShield && e.shieldExpireTimer > 0) {
          e.shieldExpireTimer--;
          if (e.shieldExpireTimer <= 0) {
            e.kineticShield = false;
            onShowToast('AEGIS BARRIER EXPIRED', 'shield');
          }
        }

        // Motion ghost trail
        if (e.speedScale > 1.25 || d.isJumping) {
          d.trail.push({ x: d.x, y: d.y, duck: d.isDucking, life: 0.55 });
        }

        // Obstacle spawn timer
        e.obstacleTimer++;
        const spawnThreshold = Math.max(46, Math.floor(104 - e.speedScale * 24));
        if (e.obstacleTimer >= spawnThreshold) {
          e.obstacleTimer = 0;
          const r = Math.random();
          const obsId = e.nextObstacleId++;

          if (r < 0.38) {
            // Laser Pylon
            e.obstacles.push({
              id: obsId,
              type: 'LASER_PYLON',
              x: w + 30,
              y: groundY - 48,
              w: 18,
              h: 48,
              color: '#ff4b89',
              pulse: 0
            });
          } else if (r < 0.65) {
            // Glitch Drone (aerial)
            const altitude = Math.random() > 0.5 ? groundY - 58 : groundY - 34;
            e.obstacles.push({
              id: obsId,
              type: 'GLITCH_DRONE',
              x: w + 30,
              y: altitude,
              w: 34,
              h: 22,
              wingPhase: 0,
              color: '#3bff17'
            });
          } else if (r < 0.88) {
            // Plasma Spikes
            e.obstacles.push({
              id: obsId,
              type: 'PLASMA_SPIKE',
              x: w + 30,
              y: groundY - 26,
              w: 32,
              h: 26,
              color: sector.bgHorizonColor
            });
          } else {
            // Falling Meteor Shard
            e.obstacles.push({
              id: obsId,
              type: 'METEOR_SHARD',
              x: w + 50,
              y: -10,
              w: 22,
              h: 22,
              vx: -3.6,
              vy: 2.4,
              color: '#ffb1c3'
            });
          }
        }

        // Collectibles spawn timer
        e.itemTimer++;
        if (e.itemTimer >= 80) {
          e.itemTimer = 0;
          const isQuantum = Math.random() > 0.84;
          e.collectibles.push({
            id: e.nextItemId++,
            type: isQuantum ? 'QUANTUM_CORE' : 'NANO_BIT',
            x: w + 30,
            y: groundY - (Math.random() * 70 + 25),
            r: isQuantum ? 9 : 6,
            phase: Math.random() * Math.PI,
            color: isQuantum ? '#ff4b89' : '#00f5ff'
          });
        }

        // Sync telemetry to parent component
        const velocityKmH = Math.floor(currentSpeed * 24 + 20);
        onUpdateTelemetry({
          distance: Math.floor(e.distanceMeters),
          score: e.score,
          velocityKmH: velocityKmH,
          nanoBits: e.nanoBitsCollected,
          multiplier: e.multiplier,
          dodgeStreak: e.dodgeStreak,
          shieldActive: e.kineticShield,
          droneDodgeCount: e.droneDodgeCount,
          chronoActive: e.chronoActive
        });
      }

      // Render Ghost Trails
      const d = e.dino;
      for (let t = d.trail.length - 1; t >= 0; t--) {
        const tr = d.trail[t];
        tr.life -= 0.06;
        tr.x -= currentSpeed * 0.4;
        if (tr.life <= 0) {
          d.trail.splice(t, 1);
          continue;
        }
        ctx.fillStyle = `rgba(0, 245, 255, ${tr.life * 0.22})`;
        const trH = tr.duck ? d.duckHeight : d.height;
        const trW = tr.duck ? d.width + 12 : d.width;
        ctx.fillRect(tr.x, tr.y, trW, trH);
      }

      // Render Dino
      const curW = d.isDucking ? d.width + 14 : d.width;
      const curH = d.isDucking ? d.duckHeight : d.height;

      ctx.save();
      ctx.translate(d.x, d.y);

      // Kinetic Shield Bubble
      if (e.kineticShield) {
        ctx.strokeStyle = sector.bgHorizonColor;
        ctx.fillStyle = `${sector.bgHorizonColor}1e`;
        ctx.lineWidth = 2;
        ctx.shadowColor = sector.bgHorizonColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(curW / 2, curH / 2, curW * 0.86, curH * 0.82, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Archetype Specific Body Variations
      if (archetype.id === 'rex') {
        // Heavy Armored Titan Rex
        ctx.fillStyle = '#262a34';
        const torsoY = d.isDucking ? 4 : 8;
        const torsoH = curH - (d.isDucking ? 6 : 16);
        ctx.fillRect(6, torsoY, curW - 10, torsoH);

        // Heavy Armor Back Spines
        ctx.fillStyle = '#ff4b89';
        ctx.fillRect(14, torsoY - 4, 8, 4);
        ctx.fillRect(28, torsoY - 4, 8, 4);

        // Armor Plating
        ctx.fillStyle = '#dfe2ef';
        ctx.fillRect(curW - 18, 0, 22, d.isDucking ? 14 : 20);

        // Reinforced mechanical tail
        ctx.fillStyle = '#31353f';
        ctx.fillRect(0, torsoY + 4, 8, torsoH - 8);
      } else if (archetype.id === 'ptero') {
        // Sleek Ptero Glider with wings
        ctx.fillStyle = '#dfe2ef';
        const torsoY = d.isDucking ? 6 : 12;
        const torsoH = curH - (d.isDucking ? 8 : 22);
        ctx.fillRect(8, torsoY, curW - 16, torsoH);

        // Cyber Wings extended
        ctx.fillStyle = '#ff4b89';
        ctx.shadowColor = '#ff4b89';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(14, torsoY + 2);
        ctx.lineTo(-6, torsoY - 10);
        ctx.lineTo(26, torsoY + 4);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Default Raptor Scout
        ctx.fillStyle = '#dfe2ef';
        const torsoY = d.isDucking ? 6 : 14;
        const torsoH = curH - (d.isDucking ? 8 : 24);
        ctx.fillRect(8, torsoY, curW - 16, torsoH);

        ctx.fillStyle = '#262a34';
        ctx.fillRect(curW - 22, 0, 22, d.isDucking ? 12 : 16);
      }

      // Glowing Ocular Visor
      const visorColor = getVisorColor();
      ctx.fillStyle = visorColor;
      ctx.shadowColor = visorColor;
      ctx.shadowBlur = 10;
      ctx.fillRect(curW - 12, d.isDucking ? 3 : 5, 12, 4);
      ctx.shadowBlur = 0;

      // Ion Thruster Engine & Plume
      const flameColor = getThrusterFlameColor();
      ctx.fillStyle = flameColor;
      ctx.fillRect(2, d.isDucking ? 10 : 18, 6, 12);

      if (d.isJumping || Math.random() > 0.3) {
        ctx.fillStyle = flameColor;
        ctx.shadowColor = flameColor;
        ctx.shadowBlur = 8;
        const flameLen = d.isJumping ? 16 : 8;
        ctx.fillRect(-flameLen, d.isDucking ? 13 : 21, flameLen, 5);
        ctx.shadowBlur = 0;
      }

      // Mechanical Running Legs
      ctx.fillStyle = '#63f7ff';
      if (!d.isJumping) {
        const l1 = Math.sin(d.legPhase) * 8;
        const l2 = Math.cos(d.legPhase) * 8;
        ctx.fillRect(12, curH - 10, 4, 10 + l1);
        ctx.fillRect(24, curH - 10, 4, 10 + l2);
      } else {
        ctx.fillRect(12, curH - 6, 6, 6);
        ctx.fillRect(24, curH - 6, 6, 6);
      }

      ctx.restore();

      // Render & Collide Collectibles
      for (let i = e.collectibles.length - 1; i >= 0; i--) {
        const c = e.collectibles[i];
        if (isPlaying && !isPaused) {
          c.x -= currentSpeed;
          c.phase += 0.08;
        }
        const floatY = c.y + Math.sin(c.phase) * 4;

        ctx.save();
        ctx.fillStyle = c.color;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        if (c.type === 'QUANTUM_CORE') {
          ctx.translate(c.x, floatY);
          ctx.rotate(c.phase);
          ctx.fillRect(-c.r, -c.r, c.r * 2, c.r * 2);
        } else {
          ctx.arc(c.x, floatY, c.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Magnet range attraction upgrade
        const magnetDist = 45 + (armory.upgrades.magnetRange - 1) * 25;
        const dx = (d.x + curW / 2) - c.x;
        const dy = (d.y + curH / 2) - floatY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (isPlaying && !isPaused && dist < magnetDist) {
          c.x += dx * 0.15;
          c.y += dy * 0.15;
        }

        // Collection Check
        if (
          c.x + c.r > d.x &&
          c.x - c.r < d.x + curW &&
          floatY + c.r > d.y &&
          floatY - c.r < d.y + curH
        ) {
          if (c.type === 'QUANTUM_CORE') {
            e.score += 500;
            e.multiplier = Math.min(8.0, e.multiplier + 0.3);
            e.cooldowns.chrono.lastUsed = -12000;
            e.cooldowns.emp.lastUsed = -15000;
            e.cooldowns.shield.lastUsed = -18000;
            soundEngine.play('quantumCore');
            spawnParticles(c.x, floatY, '#ff4b89', 20, 5);
            onShowToast('QUANTUM CORE! ALL COOLDOWNS RESET', 'stars');
          } else {
            e.score += 100;
            e.nanoBitsCollected++;
            e.multiplier = Math.min(8.0, e.multiplier + 0.08);
            soundEngine.play('pickup');
            spawnParticles(c.x, floatY, '#00f5ff', 10, 3);
          }
          e.collectibles.splice(i, 1);
          continue;
        }

        if (c.x < -30) e.collectibles.splice(i, 1);
      }

      // Render, Update & Collide Obstacles
      for (let i = e.obstacles.length - 1; i >= 0; i--) {
        const obs = e.obstacles[i];
        if (isPlaying && !isPaused) {
          if (obs.type === 'METEOR_SHARD') {
            obs.x += (obs.vx || -3.5) - currentSpeed * 0.6;
            obs.y += obs.vy || 2.2;
          } else {
            obs.x -= currentSpeed;
          }
        }

        ctx.save();
        if (obs.type === 'LASER_PYLON') {
          obs.pulse = (obs.pulse || 0) + 0.15;
          ctx.fillStyle = obs.color;
          ctx.shadowColor = obs.color;
          ctx.shadowBlur = 10;
          ctx.fillRect(obs.x + 5, obs.y, 8, obs.h);
          ctx.fillRect(obs.x, obs.y + 12, obs.w, 5);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(obs.x + 6, obs.y + 2, 6, 6);
        } else if (obs.type === 'GLITCH_DRONE') {
          obs.wingPhase = (obs.wingPhase || 0) + 0.22;
          const wingY = Math.sin(obs.wingPhase) * 6;
          ctx.fillStyle = obs.color;
          ctx.shadowColor = obs.color;
          ctx.shadowBlur = 8;
          ctx.fillRect(obs.x + 8, obs.y + 6, 18, 10);
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + wingY);
          ctx.lineTo(obs.x + 10, obs.y + 6);
          ctx.lineTo(obs.x + 26, obs.y + 6);
          ctx.lineTo(obs.x + 34, obs.y + wingY);
          ctx.lineTo(obs.x + 17, obs.y + 12);
          ctx.fill();
          ctx.fillStyle = '#ff4b89';
          ctx.fillRect(obs.x + 4, obs.y + 8, 4, 4);
        } else if (obs.type === 'PLASMA_SPIKE') {
          ctx.fillStyle = obs.color;
          ctx.shadowColor = obs.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.h);
          ctx.lineTo(obs.x + 8, obs.y);
          ctx.lineTo(obs.x + 16, obs.y + obs.h);
          ctx.lineTo(obs.x + 24, obs.y);
          ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
          ctx.fill();
        } else if (obs.type === 'METEOR_SHARD') {
          ctx.fillStyle = obs.color;
          ctx.shadowColor = '#ff4b89';
          ctx.shadowBlur = 12;
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          spawnParticles(obs.x + obs.w, obs.y + obs.h / 2, '#ff4b89', 1, 1);
        }
        ctx.restore();

        // AABB Collision Detection
        const hit =
          d.x + 6 < obs.x + obs.w &&
          d.x + curW - 4 > obs.x &&
          d.y + 4 < obs.y + obs.h &&
          d.y + curH > obs.y;

        if (hit && isPlaying) {
          if (e.kineticShield) {
            e.shieldHitsRemaining--;
            e.screenShake = 7;
            soundEngine.play('hit');
            spawnParticles(obs.x + obs.w / 2, obs.y + obs.h / 2, '#00f5ff', 24, 6);
            e.obstacles.splice(i, 1);

            if (e.shieldHitsRemaining <= 0) {
              e.kineticShield = false;
              onShowToast('SHIELD SHATTERED! THREAT CONSUMED', 'shield_with_heart');
            } else {
              onShowToast(`SHIELD HIT! ${e.shieldHitsRemaining} ABSORB REMAINING`, 'shield');
            }
            continue;
          } else {
            // Lethal collision
            e.screenShake = 18;
            soundEngine.play('gameOver');
            spawnParticles(d.x + curW / 2, d.y + curH / 2, '#ff4b89', 45, 8);

            onGameOver({
              score: e.score,
              distance: Math.floor(e.distanceMeters),
              nanoBits: e.nanoBitsCollected,
              maxStreak: e.maxStreak
            });
            break;
          }
        }

        // Successfully passed obstacle
        if (obs.x + obs.w < 0 || obs.y > h + 40) {
          if (obs.type === 'GLITCH_DRONE') {
            e.droneDodgeCount++;
          }
          e.obstacles.splice(i, 1);
          e.dodgeStreak++;
          if (e.dodgeStreak > e.maxStreak) e.maxStreak = e.dodgeStreak;
          if (e.dodgeStreak % 5 === 0) {
            e.multiplier = Math.min(8.0, e.multiplier + 0.25);
            onShowToast(`SYNAPSE MULTIPLIER: ${e.multiplier.toFixed(1)}X!`, 'local_fire_department');
          }
        }
      }

      // Render Particles
      for (let pIdx = e.particles.length - 1; pIdx >= 0; pIdx--) {
        const p = e.particles[pIdx];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
          e.particles.splice(pIdx, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1.0;
      }

      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, isPaused, sector, archetype, armory, speedSensitivity]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block cursor-crosshair"
    />
  );
};
