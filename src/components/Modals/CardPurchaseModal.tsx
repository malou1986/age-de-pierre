import React, { useState } from 'react';
import { BoardLocationId, CivilizationCard, PlayerState, ResourceType } from '../../types/game';
import { RESOURCE_NAMES } from '../../data/buildings';
import { sound } from '../../logic/audio';
import { ResourceIcon } from '../Common/ResourceIcon';
import { CivilizationCardView } from '../Cards/CivilizationCardView';
import { TabletopCivilizationCard } from '../Cards/TabletopCivilizationCard';
import { Scroll, Plus, Minus, ArrowRight, X, AlertCircle, Undo2 } from 'lucide-react';

interface CardPurchaseModalProps {
  locationId: BoardLocationId;
  card: CivilizationCard;
  player: PlayerState;
  onConfirm: (resourcesPaid: Record<ResourceType, number>) => void;
  onForfeit: () => void;
  onClose: () => void;
  isModern?: boolean;
}

export const CardPurchaseModal: React.FC<CardPurchaseModalProps> = ({
  locationId,
  card,
  player,
  onConfirm,
  onForfeit,
  onClose,
  isModern = false,
}) => {
  const slot = parseInt(locationId.split('_')[1], 10);
  const cost = slot + 1;

  const [selected, setSelected] = useState<Record<ResourceType, number>>({
    wood: 0,
    clay: 0,
    stone: 0,
    gold: 0,
  });

  const totalSelected = Object.values(selected).reduce((s, c) => s + c, 0);
  const totalStock = Object.values(player.resources).reduce((s, c) => s + c, 0);
  const canAfford = totalStock >= cost;

  const handleAdd = (r: ResourceType) => {
    if (totalSelected < cost && selected[r] < player.resources[r]) {
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

  const handlePurchase = () => {
    if (totalSelected === cost) {
      sound.playPurchase();
      onConfirm(selected);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border-2 border-emerald-600/80 rounded-2xl max-w-lg landscape:max-w-2xl w-full p-2.5 sm:p-4 landscape:p-2.5 text-stone-100 shadow-2xl space-y-1.5 sm:space-y-3 max-h-[94vh] sm:max-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-1 sm:pb-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 sm:p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Scroll className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
            <div>
              <h3 className="text-xs sm:text-base font-black text-emerald-200 leading-tight">
                Acheter la Carte Civilisation
              </h3>
              <p className="text-[9px] sm:text-[10px] text-stone-400">
                Emplacement #{cost} • Coût : <span className="text-amber-400 font-bold">{cost} ressource(s)</span> au choix
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
          {/* Left Column: Card Preview */}
          <div className="flex flex-col items-center justify-center">
            {isModern ? (
              <div className="w-28 h-40 sm:w-36 sm:h-52 shadow-xl">
                <TabletopCivilizationCard card={card} cost={cost} size="compact" showCost={false} />
              </div>
            ) : (
              <CivilizationCardView card={card} cost={cost} size="normal" showCost={false} />
            )}
          </div>

          {/* Right Column: Payment Selector & Actions */}
          <div className="flex flex-col justify-between space-y-2">
            {/* Warning if player can't afford */}
            {!canAfford && (
              <div className="bg-red-950/60 border border-red-700/80 p-2 rounded-xl flex items-start gap-1.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  Vous n'avez que {totalStock} ressource(s) pour un coût de {cost}. Vous devez renoncer à l'achat et récupérer votre ouvrier sans pénalité.
                </span>
              </div>
            )}

            {/* Resources payment selector */}
            {canAfford && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-300 font-medium">Matières à payer :</span>
                  <span className={`font-bold ${totalSelected === cost ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {totalSelected} / {cost} sélectionnée(s)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {(['wood', 'clay', 'stone', 'gold'] as ResourceType[]).map(r => {
                    const available = player.resources[r];
                    const sel = selected[r];
                    const meta = RESOURCE_NAMES[r];

                    return (
                      <div
                        key={r}
                        className="bg-stone-950 border border-stone-800 rounded-lg p-1.5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-1.5">
                          <ResourceIcon type={r} size="sm" />
                          <div>
                            <div className="text-[11px] font-bold text-stone-200">{meta.name}</div>
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
                            disabled={totalSelected >= cost || sel >= available}
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
                  onClick={handlePurchase}
                  disabled={totalSelected !== cost}
                  className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer border border-emerald-400/50"
                >
                  <span>Valider ({totalSelected}/{cost})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
