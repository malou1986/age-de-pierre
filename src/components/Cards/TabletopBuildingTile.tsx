import React from 'react';
import { BuildingTile, ResourceType } from '../../types/game';
import { RESOURCE_VALUES } from '../../data/buildings';
import { ResourceIcon } from '../Common/ResourceIcon';

interface TabletopBuildingTileProps {
  tile: BuildingTile;
  pileCount?: number;
  isInteractive?: boolean;
  size?: 'compact' | 'large';
  onClick?: () => void;
  className?: string;
}

// Fallback thematic image helper for prehistoric building tiles
const getBuildingArtwork = (tile: BuildingTile): string => {
  if (tile.imageUrl && tile.imageUrl.startsWith('/buildings/peps/')) {
    return tile.imageUrl;
  }
  if (tile.costType === 'any_1_to_7') {
    return '/buildings/peps/tile_stone_megalith.jpg';
  }
  if (tile.costType === 'variable') {
    return '/buildings/peps/tile_modular_compound.jpg';
  }
  if (tile.fixedCost) {
    if (tile.fixedCost.gold || (tile.fixedCost.stone && tile.fixedCost.stone >= 2)) {
      return '/buildings/peps/tile_stone_megalith.jpg';
    }
    if (tile.fixedCost.clay && tile.fixedCost.clay >= 2) {
      return '/buildings/peps/tile_masonry_clay.jpg';
    }
  }
  return '/buildings/peps/tile_hut_wood.jpg';
};

export const TabletopBuildingTile: React.FC<TabletopBuildingTileProps> = ({
  tile,
  pileCount,
  isInteractive = false,
  size = 'compact',
  onClick,
  className = '',
}) => {
  const artSrc = getBuildingArtwork(tile);
  const isLarge = size === 'large';

  // Calculate fixed VP if fixed cost
  const fixedVp = tile.costType === 'fixed' && tile.fixedCost
    ? (Object.entries(tile.fixedCost) as [ResourceType, number][]).reduce(
        (sum, [r, qty]) => sum + qty * RESOURCE_VALUES[r],
        0
      )
    : null;

  // --------------------------------------------------------------------------
  // VISUAL BLUEPRINT: Renders the explicit cost schema (fixed or variable)
  // --------------------------------------------------------------------------
  const renderCostBlueprint = () => {
    // 1. Fixed Cost: Exactly shows the 3D resource logos and quantities
    if (tile.costType === 'fixed' && tile.fixedCost) {
      const entries = Object.entries(tile.fixedCost) as [ResourceType, number][];
      return (
        <div className="flex items-center justify-center gap-1.5 bg-stone-950/92 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-amber-500/70 shadow-[0_2px_6px_rgba(0,0,0,0.9)] max-w-full">
          {entries.map(([r, qty]) => (
            <div key={r} className="flex items-center gap-0.5">
              <ResourceIcon type={r} size={isLarge ? 'sm' : 'xs'} />
              {qty > 1 && (
                <span className={`font-black text-amber-200 ${isLarge ? 'text-xs' : 'text-[9px]'}`}>
                  x{qty}
                </span>
              )}
            </div>
          ))}
        </div>
      );
    }

    // 2. Any 1 to 7 Resources
    if (tile.costType === 'any_1_to_7') {
      return (
        <div className="flex flex-col items-center justify-center bg-stone-950/92 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-amber-500/70 shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-1">
            <span className={`font-black text-amber-300 ${isLarge ? 'text-sm' : 'text-[10px]'}`}>
              1 → 7
            </span>
            <div className="flex items-center -space-x-1">
              <ResourceIcon type="wood" size="xs" />
              <ResourceIcon type="clay" size="xs" />
              <ResourceIcon type="stone" size="xs" />
              <ResourceIcon type="gold" size="xs" />
            </div>
          </div>
          <span className={`font-bold text-stone-300 tracking-tight ${isLarge ? 'text-[9px]' : 'text-[7px]'}`}>
            au choix (? PV)
          </span>
        </div>
      );
    }

    // 3. Variable Cost: "N ressources de M types différents"
    const count = tile.resourceCount || 4;
    const types = tile.differentTypesRequired || 1;

    // Distinct palette for type grouping (wooden/stone colored cubes)
    const TYPE_GROUPS = [
      { bg: 'bg-amber-500', border: 'border-amber-300', text: 'text-stone-950', label: 'A' },
      { bg: 'bg-sky-500', border: 'border-sky-300', text: 'text-stone-950', label: 'B' },
      { bg: 'bg-emerald-500', border: 'border-emerald-300', text: 'text-stone-950', label: 'C' },
      { bg: 'bg-purple-500', border: 'border-purple-300', text: 'text-stone-950', label: 'D' },
    ];

    // Compute distribution of count into types distinct groups (e.g. 4 into 2 -> [2, 2]; 5 into 2 -> [3, 2]; 4 into 3 -> [2, 1, 1])
    const distribution: number[] = [];
    const base = Math.floor(count / types);
    const remainder = count % types;
    for (let t = 0; t < types; t++) {
      distribution.push(base + (t === 0 ? remainder : 0));
    }

    return (
      <div className="flex flex-col items-center justify-center gap-0.5 bg-stone-950/92 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-amber-500/70 shadow-[0_2px_6px_rgba(0,0,0,0.9)] max-w-full">
        {/* Visual Partition of Cubes grouped by distinct type */}
        <div className="flex items-center gap-1">
          {distribution.map((grpCount, gIdx) => (
            <div key={gIdx} className="flex items-center gap-0.5">
              {Array.from({ length: grpCount }).map((_, cIdx) => (
                <div
                  key={cIdx}
                  className={`rounded-xs border shadow-xs flex items-center justify-center ${
                    TYPE_GROUPS[gIdx].bg
                  } ${TYPE_GROUPS[gIdx].border} ${
                    isLarge ? 'w-3.5 h-3.5' : 'w-2 h-2'
                  }`}
                  title={`Emplacement groupe type #${gIdx + 1}`}
                />
              ))}
              {gIdx < distribution.length - 1 && (
                <span className={`text-stone-400 font-bold ${isLarge ? 'text-[9px]' : 'text-[7px]'} leading-none`}>
                  +
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Clear Formula Text */}
        <div className="flex items-center gap-1 font-black leading-none tracking-tight">
          <span className={`text-amber-200 ${isLarge ? 'text-xs' : 'text-[8px]'}`}>
            {count} res.
          </span>
          <span className="text-stone-500 text-[8px]">•</span>
          <span className={`text-amber-400 ${isLarge ? 'text-xs' : 'text-[8px]'}`}>
            {types === 1 ? '1 seul type' : `${types} types diff.`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`group relative w-full h-full flex flex-col justify-between rounded-xl overflow-hidden select-none transition-all duration-200 ${
        isInteractive 
          ? 'cursor-pointer hover:-translate-y-2 hover:scale-[1.04] shadow-[0_16px_30px_rgba(245,158,11,0.7)] ring-2 ring-amber-400' 
          : 'shadow-[0_8px_18px_rgba(0,0,0,0.85)] hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.95)]'
      } ${className}`}
      style={{
        backgroundColor: '#22150e',
        border: '2px solid rgba(180, 105, 30, 0.85)',
        boxShadow: `0 6px 16px rgba(0,0,0,0.85)${
          pileCount && pileCount > 1 
            ? `, 0 3px 0 #180f0a, 0 6px 0 #0d0704, 0 10px 18px rgba(0,0,0,0.9)` 
            : ''
        }`,
      }}
      title={`${tile.description}${pileCount !== undefined ? `\n• Pile de tuiles : ${pileCount} restante(s)` : ''}\n(Cliquer pour inspecter la tuile)`}
    >
      {/* 1. HIGH-RES DIGITAL BUILDING ARTWORK */}
      <img
        src={artSrc}
        alt={tile.description}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none filter contrast-[1.05] saturate-[1.10]"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/buildings/peps/tile_hut_wood.jpg';
        }}
      />

      {/* 2. SUBTLE CARD EDGE VIGNETTE */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/60 pointer-events-none" />

      {/* Special Hut Extension Glow / Badge */}
      {tile.isSpecialHut && (
        <div className="absolute inset-0 pointer-events-none rounded-xl ring-2 ring-purple-400/80 shadow-[inset_0_0_12px_rgba(168,85,247,0.4)]" />
      )}

      {/* 3. TOP ROW: Pile Count & Victory Points */}
      <div className="relative z-10 p-1 flex items-center justify-between w-full pointer-events-none">
        {/* Pile count chip */}
        <div className="flex items-center gap-0.5 bg-stone-950/85 px-1.5 py-0.2 rounded-full border border-stone-700/80 text-[7px] sm:text-[8px] font-black text-amber-300 drop-shadow">
          <ResourceIcon type="building" size="xs" className="w-2.5 h-2.5 drop-shadow" />
          <span>{pileCount !== undefined ? pileCount : 1}</span>
        </div>

        {/* Special Hut Power Chip */}
        {tile.isSpecialHut && (
          <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 border border-purple-400 text-purple-200 px-1.5 py-0.2 rounded-full text-[7px] sm:text-[8px] font-black shadow-md flex items-center gap-0.5 animate-pulse">
            <span>✨</span>
            <span>
              {tile.passiveHutType === 'wood_quarry' ? '+1 🪵/tour' :
               tile.passiveHutType === 'clay_kiln' ? '+1 🧱/tour' :
               tile.passiveHutType === 'stone_shed' ? '+1 🪨/tour' :
               tile.passiveHutType === 'kindergarten' ? '+1 👥' :
               tile.passiveHutType === 'workshop_forge' ? '+1 🔨' :
               tile.passiveHutType === 'greenhouse' ? '+1 🌾' : 'Pouvoir'}
            </span>
          </div>
        )}

        {/* Victory Points seal */}
        {fixedVp !== null ? (
          <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-stone-950 font-black px-1.5 py-0.2 rounded-full text-[8px] sm:text-[9px] shadow-[0_2px_6px_rgba(0,0,0,0.8)] border border-yellow-200 flex items-center gap-0.5 shrink-0">
            <span>⭐</span>
            <span>+{fixedVp} PV</span>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-stone-800 to-stone-900 text-amber-300 font-black px-1.5 py-0.2 rounded-full text-[8px] sm:text-[9px] shadow border border-amber-500/50 flex items-center gap-0.5 shrink-0">
            <span>⭐</span>
            <span>? PV</span>
          </div>
        )}
      </div>

      {/* 4. BOTTOM ROW: Visual Cost Blueprint */}
      <div className="relative z-10 p-1 flex items-center justify-center w-full pointer-events-none">
        {renderCostBlueprint()}
      </div>
    </div>
  );
};
