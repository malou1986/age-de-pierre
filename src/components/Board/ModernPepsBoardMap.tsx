import React, { useState, useMemo } from 'react';
import { 
  BoardLocationId, 
  GameState, 
  PlayerState, 
  PlayerColor,
  CivilizationCard,
  BuildingTile
} from '../../types/game';
import { canPlaceMeeples, getZoneTotalMeeples } from '../../logic/gameEngine';
import { TabletopCivilizationCard } from '../Cards/TabletopCivilizationCard';
import { TabletopBuildingTile } from '../Cards/TabletopBuildingTile';
import { ResourceIcon } from '../Common/ResourceIcon';
import { 
  Wheat, 
  Crown, 
  Sparkles,
  X,
  Eye
} from 'lucide-react';

interface ModernPepsBoardMapProps {
  state: GameState;
  activePlayer: PlayerState;
  onZoneClick: (locationId: BoardLocationId) => void;
  className?: string;
}

// Player themes & styling
const PLAYER_CONFIG: Record<PlayerColor, {
  name: string;
  discFill: string;
  discStroke: string;
  glow: string;
}> = {
  red: {
    name: 'Tribu du Feu',
    discFill: '#dc2626',
    discStroke: '#fca5a5',
    glow: 'rgba(220, 38, 38, 0.8)',
  },
  blue: {
    name: "Tribu de l'Onde",
    discFill: '#2563eb',
    discStroke: '#93c5fd',
    glow: 'rgba(37, 99, 235, 0.8)',
  },
  yellow: {
    name: 'Tribu du Soleil',
    discFill: '#d97706',
    discStroke: '#fde047',
    glow: 'rgba(217, 119, 6, 0.8)',
  },
  green: {
    name: 'Tribu de la Forêt',
    discFill: '#16a34a',
    discStroke: '#86efac',
    glow: 'rgba(22, 163, 74, 0.8)',
  },
};

// Perimeter score track: 100 stone tiles around the frame (0 to 99)
interface ScoreTilePos {
  index: number;
  xPct: number;
  yPct: number;
  isMilestone: boolean;
}

const SCORE_TRACK_TILES: ScoreTilePos[] = (() => {
  const tiles: ScoreTilePos[] = [];
  const minX = 3.6;
  const maxX = 96.4;
  const minY = 3.8;
  const maxY = 96.0;

  // Top edge: 30 tiles (0..29) from left to right
  for (let i = 0; i < 30; i++) {
    tiles.push({
      index: i,
      xPct: minX + (i / 29) * (maxX - minX),
      yPct: minY,
      isMilestone: i % 10 === 0,
    });
  }

  // Right edge: 20 tiles (30..49) from top to bottom
  for (let i = 0; i < 20; i++) {
    tiles.push({
      index: 30 + i,
      xPct: maxX,
      yPct: minY + ((i + 1) / 21) * (maxY - minY),
      isMilestone: (30 + i) % 10 === 0,
    });
  }

  // Bottom edge: 30 tiles (50..79) from right to left
  for (let i = 0; i < 30; i++) {
    tiles.push({
      index: 50 + i,
      xPct: maxX - (i / 29) * (maxX - minX),
      yPct: maxY,
      isMilestone: (50 + i) % 10 === 0,
    });
  }

  // Left edge: 20 tiles (80..99) from bottom to top
  for (let i = 0; i < 20; i++) {
    tiles.push({
      index: 80 + i,
      xPct: minX,
      yPct: maxY - ((i + 1) / 21) * (maxY - minY),
      isMilestone: (80 + i) % 10 === 0,
    });
  }

  return tiles;
})();

export const ModernPepsBoardMap: React.FC<ModernPepsBoardMapProps> = ({
  state,
  activePlayer,
  onZoneClick,
  className = '',
}) => {
  const [hoveredZone, setHoveredZone] = useState<BoardLocationId | null>(null);
  const [inspectedCard, setInspectedCard] = useState<CivilizationCard | null>(null);
  const [inspectedBuilding, setInspectedBuilding] = useState<BuildingTile | null>(null);

  const isPlacement = state.phase === 'placement';
  const isResolution = state.phase === 'resolution';

  // Zone status evaluator
  const getZoneStatus = (locId: BoardLocationId) => {
    const totalMeeples = getZoneTotalMeeples(state, locId);
    const hasMyMeeples = (activePlayer.placements[locId] || 0) > 0;

    let canPlace = false;
    if (isPlacement && !activePlayer.isAi) {
      const needed = locId === 'hut' ? 2 : 1;
      canPlace = canPlaceMeeples(state, activePlayer.id, locId, needed).allowed;
    }

    const canResolve = isResolution && !activePlayer.isAi && hasMyMeeples;
    const isInteractive = canPlace || canResolve;

    return { totalMeeples, hasMyMeeples, canPlace, canResolve, isInteractive };
  };

  // Group players by score position (mod 100)
  const playersByScoreTile = useMemo(() => {
    const map = new Map<number, PlayerState[]>();
    for (const p of state.players) {
      const tileIdx = (p.victoryPoints || 0) % 100;
      if (!map.has(tileIdx)) map.set(tileIdx, []);
      map.get(tileIdx)!.push(p);
    }
    return map;
  }, [state.players]);

  // Group players by agriculture level (0..10)
  const playersByAgriStep = useMemo(() => {
    const map = new Map<number, PlayerState[]>();
    for (const p of state.players) {
      const step = Math.min(10, Math.max(0, p.agriculture || 0));
      if (!map.has(step)) map.set(step, []);
      map.get(step)!.push(p);
    }
    return map;
  }, [state.players]);

  // Render a tactile Small World meeple medallion
  const renderTactileMeeple = (
    player: PlayerState, 
    count: number, 
    size: 'sm' | 'md' | 'lg' = 'md',
    isCurrentActive = false
  ) => {
    const pCfg = PLAYER_CONFIG[player.color] || PLAYER_CONFIG.red;
    const sizeClasses = size === 'sm' 
      ? 'w-6 h-6 sm:w-7 sm:h-7 text-[10px]' 
      : size === 'lg' 
      ? 'w-10 h-10 sm:w-11 sm:h-11 text-xs' 
      : 'w-8 h-8 sm:w-9 sm:h-9 text-[11px]';

    return (
      <div 
        key={player.id}
        className={`relative inline-flex items-center justify-center rounded-full font-black select-none shadow-[0_4px_12px_rgba(0,0,0,0.9)] transition-all duration-200 ${sizeClasses} ${
          isCurrentActive ? 'scale-110 ring-2 ring-yellow-300 animate-pulse' : 'hover:scale-105'
        }`}
        style={{
          background: `radial-gradient(circle at 35% 30%, ${pCfg.discStroke} 0%, ${pCfg.discFill} 65%, #120b08 100%)`,
          border: `2px solid ${pCfg.discStroke}`,
          boxShadow: `0 4px 8px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.6)`,
        }}
        title={`${player.name} (${pCfg.name}): ${count} ouvrier${count > 1 ? 's' : ''}`}
      >
        <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-black uppercase">
          {player.name.charAt(0)}
        </span>

        {count > 1 && (
          <span 
            className="absolute -top-1 -right-1.5 bg-stone-950 text-amber-300 font-black px-1 rounded-full text-[9px] border border-amber-500 shadow-md leading-none"
          >
            x{count}
          </span>
        )}
      </div>
    );
  };

  // Render placed meeples in a territory
  const renderZoneMeeples = (locId: BoardLocationId, size: 'sm' | 'md' | 'lg' = 'md') => {
    const placedPlayers = state.players.filter(p => (p.placements[locId] || 0) > 0);
    if (placedPlayers.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center justify-center gap-1 z-20">
        {placedPlayers.map(p => {
          const count = p.placements[locId] || 0;
          return renderTactileMeeple(p, count, size, p.id === activePlayer.id);
        })}
      </div>
    );
  };

  // Helper for 7 meeple slots on resource territories
  const renderResourceSlots = (locId: BoardLocationId, ringColor: string) => {
    const total = getZoneTotalMeeples(state, locId);
    if (total > 0) {
      return renderZoneMeeples(locId, 'md');
    }
    // Show 7 subtle, semi-transparent rings on the ground
    return (
      <div className="flex items-center justify-center gap-1 opacity-40 group-hover:opacity-90 transition-opacity">
        {Array.from({ length: 7 }).map((_, i) => (
          <div 
            key={i} 
            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-dashed bg-black/20 flex items-center justify-center shadow-inner transition-transform group-hover:scale-105"
            style={{ borderColor: ringColor }}
          />
        ))}
      </div>
    );
  };

  return (
    <div 
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden rounded-3xl ${className}`}
      style={{
        backgroundColor: '#170e08',
        backgroundImage: 'radial-gradient(circle at 50% 50%, #2b190f 0%, #150d07 70%, #0a0503 100%)',
      }}
    >
      {/* 1. TABLETOP WOOD GRAIN TEXTURE */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 18px)',
        }}
      />

      {/* Main Board Container (Strict aspect ratio 1376 / 768 = 1.79, auto-scales on any screen without distortion) */}
      <div 
        className="relative h-full w-auto max-w-full max-h-full rounded-xl sm:rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] border sm:border-4 border-amber-950/90 flex items-center justify-center shrink-0"
        style={{ aspectRatio: '1376 / 768' }}
      >
        {/* 2. THE HIGH-RES ILLUSTRATED BOARD ARTWORK (ADAPTIVE ÉDITION MODERNE / CLASSIQUE) */}
        <img
          src={state.edition === 'classic' ? '/board.jpg' : '/board_peps.jpg'}
          alt={state.edition === 'classic' ? "Plateau Édition Initiale Classique 2008" : "Plateau Nouvelle Édition Contemporaine"}
          className={`absolute inset-0 w-full h-full object-fill pointer-events-none ${
            state.edition === 'classic' 
              ? 'sepia-[0.10] contrast-[1.02] brightness-[0.98]' 
              : 'saturate-[1.10] contrast-[1.03]'
          }`}
        />

        {/* 3. INTERACTIVE ZONES & MEEPLES OVERLAY (CLEAN, TRANSPARENT, NO HEAVY BOXES) */}
        <div className="absolute inset-0 z-10 pointer-events-auto">

          {/* ---------------- EXTENSION 3: LA CHASSE AU MAMMOUTH (Haut Gauche du Plateau) ---------------- */}
          {state.expansions?.mammothHerd && (() => {
            const locId: BoardLocationId = 'mammoth';
            const { isInteractive, totalMeeples } = getZoneStatus(locId);
            const activeM = state.activeMammoth;
            return (
              <div
                onClick={() => isInteractive && onZoneClick(locId)}
                onMouseEnter={() => setHoveredZone(locId)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`absolute left-[5.2%] top-[5.2%] w-[11.8%] h-[13.2%] rounded-2xl p-1 flex flex-col items-center justify-between transition-all duration-200 group z-30 ${
                  isInteractive
                    ? 'cursor-pointer border-2 border-dashed border-amber-400/70 hover:border-solid hover:border-amber-300 hover:bg-amber-950/50 hover:shadow-[0_0_18px_rgba(245,158,11,0.35)]'
                    : 'border border-amber-500/30 bg-amber-950/25'
                }`}
                title={activeM ? `Chasse au Mammouth (${activeM.name} - +${activeM.victoryPoints} VP) : Envoyez 1 ou 2 ouvriers` : 'Harde de Mammouths'}
              >
                <div className="text-center w-full">
                  <span className="text-[7px] sm:text-[8px] font-black uppercase text-amber-200 bg-stone-950/90 px-1 py-0.5 rounded-full border border-amber-500/70 shadow-md flex items-center justify-center gap-0.5 truncate">
                    <span>🦣</span>
                    <span className="truncate">{activeM ? `+${activeM.victoryPoints} VP` : 'Mammouth'}</span>
                  </span>
                </div>

                <div className="flex-1 w-full flex items-center justify-center">
                  {totalMeeples > 0 ? (
                    <div className="bg-stone-950/90 p-1 rounded-full border-2 border-amber-400 shadow-md ring-2 ring-amber-500/40 scale-105">
                      {renderZoneMeeples(locId, 'md')}
                    </div>
                  ) : (
                    <div 
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center text-xs shadow-md transition-all ${
                        isInteractive
                          ? 'border-amber-400 bg-amber-950/80 text-amber-200 ring-2 ring-amber-400/50 group-hover:scale-110'
                          : 'border-dashed border-amber-500/40 bg-stone-950/60 text-amber-300'
                      }`}
                    >
                      🦣
                    </div>
                  )}
                </div>

                <div className="text-[7px] font-black text-amber-300/90 truncate w-full text-center">
                  {totalMeeples}/4 Chasseurs
                </div>
              </div>
            );
          })()}

          {/* ---------------- 1. HUNTING GROUND (Savane de Chasse, Haut Gauche-Centre) ---------------- */}
          {(() => {
            const locId: BoardLocationId = 'hunting';
            const { isInteractive, canPlace } = getZoneStatus(locId);
            return (
              <div
                onClick={() => isInteractive && onZoneClick(locId)}
                onMouseEnter={() => setHoveredZone(locId)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`absolute left-[17.2%] top-[6.5%] w-[15.5%] h-[37%] rounded-3xl p-2 flex flex-col justify-between transition-all duration-200 group ${
                  isInteractive
                    ? 'cursor-pointer border border-dashed border-white/10 hover:border-solid hover:border-amber-400 hover:bg-amber-400/[0.04] hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'hover:bg-white/[0.02]'
                }`}
                title="La Plaine de Chasse : Nourriture ÷ 2 (Ouvriers illimités)"
              >
                {/* Floating Thematic Tooltip */}
                <div className="self-start opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="bg-stone-950/85 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500 shadow-md flex items-center gap-1">
                    <ResourceIcon type="food" size="xs" />
                    <span>Chasse (÷ 2)</span>
                  </span>
                </div>

                {/* Gathering Area around Campfire for Meeples */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  {renderZoneMeeples(locId, 'md')}
                </div>

                {isInteractive && (
                  <div className="self-center bg-stone-950/90 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-400/60 shadow opacity-0 group-hover:opacity-100 transition-opacity">
                    {canPlace ? '🎯 Cliquer pour chasser' : '⚡ Récolter nourriture'}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ---------------- 2. GREAT FOREST (La Grande Forêt, Haut Centre) ---------------- */}
          {(() => {
            const locId: BoardLocationId = 'forest';
            const { isInteractive, canPlace } = getZoneStatus(locId);
            return (
              <div
                onClick={() => isInteractive && onZoneClick(locId)}
                onMouseEnter={() => setHoveredZone(locId)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`absolute left-[33%] top-[6%] w-[23%] h-[32%] rounded-3xl p-2 flex flex-col justify-between transition-all duration-200 group ${
                  isInteractive
                    ? 'cursor-pointer border border-dashed border-white/10 hover:border-solid hover:border-emerald-400 hover:bg-emerald-400/[0.04] hover:shadow-[0_0_15px_rgba(52,211,153,0.15)]'
                    : 'hover:bg-white/[0.02]'
                }`}
                title="La Grande Forêt : Bois ÷ 3 (7 ouvriers max)"
              >
                <div className="self-start opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="bg-stone-950/85 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500 shadow-md flex items-center gap-1">
                    <ResourceIcon type="wood" size="xs" />
                    <span>Forêt (Bois ÷ 3)</span>
                  </span>
                </div>

                {/* 7 Slots / Placed Meeples directly on the ground */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  {renderResourceSlots(locId, '#34d399')}
                </div>

                {isInteractive && (
                  <div className="self-center bg-stone-950/90 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/60 shadow opacity-0 group-hover:opacity-100 transition-opacity">
                    {canPlace ? '🎯 Couper du bois' : '⚡ Récolter bois'}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ---------------- 3. CLAY PIT / GLAISIERE (Argilière & Fours, Haut Centre-Droit) ---------------- */}
          {(() => {
            const locId: BoardLocationId = 'clay_pit';
            const { isInteractive, canPlace } = getZoneStatus(locId);
            return (
              <div
                onClick={() => isInteractive && onZoneClick(locId)}
                onMouseEnter={() => setHoveredZone(locId)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`absolute left-[57.5%] top-[6%] w-[19.5%] h-[32%] rounded-3xl p-2 flex flex-col justify-between transition-all duration-200 group ${
                  isInteractive
                    ? 'cursor-pointer border border-dashed border-white/10 hover:border-solid hover:border-orange-400 hover:bg-orange-400/[0.04] hover:shadow-[0_0_15px_rgba(251,146,60,0.15)]'
                    : 'hover:bg-white/[0.02]'
                }`}
                title="La Glaisière : Argile ÷ 4 (7 ouvriers max)"
              >
                <div className="self-start opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="bg-stone-950/85 text-orange-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-orange-500 shadow-md flex items-center gap-1">
                    <ResourceIcon type="clay" size="xs" />
                    <span>Glaisière (Argile ÷ 4)</span>
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                  {renderResourceSlots(locId, '#fb923c')}
                </div>

                {isInteractive && (
                  <div className="self-center bg-stone-950/90 text-orange-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-orange-400/60 shadow opacity-0 group-hover:opacity-100 transition-opacity">
                    {canPlace ? '🎯 Extraire argile' : '⚡ Récolter argile'}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ---------------- 4. MOUNTAIN QUARRY (Carrière & Mégalithes, Haut Droit) ---------------- */}
          {(() => {
            const locId: BoardLocationId = 'quarry';
            const { isInteractive, canPlace } = getZoneStatus(locId);
            return (
              <div
                onClick={() => isInteractive && onZoneClick(locId)}
                onMouseEnter={() => setHoveredZone(locId)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`absolute left-[78%] top-[6%] w-[18%] h-[38%] rounded-3xl p-2 flex flex-col justify-between transition-all duration-200 group ${
                  isInteractive
                    ? 'cursor-pointer border border-dashed border-white/10 hover:border-solid hover:border-slate-300 hover:bg-slate-300/[0.04] hover:shadow-[0_0_15px_rgba(203,213,225,0.15)]'
                    : 'hover:bg-white/[0.02]'
                }`}
                title="La Carrière de Pierre : Pierre ÷ 5 (7 ouvriers max)"
              >
                <div className="self-start opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="bg-stone-950/85 text-slate-200 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-400 shadow-md flex items-center gap-1">
                    <ResourceIcon type="stone" size="xs" />
                    <span>Carrière (Pierre ÷ 5)</span>
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                  {renderResourceSlots(locId, '#cbd5e1')}
                </div>

                {isInteractive && (
                  <div className="self-center bg-stone-950/90 text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-300/60 shadow opacity-0 group-hover:opacity-100 transition-opacity">
                    {canPlace ? '🎯 Tailler pierre' : '⚡ Récolter pierre'}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ---------------- 5. RIVER & GOLD PANNING (Rivière & Orpaillage, Milieu Droit) ---------------- */}
          {(() => {
            const locId: BoardLocationId = 'river';
            const { isInteractive, canPlace } = getZoneStatus(locId);
            return (
              <div
                onClick={() => isInteractive && onZoneClick(locId)}
                onMouseEnter={() => setHoveredZone(locId)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`absolute left-[74%] top-[39%] w-[21%] h-[26%] rounded-3xl p-2 flex flex-col justify-between transition-all duration-200 group ${
                  isInteractive
                    ? 'cursor-pointer border border-dashed border-white/10 hover:border-solid hover:border-cyan-400 hover:bg-cyan-400/[0.04] hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'hover:bg-white/[0.02]'
                }`}
                title="La Rivière Aurifère : Or ÷ 6 (7 ouvriers max)"
              >
                <div className="self-start opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="bg-stone-950/85 text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-cyan-400 shadow-md flex items-center gap-1">
                    <ResourceIcon type="gold" size="xs" />
                    <span>Rivière (Or ÷ 6)</span>
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                  {renderResourceSlots(locId, '#38bdf8')}
                </div>

                {isInteractive && (
                  <div className="self-center bg-stone-950/90 text-cyan-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-cyan-400/60 shadow opacity-0 group-hover:opacity-100 transition-opacity">
                    {canPlace ? '🎯 Orpailler' : '⚡ Récolter or'}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ---------------- 6. AGRICULTURE LADDER (Sur le Côté Gauche du Plateau - 100% DÉGAGÉE) ---------------- */}
          <div 
            className="absolute left-[5%] top-[19%] w-[5.2%] h-[49%] bg-stone-950/90 backdrop-blur-sm rounded-xl border-2 border-amber-500/80 p-1 flex flex-col justify-between shadow-2xl z-20"
            title="Piste d'Agriculture (0 à 10): Fournit du blé gratuit pour nourrir vos ouvriers à chaque manche"
          >
            <div className="text-center border-b border-amber-600/60 pb-0.5">
              <span className="text-[8px] sm:text-[9px] font-black uppercase text-amber-300 tracking-tight flex items-center justify-center gap-0.5">
                <Wheat className="w-2.5 h-2.5 text-amber-400" />
                Agri
              </span>
            </div>

            {/* 11 steps: from 10 down to 0 with prominent wooden player pegs */}
            <div className="flex-1 flex flex-col-reverse justify-between py-0.5 gap-0.5">
              {Array.from({ length: 11 }).map((_, step) => {
                const occupants = playersByAgriStep.get(step) || [];
                const hasOccupants = occupants.length > 0;
                return (
                  <div 
                    key={step} 
                    className={`relative flex items-center justify-between px-1 py-0.5 rounded text-[8px] font-bold transition-colors ${
                      hasOccupants ? 'bg-amber-950/60 ring-1 ring-amber-400/50' : (step % 2 === 0 ? 'bg-stone-900/80' : 'bg-stone-850/40')
                    }`}
                  >
                    <span className="text-amber-200/90 text-[7px] font-black">{step}</span>
                    <div className="flex items-center -space-x-1 ml-auto">
                      {occupants.map(p => (
                        <div
                          key={p.id}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-white shadow-md flex items-center justify-center text-[7px] font-black text-white hover:scale-125 transition-transform"
                          style={{ backgroundColor: PLAYER_CONFIG[p.color].discFill }}
                          title={`${p.name}: Niveau Agri ${step}`}
                        >
                          {p.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---------------- 7. VILLAGE ATELIERS (Champs, Atelier Outils, Hutte) ---------------- */}

          {/* A. LES CHAMPS (+1 Agriculture, Centre-Gauche du Village) */}
          {(() => {
            const locId: BoardLocationId = 'field';
            const { isInteractive, totalMeeples } = getZoneStatus(locId);
            return (
              <div
                onClick={() => isInteractive && onZoneClick(locId)}
                onMouseEnter={() => setHoveredZone(locId)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`absolute left-[44.5%] top-[36.5%] w-[12%] h-[12.5%] rounded-2xl p-1 flex flex-col items-center justify-center transition-all duration-200 group ${
                  isInteractive
                    ? 'cursor-pointer border border-dashed border-white/10 hover:border-solid hover:border-amber-400 hover:bg-amber-400/[0.05] hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'hover:bg-white/[0.02]'
                }`}
                title="Champs : +1 sur la piste d'Agriculture (1 ouvrier max)"
              >
                {totalMeeples > 0 ? (
                  renderZoneMeeples(locId, 'md')
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-dashed border-amber-300/40 bg-amber-950/30 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-amber-300 transition-all">
                    <Wheat className="w-3.5 h-3.5 text-amber-300/90" />
                  </div>
                )}
              </div>
            );
          })()}

          {/* B. L'ATELIER EN PIERRE DU FABRICANT D'OUTILS (+1 Outil permanent, Village Bas-Droit) */}
          {(() => {
            const locId: BoardLocationId = 'tool_maker';
            const { isInteractive, totalMeeples } = getZoneStatus(locId);
            return (
              <>
                {/* Zone interactive directement sur l'Atelier d'Outils - Totalement dégagée au-dessus des cartes (Top: 40.5%, Hauteur: 11.5%, Se termine à 52% -> 12.5% au-dessus de card_3) */}
                <div
                  onClick={() => isInteractive && onZoneClick(locId)}
                  onMouseEnter={() => setHoveredZone(locId)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className={`absolute left-[47.0%] top-[40.5%] w-[11.5%] h-[11.5%] rounded-2xl p-1 flex flex-col items-center justify-between transition-all duration-200 group z-30 ${
                    isInteractive
                      ? 'cursor-pointer border-2 border-dashed border-amber-400/60 hover:border-solid hover:border-amber-400 hover:bg-stone-900/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      : 'hover:bg-white/[0.02]'
                  }`}
                  title="Atelier d'Outils en pierre : Poser 1 ouvrier pour forger +1 Outil permanent (1 ouvrier max)"
                >
                  {/* Badge d'atelier avec statut d'occupation très clair */}
                  <div className="transition-opacity duration-200 pointer-events-none">
                    <span className={`text-[7px] sm:text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border shadow-md ${
                      totalMeeples > 0
                        ? 'bg-amber-950 text-amber-200 border-amber-500'
                        : 'bg-stone-950/90 text-amber-200 border-amber-500/70'
                    }`}>
                      {totalMeeples > 0 ? '🔨 Outils : Pris' : 'Atelier Outils'}
                    </span>
                  </div>

                  {/* Emplacement de dépose du pion : sur l'enclume, surélevé et parfaitement visible au-dessus des cartes */}
                  <div className="flex-1 w-full flex items-center justify-center relative z-30">
                    {totalMeeples > 0 ? (
                      <div className="bg-stone-950/95 p-1 rounded-full border-2 border-amber-400 shadow-[0_4px_14px_rgba(0,0,0,0.95)] ring-2 ring-amber-500/50 scale-105">
                        {renderZoneMeeples(locId, 'md')}
                      </div>
                    ) : (
                      <div 
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center text-[10px] shadow-md transition-all ${
                          isInteractive
                            ? 'border-amber-400 bg-amber-950/85 text-amber-200 ring-2 ring-amber-400/50 group-hover:scale-110'
                            : 'border-dashed border-stone-500 bg-stone-950/70 text-stone-300'
                        }`}
                        title="Déposer 1 ouvrier sur l'enclume de l'atelier"
                      >
                        🔨
                      </div>
                    )}
                  </div>
                </div>

                {/* Réserve physique des tuiles Outils (1/2 et 3/4) positionnée immédiatement à gauche de l'atelier, bien au-dessus des cartes */}
                <div 
                  onClick={() => isInteractive && onZoneClick(locId)}
                  className={`absolute left-[41.0%] top-[41.5%] flex items-center gap-1 z-30 transition-all select-none ${
                    isInteractive ? 'cursor-pointer hover:scale-105' : ''
                  }`}
                  title="Réserve d'Outils du village (1-2 / 3-4) : Cliquez pour envoyer un ouvrier à l'atelier"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg overflow-hidden border border-stone-500 shadow-md bg-stone-900/90 hover:border-amber-400 transition-colors">
                    <img 
                      src="/tools/tool_1.png" 
                      alt="Tuile Outil 1/2" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg overflow-hidden border border-stone-500 shadow-md bg-stone-900/90 hover:border-amber-400 transition-colors">
                    <img 
                      src="/tools/tool_3.png" 
                      alt="Tuile Outil 3/4" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              </>
            );
          })()}

          {/* C. LA HUTTE D'AMOUR / NAISSANCES (+1 Ouvrier, Centre-Gauche) */}
          {(() => {
            const locId: BoardLocationId = 'hut';
            const { isInteractive, totalMeeples } = getZoneStatus(locId);
            return (
              <div
                onClick={() => isInteractive && onZoneClick(locId)}
                onMouseEnter={() => setHoveredZone(locId)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`absolute left-[34.5%] top-[52.5%] w-[10.5%] h-[13%] rounded-2xl p-1 flex flex-col items-center justify-center transition-all duration-200 group ${
                  isInteractive
                    ? 'cursor-pointer border border-dashed border-white/10 hover:border-solid hover:border-rose-400 hover:bg-rose-400/[0.04] hover:shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                    : 'hover:bg-white/[0.02]'
                }`}
                title="Hutte des Naissances : +1 nouvel ouvrier pour la prochaine manche (2 ouvriers requis !)"
              >
                {totalMeeples > 0 ? (
                  renderZoneMeeples(locId, 'md')
                ) : (
                  <div className="flex items-center gap-1 group-hover:scale-105 transition-transform">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-dashed border-rose-300/50 bg-rose-950/40 flex items-center justify-center text-[8px] text-rose-200 font-black shadow-sm group-hover:border-rose-300">
                      1
                    </div>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-dashed border-rose-300/50 bg-rose-950/40 flex items-center justify-center text-[8px] text-rose-200 font-black shadow-sm group-hover:border-rose-300">
                      2
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ---------------- EXTENSION 2: L'ÉCHOPPE DES MARCHANDS & PISTE DE TROC (Tuile Cartonné d'Extension) ---------------- */}
          {state.expansions?.styleIsTheGoal && (() => {
            const locId: BoardLocationId = 'merchant';
            const { isInteractive, totalMeeples, canPlace } = getZoneStatus(locId);
            return (
              <div
                onClick={() => isInteractive && onZoneClick(locId)}
                onMouseEnter={() => setHoveredZone(locId)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`absolute left-[13.5%] top-[48%] w-[19%] h-[21%] rounded-2xl p-1 flex flex-col items-center justify-between transition-all duration-300 group z-30 select-none ${
                  isInteractive
                    ? 'cursor-pointer border-2 border-purple-400/90 shadow-[0_12px_28px_rgba(0,0,0,0.85),0_0_20px_rgba(168,85,247,0.45)] hover:scale-[1.03] hover:border-purple-300'
                    : 'border-2 border-stone-800/90 shadow-[0_8px_20px_rgba(0,0,0,0.8)]'
                }`}
                style={{
                  boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.8), 0 4px 6px -2px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
                }}
                title="Échoppe des Marchands (Extension 'Le Style, c'est le But') : Poser 1 ouvrier pour monter sur la Piste de Troc et échanger des Parures ou ressources"
              >
                {/* 1. Illustration Authentique Haute Définition de la Tuile d'Extension Cartonné */}
                <img
                  src="/extensions/merchant_tile.jpg"
                  alt="Tuile d'Extension : Échoppe des Marchands"
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl pointer-events-none filter brightness-95 group-hover:brightness-105 transition-all"
                />

                {/* Subtile patine cartonné & biseau physique */}
                <div className="absolute inset-0 rounded-2xl border border-amber-500/25 pointer-events-none" />

                {/* Ruban d'en-tête de l'extension */}
                <div className="relative z-10 w-full text-center">
                  <span className="text-[7px] sm:text-[8px] font-black uppercase text-purple-200 bg-stone-950/90 px-2 py-0.5 rounded-full border border-purple-500/80 shadow-md inline-flex items-center gap-1">
                    <span>⚖️</span>
                    <span>Marchands & Troc</span>
                  </span>
                </div>

                {/* Emplacement de dépose du pion : cercle gravé au centre de la tuile */}
                <div className="flex-1 w-full flex items-center justify-center relative z-10">
                  {totalMeeples > 0 ? (
                    <div className="bg-stone-950/95 p-1.5 rounded-full border-2 border-purple-400 shadow-[0_4px_16px_rgba(0,0,0,0.95)] ring-2 ring-purple-500/60 scale-105">
                      {renderZoneMeeples(locId, 'md')}
                    </div>
                  ) : (
                    <div 
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs shadow-md transition-all ${
                        isInteractive
                          ? 'border-purple-400 bg-purple-950/85 text-purple-200 ring-2 ring-purple-400/50 group-hover:scale-110'
                          : 'border-dashed border-purple-500/50 bg-stone-950/75 text-purple-300'
                      }`}
                      title="Poser 1 ouvrier sur la tuile des marchands"
                    >
                      📿
                    </div>
                  )}
                </div>

                {/* Pied de tuile : Piste de troc & Parures */}
                <div className="relative z-10 w-full text-center pb-0.5">
                  <span className="text-[6.5px] sm:text-[7.5px] font-bold text-amber-200/90 bg-stone-950/85 px-1.5 py-0.5 rounded-md border border-amber-600/40 shadow-xs">
                    Piste de Troc • Parures
                  </span>
                </div>
              </div>
            );
          })()}

          {/* ---------------- 8. LES 4 CHANTIERS DE BÂTIMENTS (Bas Gauche - Équilibré & Distinct) ---------------- */}
          <div 
            className="absolute left-[5.5%] top-[71.5%] w-[36%] h-[22.5%] grid grid-cols-4 gap-1.5 sm:gap-2 z-20"
            title="Chantiers de Bâtiments : Déposez 1 ouvrier pour construire la hutte visible en payant ses ressources"
          >
            {[0, 1, 2, 3].map(pileIdx => {
              const locId = `building_${pileIdx}` as BoardLocationId;
              const { isInteractive, totalMeeples } = getZoneStatus(locId);
              const pile = state.buildingPiles[pileIdx] || [];
              const topTile = pile[pile.length - 1];

              return (
                <div
                  key={locId}
                  className="w-full h-full min-w-0 flex flex-col justify-between items-center"
                >
                  {/* The Physical Cardboard Building Tile */}
                  <div className="w-full flex-1 min-w-0 mb-0.5">
                    {topTile ? (
                      <TabletopBuildingTile
                        tile={topTile}
                        pileCount={pile.length}
                        isInteractive={isInteractive}
                        onClick={() => isInteractive ? onZoneClick(locId) : setInspectedBuilding(topTile)}
                      />
                    ) : (
                      <div className="w-full h-full rounded-lg border-2 border-dashed border-stone-700/60 bg-stone-950/50 flex items-center justify-center text-[8px] text-stone-500 font-bold italic">
                        Épuisée
                      </div>
                    )}
                  </div>

                  {/* Meeple Placement Ring directly under the tile */}
                  <div 
                    onClick={() => isInteractive && onZoneClick(locId)}
                    className={`h-6 sm:h-7 w-full shrink-0 flex items-center justify-center rounded transition-all ${
                      isInteractive ? 'cursor-pointer hover:bg-amber-400/10' : ''
                    }`}
                  >
                    {totalMeeples > 0 ? (
                      renderZoneMeeples(locId, 'md')
                    ) : topTile ? (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-dashed border-amber-300/40 bg-stone-950/50 flex items-center justify-center text-[7px] sm:text-[8px] font-black text-amber-300/80 shadow-sm group-hover:scale-105 group-hover:border-amber-300 transition-transform">
                        1
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---------------- 9. LE MARCHÉ DES CARTES CIVILISATION (Bas Droit - MAXIMUM LARGEUR & VISIBILITÉ) ---------------- */}
          {/* Spanning X: 50.5% to 94.5% (44.0% width, 32.0% height), maximum card area without external bars */}
          <div 
            className="absolute left-[50.5%] top-[64.5%] w-[44.0%] h-[32.0%] grid grid-cols-4 gap-1 sm:gap-1.5 z-20"
            title="Marché des Civilisations : Déposez 1 ouvrier pour acquérir la carte correspondante"
          >
            {[
              { slot: 3, locId: 'card_3' as BoardLocationId, cost: 4 },
              { slot: 2, locId: 'card_2' as BoardLocationId, cost: 3 },
              { slot: 1, locId: 'card_1' as BoardLocationId, cost: 2 },
              { slot: 0, locId: 'card_0' as BoardLocationId, cost: 1 },
            ].map(({ slot, locId, cost }) => {
              const { isInteractive, totalMeeples } = getZoneStatus(locId);
              const card = state.activeCards[slot];

              return (
                <div
                  key={locId}
                  className="relative w-full h-full min-w-0 flex flex-col justify-between items-center group"
                >
                  {/* Distinct, Tabletop Playing Card with Unique Artwork filling full height */}
                  <div className="w-full h-full min-w-0 flex-1 relative">
                    {card ? (
                      <TabletopCivilizationCard
                        card={card}
                        cost={cost}
                        showCost={true}
                        isInteractive={isInteractive}
                        onClick={() => isInteractive ? onZoneClick(locId) : setInspectedCard(card)}
                        className="w-full h-full shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl border-2 border-dashed border-stone-700/60 bg-stone-950/60 flex flex-col items-center justify-center p-1 text-center shadow-inner">
                        <span className="text-xs text-amber-500/80 font-black">🪙 {cost}</span>
                        <span className="text-[8px] text-stone-500 font-bold uppercase tracking-wider">Vide</span>
                      </div>
                    )}

                    {/* Integrated Floating Meeple Placement Ring directly over card bottom */}
                    <div 
                      onClick={(e) => {
                        if (isInteractive) {
                          e.stopPropagation();
                          onZoneClick(locId);
                        }
                      }}
                      className={`absolute -bottom-1 inset-x-0 z-30 flex items-center justify-center pointer-events-auto transition-transform ${
                        isInteractive ? 'cursor-pointer hover:scale-110' : ''
                      }`}
                    >
                      {totalMeeples > 0 ? (
                        <div className="bg-stone-950/90 px-1 py-0.5 rounded-full border border-amber-400 shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                          {renderZoneMeeples(locId, 'md')}
                        </div>
                      ) : card ? (
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-dashed flex items-center justify-center text-[8px] sm:text-[9px] font-black shadow-md transition-all ${
                          isInteractive 
                            ? 'border-amber-300 bg-amber-500/40 text-amber-200 ring-2 ring-amber-400/60 scale-105' 
                            : 'border-stone-600/70 bg-stone-950/80 text-stone-400'
                        }`}>
                          1
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ---------------- 10. PERIMETER VICTORY POINT SCORE TRACK (0 À 100) ---------------- */}
        <div className="absolute inset-0 pointer-events-none z-30">
          {SCORE_TRACK_TILES.map(tile => {
            const playersHere = playersByScoreTile.get(tile.index) || [];
            const hasPlayers = playersHere.length > 0;

            return (
              <div
                key={tile.index}
                className={`absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-sm transition-transform duration-150 hover:scale-125 hover:z-40 ${
                  tile.isMilestone 
                    ? 'w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-black shadow-[0_0_8px_rgba(245,158,11,0.9)] border border-amber-200' 
                    : 'w-3.5 h-3.5 bg-stone-950/90 text-stone-300 font-bold border border-stone-700/80'
                }`}
                style={{
                  left: `${tile.xPct}%`,
                  top: `${tile.yPct}%`,
                }}
                title={`Case de score ${tile.index}${
                  hasPlayers 
                    ? ` : ${playersHere.map(p => `${p.name} (${p.victoryPoints} PV)`).join(', ')}` 
                    : ''
                }`}
              >
                {(tile.isMilestone || tile.index % 5 === 0) && (
                  <span className={`text-[7px] leading-none ${tile.isMilestone ? 'font-black' : 'opacity-70'}`}>
                    {tile.index}
                  </span>
                )}

                {hasPlayers && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center -space-x-1.5">
                      {playersHere.map(p => {
                        const pCfg = PLAYER_CONFIG[p.color];
                        const hasBonus100 = p.victoryPoints >= 100;
                        return (
                          <div
                            key={p.id}
                            className="relative w-4 h-4 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-[7px] font-black text-white animate-bounce"
                            style={{
                              backgroundColor: pCfg.discFill,
                              boxShadow: `0 0 8px ${pCfg.glow}`,
                            }}
                            title={`${p.name}: ${p.victoryPoints} Points de Victoire !`}
                          >
                            <span>{p.name.charAt(0)}</span>
                            {hasBonus100 && (
                              <Crown className="w-2.5 h-2.5 text-yellow-300 absolute -top-2 -right-1 drop-shadow" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* INSPECTION OVERLAY MODAL FOR CARDS & BUILDINGS */}
        {inspectedCard && (
          <div 
            className="absolute inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in pointer-events-auto"
            onClick={() => setInspectedCard(null)}
          >
            <div 
              className="relative w-full max-w-lg landscape:max-w-2xl bg-stone-900/95 border-2 border-amber-500/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col md:flex-row landscape:flex-row gap-3 sm:gap-5 items-center max-h-[92dvh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setInspectedCard(null)}
                className="absolute top-2 sm:top-3 right-2 sm:right-3 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center border border-stone-600 cursor-pointer shadow-lg transition-colors"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Card visualizer */}
              <div className="w-32 h-44 sm:w-48 sm:h-72 shrink-0 shadow-2xl rounded-2xl overflow-hidden ring-4 ring-amber-400/30">
                <TabletopCivilizationCard 
                  card={inspectedCard} 
                  showCost={false}
                  size="compact"
                  className="w-full h-full"
                />
              </div>

              {/* Explanatory rules breakdown */}
              <div className="flex-1 flex flex-col justify-between self-stretch text-left">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl flex items-center justify-center">
                      {inspectedCard.bottomBonus.type === 'green' ? (
                        '🌿'
                      ) : inspectedCard.bottomBonus.sandType === 'builder' ? (
                        <ResourceIcon type="building" size="sm" className="w-5 h-5 drop-shadow" />
                      ) : inspectedCard.bottomBonus.sandType === 'farmer' ? (
                        <ResourceIcon type="agriculture" size="sm" className="w-5 h-5 drop-shadow" />
                      ) : inspectedCard.bottomBonus.sandType === 'tool_maker' ? (
                        <ResourceIcon type="tool" size="sm" className="w-5 h-5 drop-shadow" />
                      ) : (
                        '⏳'
                      )}
                    </span>
                    <h3 className="text-lg font-black text-amber-200">
                      {inspectedCard.name}
                    </h3>
                  </div>

                  <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 bg-stone-950 border border-stone-700 text-amber-400">
                    {inspectedCard.bottomBonus.type === 'green' ? 'Symbole Vert de Culture' : 'Figure Sablée de Multiplicateur'}
                  </div>

                  <div className="space-y-3">
                    <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800">
                      <span className="text-xs font-bold text-amber-400 block mb-0.5">
                        ⚡ Gain Immédiat (À l'achat)
                      </span>
                      <p className="text-xs text-stone-200 leading-relaxed">
                        {inspectedCard.topBonus.description}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800">
                      <span className="text-xs font-bold text-emerald-400 block mb-0.5">
                        🏆 Décompte Fin de Partie
                      </span>
                      <p className="text-xs text-stone-200 leading-relaxed">
                        {inspectedCard.bottomBonus.type === 'green'
                          ? `Symbole ${inspectedCard.bottomBonus.greenSymbol}. Formez des séries de 1 à 8 symboles différents : chaque série rapporte le carré de ses symboles (ex: 5 symboles = 25 PV, 8 symboles = 64 PV !).`
                          : `${inspectedCard.bottomBonus.description}. Ce personnage multiplie votre total correspondant lors du calcul final.`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 italic">
                    💡 Le dessin de la carte illustre directement ces deux effets.
                  </span>
                  <button 
                    onClick={() => setInspectedCard(null)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-lg shadow-md transition-colors"
                  >
                    Compris
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {inspectedBuilding && (
          <div 
            className="absolute inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in pointer-events-auto"
            onClick={() => setInspectedBuilding(null)}
          >
            <div 
              className="relative w-full max-w-lg landscape:max-w-2xl bg-stone-900/95 border-2 border-amber-600/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col md:flex-row landscape:flex-row gap-3 sm:gap-5 items-center max-h-[92dvh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setInspectedBuilding(null)}
                className="absolute top-2 sm:top-3 right-2 sm:right-3 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center border border-stone-600 cursor-pointer shadow-lg transition-colors"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Building visualizer */}
              <div className="w-32 h-32 sm:w-44 sm:h-44 shrink-0 shadow-2xl rounded-2xl overflow-hidden ring-4 ring-amber-500/30">
                <TabletopBuildingTile 
                  tile={inspectedBuilding} 
                  size="compact"
                  className="w-full h-full"
                />
              </div>

              {/* Explanatory rules breakdown */}
              <div className="flex-1 flex flex-col justify-between self-stretch text-left">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ResourceIcon type="building" size="sm" className="w-5 h-5 drop-shadow" />
                    <h3 className="text-lg font-black text-amber-200">
                      Bâtiment Préhistorique
                    </h3>
                  </div>

                  <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 bg-stone-950 border border-stone-700 text-amber-400">
                    Tuile de Chantier
                  </div>

                  <div className="space-y-3">
                    <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800">
                      <span className="text-xs font-bold text-amber-400 block mb-0.5">
                        📦 Ressources Requises
                      </span>
                      <p className="text-xs text-stone-200 leading-relaxed">
                        {inspectedBuilding.description}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800">
                      <span className="text-xs font-bold text-yellow-400 block mb-0.5">
                        ⭐ Gain en Points de Victoire
                      </span>
                      <p className="text-xs text-stone-200 leading-relaxed">
                        {inspectedBuilding.victoryPoints !== undefined
                          ? `Rapporte immédiatement +${inspectedBuilding.victoryPoints} Points de Victoire lors de la construction.`
                          : 'Rapporte la somme de la valeur de toutes les ressources dépensées (Bois=3, Glaise=4, Pierre=5, Or=6 PV).'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 italic">
                    💡 Déposez 1 ouvrier sur le chantier pour bâtir cette tuile.
                  </span>
                  <button 
                    onClick={() => setInspectedBuilding(null)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-lg shadow-md transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
