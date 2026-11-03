import React from 'react';
import { BuildingTile, ResourceType } from '../../types/game';
import { RESOURCE_NAMES, RESOURCE_VALUES } from '../../data/buildings';
import { ResourceIcon } from '../Common/ResourceIcon';

interface BuildingTileViewProps {
  tile: BuildingTile;
  pileCount?: number;
  size?: 'mini' | 'normal' | 'large';
  className?: string;
}

export const BuildingTileView: React.FC<BuildingTileViewProps> = ({
  tile,
  pileCount,
  size = 'normal',
  className = '',
}) => {
  const isMini = size === 'mini';

  // Calculate fixed VP if fixed cost
  const fixedVp = tile.costType === 'fixed' && tile.fixedCost
    ? (Object.entries(tile.fixedCost) as [ResourceType, number][]).reduce(
        (sum, [r, qty]) => sum + qty * RESOURCE_VALUES[r],
        0
      )
    : null;

  // Render cost requirement badges
  const renderCostBadges = () => {
    if (tile.costType === 'fixed' && tile.fixedCost) {
      return (
        <div className="flex flex-wrap items-center justify-center gap-1">
          {(Object.entries(tile.fixedCost) as [ResourceType, number][]).map(([r, qty]) => (
            <span
              key={r}
              className="inline-flex items-center gap-1 bg-stone-900 px-1.5 py-0.5 rounded-lg text-xs font-bold border border-stone-700 text-stone-200"
            >
              <span>{RESOURCE_NAMES[r].icon}</span>
              <span>{qty}</span>
            </span>
          ))}
        </div>
      );
    }

    if (tile.costType === 'any_1_to_7') {
      return (
        <div className="inline-flex items-center gap-1 bg-amber-950/70 border border-amber-700 px-2 py-0.5 rounded-lg text-amber-300 text-xs font-bold">
          <span>1 à 7 au choix</span>
          <span className="text-stone-400">🪵🧱🪨✨</span>
        </div>
      );
    }

    if (tile.costType === 'variable') {
      const count = tile.resourceCount || 4;
      const types = tile.differentTypesRequired || 1;
      return (
        <div className="inline-flex items-center gap-1 bg-stone-900 border border-amber-500/80 px-2 py-0.5 rounded-lg text-amber-200 text-xs font-bold shadow">
          <span>{count} ressources</span>
          <span className="text-stone-400">({types} type{types > 1 ? 's diff.' : ' unique'})</span>
        </div>
      );
    }

    if (tile.costType === '4_different') {
      return (
        <div className="inline-flex items-center gap-1 bg-stone-900 border border-emerald-600 px-2 py-0.5 rounded-lg text-emerald-300 text-xs font-bold">
          <span>4 types différents</span>
          <span>(1B+1G+1P+1Or)</span>
        </div>
      );
    }

    if (tile.costType === '5_different') {
      return (
        <div className="inline-flex items-center gap-1 bg-stone-900 border border-amber-600 px-2 py-0.5 rounded-lg text-amber-300 text-xs font-bold">
          <span>5 ressources au choix</span>
        </div>
      );
    }

    if (tile.costType === '2_types_x2') {
      return (
        <div className="inline-flex items-center gap-1 bg-stone-900 border border-indigo-600 px-2 py-0.5 rounded-lg text-indigo-300 text-xs font-bold">
          <span>2x2 types (Ex: 2B + 2P)</span>
        </div>
      );
    }

    return null;
  };

  // Mini board version (shows authentic tile image + pile counter)
  if (isMini) {
    return (
      <div 
        className={`relative w-full h-full rounded-md overflow-hidden select-none border border-amber-600/60 shadow-lg group hover:border-amber-400 transition-all ${className}`}
        style={{
          backgroundImage: tile.imageUrl ? `url(${tile.imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#1c1917',
        }}
      >
        {/* If no image fallback */}
        {!tile.imageUrl && (
          <div className="p-1 h-full flex flex-col justify-between bg-stone-900 text-[9px] text-center">
            <span className="font-bold text-amber-300">Hutte</span>
            <span className="text-stone-300">{fixedVp !== null ? `+${fixedVp} VP` : 'VP'}</span>
          </div>
        )}

        {/* Pile count pill */}
        {pileCount !== undefined && (
          <div className="absolute top-0.5 right-0.5 bg-stone-950/90 text-amber-300 border border-amber-500/80 px-1 py-0.2 rounded font-black text-[9px] shadow leading-none font-mono">
            {pileCount}
          </div>
        )}

        {/* Bottom VP banner */}
        <div className="absolute bottom-0 inset-x-0 bg-stone-950/85 backdrop-blur-[1px] px-1 py-0.2 text-[8px] font-black text-center truncate border-t border-stone-800 text-amber-300">
          {fixedVp !== null ? `+${fixedVp} VP` : 'VP = Valeur'}
        </div>
      </div>
    );
  }

  // Full / Modal version
  return (
    <div className={`rounded-3xl border-2 border-amber-600/80 bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-950 shadow-2xl p-4 select-none relative overflow-hidden flex flex-col justify-between ${className}`}>
      {/* Texture background */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800/80 pb-2 relative z-10">
        <div className="flex items-center gap-2">
          <ResourceIcon type="building" size="md" className="w-6 h-6 drop-shadow" />
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block">
              Tuile Bâtiment Authentique
            </span>
            <h4 className="text-base sm:text-lg font-black text-stone-100">
              Hutte Préhistorique
            </h4>
          </div>
        </div>

        {pileCount !== undefined && (
          <span className="bg-stone-800 text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-stone-700 font-mono font-bold">
            {pileCount} restantes
          </span>
        )}
      </div>

      {/* Tile preview + requirements */}
      <div className="my-3 flex items-center gap-4 relative z-10">
        {tile.imageUrl && (
          <div className="w-20 sm:w-24 shrink-0 rounded-xl overflow-hidden border-2 border-stone-700 shadow-lg">
            <img src={tile.imageUrl} alt="Hutte" className="w-full h-auto object-cover" />
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold mb-1">
                Matériaux Requis
              </span>
              {renderCostBadges()}
            </div>

            <div className="text-right min-w-[70px]">
              <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-black">
                Gain
              </span>
              <span className="text-2xl font-black text-amber-300">
                {fixedVp !== null ? `+${fixedVp}` : 'Variable'}
              </span>
              <span className="text-[10px] text-stone-400 block">
                {fixedVp !== null ? 'Points de Victoire' : 'selon matériaux'}
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-300 text-center font-medium">
            {tile.description}
          </p>
        </div>
      </div>
    </div>
  );
};
