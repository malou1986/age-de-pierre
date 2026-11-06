import React, { useState } from 'react';
import { BoardLocationId, GameState, PlayerState } from '../../types/game';
import { TabletopCivilizationCard } from '../Cards/TabletopCivilizationCard';
import { TabletopBuildingTile } from '../Cards/TabletopBuildingTile';
import { ResourceIcon } from '../Common/ResourceIcon';
import { 
  Scroll, 
  ChevronLeft, 
  ChevronRight, 
  Coins, 
  Users, 
  Sparkles,
  Layers,
  Check
} from 'lucide-react';

interface SmallWorldRightBandeauProps {
  state: GameState;
  activePlayer: PlayerState;
  isOpen: boolean;
  onToggle: () => void;
  onZoneClick: (locationId: BoardLocationId) => void;
}

export const SmallWorldRightBandeau: React.FC<SmallWorldRightBandeauProps> = ({
  state,
  activePlayer,
  isOpen,
  onToggle,
  onZoneClick,
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'buildings'>('cards');
  const isPlacement = state.phase === 'placement';
  const isResolution = state.phase === 'resolution';

  const cardSlots: { slot: number; locId: BoardLocationId; cost: number }[] = [
    { slot: 3, locId: 'card_3', cost: 4 },
    { slot: 2, locId: 'card_2', cost: 3 },
    { slot: 1, locId: 'card_1', cost: 2 },
    { slot: 0, locId: 'card_0', cost: 1 },
  ];

  const buildingSlots: { pileIdx: number; locId: BoardLocationId }[] = [
    { pileIdx: 0, locId: 'building_0' },
    { pileIdx: 1, locId: 'building_1' },
    { pileIdx: 2, locId: 'building_2' },
    { pileIdx: 3, locId: 'building_3' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="relative h-full w-8 shrink-0 bg-stone-950/95 border-l border-amber-900/70 hover:bg-stone-900 flex flex-col items-center justify-center gap-2 text-amber-300 cursor-pointer shadow-lg transition-colors z-30 select-none py-2"
        title="Ouvrir le Marché des Cartes & Bâtiments"
      >
        <ChevronLeft className="w-4 h-4 text-amber-400 animate-pulse" />
        <Scroll className="w-3.5 h-3.5 text-amber-400" />
        <span className="[writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-wider text-amber-200">
          Marché Cartes ({state.activeCards.filter(Boolean).length})
        </span>
      </button>
    );
  }

  return (
    <aside
      className="relative h-full w-[240px] sm:w-[280px] shrink-0 flex flex-col justify-between bg-stone-950/95 backdrop-blur-2xl border-l-2 border-amber-900/70 shadow-2xl z-30 select-none overflow-hidden transition-all duration-300"
      style={{
        backgroundImage: 'radial-gradient(ellipse at top right, rgba(70, 40, 20, 0.25), transparent 70%)',
      }}
    >
      {/* Bandeau Header / Title & Toggle Tabs */}
      <div className="p-2 border-b border-stone-800/80 bg-gradient-to-l from-stone-900 to-stone-950 shrink-0 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/60 flex items-center justify-center">
              <Scroll className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-amber-200">
                Marché Dédié
              </h2>
              <p className="text-[9px] text-stone-400">
                Vue large & lisible smartphone
              </p>
            </div>
          </div>

          <button
            onClick={onToggle}
            className="p-1 rounded-lg bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 cursor-pointer transition-colors"
            title="Masquer le panneau latéral"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers: Cartes Civilisation vs Bâtiments */}
        <div className="flex gap-1 p-0.5 bg-stone-900/90 rounded-lg border border-stone-800">
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex-1 py-1 px-1 rounded-md text-[10px] font-black flex items-center justify-center gap-1 transition-all ${
              activeTab === 'cards'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Scroll className="w-3 h-3" />
            <span>Cartes ({state.activeCards.filter(Boolean).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('buildings')}
            className={`flex-1 py-1 px-1 rounded-md text-[10px] font-black flex items-center justify-center gap-1 transition-all ${
              activeTab === 'buildings'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ResourceIcon type="building" size="xs" />
            <span>Huttes ({state.buildingPiles.flat().length})</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2 custom-scrollbar">
        {activeTab === 'cards' ? (
          <div className="space-y-2">
            {cardSlots.map(({ slot, locId, cost }) => {
              const card = state.activeCards[slot];

              const placedEntries = state.players
                .map(p => ({ player: p, count: p.placements[locId] || 0 }))
                .filter(e => e.count > 0);

              const hasMyMeeple = (activePlayer.placements[locId] || 0) > 0;
              const canInteract = 
                (isPlacement && !activePlayer.isAi && placedEntries.length === 0 && activePlayer.availableMeeples > 0) ||
                (isResolution && !activePlayer.isAi && hasMyMeeple);

              return (
                <div
                  key={locId}
                  className={`relative rounded-xl p-2 border transition-all duration-200 flex flex-col justify-between ${
                    hasMyMeeple && isResolution
                      ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-400 shadow-amber-500/20'
                      : canInteract
                      ? 'bg-stone-900/90 border-amber-500/60 hover:border-amber-400 shadow-md'
                      : 'bg-stone-900/60 border-stone-800'
                  }`}
                >
                  {/* Top Bar: Slot and Cost */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-950 text-amber-300 font-black text-[9px] border border-amber-900/60 shadow-xs">
                      <Coins className="w-2.5 h-2.5 text-amber-400" />
                      <span>Emplacement #{cost} • Coût : {cost} ress.</span>
                    </span>

                    {/* Placed Meeple Badge */}
                    {placedEntries.length > 0 ? (
                      <div className="flex items-center gap-1">
                        {placedEntries.map(({ player, count }) => (
                          <span
                            key={player.id}
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black border shadow-xs ${
                              player.color === 'red' ? 'bg-red-950 text-red-200 border-red-600' :
                              player.color === 'blue' ? 'bg-blue-950 text-blue-200 border-blue-600' :
                              player.color === 'yellow' ? 'bg-amber-950 text-amber-200 border-amber-500' :
                              'bg-emerald-950 text-emerald-200 border-emerald-600'
                            }`}
                          >
                            <Users className="w-2.5 h-2.5" />
                            <span>{player.name} ({count})</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[9px] text-emerald-400/90 font-bold">Libre</span>
                    )}
                  </div>

                  {/* Card Content Row */}
                  {card ? (
                    <div className="flex items-start gap-2">
                      <div className="w-16 h-24 sm:w-20 sm:h-28 shrink-0">
                        <TabletopCivilizationCard 
                          card={card} 
                          cost={cost} 
                          showCost={true}
                          isInteractive={canInteract}
                          onClick={() => onZoneClick(locId)}
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="text-[11px] font-black text-amber-200 truncate">
                          {card.name}
                        </div>
                        <div className="text-[9px] text-stone-300 bg-stone-950/80 p-1 rounded border border-stone-800 leading-tight">
                          <span className="text-amber-400 font-bold block text-[8px] uppercase">Gain Immédiat :</span>
                          {card.topBonus.description}
                        </div>
                        <div className="text-[9px] text-stone-300 bg-stone-950/80 p-1 rounded border border-stone-800 leading-tight">
                          <span className="text-emerald-400 font-bold block text-[8px] uppercase">Fin de Partie :</span>
                          {card.bottomBonus.description}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-stone-600 text-[10px] italic">
                      Emplacement vide
                    </div>
                  )}

                  {/* Tactile 1-Tap Action Button */}
                  {canInteract && (
                    <button
                      onClick={() => onZoneClick(locId)}
                      className={`w-full mt-2 py-1.5 px-2 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer ${
                        isPlacement
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 hover:from-amber-400 hover:to-amber-500'
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-stone-950 hover:from-emerald-400 hover:to-emerald-500 animate-pulse'
                      }`}
                    >
                      {isPlacement ? (
                        <>
                          <span>➕ Poser 1 Ouvrier</span>
                          <span className="text-[10px] opacity-80">(Coût : {cost} ress.)</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Acheter & Récupérer</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {buildingSlots.map(({ pileIdx, locId }) => {
                const pile = state.buildingPiles[pileIdx] || [];
                const topTile = pile[pile.length - 1];

                const placedEntries = state.players
                  .map(p => ({ player: p, count: p.placements[locId] || 0 }))
                  .filter(e => e.count > 0);

                const hasMyMeeple = (activePlayer.placements[locId] || 0) > 0;
                const canInteract = 
                  (isPlacement && !activePlayer.isAi && placedEntries.length === 0 && activePlayer.availableMeeples > 0) ||
                  (isResolution && !activePlayer.isAi && hasMyMeeple);

                return (
                  <div
                    key={locId}
                    onClick={() => canInteract && onZoneClick(locId)}
                    className={`relative rounded-xl p-2 border transition-all duration-200 flex flex-col justify-between ${
                      canInteract ? 'cursor-pointer hover:border-amber-400 hover:scale-[1.02] shadow-md' : 'opacity-85'
                    } ${
                      hasMyMeeple && isResolution
                        ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-400 shadow-amber-500/20'
                        : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-amber-300">
                        Pile {pileIdx + 1}
                      </span>
                      <span className="text-[9px] px-1 rounded bg-stone-950 text-stone-400 font-bold border border-stone-800">
                        x{pile.length}
                      </span>
                    </div>

                    {topTile ? (
                      <div className="flex flex-col items-center text-center">
                        <div className="w-18 h-18 sm:w-20 sm:h-20 mx-auto my-0.5">
                          <TabletopBuildingTile
                            tile={topTile}
                            pileCount={pile.length}
                            size="compact"
                          />
                        </div>
                        <span className="text-[9px] font-semibold text-stone-300 line-clamp-1 mt-0.5">
                          {topTile.description}
                        </span>
                      </div>
                    ) : (
                      <div className="py-4 text-center text-stone-600 text-[10px] italic">
                        Pile épuisée
                      </div>
                    )}

                    {/* Meeple Badge on Building Pile */}
                    {placedEntries.length > 0 && (
                      <div className="mt-1 flex justify-center">
                        {placedEntries.map(({ player, count }) => (
                          <span
                            key={player.id}
                            className={`px-1.5 py-0.2 rounded-full text-[9px] font-black border ${
                              player.color === 'red' ? 'bg-red-950 text-red-200 border-red-600' :
                              player.color === 'blue' ? 'bg-blue-950 text-blue-200 border-blue-600' :
                              player.color === 'yellow' ? 'bg-amber-950 text-amber-200 border-amber-500' :
                              'bg-emerald-950 text-emerald-200 border-emerald-600'
                            }`}
                          >
                            {player.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
