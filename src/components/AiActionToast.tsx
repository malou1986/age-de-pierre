import React from 'react';
import { PlayerColor } from '../types/game';
import { MeepleIcon } from './Meeples';
import { Sparkles, Bot } from 'lucide-react';

export interface AiActionData {
  id: string;
  playerName: string;
  playerColor: PlayerColor;
  actionTitle: string;
  locationName: string;
  diceText?: string;
  gainBadge: string;
  icon: React.ReactNode;
}

interface AiActionToastProps {
  action: AiActionData | null;
}

export const AiActionToast: React.FC<AiActionToastProps> = ({ action }) => {
  if (!action) return null;

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-40 max-w-md w-full px-4 pointer-events-none animate-bounce-short">
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-2 border-amber-500/90 rounded-2xl p-3 shadow-2xl shadow-black/80 flex items-center justify-between gap-3 text-stone-100 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <MeepleIcon color={action.playerColor} size={28} glow />
            <span className="absolute -bottom-1 -right-1 bg-stone-950 p-0.5 rounded-full text-stone-400 border border-stone-700">
              <Bot className="w-2.5 h-2.5" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-amber-200">
                {action.playerName}
              </span>
              <span className="text-[11px] text-stone-400 font-medium">
                • {action.locationName}
              </span>
            </div>
            {action.diceText && (
              <p className="text-xs text-stone-300 font-mono mt-0.5">
                {action.diceText}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 px-3 py-1 rounded-xl shadow font-black text-xs">
          <span>{action.icon}</span>
          <span>{action.gainBadge}</span>
        </div>
      </div>
    </div>
  );
};
