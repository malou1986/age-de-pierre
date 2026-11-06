import React, { useState } from 'react';
import { PlayerState, ResourceType } from '../../types/game';
import { RESOURCE_NAMES } from '../../data/buildings';
import { sound } from '../../logic/audio';
import { ResourceIcon } from '../Common/ResourceIcon';
import { AlertTriangle, Plus, Minus, ArrowRight, Wand2 } from 'lucide-react';

interface FeedingModalProps {
  player: PlayerState;
  onConfirm: (resourcesPaid: Record<ResourceType, number>, acceptPenalty: boolean) => void;
}

export const FeedingModal: React.FC<FeedingModalProps> = ({
  player,
  onConfirm,
}) => {
  const foodNeeded = Math.max(0, player.totalMeeples - player.agriculture);
  const foodAvailable = player.food;
  const deficit = Math.max(0, foodNeeded - foodAvailable);

  const [selected, setSelected] = useState<Record<ResourceType, number>>({
    wood: 0,
    clay: 0,
    stone: 0,
    gold: 0,
  });

  const totalPaid = Object.values(selected).reduce((s, c) => s + c, 0);

  const handleAdd = (r: ResourceType) => {
    if (totalPaid < deficit && selected[r] < player.resources[r]) {
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

  // Auto-fill cheapest resources (Wood -> Clay -> Stone -> Gold)
  const handleAutoFill = () => {
    sound.playTool();
    const order: ResourceType[] = ['wood', 'clay', 'stone', 'gold'];
    const newSel: Record<ResourceType, number> = { wood: 0, clay: 0, stone: 0, gold: 0 };
    let paid = 0;

    for (const r of order) {
      while (player.resources[r] > newSel[r] && paid < deficit) {
        newSel[r] += 1;
        paid += 1;
      }
    }
    setSelected(newSel);
  };

  const handleResolveWithResources = () => {
    sound.playHarvest();
    onConfirm(selected, false);
  };

  const handleAcceptPenalty = () => {
    sound.playFamine();
    onConfirm({ wood: 0, clay: 0, stone: 0, gold: 0 }, true);
  };

  const totalPlayerResources = Object.values(player.resources).reduce((s, c) => s + c, 0);
  const canCoverWithResources = totalPlayerResources >= deficit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-stone-900 border-2 border-red-600/90 rounded-2xl max-w-lg landscape:max-w-2xl w-full p-3 sm:p-4 landscape:p-3 text-stone-100 shadow-2xl space-y-2 sm:space-y-3 my-auto max-h-[96dvh] overflow-y-auto flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-stone-800 pb-1.5 shrink-0">
          <span className="p-1.5 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-red-300">
              Famine ! Nourrir la tribu
            </h3>
            <p className="text-[10px] text-stone-400">
              Vos réserves de nourriture sont insuffisantes pour cette manche.
            </p>
          </div>
        </div>

        {/* Responsive Content: 2-column on landscape */}
        <div className="grid grid-cols-1 landscape:grid-cols-2 md:landscape:grid-cols-2 gap-2 sm:gap-3 items-stretch flex-1 min-h-0">
          {/* Left Column: Breakdown */}
          <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1.5 text-xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex justify-between text-stone-300 text-[11px]">
                <span>Ouvriers à nourrir :</span>
                <span className="font-bold text-stone-100">{player.totalMeeples} rations</span>
              </div>
              <div className="flex justify-between text-stone-300 text-[11px]">
                <span className="flex items-center gap-1">
                  <ResourceIcon type="agriculture" size="xs" />
                  <span>Couvert par l'agri :</span>
                </span>
                <span className="font-bold text-emerald-400">-{player.agriculture}</span>
              </div>
              <div className="flex justify-between text-stone-300 text-[11px]">
                <span className="flex items-center gap-1">
                  <ResourceIcon type="food" size="xs" />
                  <span>Stock nourriture prélevé :</span>
                </span>
                <span className="font-bold text-amber-400">-{foodAvailable}</span>
              </div>
            </div>

            <div className="border-t border-stone-800 pt-1.5 flex justify-between font-black text-xs sm:text-sm text-red-400">
              <span>Déficit à combler :</span>
              <span>{deficit} ration(s)</span>
            </div>
          </div>

          {/* Right Column: Resources selector & Actions */}
          <div className="flex flex-col justify-between space-y-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-stone-300">
                <span>Remplacer par des matières :</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleAutoFill}
                    disabled={!canCoverWithResources}
                    className="text-[10px] text-amber-300 hover:text-amber-200 underline flex items-center gap-0.5 cursor-pointer disabled:opacity-30 disabled:no-underline"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Auto</span>
                  </button>
                  <span className={`font-black text-xs ${totalPaid === deficit ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {totalPaid} / {deficit}
                  </span>
                </div>
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
                          disabled={totalPaid >= deficit || sel >= available}
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

            {/* Actions */}
            <div className="pt-1 space-y-1.5">
              {totalPaid === deficit && (
                <button
                  onClick={handleResolveWithResources}
                  className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer border border-emerald-400/50"
                >
                  <span>Payer ces {totalPaid} ressource(s)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleAcceptPenalty}
                className="w-full py-1.5 sm:py-2 bg-red-950/70 hover:bg-red-900/80 border border-red-700/80 text-red-200 font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-[11px] cursor-pointer"
              >
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>Subir la famine (-10 VP)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
