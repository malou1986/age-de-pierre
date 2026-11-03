import React, { useState } from 'react';
import { BoardLocationId, BuildingTile, PlayerState, ResourceType } from '../../types/game';
import { RESOURCE_NAMES, RESOURCE_VALUES } from '../../data/buildings';
import { sound } from '../../logic/audio';
import { BuildingTileView } from '../Cards/BuildingTileView';
import { TabletopBuildingTile } from '../Cards/TabletopBuildingTile';
import { canPlayerAffordBuilding } from '../../logic/ai';
import { ResourceIcon } from '../Common/ResourceIcon';
import { Award, Plus, Minus, ArrowRight, X, AlertCircle, Undo2 } from 'lucide-react';

interface BuildingPurchaseModalProps {
  locationId: BoardLocationId;
  tile: BuildingTile;
  player: PlayerState;
  onConfirm: (resourcesPaid: Record<ResourceType, number>) => void;
  onForfeit: () => void;
  onClose: () => void;
  isModern?: boolean;
}

export const BuildingPurchaseModal: React.FC<BuildingPurchaseModalProps> = ({
  locationId,
  tile,
  player,
  onConfirm,
  onForfeit,
  onClose,
  isModern = false,
}) => {
  // Prepopulate if fixed cost
  const [selected, setSelected] = useState<Record<ResourceType, number>>(() => {
    if (tile.costType === 'fixed' && tile.fixedCost) {
      return {
        wood: tile.fixedCost.wood || 0,
        clay: tile.fixedCost.clay || 0,
        stone: tile.fixedCost.stone || 0,
        gold: tile.fixedCost.gold || 0,
      };
    }
    return { wood: 0, clay: 0, stone: 0, gold: 0 };
  });

  const totalSelected = Object.values(selected).reduce((s, c) => s + c, 0);
  const canAfford = canPlayerAffordBuilding(player, tile);

  // Calculate live VP
  const vpEarned = (['wood', 'clay', 'stone', 'gold'] as ResourceType[]).reduce(
    (sum, r) => sum + selected[r] * RESOURCE_VALUES[r],
    0
  );

  // Validate requirement
  const isValid = (): boolean => {
    // Check player has enough resources in stock
    for (const r of ['wood', 'clay', 'stone', 'gold'] as ResourceType[]) {
      if (selected[r] > player.resources[r]) return false;
    }

    if (tile.costType === 'fixed' && tile.fixedCost) {
      return (
        selected.wood === (tile.fixedCost.wood || 0) &&
        selected.clay === (tile.fixedCost.clay || 0) &&
        selected.stone === (tile.fixedCost.stone || 0) &&
        selected.gold === (tile.fixedCost.gold || 0)
      );
    }

    if (tile.costType === 'any_1_to_7') {
      return totalSelected >= 1 && totalSelected <= 7;
    }

    if (tile.costType === 'variable') {
      const requiredTotal = tile.resourceCount || 4;
      const requiredTypes = tile.differentTypesRequired || 1;
      const typesCount = (['wood', 'clay', 'stone', 'gold'] as ResourceType[]).filter(r => selected[r] > 0).length;
      return totalSelected === requiredTotal && typesCount === requiredTypes;
    }

    if (tile.costType === '4_different') {
      return (
        selected.wood === 1 &&
        selected.clay === 1 &&
        selected.stone === 1 &&
        selected.gold === 1
      );
    }

    if (tile.costType === '5_different') {
      return totalSelected === 5;
    }

    if (tile.costType === '2_types_x2') {
      const counts = Object.values(selected).filter(c => c > 0);
      return counts.length === 2 && counts[0] === 2 && counts[1] === 2;
    }

    return false;
  };

  const handleAdd = (r: ResourceType) => {
    if (selected[r] < player.resources[r]) {
      setSelected({ ...selected, [r]: selected[r] + 1 });
      sound.playTool();
    }
  };

  const handleRemove = (r: ResourceType) => {
    if (selected[r] > 0) {
      setSelected({ ...selected, [r]: selected[r] - 1 });
      sound.playTool();
    }
  };

  const handleBuild = () => {
    if (isValid()) {
      sound.playPurchase();
      onConfirm(selected);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border-2 border-amber-600/80 rounded-2xl max-w-lg landscape:max-w-2xl w-full p-2.5 sm:p-4 landscape:p-2.5 text-stone-100 shadow-2xl space-y-1.5 sm:space-y-3 max-h-[94vh] sm:max-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-1 sm:pb-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 sm:p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 flex items-center justify-center">
              <ResourceIcon type="building" size="sm" />
            </span>
            <div>
              <h3 className="text-xs sm:text-base font-black text-amber-200 leading-tight">
                Construire la Hutte Préhistorique
              </h3>
              <p className="text-[9px] sm:text-[10px] text-stone-400">
                Payez les matériaux nécessaires pour remporter les Points de Victoire.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Fermer la fenêtre"
            className="p-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Responsive Content: 2-column on landscape */}
        <div className="grid grid-cols-1 landscape:grid-cols-2 md:landscape:grid-cols-2 gap-2 sm:gap-3 items-center flex-1 min-h-0 overflow-y-auto pr-0.5">
          {/* Left Column: Tile Preview & Score Banner */}
          <div className="flex flex-col items-center justify-center space-y-2">
            {isModern ? (
              <div className="w-28 h-28 sm:w-36 sm:h-36 shadow-xl">
                <TabletopBuildingTile tile={tile} size="large" />
              </div>
            ) : (
              <BuildingTileView tile={tile} size="normal" />
            )}

            <div className="px-3 py-1 bg-stone-950/80 rounded-lg border border-amber-500/40 text-center">
              <span className="text-[10px] text-stone-400 block">Gain de construction</span>
              <span className="text-base font-black text-amber-300">+{vpEarned} VP</span>
            </div>
          </div>

          {/* Right Column: Resource Payment Selector & Actions */}
          <div className="flex flex-col justify-between space-y-2">
            {/* Warning if player cannot afford */}
            {!canAfford && (
              <div className="bg-red-950/60 border border-red-700/80 p-2 rounded-xl flex items-start gap-1.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  Matériaux insuffisants en stock pour cette hutte. Vous pouvez renoncer et récupérer votre ouvrier sans pénalité.
                </span>
              </div>
            )}

            {/* Resources payment selector */}
            {canAfford && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-300 font-medium">Fournir les matériaux :</span>
                  <span className="font-bold text-amber-400">Total : {vpEarned} VP</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {(['wood', 'clay', 'stone', 'gold'] as ResourceType[]).map(r => {
                    const available = player.resources[r];
                    const sel = selected[r];
                    const meta = RESOURCE_NAMES[r];
                    const val = RESOURCE_VALUES[r];

                    return (
                      <div
                        key={r}
                        className="bg-stone-950 border border-stone-800 rounded-lg p-1.5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{meta.icon}</span>
                          <div>
                            <div className="text-[11px] font-bold text-stone-200">
                              {meta.name} <span className="text-stone-500 text-[9px]">({val}VP)</span>
                            </div>
                            <div className="text-[9px] text-stone-400">Stock : {available}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRemove(r)}
                            disabled={sel === 0}
                            className="w-6 h-6 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed rounded flex items-center justify-center text-stone-200 font-bold cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-4 text-center font-bold text-xs text-amber-400">{sel}</span>
                          <button
                            onClick={() => handleAdd(r)}
                            disabled={sel >= available}
                            className="w-6 h-6 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed rounded flex items-center justify-center text-stone-200 font-bold cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions buttons */}
            <div className="pt-1 flex gap-1.5">
              <button
                onClick={onForfeit}
                className="flex-1 py-2 sm:py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Renoncer</span>
              </button>

              {canAfford && (
                <button
                  onClick={handleBuild}
                  disabled={!isValid()}
                  className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer border border-amber-400/50"
                >
                  <Award className="w-4 h-4" />
                  <span>Construire (+{vpEarned} VP)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
