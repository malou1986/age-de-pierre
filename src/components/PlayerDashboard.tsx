import React from 'react';
import { GameState, PlayerState, ResourceType } from '../types/game';
import { RESOURCE_NAMES } from '../data/buildings';
import { MeepleIcon } from './Meeples';
import { TribeHungerMeter } from './TribeHungerMeter';
import { ResourceIcon } from './Common/ResourceIcon';
import { 
  Crown, 
  Wheat, 
  Utensils, 
  Wrench, 
  Scroll, 
  Award, 
  Bot 
} from 'lucide-react';

interface PlayerDashboardProps {
  state: GameState;
  activePlayer: PlayerState;
  onSelectPlayer?: (playerId: string) => void;
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({
  state,
  activePlayer,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {state.players.map((p, idx) => {
          const isActive = p.id === activePlayer.id;
          const isFirst = idx === state.firstPlayerIndex;
          const totalTools = p.toolTiles.reduce((s, t) => s + t, 0);

          return (
            <div
              key={p.id}
              className={`rounded-2xl p-3 border-2 transition-all duration-200 relative ${
                isActive
                  ? 'bg-stone-900 border-amber-400 shadow-xl ring-2 ring-amber-400/40 scale-[1.01]'
                  : 'bg-stone-950/90 border-stone-800'
              }`}
            >
              {/* Header: Name, color, first player, AI badge */}
              <div className="flex items-center justify-between border-b border-stone-800/80 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <MeepleIcon color={p.color} size={22} />
                  <span className={`font-bold text-sm truncate max-w-[110px] ${
                    isActive ? 'text-amber-300' : 'text-stone-200'
                  }`}>
                    {p.name}
                  </span>
                  {p.isAi && (
                    <span className="p-0.5 bg-stone-800 rounded text-stone-400" title="Robot IA">
                      <Bot className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {isFirst && (
                    <span
                      title="Premier Joueur de la manche"
                      className="p-1 bg-amber-500/20 text-amber-400 rounded-md border border-amber-500/30"
                    >
                      <Crown className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <span className="bg-amber-500/10 text-amber-300 font-black text-xs px-2 py-0.5 rounded-full border border-amber-500/30">
                    {p.victoryPoints} VP
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-1.5 text-center text-xs mb-2.5">
                {/* Meeples */}
                <div className="bg-stone-900/90 p-1.5 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 block font-medium">Ouvriers</span>
                  <span className="font-bold text-stone-100">
                    {p.availableMeeples}
                    <span className="text-stone-400 text-[10px]">/{p.totalMeeples}</span>
                  </span>
                </div>

                {/* Food */}
                <div className="bg-stone-900/90 p-1.5 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 block font-medium">Nourriture</span>
                  <span className="font-bold text-amber-400 inline-flex items-center gap-1">
                    <ResourceIcon type="food" size="xs" />
                    <span>{p.food}</span>
                  </span>
                </div>

                {/* Agriculture */}
                <div className="bg-stone-900/90 p-1.5 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 block font-medium">Champs</span>
                  <span className="font-bold text-emerald-400 inline-flex items-center gap-1">
                    <ResourceIcon type="agriculture" size="xs" />
                    <span>{p.agriculture}</span>
                  </span>
                </div>

                {/* Tools */}
                <div className="bg-stone-900/90 p-1.5 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 block font-medium">Outils</span>
                  <span className="font-bold text-blue-400 inline-flex items-center gap-1">
                    <ResourceIcon type="tool" size="xs" />
                    <span>{totalTools}</span>
                  </span>
                </div>
              </div>

              {/* Tribe Hunger & Food Security Bar */}
              <div className="mb-2">
                <TribeHungerMeter player={p} compact />
              </div>

              {/* Resources bar */}
              <div className="grid grid-cols-4 gap-1 bg-stone-950 p-1.5 rounded-xl border border-stone-800/80 text-[11px] font-bold">
                <div className="flex items-center justify-center gap-1 text-[#C88A58]">
                  <ResourceIcon type="wood" size="xs" />
                  <span>{p.resources.wood}</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-[#E07A5F]">
                  <ResourceIcon type="clay" size="xs" />
                  <span>{p.resources.clay}</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-[#9CA3AF]">
                  <ResourceIcon type="stone" size="xs" />
                  <span>{p.resources.stone}</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-[#FBBF24]">
                  <ResourceIcon type="gold" size="xs" />
                  <span>{p.resources.gold}</span>
                </div>
              </div>

              {/* Cards and Buildings tally */}
              <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2 px-1">
                <span className="flex items-center gap-1">
                  <Scroll className="w-3 h-3 text-emerald-400" />
                  {p.civilizationCards.length} carte(s)
                </span>
                <span className="flex items-center gap-1">
                  <ResourceIcon type="building" size="xs" />
                  {p.buildings.length} hutte(s)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
