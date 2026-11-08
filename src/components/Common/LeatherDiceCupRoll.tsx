import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../logic/audio';
import { haptic } from '../../logic/haptics';
import { Dices, FastForward } from 'lucide-react';

export interface LeatherDiceCupRollProps {
  /** Number of dice to roll (1 to 10) */
  diceCount: number;
  /** Initial dice values before roll, or default [1, 1, ...] */
  initialValues?: number[];
  /** Controlled final values if determined outside (optional) */
  targetValues?: number[];
  /** Controlled rolling flag (optional) */
  isControlledRolling?: boolean;
  /** Triggered when roll starts */
  onRollStart?: () => void;
  /** Triggered when roll animation completes with final dice values */
  onRollComplete?: (values: number[]) => void;
  /** True if the user has already rolled */
  hasRolled?: boolean;
  /** Drafting mode props */
  isDraftMode?: boolean;
  /** Claimed/taken die indices */
  claimedIndices?: number[];
  /** Currently selected index for draft confirmation */
  selectedIndex?: number | null;
  /** Badges to show on claimed dice { [dieIndex]: { label: string; color: string; icon?: string } } */
  draftBadges?: Record<number, { label: string; color: string; icon?: string; rewardLabel?: string }>;
  /** Callback when a die is clicked in draft mode */
  onDieClick?: (index: number, value: number) => void;
  /** Custom button label */
  rollButtonLabel?: string;
  /** Custom arena styling */
  className?: string;
  /** Whether to show the cup at all times or compact it after roll */
  compactAfterRoll?: boolean;
  /** Automatically trigger roll (useful for AI) */
  autoRoll?: boolean;
}

// ----------------------------------------------------------------------------
// Authentic Prehistoric Leather Cup SVG
// ----------------------------------------------------------------------------
export interface LeatherCupProps {
  state: 'idle' | 'shaking' | 'pouring' | 'settled';
  onClick?: () => void;
  diceCount: number;
  size?: 'normal' | 'compact';
}

export const LeatherCup: React.FC<LeatherCupProps> = ({ state, onClick, diceCount, size = 'normal' }) => {
  const isCompact = size === 'compact';
  const width = isCompact ? 56 : 78;
  const height = isCompact ? 68 : 94;

  return (
    <div
      onClick={onClick}
      className={`relative inline-block transition-transform duration-300 select-none ${
        state === 'idle'
          ? 'cursor-pointer hover:scale-105 active:scale-95 group'
          : state === 'shaking'
          ? 'animate-cup-rattle'
          : state === 'pouring'
          ? '-rotate-[72deg] -translate-y-2 translate-x-2 transition-transform duration-250 ease-out'
          : 'scale-90 opacity-80'
      }`}
      style={{
        transformOrigin: 'bottom center',
      }}
      title={state === 'idle' ? 'Secouer le gobelet pour lancer les dés !' : undefined}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.85)]"
      >
        <defs>
          {/* Leather outer gradient */}
          <linearGradient id="leatherGrad" x1="15" y1="20" x2="85" y2="115" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7a4b22" />
            <stop offset="35%" stopColor="#5a3314" />
            <stop offset="70%" stopColor="#3d200b" />
            <stop offset="100%" stopColor="#251206" />
          </linearGradient>

          {/* Cup interior shadow */}
          <linearGradient id="cupInsideGrad" x1="50" y1="6" x2="50" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#140a04" />
            <stop offset="100%" stopColor="#381c0b" />
          </linearGradient>

          {/* Leather rim collar */}
          <linearGradient id="rimGrad" x1="10" y1="12" x2="90" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8c582c" />
            <stop offset="50%" stopColor="#4a260c" />
            <stop offset="100%" stopColor="#2a1406" />
          </linearGradient>

          {/* Rawhide cord gradient */}
          <linearGradient id="laceGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3deb8" />
            <stop offset="100%" stopColor="#a78657" />
          </linearGradient>
        </defs>

        {/* Cup Shadow */}
        <ellipse cx="50" cy="114" rx="34" ry="5" fill="#000000" fillOpacity="0.45" />

        {/* Cup Body: Hand-stitched organic tapered leather */}
        <path
          d="M 18,22 Q 13,68 22,110 Q 50,116 78,110 Q 87,68 82,22 Z"
          fill="url(#leatherGrad)"
          stroke="#200e04"
          strokeWidth="2"
        />

        {/* Leather texture subtle distressed streaks */}
        <path d="M 28,34 Q 25,65 30,95" stroke="#8d5b30" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 4" fill="none" />
        <path d="M 72,32 Q 74,68 70,98" stroke="#1d0a02" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
        <path d="M 40,42 Q 38,72 42,105" stroke="#8d5b30" strokeWidth="0.8" strokeOpacity="0.25" fill="none" />

        {/* Cup Mouth / Interior Rim */}
        <ellipse cx="50" cy="22" rx="32" ry="11" fill="url(#cupInsideGrad)" stroke="#221006" strokeWidth="1.5" />
        <ellipse cx="50" cy="22" rx="30" ry="9" fill="#150a04" />

        {/* Dice peeking inside cup when idle */}
        {state === 'idle' && (
          <g transform="translate(42, 17) scale(0.65)" opacity="0.9">
            <rect x="0" y="0" width="16" height="16" rx="3" fill="#e8cfa5" stroke="#8b572a" strokeWidth="1.5" />
            <circle cx="8" cy="8" r="2" fill="#3b1d08" />
          </g>
        )}

        {/* Rim leather trim band */}
        <path
          d="M 18,22 Q 50,29 82,22 Q 81,18 79,15 Q 50,22 21,15 Q 19,18 18,22 Z"
          fill="url(#rimGrad)"
          stroke="#2d1607"
          strokeWidth="1"
        />

        {/* Rawhide Cross-Stitching down the seam (Iconic Stone Age game cup detail) */}
        <g stroke="url(#laceGrad)" strokeWidth="2.2" strokeLinecap="round">
          {/* Stitch 1 */}
          <line x1="44" y1="38" x2="56" y2="46" />
          <line x1="56" y1="38" x2="44" y2="46" />
          <circle cx="44" cy="38" r="1.2" fill="#180b03" stroke="none" />
          <circle cx="56" cy="38" r="1.2" fill="#180b03" stroke="none" />
          <circle cx="44" cy="46" r="1.2" fill="#180b03" stroke="none" />
          <circle cx="56" cy="46" r="1.2" fill="#180b03" stroke="none" />

          {/* Stitch 2 */}
          <line x1="44" y1="56" x2="56" y2="64" />
          <line x1="56" y1="56" x2="44" y2="64" />
          <circle cx="44" cy="56" r="1.2" fill="#180b03" stroke="none" />
          <circle cx="56" cy="56" r="1.2" fill="#180b03" stroke="none" />
          <circle cx="44" cy="64" r="1.2" fill="#180b03" stroke="none" />
          <circle cx="56" cy="64" r="1.2" fill="#180b03" stroke="none" />

          {/* Stitch 3 */}
          <line x1="45" y1="74" x2="55" y2="82" />
          <line x1="55" y1="74" x2="45" y2="82" />
          <circle cx="45" cy="74" r="1.2" fill="#180b03" stroke="none" />
          <circle cx="55" cy="74" r="1.2" fill="#180b03" stroke="none" />
          <circle cx="45" cy="82" r="1.2" fill="#180b03" stroke="none" />
          <circle cx="55" cy="82" r="1.2" fill="#180b03" stroke="none" />

          {/* Stitch 4 */}
          <line x1="46" y1="92" x2="54" y2="100" />
          <line x1="54" y1="92" x2="46" y2="100" />
          <circle cx="46" cy="92" r="1.2" fill="#180b03" stroke="none" />
          <circle cx="54" cy="92" r="1.2" fill="#180b03" stroke="none" />
          <circle cx="46" cy="100" r="1.2" fill="#180b03" stroke="none" />
          <circle cx="54" cy="100" r="1.2" fill="#180b03" stroke="none" />
        </g>
      </svg>

      {/* Floating badge prompt when idle */}
      {state === 'idle' && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-md whitespace-nowrap group-hover:bg-amber-400 group-hover:scale-105 transition-all">
          {diceCount} {diceCount > 1 ? 'dés' : 'dé'}
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Authentic 3D Carved Beechwood Die
// ----------------------------------------------------------------------------
const DIE_DOT_LAYOUTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[26, 22], [74, 22], [26, 50], [74, 50], [26, 78], [74, 78]],
};

export interface WoodenDieProps {
  value: number;
  sizeClass?: string;
  dotSizeClass?: string;
  isRolling?: boolean;
  tumbleRotation?: number;
  restingTilt?: number;
  isInteractive?: boolean;
  isSelected?: boolean;
  isClaimed?: boolean;
  badge?: { label: string; color: string; icon?: string; rewardLabel?: string };
  onClick?: () => void;
}

export const WoodenDie: React.FC<WoodenDieProps> = ({
  value,
  sizeClass = 'w-14 h-14',
  dotSizeClass = 'w-3 h-3',
  isRolling = false,
  tumbleRotation = 0,
  restingTilt = 0,
  isInteractive = false,
  isSelected = false,
  isClaimed = false,
  badge,
  onClick,
}) => {
  const dots = DIE_DOT_LAYOUTS[value] || DIE_DOT_LAYOUTS[1];
  const safeVal = Math.max(1, Math.min(6, value));

  return (
    <div
      onClick={isInteractive && !isClaimed ? onClick : undefined}
      className={`relative select-none transition-all duration-200 ${sizeClass} ${
        isInteractive && !isClaimed
          ? 'cursor-pointer hover:scale-115 active:scale-95 group'
          : isClaimed
          ? 'opacity-40 grayscale-[40%]'
          : ''
      }`}
      style={{
        transform: isRolling
          ? `rotate(${tumbleRotation}deg) scale(1.08)`
          : `rotate(${restingTilt}deg)`,
        transition: isRolling ? 'none' : 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* 3D Physical Die Body */}
      <div
        className={`w-full h-full rounded-xl sm:rounded-2xl relative overflow-hidden transition-all ${
          isSelected
            ? 'ring-4 ring-amber-400 shadow-[0_0_22px_rgba(251,191,36,0.9)] scale-110'
            : isInteractive && !isClaimed
            ? 'group-hover:ring-2 group-hover:ring-amber-300 shadow-[0_10px_20px_rgba(0,0,0,0.7)]'
            : 'shadow-[0_8px_16px_rgba(0,0,0,0.75)]'
        }`}
        style={{
          // Realistic Beechwood Material
          background: 'radial-gradient(circle at 30% 25%, #f6e3c5 0%, #dfb77e 48%, #bd8c4c 85%, #96672f 100%)',
          boxShadow: `
            inset 1.5px 1.5px 2px rgba(255, 255, 255, 0.75),
            inset -2px -2px 3.5px rgba(60, 32, 10, 0.6),
            0 8px 18px rgba(0, 0, 0, 0.6)
          `,
          border: '1px solid #7c4b1d',
        }}
      >
        {/* Subtle organic wood grain streak */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(90, 48, 14, 0.4) 6px, rgba(90, 48, 14, 0.4) 8px)',
          }}
        />

        {/* Die Face Dots: Deep Carved / Burnt Dark Pips */}
        {dots.map(([px, py], i) => (
          <div
            key={i}
            className={`absolute rounded-full ${dotSizeClass} -translate-x-1/2 -translate-y-1/2`}
            style={{
              left: `${px}%`,
              top: `${py}%`,
              backgroundColor: safeVal === 1 ? '#8a1f11' : '#281304', // Authentic game die: 1 is slightly deep red-tinted or dark burnt
              boxShadow: `
                inset 1px 1px 1.5px rgba(0, 0, 0, 0.9),
                0 0.8px 1px rgba(255, 255, 255, 0.5)
              `,
            }}
          />
        ))}
      </div>

      {/* Claimed Badge in Draft Mode */}
      {isClaimed && badge && (
        <div
          className="absolute -top-2.5 -right-2.5 z-20 px-1.5 py-0.5 rounded-full text-[9px] font-black border shadow-lg flex items-center gap-1 shrink-0 whitespace-nowrap animate-scale-in"
          style={{
            backgroundColor: badge.color || '#3b82f6',
            color: '#ffffff',
            borderColor: 'rgba(255,255,255,0.7)',
          }}
        >
          {badge.icon && <span>{badge.icon}</span>}
          <span className="truncate max-w-[55px]">{badge.label}</span>
        </div>
      )}

      {/* Draft reward subtitle badge under die */}
      {badge && badge.rewardLabel && !isClaimed && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 bg-stone-900/95 border border-amber-500/70 text-amber-200 text-[8px] font-black px-1.5 py-0.2 rounded-md shadow-md whitespace-nowrap">
          {badge.rewardLabel}
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Master Prehistoric Leather Cup Rolling Arena
// ----------------------------------------------------------------------------
export const LeatherDiceCupRoll: React.FC<LeatherDiceCupRollProps> = ({
  diceCount,
  initialValues,
  targetValues,
  isControlledRolling,
  onRollStart,
  onRollComplete,
  hasRolled = false,
  isDraftMode = false,
  claimedIndices = [],
  selectedIndex = null,
  draftBadges = {},
  onDieClick,
  rollButtonLabel = 'Secouer & Lancer les dés !',
  className = '',
  compactAfterRoll = false,
  autoRoll = false,
}) => {
  const safeCount = Math.max(1, Math.min(10, diceCount));

  // Current values shown on dice
  const [diceValues, setDiceValues] = useState<number[]>(() => {
    if (initialValues && initialValues.length === safeCount) {
      return initialValues;
    }
    return Array.from({ length: safeCount }, () => 1);
  });

  // Physical resting angles (-9° to +9°) for each die
  const [restingTilts] = useState<number[]>(() =>
    Array.from({ length: 10 }, () => (Math.random() - 0.5) * 16)
  );

  // Tumble rotations during animation
  const [tumbleRotations, setTumbleRotations] = useState<number[]>(() =>
    Array.from({ length: 10 }, () => 0)
  );

  // Animation phase: 'idle' -> 'shaking' -> 'pouring' -> 'settled'
  const [cupState, setCupState] = useState<'idle' | 'shaking' | 'pouring' | 'settled'>(
    hasRolled ? 'settled' : 'idle'
  );

  const [localHasRolled, setLocalHasRolled] = useState(hasRolled);
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const shakeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      animTimeoutRef.current.forEach(t => clearTimeout(t));
      if (shakeIntervalRef.current) clearInterval(shakeIntervalRef.current);
    };
  }, []);

  // Sync external hasRolled
  useEffect(() => {
    if (hasRolled && !localHasRolled) {
      setLocalHasRolled(true);
      setCupState('settled');
    }
  }, [hasRolled]);

  // Sync target values if provided
  useEffect(() => {
    if (targetValues && targetValues.length === safeCount) {
      setDiceValues(targetValues);
    }
  }, [targetValues, safeCount]);

  // Auto roll trigger (e.g. for AI or automated turns)
  useEffect(() => {
    if (autoRoll && !localHasRolled && cupState === 'idle') {
      const timer = setTimeout(() => {
        triggerRoll();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoRoll, localHasRolled, cupState]);

  // Fast skip animation on tap
  const skipAnimation = (finalVals: number[]) => {
    animTimeoutRef.current.forEach(t => clearTimeout(t));
    animTimeoutRef.current = [];
    if (shakeIntervalRef.current) {
      clearInterval(shakeIntervalRef.current);
      shakeIntervalRef.current = null;
    }

    setDiceValues(finalVals);
    setCupState('settled');
    setLocalHasRolled(true);
    sound.playDiceLand();
    haptic.medium();

    if (onRollComplete) {
      onRollComplete(finalVals);
    }
  };

  // Trigger the full leather cup tumble roll
  const triggerRoll = () => {
    if (cupState === 'shaking' || cupState === 'pouring') return;

    if (onRollStart) onRollStart();

    // Determine final dice values
    const finalVals = targetValues && targetValues.length === safeCount
      ? targetValues
      : Array.from({ length: safeCount }, () => Math.floor(Math.random() * 6) + 1);

    // 1. Shaking phase (cup rattles left/right)
    setCupState('shaking');
    sound.playDiceShake();
    haptic.diceRoll();

    // Rattle dice values inside cup
    let shakeTicks = 0;
    shakeIntervalRef.current = setInterval(() => {
      setDiceValues(Array.from({ length: safeCount }, () => Math.floor(Math.random() * 6) + 1));
      setTumbleRotations(Array.from({ length: 10 }, () => Math.floor(Math.random() * 180) - 90));
      shakeTicks++;
      if (shakeTicks > 4) {
        if (shakeIntervalRef.current) clearInterval(shakeIntervalRef.current);
      }
    }, 60);

    // 2. Pouring phase: Cup tilts forward, dice tumble out (at 320ms)
    const t1 = setTimeout(() => {
      setCupState('pouring');
      sound.playDiceLand();
      haptic.medium();

      // Rapid tumble
      setDiceValues(Array.from({ length: safeCount }, () => Math.floor(Math.random() * 6) + 1));
      setTumbleRotations(Array.from({ length: 10 }, () => (Math.random() - 0.5) * 60));
    }, 320);

    // 3. Settle phase: Dice bounce and land on final values (at 680ms)
    const t2 = setTimeout(() => {
      setDiceValues(finalVals);
      setTumbleRotations(Array.from({ length: 10 }, () => 0));
      setCupState('settled');
      setLocalHasRolled(true);

      if (onRollComplete) {
        onRollComplete(finalVals);
      }
    }, 680);

    animTimeoutRef.current.push(t1, t2);
  };

  // Determine size classes based on dice count to ensure perfect mobile fitting
  const getDiceSizeClasses = () => {
    if (safeCount <= 2) {
      return {
        die: 'w-14 h-14 sm:w-16 sm:h-16',
        dot: 'w-3 h-3 sm:w-3.5 sm:h-3.5',
      };
    }
    if (safeCount <= 4) {
      return {
        die: 'w-11 h-11 sm:w-13 sm:h-13',
        dot: 'w-2.5 h-2.5 sm:w-3 sm:h-3',
      };
    }
    if (safeCount <= 6) {
      return {
        die: 'w-10 h-10 sm:w-12 sm:h-12',
        dot: 'w-2 h-2 sm:w-2.5 sm:h-2.5',
      };
    }
    // 7 to 10 dice (Heavy harvest with many meeples)
    return {
      die: 'w-9 h-9 sm:w-10 sm:h-10',
      dot: 'w-1.5 h-1.5 sm:w-2 sm:h-2',
    };
  };

  const { die: dieSize, dot: dotSize } = getDiceSizeClasses();
  const diceSum = diceValues.reduce((s, v) => s + v, 0);

  const isAnimating = cupState === 'shaking' || cupState === 'pouring';

  return (
    <div
      className={`relative w-full flex flex-col items-center justify-between bg-gradient-to-b from-[#1b120c] via-[#140d08] to-[#100a06] border border-amber-900/60 rounded-2xl p-2.5 sm:p-3.5 shadow-[inset_0_4px_16px_rgba(0,0,0,0.85)] select-none overflow-hidden ${className}`}
      style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 30%, rgba(138, 75, 23, 0.22), transparent 75%)',
      }}
    >
      {/* Tap anywhere during animation to fast skip */}
      {isAnimating && (
        <button
          onClick={() => {
            const finalVals = targetValues && targetValues.length === safeCount
              ? targetValues
              : diceValues;
            skipAnimation(finalVals);
          }}
          className="absolute top-2 right-2 z-30 flex items-center gap-1 bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-300 px-2 py-0.5 rounded-full border border-stone-700 text-[10px] font-bold shadow-md cursor-pointer transition-colors"
          title="Passer l'animation"
        >
          <FastForward className="w-3 h-3 text-amber-400" />
          <span>Passer</span>
        </button>
      )}

      {/* Top Section: The Iconic Stitched Leather Cup */}
      {(!compactAfterRoll || !localHasRolled) && (
        <div className="flex flex-col items-center justify-center pt-1 pb-1 shrink-0">
          <LeatherCup
            state={cupState}
            onClick={!localHasRolled && !isAnimating ? triggerRoll : undefined}
            diceCount={safeCount}
            size={safeCount > 6 ? 'compact' : 'normal'}
          />
        </div>
      )}

      {/* Rolling / Resting Arena Mat */}
      <div
        className="w-full flex-1 flex flex-col items-center justify-center my-1.5 sm:my-2 min-h-[70px] sm:min-h-[85px] px-1"
        onClick={() => {
          if (isAnimating) {
            const finalVals = targetValues && targetValues.length === safeCount
              ? targetValues
              : diceValues;
            skipAnimation(finalVals);
          }
        }}
      >
        {/* Dice tray container */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-full">
          {diceValues.map((val, idx) => (
            <WoodenDie
              key={idx}
              value={val}
              sizeClass={dieSize}
              dotSizeClass={dotSize}
              isRolling={isAnimating}
              tumbleRotation={tumbleRotations[idx] || 0}
              restingTilt={restingTilts[idx] || 0}
              isInteractive={isDraftMode && localHasRolled}
              isSelected={selectedIndex === idx}
              isClaimed={claimedIndices.includes(idx)}
              badge={draftBadges[idx]}
              onClick={() => onDieClick && onDieClick(idx, val)}
            />
          ))}
        </div>
      </div>

      {/* Bottom Controls / Status Area */}
      <div className="w-full shrink-0 flex flex-col items-center pt-1 border-t border-amber-950/70">
        {!localHasRolled ? (
          <button
            onClick={triggerRoll}
            disabled={isAnimating}
            className="w-full py-2 sm:py-2.5 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black rounded-xl shadow-[0_6px_18px_rgba(245,158,11,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer border border-amber-400"
          >
            <Dices className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
            <span>{isAnimating ? 'Lancement...' : rollButtonLabel}</span>
          </button>
        ) : (
          <div className="w-full flex items-center justify-between px-2 py-1 bg-stone-950/80 rounded-xl border border-amber-900/40">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-xs text-stone-400 uppercase font-bold tracking-wider">
                Total des dés :
              </span>
              <span className="text-base sm:text-xl font-black text-amber-300 drop-shadow">
                {diceSum}
              </span>
            </div>

            {isDraftMode ? (
              <span className="text-[10px] text-amber-400 font-semibold italic">
                Cliquez sur un dé pour le choisir
              </span>
            ) : (
              <span className="text-[10px] text-stone-400">
                {safeCount} {safeCount > 1 ? 'dés jetés' : 'dé jeté'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
