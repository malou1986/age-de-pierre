import React from 'react';
import { 
  BoardLocationId, 
  GameState, 
  PlayerState, 
} from '../../types/game';
import { canPlaceMeeples, getZoneTotalMeeples } from '../../logic/gameEngine';
import { MeepleIcon } from '../Meeples';
import { CivilizationCardView } from '../Cards/CivilizationCardView';
import { BuildingTileView } from '../Cards/BuildingTileView';
import { ResourceIcon } from '../Common/ResourceIcon';
import { Flame } from 'lucide-react';

interface VirtualBoardProps {
  state: GameState;
  activePlayer: PlayerState;
  onZoneClick: (locationId: BoardLocationId) => void;
}

export const VirtualBoard: React.FC<VirtualBoardProps> = ({
  state,
  activePlayer,
  onZoneClick,
}) => {
  const isPlacement = state.phase === 'placement';
  const isResolution = state.phase === 'resolution';

  // Helper to determine if a zone is clickable for active player
  const getZoneStatus = (locId: BoardLocationId) => {
    const totalMeeples = getZoneTotalMeeples(state, locId);
    const hasMyMeeples = (activePlayer.placements[locId] || 0) > 0;

    const canPlace = isPlacement && !activePlayer.isAi && canPlaceMeeples(
      state,
      activePlayer.id,
      locId,
      locId === 'hut' ? 2 : 1
    ).allowed;

    const canResolve = isResolution && !activePlayer.isAi && hasMyMeeples;

    return { totalMeeples, hasMyMeeples, canPlace, canResolve };
  };

  // Helper to render meeples in a zone
  const renderMeeples = (locId: BoardLocationId, maxDisplay = 7) => {
    const placedPlayers = state.players.filter(p => (p.placements[locId] || 0) > 0);
    if (placedPlayers.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center justify-center gap-1 p-0.5">
        {placedPlayers.map(p => {
          const count = p.placements[locId] || 0;
          return (
            <div
              key={p.id}
              className={`transition-transform duration-200 ${
                p.id === activePlayer.id && isResolution ? 'scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-bounce' : ''
              }`}
            >
              <MeepleIcon
                color={p.color}
                size={22}
                count={count}
                glow={p.id === activePlayer.id && isResolution}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto select-none">
      {/* Board Aspect-Ratio Container (760 x 531 = ~1.431) */}
      <div
        className="relative w-full rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-amber-900/60 overflow-hidden bg-stone-950"
        style={{ aspectRatio: '760 / 531' }}
      >
        {/* Background Board Artwork */}
        <img
          src="/board.jpg"
          alt="Plateau officiel L'Âge de Pierre"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none filter saturate-[1.08] contrast-[1.02]"
        />

        {/* 1. HUNTING GROUND (Savane / Chasse - Haut Gauche) */}
        {(() => {
          const { canPlace, canResolve } = getZoneStatus('hunting');
          return (
            <div
              onClick={() => (canPlace || canResolve) && onZoneClick('hunting')}
              title="La Chasse (Nourriture ÷2)"
              className={`absolute rounded-xl transition-all flex flex-col items-center justify-center p-1 ${
                canPlace || canResolve
                  ? 'cursor-pointer ring-4 ring-amber-400 bg-amber-500/20 shadow-lg scale-[1.02]'
                  : 'hover:bg-black/10'
              }`}
              style={{
                left: '7.89%',
                top: '8.47%',
                width: '21.05%',
                height: '30.13%',
              }}
            >
              <div className="bg-stone-950/70 border border-amber-500/50 rounded-lg px-2 py-0.5 text-[10px] font-black text-amber-200 mb-1 flex items-center gap-1.5 shadow">
                <span className="flex items-center gap-1"><ResourceIcon type="food" size="xs" /> Chasse</span>
                <span className="text-amber-400 font-mono">÷2</span>
              </div>
              {renderMeeples('hunting')}
              {(canPlace || canResolve) && (
                <span className="mt-1 bg-amber-500 text-stone-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow animate-pulse">
                  {canPlace ? '+ Poser' : '➔ Récolter'}
                </span>
              )}
            </div>
          );
        })()}

        {/* 2. THE FOREST (La Forêt - Bois ÷3) */}
        {(() => {
          const { canPlace, canResolve, totalMeeples } = getZoneStatus('forest');
          return (
            <div
              onClick={() => (canPlace || canResolve) && onZoneClick('forest')}
              title="La Forêt (Bois ÷3) - Max 7"
              className={`absolute rounded-xl transition-all flex flex-col items-center justify-center p-1 ${
                canPlace || canResolve
                  ? 'cursor-pointer ring-4 ring-emerald-400 bg-emerald-500/25 shadow-lg scale-[1.02]'
                  : 'hover:bg-black/10'
              }`}
              style={{
                left: '30.26%',
                top: '10.36%',
                width: '16.45%',
                height: '25.42%',
              }}
            >
              <div className="bg-stone-950/75 border border-emerald-500/50 rounded-lg px-2 py-0.5 text-[10px] font-black text-emerald-300 mb-1 flex items-center gap-1.5 shadow">
                <span className="flex items-center gap-1"><ResourceIcon type="wood" size="xs" /> Forêt</span>
                <span className="font-mono text-emerald-400">÷3</span>
                <span className="text-[9px] text-stone-400 font-mono">({totalMeeples}/7)</span>
              </div>
              {renderMeeples('forest')}
              {(canPlace || canResolve) && (
                <span className="mt-1 bg-emerald-500 text-stone-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow animate-pulse">
                  {canPlace ? '+ Poser' : '➔ Récolter'}
                </span>
              )}
            </div>
          );
        })()}

        {/* 3. CLAY PIT (La Glaisière - Glaise ÷4) */}
        {(() => {
          const { canPlace, canResolve, totalMeeples } = getZoneStatus('clay_pit');
          return (
            <div
              onClick={() => (canPlace || canResolve) && onZoneClick('clay_pit')}
              title="La Glaisière (Glaise ÷4) - Max 7"
              className={`absolute rounded-xl transition-all flex flex-col items-center justify-center p-1 ${
                canPlace || canResolve
                  ? 'cursor-pointer ring-4 ring-orange-400 bg-orange-500/25 shadow-lg scale-[1.02]'
                  : 'hover:bg-black/10'
              }`}
              style={{
                left: '48.68%',
                top: '10.36%',
                width: '18.42%',
                height: '24.48%',
              }}
            >
              <div className="bg-stone-950/75 border border-orange-500/50 rounded-lg px-2 py-0.5 text-[10px] font-black text-orange-300 mb-1 flex items-center gap-1.5 shadow">
                <span className="flex items-center gap-1"><ResourceIcon type="clay" size="xs" /> Glaise</span>
                <span className="font-mono text-orange-400">÷4</span>
                <span className="text-[9px] text-stone-400 font-mono">({totalMeeples}/7)</span>
              </div>
              {renderMeeples('clay_pit')}
              {(canPlace || canResolve) && (
                <span className="mt-1 bg-orange-500 text-stone-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow animate-pulse">
                  {canPlace ? '+ Poser' : '➔ Récolter'}
                </span>
              )}
            </div>
          );
        })()}

        {/* 4. MOUNTAIN QUARRY (La Carrière - Pierre ÷5) */}
        {(() => {
          const { canPlace, canResolve, totalMeeples } = getZoneStatus('quarry');
          return (
            <div
              onClick={() => (canPlace || canResolve) && onZoneClick('quarry')}
              title="La Carrière (Pierre ÷5) - Max 7"
              className={`absolute rounded-xl transition-all flex flex-col items-center justify-center p-1 ${
                canPlace || canResolve
                  ? 'cursor-pointer ring-4 ring-slate-300 bg-slate-500/25 shadow-lg scale-[1.02]'
                  : 'hover:bg-black/10'
              }`}
              style={{
                left: '77.63%',
                top: '10.36%',
                width: '15.79%',
                height: '24.48%',
              }}
            >
              <div className="bg-stone-950/75 border border-slate-400/50 rounded-lg px-2 py-0.5 text-[10px] font-black text-slate-200 mb-1 flex items-center gap-1.5 shadow">
                <span className="flex items-center gap-1"><ResourceIcon type="stone" size="xs" /> Pierre</span>
                <span className="font-mono text-slate-300">÷5</span>
                <span className="text-[9px] text-stone-400 font-mono">({totalMeeples}/7)</span>
              </div>
              {renderMeeples('quarry')}
              {(canPlace || canResolve) && (
                <span className="mt-1 bg-slate-200 text-stone-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow animate-pulse">
                  {canPlace ? '+ Poser' : '➔ Récolter'}
                </span>
              )}
            </div>
          );
        })()}

        {/* 5. RIVER (La Rivière - Or ÷6) */}
        {(() => {
          const { canPlace, canResolve, totalMeeples } = getZoneStatus('river');
          return (
            <div
              onClick={() => (canPlace || canResolve) && onZoneClick('river')}
              title="La Rivière (Or ÷6) - Max 7"
              className={`absolute rounded-xl transition-all flex flex-col items-center justify-center p-1 ${
                canPlace || canResolve
                  ? 'cursor-pointer ring-4 ring-yellow-400 bg-yellow-500/25 shadow-lg scale-[1.02]'
                  : 'hover:bg-black/10'
              }`}
              style={{
                left: '71.05%',
                top: '39.55%',
                width: '22.37%',
                height: '22.60%',
              }}
            >
              <div className="bg-stone-950/75 border border-yellow-500/50 rounded-lg px-2 py-0.5 text-[10px] font-black text-yellow-300 mb-1 flex items-center gap-1.5 shadow">
                <span className="flex items-center gap-1"><ResourceIcon type="gold" size="xs" /> Or</span>
                <span className="font-mono text-yellow-400">÷6</span>
                <span className="text-[9px] text-stone-400 font-mono">({totalMeeples}/7)</span>
              </div>
              {renderMeeples('river')}
              {(canPlace || canResolve) && (
                <span className="mt-1 bg-yellow-400 text-stone-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow animate-pulse">
                  {canPlace ? '+ Poser' : '➔ Récolter'}
                </span>
              )}
            </div>
          );
        })()}

        {/* 6. VILLAGE: TOOL MAKER (Fabricant d'outils) */}
        {(() => {
          const { canPlace, canResolve } = getZoneStatus('tool_maker');
          return (
            <div
              onClick={() => (canPlace || canResolve) && onZoneClick('tool_maker')}
              title="Fabricant d'outils (+1 outil permanent)"
              className={`absolute rounded-xl transition-all flex flex-col items-center justify-center p-0.5 ${
                canPlace || canResolve
                  ? 'cursor-pointer ring-4 ring-blue-400 bg-blue-500/30 shadow-lg scale-[1.03]'
                  : 'hover:bg-black/10'
              }`}
              style={{
                left: '49.34%',
                top: '40.49%',
                width: '12.5%',
                height: '16.01%',
              }}
            >
              <div className="bg-stone-950/80 border border-blue-500/50 rounded px-1.5 py-0.2 text-[9px] font-bold text-blue-300 mb-0.5 shadow">
                🔨 Outils (1)
              </div>
              {renderMeeples('tool_maker')}
              {(canPlace || canResolve) && (
                <span className="bg-blue-400 text-stone-950 font-black text-[8px] px-1 rounded shadow animate-pulse">
                  {canPlace ? '+ Poser' : '➔ Activer'}
                </span>
              )}
            </div>
          );
        })()}

        {/* 7. VILLAGE: FIELD (Champ d'Agriculture) */}
        {(() => {
          const { canPlace, canResolve } = getZoneStatus('field');
          return (
            <div
              onClick={() => (canPlace || canResolve) && onZoneClick('field')}
              title="Le Champ (+1 Agriculture)"
              className={`absolute rounded-xl transition-all flex flex-col items-center justify-center p-0.5 ${
                canPlace || canResolve
                  ? 'cursor-pointer ring-4 ring-amber-400 bg-amber-500/30 shadow-lg scale-[1.03]'
                  : 'hover:bg-black/10'
              }`}
              style={{
                left: '26.32%',
                top: '46.14%',
                width: '16.45%',
                height: '17.89%',
              }}
            >
              <div className="bg-stone-950/80 border border-amber-500/50 rounded px-1.5 py-0.2 text-[9px] font-bold text-amber-300 mb-0.5 shadow">
                🌾 Champ (1)
              </div>
              {renderMeeples('field')}
              {(canPlace || canResolve) && (
                <span className="bg-amber-400 text-stone-950 font-black text-[8px] px-1 rounded shadow animate-pulse">
                  {canPlace ? '+ Poser' : '➔ Cultiver'}
                </span>
              )}
            </div>
          );
        })()}

        {/* 8. VILLAGE: HUT (Hutte de Reproduction / 2 ouvriers) */}
        {(() => {
          const { canPlace, canResolve } = getZoneStatus('hut');
          return (
            <div
              onClick={() => (canPlace || canResolve) && onZoneClick('hut')}
              title="La Hutte (Reproduction : 2 ouvriers -> +1 nouvel ouvrier)"
              className={`absolute rounded-xl transition-all flex flex-col items-center justify-center p-0.5 ${
                canPlace || canResolve
                  ? 'cursor-pointer ring-4 ring-red-400 bg-red-500/30 shadow-lg scale-[1.03]'
                  : 'hover:bg-black/10'
              }`}
              style={{
                left: '34.87%',
                top: '59.32%',
                width: '11.84%',
                height: '16.01%',
              }}
            >
              <div className="bg-stone-950/80 border border-red-500/50 rounded px-1.5 py-0.2 text-[9px] font-bold text-red-300 mb-0.5 shadow">
                ❤️ Hutte (2)
              </div>
              {renderMeeples('hut')}
              {(canPlace || canResolve) && (
                <span className="bg-red-400 text-stone-950 font-black text-[8px] px-1 rounded shadow animate-pulse">
                  {canPlace ? '+ Poser 2' : '➔ Naissance'}
                </span>
              )}
            </div>
          );
        })()}

        {/* 9. BUILDING PILES (4 Bottom-Left Wooden Slots) */}
        <div
          className="absolute flex items-center justify-between gap-1 p-0.5"
          style={{
            left: '9.87%',
            top: '73.45%',
            width: '38.82%',
            height: '17.89%',
          }}
        >
          {state.buildingPiles.map((pile, idx) => {
            const locId = `building_${idx}` as BoardLocationId;
            const topTile = pile[pile.length - 1];
            const { canPlace, canResolve } = getZoneStatus(locId);

            if (!topTile) {
              return (
                <div
                  key={idx}
                  className="w-1/4 h-full rounded border border-dashed border-stone-800/80 bg-stone-950/40 flex items-center justify-center text-[9px] text-stone-600 italic"
                >
                  Épuisée
                </div>
              );
            }

            return (
              <div
                key={idx}
                onClick={() => (canPlace || canResolve) && onZoneClick(locId)}
                className={`relative w-1/4 h-full rounded transition-all flex flex-col justify-between ${
                  canPlace || canResolve
                    ? 'cursor-pointer ring-3 ring-amber-400 shadow-lg scale-105 z-10'
                    : ''
                }`}
              >
                <BuildingTileView tile={topTile} pileCount={pile.length} size="mini" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {renderMeeples(locId)}
                </div>
                {(canPlace || canResolve) && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 font-black text-[8px] px-1 rounded shadow pointer-events-none animate-pulse">
                    {canPlace ? '+' : '➔'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 10. CIVILIZATION CARDS (4 Bottom-Right Wooden Slots with 4, 3, 2, 1 costs) */}
        <div
          className="absolute flex items-center justify-between gap-1 p-0.5"
          style={{
            left: '51.32%',
            top: '64.97%',
            width: '43.42%',
            height: '26.37%',
          }}
        >
          {/* Card slots in official order: slot 3 (4 res), slot 2 (3 res), slot 1 (2 res), slot 0 (1 res) */}
          {[3, 2, 1, 0].map(slot => {
            const locId = `card_${slot}` as BoardLocationId;
            const card = state.activeCards[slot];
            const { canPlace, canResolve } = getZoneStatus(locId);
            const cost = slot + 1;

            if (!card) {
              return (
                <div
                  key={slot}
                  className="w-1/4 h-full rounded border border-dashed border-stone-800/80 bg-stone-950/40 flex items-center justify-center text-[9px] text-stone-600 italic"
                >
                  Vide
                </div>
              );
            }

            return (
              <div
                key={slot}
                onClick={() => (canPlace || canResolve) && onZoneClick(locId)}
                className={`relative w-1/4 h-full rounded transition-all flex flex-col justify-between ${
                  canPlace || canResolve
                    ? 'cursor-pointer ring-3 ring-emerald-400 shadow-lg scale-105 z-10'
                    : ''
                }`}
              >
                <CivilizationCardView card={card} cost={cost} size="mini" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {renderMeeples(locId)}
                </div>
                {(canPlace || canResolve) && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-stone-950 font-black text-[8px] px-1 rounded shadow pointer-events-none animate-pulse">
                    {canPlace ? '+' : '➔'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 11. AGRICULTURE TRACK MARKERS (Left strip 0 to 10) */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: '4.5%',
            top: '38%',
            width: '4%',
            height: '54%',
          }}
        >
          {state.players.map(p => {
            // Track height mapping: 0 at bottom (top: 90%), 10 at top (top: 5%)
            const topPct = 90 - (p.agriculture / 10) * 85;
            return (
              <div
                key={p.id}
                className="absolute transition-all duration-300 drop-shadow-md"
                style={{
                  top: `${topPct}%`,
                  left: '10%',
                }}
              >
                <MeepleIcon color={p.color} size={14} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
