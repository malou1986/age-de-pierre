import React, { useState } from 'react';
import { PlayerState, ResourceType } from '../../types/game';
import { ResourceIcon } from '../Common/ResourceIcon';
import { Sparkles, ArrowRight, Check, X, ShieldAlert } from 'lucide-react';

interface MerchantBarterModalProps {
  player: PlayerState;
  onConfirm: (tradeDetails?: {
    giveRes?: ResourceType;
    giveAmount?: number;
    getRes?: ResourceType;
    getAmount?: number;
    buyJewelry?: boolean;
    jewelryCount?: number;
  }) => void;
  onClose: () => void;
}

export const MerchantBarterModal: React.FC<MerchantBarterModalProps> = ({
  player,
  onConfirm,
  onClose,
}) => {
  const currentLevel = player.merchantLevel || 0;
  const newLevel = Math.min(5, currentLevel + 1);

  // Bonus jewelry granted automatically upon reaching levels 3, 4, 5
  let autoFreeJewelry = 0;
  if (newLevel === 3 && currentLevel < 3) autoFreeJewelry = 1;
  if (newLevel === 4 && currentLevel < 4) autoFreeJewelry = 1;
  if (newLevel === 5 && currentLevel < 5) autoFreeJewelry = 2;

  // Selected trade option
  const [giveRes, setGiveRes] = useState<ResourceType | null>(null);
  const [tradeTarget, setTradeTarget] = useState<'jewelry' | ResourceType>('jewelry');

  // Trade rate depends on newLevel
  // Level 1: 3:1, Level 2: 2:1, Level 3+: 1:1
  const requiredGive = newLevel >= 3 ? 1 : newLevel === 2 ? 2 : 3;

  const canAffordTrade = giveRes ? (player.resources[giveRes] || 0) >= requiredGive : false;

  const handleExecuteTrade = () => {
    if (giveRes && canAffordTrade) {
      if (tradeTarget === 'jewelry') {
        onConfirm({
          giveRes,
          giveAmount: requiredGive,
          buyJewelry: true,
          jewelryCount: 1,
        });
      } else {
        onConfirm({
          giveRes,
          giveAmount: requiredGive,
          getRes: tradeTarget,
          getAmount: 1,
        });
      }
    } else {
      // Just advance track and gain free level perks
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-stone-900 border-2 border-purple-500/80 rounded-3xl max-w-xl w-full p-4 sm:p-6 text-stone-100 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-400 flex items-center justify-center text-xl shadow-lg">
              ⚖️
            </div>
            <div>
              <h3 className="text-xl font-black text-purple-300">
                L'Échoppe du Marchand & Troc
              </h3>
              <p className="text-xs text-stone-400">
                Extension « Le Style, c'est le But »
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Barter Track Progression Banner */}
        <div className="bg-purple-950/40 border border-purple-500/50 rounded-2xl p-3 sm:p-4 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-bold text-stone-300">Progression Piste de Troc :</span>
            <span className="font-black text-purple-300">
              Niveau {currentLevel} ➔ <span className="text-emerald-400 font-extrabold text-base">Niveau {newLevel} / 5</span>
            </span>
          </div>

          {/* Track 5 steps indicator */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            {[1, 2, 3, 4, 5].map(step => {
              const isPassed = step <= newLevel;
              const isCurrent = step === newLevel;
              return (
                <div
                  key={step}
                  className={`p-1.5 rounded-lg border text-center transition-all ${
                    isCurrent
                      ? 'bg-purple-600 border-purple-300 text-white shadow-lg ring-2 ring-purple-400 scale-105'
                      : isPassed
                      ? 'bg-purple-900/60 border-purple-600 text-purple-200'
                      : 'bg-stone-950/60 border-stone-800 text-stone-600'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase">Niv. {step}</div>
                  <div className="text-[8px] opacity-90 truncate">
                    {step === 1 && 'Taux 3:1'}
                    {step === 2 && 'Taux 2:1'}
                    {step === 3 && '+1 📿 • 1:1'}
                    {step === 4 && '+1 📿 • 1:1'}
                    {step === 5 && '+2 📿 • Max'}
                  </div>
                </div>
              );
            })}
          </div>

          {autoFreeJewelry > 0 && (
            <div className="bg-emerald-950/60 border border-emerald-500/60 rounded-xl p-2 text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-1.5 animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Niveau franchi ! Vous recevez immédiatement <strong>+{autoFreeJewelry} Parure(s) de parure gratuite(s) 📿</strong> !</span>
            </div>
          )}
        </div>

        {/* 2. Barter Exchange Stall */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-300 px-1">
            <span>Comptoir d'échange (Optionnel) :</span>
            <span className="text-purple-300">Taux actuel : {requiredGive} ressource(s) ➔ 1 cible</span>
          </div>

          {/* Giving Resource */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3 space-y-2">
            <span className="text-[11px] text-stone-400 block font-semibold">
              1. Choisir la ressource à échanger (quantité requise : {requiredGive}) :
            </span>
            <div className="grid grid-cols-4 gap-2">
              {(['wood', 'clay', 'stone', 'gold'] as ResourceType[]).map(res => {
                const count = player.resources[res] || 0;
                const isSelected = giveRes === res;
                const canSelect = count >= requiredGive;

                return (
                  <button
                    key={res}
                    type="button"
                    disabled={!canSelect}
                    onClick={() => setGiveRes(isSelected ? null : res)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'border-purple-400 bg-purple-950/80 ring-2 ring-purple-400'
                        : canSelect
                        ? 'border-stone-700 bg-stone-900 hover:border-purple-500/60'
                        : 'border-stone-850 bg-stone-950/50 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <ResourceIcon type={res} size="sm" />
                    <span className="text-[11px] font-bold text-stone-200 mt-1 capitalize">{res}</span>
                    <span className="text-[10px] text-stone-400">En stock: {count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Receiving Target */}
          {giveRes && (
            <div className="bg-stone-950/70 border border-purple-500/40 rounded-2xl p-3 space-y-2 animate-fade-in">
              <span className="text-[11px] text-stone-300 block font-semibold">
                2. Choisir l'objet obtenu en échange :
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {/* Option Jewelry / Parure */}
                <button
                  type="button"
                  onClick={() => setTradeTarget('jewelry')}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    tradeTarget === 'jewelry'
                      ? 'border-amber-400 bg-amber-950/80 ring-2 ring-amber-400 text-amber-200 font-bold'
                      : 'border-stone-700 bg-stone-900 text-stone-300 hover:border-amber-500/60'
                  }`}
                >
                  <span className="text-xl">📿</span>
                  <span className="text-[10px] font-black mt-0.5">Parure</span>
                  <span className="text-[8px] text-amber-400/90 font-semibold">+Style & Joker</span>
                </button>

                {/* Resource targets */}
                {(['wood', 'clay', 'stone', 'gold'] as ResourceType[]).map(res => {
                  const isSelected = tradeTarget === res;
                  return (
                    <button
                      key={res}
                      type="button"
                      disabled={giveRes === res}
                      onClick={() => setTradeTarget(res)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'border-purple-400 bg-purple-950/80 ring-2 ring-purple-400'
                          : giveRes !== res
                          ? 'border-stone-700 bg-stone-900 hover:border-purple-500/60'
                          : 'border-stone-850 bg-stone-950/50 opacity-30 cursor-not-allowed'
                      }`}
                    >
                      <ResourceIcon type={res} size="xs" />
                      <span className="text-[10px] font-bold text-stone-200 mt-1 capitalize">{res}</span>
                      <span className="text-[8px] text-stone-400">+1 unité</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleExecuteTrade}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Check className="w-4 h-4" />
            <span>
              {giveRes && canAffordTrade
                ? `Valider le Troc (${requiredGive} ${giveRes} ➔ 1 ${tradeTarget === 'jewelry' ? 'Parure 📿' : tradeTarget})`
                : `Valider l'avancée sur la Piste de Troc (Niv. ${newLevel})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
