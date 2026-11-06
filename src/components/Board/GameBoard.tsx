import React from 'react';
import { 
  BoardLocationId, 
  CivilizationCard, 
  GameState, 
  PlayerState, 
  ResourceType 
} from '../../types/game';
import { canPlaceMeeples, getLocationInfo, getZonePlayers, getZoneTotalMeeples } from '../../logic/gameEngine';
import { RESOURCE_NAMES, RESOURCE_VALUES } from '../../data/buildings';
import { MeepleIcon } from '../Meeples';
import { CivilizationCardView } from '../Cards/CivilizationCardView';
import { BuildingTileView } from '../Cards/BuildingTileView';
import { ResourceIcon } from '../Common/ResourceIcon';
import { 
  Dices, 
  Wheat, 
  Wrench, 
  Users, 
  Scroll, 
  Sparkles, 
  Flame, 
  Award 
} from 'lucide-react';

interface GameBoardProps {
  state: GameState;
  activePlayer: PlayerState;
  onZoneClick: (locationId: BoardLocationId) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  state,
  activePlayer,
  onZoneClick,
}) => {
  const isPlacement = state.phase === 'placement';
  const isResolution = state.phase === 'resolution';

  // Zone status helper
  const getZoneStatus = (locId: BoardLocationId) => {
    const totalMeeples = getZoneTotalMeeples(state, locId);
    const hasMyMeeples = (activePlayer.placements[locId] || 0) > 0;
    
    // In placement: can active player place here?
    const canPlace = isPlacement && !activePlayer.isAi && canPlaceMeeples(
      state, 
      activePlayer.id, 
      locId, 
      locId === 'hut' ? 2 : 1
    ).allowed;

    // In resolution: can active player resolve here?
    const canResolve = isResolution && !activePlayer.isAi && hasMyMeeples;

    return { totalMeeples, hasMyMeeples, canPlace, canResolve };
  };

  // Render meeples in zone
  const renderZoneMeeples = (locId: BoardLocationId) => {
    return (
      <div className="flex flex-wrap items-center gap-1.5 justify-center mt-1">
        {state.players.map(p => {
          const count = p.placements[locId] || 0;
          if (count === 0) return null;
          return (
            <div key={p.id} className="relative transition-transform duration-200 hover:scale-110">
              <MeepleIcon 
                color={p.color} 
                size={26} 
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
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* --- TOP ROW: NATURE & RESOURCES --- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Hunting Ground */}
        {(() => {
          const { canPlace, canResolve } = getZoneStatus('hunting');
          return (
            <div
              onClick={() => (canPlace || canResolve) && onZoneClick('hunting')}
              className={`relative rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between select-none ${
                canPlace || canResolve
                  ? 'cursor-pointer hover:border-amber-400 hover:scale-[1.02] bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border-amber-600/60 shadow-lg ring-2 ring-amber-500/30'
                  : 'bg-stone-900/80 border-stone-800'
              }`}
              style={{ minHeight: '140px' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wide text-amber-300 uppercase flex items-center gap-1.5">
                  <ResourceIcon type="food" size="xs" /> La Chasse
                </span>
                <span className="text-[10px] bg-stone-950 px-2 py-0.5 rounded-full border border-stone-800 text-stone-300 font-mono">
                  ÷2
                </span>
              </div>
              <div className="text-[11px] text-stone-400 my-1">
                Savane à mammouths. Illimité.
              </div>
              {renderZoneMeeples('hunting')}
              {(canPlace || canResolve) && (
                <div className="text-[10px] text-center font-bold text-amber-400 mt-2 bg-amber-500/10 rounded py-0.5 animate-pulse">
                  {canPlace ? '+ Poser ouvrier(s)' : '➔ Récolter (Dés)'}
                </div>
              )}
            </div>
          );
        })()}

        {/* Forest (Wood) */}
        {(() => {
          const { canPlace, canResolve, totalMeeples } = getZoneStatus('forest');
          return (
            <div
              onClick={() => (canPlace || canResolve) && onZoneClick('forest')}
              className={`relative rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between select-none ${
                canPlace || canResolve
                  ? 'cursor-pointer hover:border-amber-400 hover:scale-[1.02] bg-gradient-to-br from-emerald-950/40 via-stone-900 to-stone-950 border-emerald-600/60 shadow-lg ring-2 ring-emerald-500/30'
                  : 'bg-stone-900/80 border-stone-800'
              }`}
              style={{ minHeight: '140px' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wide text-emerald-300 uppercase flex items-center gap-1.5">
                  <ResourceIcon type="wood" size="xs" /> La Forêt
                </span>
                <span className="text-[10px] bg-stone-950 px-2 py-0.5 rounded-full border border-stone-800 text-stone-300 font-mono">
                  ÷3
                </span>
              </div>
              <div className="text-[11px] text-stone-400 my-1">
                Bois (valeur 3). Max 7 ({totalMeeples}/7).
              </div>
              {renderZoneMeeples('forest')}
              {(canPlace || canResolve) && (
                <div className="text-[10px] text-center font-bold text-emerald-400 mt-2 bg-emerald-500/10 rounded py-0.5 animate-pulse">
                  {canPlace ? '+ Poser ouvrier(s)' : '➔ Récolter (Dés)'}
                </div>
              )}
            </div>
          );
        })()}

        {/* Clay Pit (Clay) */}
        {(() => {
          const { canPlace, canResolve, totalMeeples } = getZoneStatus('clay_pit');
          return (
            <div
              onClick={() => (canPlace || canResolve) && onZoneClick('clay_pit')}
              className={`relative rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between select-none ${
                canPlace || canResolve
                  ? 'cursor-pointer hover:border-amber-400 hover:scale-[1.02] bg-gradient-to-br from-orange-950/40 via-stone-900 to-stone-950 border-orange-600/60 shadow-lg ring-2 ring-orange-500/30'
                  : 'bg-stone-900/80 border-stone-800'
              }`}
              style={{ minHeight: '140px' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wide text-orange-300 uppercase flex items-center gap-1.5">
                  <ResourceIcon type="clay" size="xs" /> La Glaisière
                </span>
                <span className="text-[10px] bg-stone-950 px-2 py-0.5 rounded-full border border-stone-800 text-stone-300 font-mono">
                  ÷4
                </span>
              </div>
              <div className="text-[11px] text-stone-400 my-1">
                Glaise (valeur 4). Max 7 ({totalMeeples}/7).
              </div>
              {renderZoneMeeples('clay_pit')}
              {(canPlace || canResolve) && (
                <div className="text-[10px] text-center font-bold text-orange-400 mt-2 bg-orange-500/10 rounded py-0.5 animate-pulse">
                  {canPlace ? '+ Poser ouvrier(s)' : '➔ Récolter (Dés)'}
                </div>
              )}
            </div>
          );
        })()}

        {/* Quarry (Stone) */}
        {(() => {
          const { canPlace, canResolve, totalMeeples } = getZoneStatus('quarry');
          return (
            <div
              onClick={() => (canPlace || canResolve) && onZoneClick('quarry')}
              className={`relative rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between select-none ${
                canPlace || canResolve
                  ? 'cursor-pointer hover:border-amber-400 hover:scale-[1.02] bg-gradient-to-br from-slate-900 via-stone-900 to-stone-950 border-slate-500/60 shadow-lg ring-2 ring-slate-400/30'
                  : 'bg-stone-900/80 border-stone-800'
              }`}
              style={{ minHeight: '140px' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wide text-slate-300 uppercase flex items-center gap-1.5">
                  <ResourceIcon type="stone" size="xs" /> La Carrière
                </span>
                <span className="text-[10px] bg-stone-950 px-2 py-0.5 rounded-full border border-stone-800 text-stone-300 font-mono">
                  ÷5
                </span>
              </div>
              <div className="text-[11px] text-stone-400 my-1">
                Pierre (valeur 5). Max 7 ({totalMeeples}/7).
              </div>
              {renderZoneMeeples('quarry')}
              {(canPlace || canResolve) && (
                <div className="text-[10px] text-center font-bold text-slate-300 mt-2 bg-slate-500/10 rounded py-0.5 animate-pulse">
                  {canPlace ? '+ Poser ouvrier(s)' : '➔ Récolter (Dés)'}
                </div>
              )}
            </div>
          );
        })()}

        {/* River (Gold) */}
        {(() => {
          const { canPlace, canResolve, totalMeeples } = getZoneStatus('river');
          return (
            <div
              onClick={() => (canPlace || canResolve) && onZoneClick('river')}
              className={`relative rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between select-none col-span-2 sm:col-span-1 ${
                canPlace || canResolve
                  ? 'cursor-pointer hover:border-amber-400 hover:scale-[1.02] bg-gradient-to-br from-yellow-950/40 via-stone-900 to-stone-950 border-yellow-500/60 shadow-lg ring-2 ring-yellow-400/30'
                  : 'bg-stone-900/80 border-stone-800'
              }`}
              style={{ minHeight: '140px' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wide text-yellow-300 uppercase flex items-center gap-1.5">
                  <ResourceIcon type="gold" size="xs" /> La Rivière
                </span>
                <span className="text-[10px] bg-stone-950 px-2 py-0.5 rounded-full border border-stone-800 text-stone-300 font-mono">
                  ÷6
                </span>
              </div>
              <div className="text-[11px] text-stone-400 my-1">
                Pépites d’or (valeur 6). Max 7 ({totalMeeples}/7).
              </div>
              {renderZoneMeeples('river')}
              {(canPlace || canResolve) && (
                <div className="text-[10px] text-center font-bold text-yellow-400 mt-2 bg-yellow-500/10 rounded py-0.5 animate-pulse">
                  {canPlace ? '+ Poser ouvrier(s)' : '➔ Récolter (Dés)'}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* --- MIDDLE ROW: LE VILLAGE PRÉHISTORIQUE --- */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/20 to-stone-900 border-2 border-stone-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <h4 className="text-xs font-black tracking-wider uppercase text-amber-400">
              Le Village Préhistorique
            </h4>
          </div>
          <span className="text-[11px] text-stone-400">
            {state.players.length <= 3 && !(state.variants.firstTurnCourtesy && state.round === 1)
              ? 'Max 2 emplacements par manche'
              : 'Tous emplacements ouverts'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Tool Maker */}
          {(() => {
            const { canPlace, canResolve } = getZoneStatus('tool_maker');
            return (
              <div
                onClick={() => (canPlace || canResolve) && onZoneClick('tool_maker')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col justify-between ${
                  canPlace || canResolve
                    ? 'cursor-pointer hover:border-blue-400 hover:scale-[1.02] bg-blue-950/30 border-blue-600/70 shadow-md ring-2 ring-blue-500/30'
                    : 'bg-stone-950/80 border-stone-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-stone-200">Fabricant d’outils</span>
                  </div>
                  <span className="text-[10px] bg-stone-900 px-1.5 py-0.5 rounded text-blue-300 font-semibold border border-stone-800">
                    1 ouvrier
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 my-1.5">
                  +1 niveau d'outil réutilisable chaque tour.
                </p>
                {renderZoneMeeples('tool_maker')}
                {(canPlace || canResolve) && (
                  <div className="text-[10px] text-center font-bold text-blue-400 mt-2 bg-blue-500/10 rounded py-0.5 animate-pulse">
                    {canPlace ? '+ Poser (1)' : '➔ Améliorer Outils'}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Love Hut */}
          {(() => {
            const { canPlace, canResolve } = getZoneStatus('hut');
            return (
              <div
                onClick={() => (canPlace || canResolve) && onZoneClick('hut')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col justify-between ${
                  canPlace || canResolve
                    ? 'cursor-pointer hover:border-red-400 hover:scale-[1.02] bg-red-950/30 border-red-600/70 shadow-md ring-2 ring-red-500/30'
                    : 'bg-stone-950/80 border-stone-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-bold text-stone-200">Hutte (Reproduction)</span>
                  </div>
                  <span className="text-[10px] bg-stone-900 px-1.5 py-0.5 rounded text-red-300 font-semibold border border-stone-800">
                    2 ouvriers
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 my-1.5">
                  +1 nouvel ouvrier pour la manche suivante (max 10).
                </p>
                {renderZoneMeeples('hut')}
                {(canPlace || canResolve) && (
                  <div className="text-[10px] text-center font-bold text-red-400 mt-2 bg-red-500/10 rounded py-0.5 animate-pulse">
                    {canPlace ? '+ Poser (2)' : '➔ Agrandir Tribu'}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Field / Agriculture */}
          {(() => {
            const { canPlace, canResolve } = getZoneStatus('field');
            return (
              <div
                onClick={() => (canPlace || canResolve) && onZoneClick('field')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col justify-between ${
                  canPlace || canResolve
                    ? 'cursor-pointer hover:border-amber-400 hover:scale-[1.02] bg-amber-950/30 border-amber-600/70 shadow-md ring-2 ring-amber-500/30'
                    : 'bg-stone-950/80 border-stone-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wheat className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-stone-200">Champ (Agriculture)</span>
                  </div>
                  <span className="text-[10px] bg-stone-900 px-1.5 py-0.5 rounded text-amber-300 font-semibold border border-stone-800">
                    1 ouvrier
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 my-1.5">
                  +1 niveau d'agriculture (1 blé passif chaque tour).
                </p>
                {renderZoneMeeples('field')}
                {(canPlace || canResolve) && (
                  <div className="text-[10px] text-center font-bold text-amber-400 mt-2 bg-amber-500/10 rounded py-0.5 animate-pulse">
                    {canPlace ? '+ Poser (1)' : '➔ Cultiver Champ'}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* --- BOTTOM ROW: CIVILIZATION CARDS & BUILDINGS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Civilization Cards Market */}
        <div className="bg-stone-900/90 border-2 border-stone-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scroll className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black tracking-wider uppercase text-emerald-400">
                Cartes Civilisation
              </h4>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">
              Pioche : {state.cardsDeck.length} restante(s)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[3, 2, 1, 0].map(slot => {
              const locId = `card_${slot}` as BoardLocationId;
              const card = state.activeCards[slot];
              const { canPlace, canResolve } = getZoneStatus(locId);

              if (!card) {
                return (
                  <div
                    key={slot}
                    className="bg-stone-950/40 border border-stone-800/60 rounded-xl p-2.5 text-center flex flex-col items-center justify-center min-h-[140px]"
                  >
                    <span className="text-stone-600 text-xs italic">Vide</span>
                  </div>
                );
              }

              return (
                <div
                  key={slot}
                  onClick={() => (canPlace || canResolve) && onZoneClick(locId)}
                  className={`relative rounded-xl border-2 transition-all flex flex-col justify-between text-left select-none p-1 ${
                    canPlace || canResolve
                      ? 'cursor-pointer ring-3 ring-emerald-400 border-emerald-500 shadow-md scale-[1.02]'
                      : 'border-stone-800'
                  }`}
                  style={{ minHeight: '140px' }}
                >
                  <CivilizationCardView card={card} cost={slot + 1} size="mini" />
                  <div className="mt-1">
                    {renderZoneMeeples(locId)}
                    {(canPlace || canResolve) && (
                      <div className="text-[10px] text-center font-bold text-emerald-400 mt-1 bg-emerald-500/10 rounded py-0.5 animate-pulse">
                        {canPlace ? '+ Réserver' : '➔ Acheter'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Building Piles */}
        <div className="bg-stone-900/90 border-2 border-stone-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ResourceIcon type="building" size="sm" />
              <h4 className="text-xs font-black tracking-wider uppercase text-amber-400">
                Piles de Bâtiments & Huttes
              </h4>
            </div>
            <span className="text-[11px] text-stone-400">
              {state.buildingPiles.filter(p => p.length === 0).length} / {state.buildingPiles.length} pile(s) vide(s)
            </span>
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-${state.buildingPiles.length} gap-2`}>
            {state.buildingPiles.map((pile, idx) => {
              const locId = `building_${idx}` as BoardLocationId;
              const topTile = pile[pile.length - 1];
              const { canPlace, canResolve } = getZoneStatus(locId);

              if (!topTile) {
                return (
                  <div
                    key={idx}
                    className="bg-stone-950/40 border border-dashed border-stone-800 rounded-xl p-2.5 text-center flex flex-col items-center justify-center min-h-[140px]"
                  >
                    <span className="text-stone-600 text-xs italic">Pile épuisée</span>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  onClick={() => (canPlace || canResolve) && onZoneClick(locId)}
                  className={`relative rounded-xl border-2 transition-all flex flex-col justify-between text-left select-none p-1 ${
                    canPlace || canResolve
                      ? 'cursor-pointer ring-3 ring-amber-400 border-amber-500 shadow-md scale-[1.02]'
                      : 'border-stone-800'
                  }`}
                  style={{ minHeight: '140px' }}
                >
                  <BuildingTileView tile={topTile} pileCount={pile.length} size="mini" />
                  <div className="mt-1">
                    {renderZoneMeeples(locId)}
                    {(canPlace || canResolve) && (
                      <div className="text-[10px] text-center font-bold text-amber-400 mt-1 bg-amber-500/10 rounded py-0.5 animate-pulse">
                        {canPlace ? '+ Réserver' : '➔ Construire'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
