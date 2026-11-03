import React, { useEffect, useState } from 'react';
import { CivilizationCard, PlayerState, ResourceType } from '../../types/game';
import { GREEN_SYMBOLS } from '../../data/cards';
import { CivilizationCardView } from '../Cards/CivilizationCardView';
import { TabletopCivilizationCard } from '../Cards/TabletopCivilizationCard';
import { ResourceIcon } from '../Common/ResourceIcon';
import { Gift, Sparkles, Check, ArrowRight, X, Info, Award, Scroll } from 'lucide-react';
import { sound } from '../../logic/audio';

interface DrawnCardRevealModalProps {
  card: CivilizationCard;
  player: PlayerState;
  originalCard: CivilizationCard;
  onClose: () => void;
  isModern?: boolean;
}

export const DrawnCardRevealModal: React.FC<DrawnCardRevealModalProps> = ({
  card,
  player,
  originalCard,
  onClose,
  isModern = false,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(player.isAi ? 4 : null);

  useEffect(() => {
    sound.playPurchase();
  }, []);

  // For AI player, auto-dismiss after a few seconds so the game flows smoothly
  useEffect(() => {
    if (!player.isAi) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [player.isAi, onClose]);

  // Compute player's green symbols stats
  const greenSymbolStats = React.useMemo(() => {
    if (card.bottomBonus.type !== 'green') return null;
    const symId = card.bottomBonus.greenSymbol;
    const existingCount = player.civilizationCards.filter(
      c => c.bottomBonus.type === 'green' && c.bottomBonus.greenSymbol === symId
    ).length;

    // Distinct set of green symbols
    const distinctSymbols = new Set(
      player.civilizationCards
        .filter(c => c.bottomBonus.type === 'green')
        .map(c => c.bottomBonus.greenSymbol)
    );
    // Include this newly drawn card
    if (symId) distinctSymbols.add(symId);

    const symMeta = GREEN_SYMBOLS.find(s => s.id === symId) || { label: 'Culture', icon: '🌿' };
    const isNewUnique = existingCount === 0;

    return {
      symMeta,
      isNewUnique,
      existingCount,
      distinctCount: distinctSymbols.size,
      totalVp: distinctSymbols.size * distinctSymbols.size,
    };
  }, [card, player.civilizationCards]);

  // Compute player's sand multiplier stats
  const sandMultiplierStats = React.useMemo(() => {
    if (card.bottomBonus.type !== 'sand') return null;
    const multType = card.bottomBonus.sandType;
    const mult = card.bottomBonus.sandMultiplier || 1;

    const totalTools = player.toolTiles.reduce((s, v) => s + v, 0);

    let targetName = '';
    let targetIcon = '⏳';
    let currentValue = 0;

    switch (multType) {
      case 'shaman':
        targetName = 'Ouvriers (Population)';
        targetIcon = '🧙';
        currentValue = player.totalMeeples;
        break;
      case 'farmer':
        targetName = 'Niveau Agriculture';
        targetIcon = '🌾';
        currentValue = player.agriculture;
        break;
      case 'tool_maker':
        targetName = 'Total des Outils';
        targetIcon = '🔨';
        currentValue = totalTools;
        break;
      case 'builder':
        targetName = 'Bâtiments construits';
        targetIcon = '🏛️';
        currentValue = player.buildings.length;
        break;
    }

    const currentVP = mult * currentValue;

    return {
      multType,
      mult,
      targetName,
      targetIcon,
      currentValue,
      currentVP,
    };
  }, [card, player]);

  const isGreen = card.bottomBonus.type === 'green';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className={`bg-stone-900 border-2 ${isGreen ? 'border-emerald-500/90 shadow-emerald-950/60' : 'border-amber-500/90 shadow-amber-950/60'} rounded-2xl sm:rounded-3xl max-w-lg landscape:max-w-2xl w-full text-stone-100 shadow-2xl flex flex-col max-h-[96vh] sm:max-h-[92vh] overflow-hidden justify-between`}>
        
        {/* Pinned Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-stone-800 px-3.5 py-2.5 sm:px-5 sm:py-3 bg-stone-950/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className={`p-1.5 sm:p-2 rounded-xl border ${isGreen ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'}`}>
              <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-amber-200 leading-tight">
                  Carte Civilisation Gratuite Piochée !
                </h3>
                {player.isAi && (
                  <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-700/60 font-bold px-1.5 py-0.2 rounded-full">
                    {player.name} (IA)
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-stone-400">
                Bonus immédiat de <strong className="text-amber-300">« {originalCard.name} »</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Center Content (2-Column in landscape) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 landscape:space-y-0 landscape:grid landscape:grid-cols-2 landscape:gap-4 items-center">
          
          {/* Column 1: Card Artwork Visual */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="relative group">
              <div className="w-32 h-44 sm:w-38 sm:h-52 shadow-2xl rounded-xl overflow-hidden border-2 border-stone-700/80">
                {isModern ? (
                  <TabletopCivilizationCard card={card} cost={0} size="compact" showCost={false} />
                ) : (
                  <CivilizationCardView card={card} cost={0} size="normal" showCost={false} />
                )}
              </div>
              
              {/* Badge "Offerte" */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" />
                <span>Gratuite</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm font-black text-stone-100">{card.name}</div>
              <div className="text-[11px] text-stone-400">Piochée du dessus du deck</div>
            </div>
          </div>

          {/* Column 2: Deep Dive into the End-Game Bonus (Bottom Effect) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 border-b border-stone-800 pb-1">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Effet de fin de partie acquis :</span>
            </div>

            {/* Case A: Green Cultural Symbol */}
            {greenSymbolStats && (
              <div className="bg-emerald-950/70 border-2 border-emerald-500/80 rounded-xl p-2.5 space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{greenSymbolStats.symMeta.icon}</span>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider block text-emerald-400 font-black">
                        Symbole de Culture Vert
                      </span>
                      <span className="text-sm font-black text-emerald-100">
                        {greenSymbolStats.symMeta.label}
                      </span>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                    Collection K²
                  </span>
                </div>

                {/* Tribe Collection Status */}
                <div className="bg-stone-950/80 rounded-lg p-2 border border-emerald-900/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-300">Statut dans votre tribu :</span>
                    {greenSymbolStats.isNewUnique ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                        <Sparkles className="w-3 h-3" /> Nouveau symbole unique !
                      </span>
                    ) : (
                      <span className="text-amber-300 font-bold text-[11px]">
                        Déjà possédé ({greenSymbolStats.existingCount}x) • Débute un 2ᵉ set
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-800 text-[11px]">
                    <span className="text-stone-400">Total symboles uniques :</span>
                    <strong className="text-emerald-300 font-mono font-bold">
                      {greenSymbolStats.distinctCount} / 8 différents
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Valeur de votre série :</span>
                    <strong className="text-amber-300 font-mono font-black text-xs">
                      {greenSymbolStats.distinctCount}² = {greenSymbolStats.totalVp} PV
                    </strong>
                  </div>
                </div>

                <div className="text-[9px] text-stone-400 leading-tight">
                  Barème : 1=1 PV, 2=4 PV, 3=9 PV, 4=16 PV, 5=25 PV, 6=36 PV, 7=49 PV, 8=64 PV.
                </div>
              </div>
            )}

            {/* Case B: Sand Multiplier (Shaman, Builder, Farmer, Toolmaker) */}
            {sandMultiplierStats && (
              <div className="bg-amber-950/60 border-2 border-amber-500/80 rounded-xl p-2.5 space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sandMultiplierStats.multType === 'builder' ? (
                      <ResourceIcon type="building" size="md" className="w-6 h-6 shrink-0" />
                    ) : sandMultiplierStats.multType === 'farmer' ? (
                      <ResourceIcon type="agriculture" size="md" className="w-6 h-6 shrink-0" />
                    ) : sandMultiplierStats.multType === 'tool_maker' ? (
                      <ResourceIcon type="tool" size="md" className="w-6 h-6 shrink-0" />
                    ) : (
                      <span className="text-2xl">{sandMultiplierStats.targetIcon}</span>
                    )}
                    <div>
                      <span className="text-[9px] uppercase tracking-wider block text-amber-400 font-black">
                        Multiplicateur Fond Sablé
                      </span>
                      <span className="text-sm font-black text-amber-100">
                        {card.bottomBonus.description || `${sandMultiplierStats.mult}× ${sandMultiplierStats.targetName}`}
                      </span>
                    </div>
                  </div>
                  <span className="bg-amber-500 text-stone-950 font-black text-xs px-2 py-0.5 rounded-full shadow-sm">
                    x{sandMultiplierStats.mult}
                  </span>
                </div>

                {/* Live Scoring Estimation */}
                <div className="bg-stone-950/80 rounded-lg p-2 border border-amber-900/60 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-300">Multiplie :</span>
                    <span className="font-bold text-amber-200">{sandMultiplierStats.targetName}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-800 text-[11px]">
                    <span className="text-stone-400">Niveau actuel de votre tribu :</span>
                    <strong className="text-stone-200 font-mono font-bold">
                      {sandMultiplierStats.currentValue}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Gain de points final estimé :</span>
                    <strong className="text-amber-300 font-mono font-black text-xs">
                      {sandMultiplierStats.mult} × {sandMultiplierStats.currentValue} = +{sandMultiplierStats.currentVP} PV
                    </strong>
                  </div>
                </div>

                <div className="text-[9px] text-stone-400 leading-tight">
                  Ce coefficient s'ajoutera à vos autres multiplicateurs lors du grand décompte final !
                </div>
              </div>
            )}

            {/* Official Rules Clarification Note */}
            <div className="bg-stone-950/90 border border-stone-800 p-2 rounded-xl flex items-start gap-1.5 text-[10px] text-stone-400">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Règle officielle :</strong> le bonus supérieur de cette carte gratuite n'est pas appliqué. Seul son effet de fin de partie (partie inférieure) rejoint définitivement votre tribu.
              </span>
            </div>
          </div>
        </div>

        {/* Pinned Action Button (Always 100% accessible on smartphone in landscape) */}
        <div className="shrink-0 p-2.5 sm:p-3 bg-stone-950/95 border-t border-stone-800/90 flex items-center justify-between gap-3 z-10">
          <div className="text-[11px] text-stone-400 hidden sm:block">
            {player.isAi && secondsLeft !== null ? (
              <span>Fermeture automatique dans <strong className="text-amber-400">{secondsLeft}s</strong>...</span>
            ) : (
              <span>La carte a été ajoutée à votre coffre de tribu.</span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-full sm:w-auto flex-1 sm:flex-initial px-6 py-2.5 sm:py-3 font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-xl transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
              isGreen
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 ring-2 ring-emerald-400/40 shadow-emerald-950/40'
                : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 ring-2 ring-amber-400/40 shadow-amber-950/40'
            }`}
          >
            <span>{player.isAi ? 'Continuer la partie' : 'Ajouter à mon coffre de tribu'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
