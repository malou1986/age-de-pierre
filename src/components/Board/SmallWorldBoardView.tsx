import React, { useState } from 'react';
import { BoardLocationId, GameState, PlayerState } from '../../types/game';
import { ModernPepsBoardMap } from './ModernPepsBoardMap';
import { SmallWorldLeftBandeau } from './SmallWorldLeftBandeau';
import { SmallWorldRightBandeau } from './SmallWorldRightBandeau';

interface SmallWorldBoardViewProps {
  state: GameState;
  activePlayer: PlayerState;
  onZoneClick: (locationId: BoardLocationId) => void;
  onPassPlacement?: () => void;
  onResolveNextZone?: () => void;
  canPassPlacement?: boolean;
  canResolveNextZone?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isTribesDrawerOpen?: boolean;
  onToggleTribesDrawer?: () => void;
}

export const SmallWorldBoardView: React.FC<SmallWorldBoardViewProps> = ({
  state,
  activePlayer,
  onZoneClick,
  onPassPlacement,
  onResolveNextZone,
  canPassPlacement = false,
  canResolveNextZone = false,
  isFullscreen = false,
  onToggleFullscreen,
  isTribesDrawerOpen,
  onToggleTribesDrawer,
}) => {
  // Left bandeau state (controlled or uncontrolled fallback)
  const [internalOpen, setInternalOpen] = useState(false);
  const isDrawerOpen = isTribesDrawerOpen !== undefined ? isTribesDrawerOpen : internalOpen;
  const handleToggleDrawer = onToggleTribesDrawer || (() => setInternalOpen(prev => !prev));

  // Right market dock state (default open on landscape / wide viewports)
  const [isRightBandeauOpen, setIsRightBandeauOpen] = useState(true);

  return (
    <div 
      className="relative w-full h-full flex overflow-hidden select-none"
      style={{
        backgroundColor: '#150e09',
        backgroundImage: 'radial-gradient(ellipse at 50% 40%, #29180e 0%, #170d07 55%, #0d0704 100%)',
      }}
    >
      {/* 1. LEFT BANDEAU: PLAYERS STACK & ACTIVE TRIBE CHEST */}
      <SmallWorldLeftBandeau
        state={state}
        activePlayer={activePlayer}
        isOpen={isDrawerOpen}
        onToggle={handleToggleDrawer}
        onPassPlacement={onPassPlacement}
        onResolveNextZone={onResolveNextZone}
        canPassPlacement={canPassPlacement}
        canResolveNextZone={canResolveNextZone}
      />

      {/* 2. CENTER: VIBRANT CONTEMPORARY PEPS GAME BOARD */}
      <main className="flex-1 relative h-full flex flex-col justify-center items-center overflow-hidden p-0 sm:p-1">
        {/* Tabletop Wood Planks Texture overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 120px)',
          }}
        />

        {/* Board Component */}
        <div className="w-full h-full flex items-center justify-center relative">
          <ModernPepsBoardMap
            state={state}
            activePlayer={activePlayer}
            onZoneClick={onZoneClick}
            className="w-full h-full"
          />
        </div>
      </main>

      {/* 3. RIGHT BANDEAU: LARGE & READABLE SMARTPHONE MARKET TRAY */}
      <SmallWorldRightBandeau
        state={state}
        activePlayer={activePlayer}
        isOpen={isRightBandeauOpen}
        onToggle={() => setIsRightBandeauOpen(prev => !prev)}
        onZoneClick={onZoneClick}
      />
    </div>
  );
};
