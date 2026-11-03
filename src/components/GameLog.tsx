import React, { useState } from 'react';
import { GameLogEntry } from '../types/game';
import { History, ChevronUp, ChevronDown } from 'lucide-react';

interface GameLogProps {
  entries: GameLogEntry[];
}

export const GameLog: React.FC<GameLogProps> = ({ entries }) => {
  const [isOpen, setIsOpen] = useState(false);

  const recent = entries.slice(-1)[0];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-stone-950/90 border border-stone-800 rounded-xl overflow-hidden shadow-md">
        {/* Compact ticker */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="px-3.5 py-2 flex items-center justify-between cursor-pointer hover:bg-stone-900/80 transition-colors text-xs"
        >
          <div className="flex items-center gap-2 truncate text-stone-300">
            <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-amber-300 shrink-0">Historique :</span>
            <span className="truncate text-stone-300">
              {recent ? recent.text : 'Début de la partie.'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-stone-400 shrink-0 text-[11px]">
            <span>{isOpen ? 'Masquer' : `${entries.length} actions`}</span>
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Expanded list */}
        {isOpen && (
          <div className="max-h-48 overflow-y-auto p-3 space-y-1.5 border-t border-stone-800 text-xs bg-stone-950">
            {entries.slice().reverse().map(entry => (
              <div
                key={entry.id}
                className={`py-1 px-2 rounded flex items-center justify-between gap-2 ${
                  entry.type === 'info'
                    ? 'bg-amber-950/20 text-amber-300 font-semibold'
                    : entry.type === 'food'
                    ? 'bg-red-950/20 text-red-300'
                    : 'text-stone-300 hover:bg-stone-900'
                }`}
              >
                <span>{entry.text}</span>
                <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                  M.{entry.round}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
