import React, { useState, useEffect, useCallback } from 'react';
import { Undo2 } from 'lucide-react';
import { 
  BoardLocationId, 
  CivilizationCard,
  GameSettings, 
  GameState, 
  ResourceType,
  PlayerState
} from './types/game';
import { 
  canPlaceMeeples, 
  checkAdvanceResolution,
  createInitialGameState, 
  forfeitResolution, 
  getLocationInfo, 
  getPlayerUnresolvedLocations, 
  passPlayerPlacement, 
  placeMeeples, 
  resolveBuildingPurchase, 
  resolveCardPurchase, 
  resolveCardDiceDraft,
  resolveDiceHarvest, 
  resolveHumanFeeding, 
  resolveVillageAction,
  resolveMerchantVisit,
  resolveMammothContest
} from './logic/gameEngine';
import { 
  getAiBuildingPayment, 
  getAiCardPayment, 
  getAiPlacementChoice, 
  getAiToolUsage 
} from './logic/ai';
import { sound, ambientMusic } from './logic/audio';
import { CompactNativeHUD } from './components/CompactNativeHUD';
import { GameHeader } from './components/GameHeader';
import { SmallWorldBoardView } from './components/Board/SmallWorldBoardView';
import { VirtualBoard3D } from './components/Board/VirtualBoard3D';
import { GameBoard } from './components/Board/GameBoard';
import { MobileTribalDrawer } from './components/Mobile/MobileTribalDrawer';
import { GameTurnGuide } from './components/GameTurnGuide';
import { PlayerReserveChest } from './components/PlayerReserveChest';
import { PlayerDashboard } from './components/PlayerDashboard';
import { GameLog } from './components/GameLog';
import { AiActionToast, AiActionData } from './components/AiActionToast';
import { RoundSummaryModal } from './components/Modals/RoundSummaryModal';
import { HomeScreen } from './components/HomeScreen';

// Modals
import { FirstPlayerDrawModal } from './components/Modals/FirstPlayerDrawModal';
import { GameSettingsModal } from './components/Modals/GameSettingsModal';
import { DiceRollModal } from './components/Modals/DiceRollModal';
import { DiceDraftModal } from './components/Modals/DiceDraftModal';
import { CardDiceRollModal } from './components/Modals/CardDiceRollModal';
import { CardPurchaseModal } from './components/Modals/CardPurchaseModal';
import { BuildingPurchaseModal } from './components/Modals/BuildingPurchaseModal';
import { FeedingModal } from './components/Modals/FeedingModal';
import { TutorialModal } from './components/Modals/TutorialModal';
import { EndGameModal } from './components/Modals/EndGameModal';
import { QRModal } from './components/Modals/QRModal';
import { NewGameModal } from './components/Modals/NewGameModal';
import { MeepleCountModal } from './components/Modals/MeepleCountModal';
import { DrawnCardRevealModal } from './components/Modals/DrawnCardRevealModal';
import { MerchantBarterModal } from './components/Modals/MerchantBarterModal';
import { MammothContestModal } from './components/Modals/MammothContestModal';
import { ClassicBoardZoneEditor } from './components/Board/ClassicBoardZoneEditor';
import { ResourceIcon } from './components/Common/ResourceIcon';
import { Eye, LayoutGrid, Sparkles, Compass, Smartphone, X } from 'lucide-react';

const DEFAULT_SETTINGS: GameSettings = {
  playerCount: 4,
  edition: 'modern',
  players: [
    { name: 'Rahan', color: 'red', isAi: false, aiDifficulty: 'normal' },
    { name: 'Ayla', color: 'blue', isAi: true, aiDifficulty: 'normal' },
    { name: 'Naoh', color: 'yellow', isAi: true, aiDifficulty: 'hard' },
    { name: 'Crao', color: 'green', isAi: true, aiDifficulty: 'easy' },
  ],
  variants: {
    firstTurnCourtesy: true,
    startingCompensation: true,
    twoPilesEnd: true,
    completeCycleEnd: true,
  },
  expansions: {
    newHuts: true,
    styleIsTheGoal: false,
    mammothHerd: false,
  },
};

const SAVE_KEY_STATE = 'age_de_pierre_saved_game_state';
const SAVE_KEY_SETTINGS = 'age_de_pierre_saved_game_settings';

export const App: React.FC = () => {
  const [currentSettings, setCurrentSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [state, setState] = useState<GameState>(() => createInitialGameState(DEFAULT_SETTINGS));

  // 1-Step Undo state (allows players to revert accidental moves)
  const [undoState, setUndoState] = useState<GameState | null>(null);

  const handleUndo = useCallback(() => {
    if (!undoState) return;
    sound.playClick();
    setState(undoState);
    setUndoState(null);
  }, [undoState]);

  // Keyboard shortcut: Ctrl+Z / Cmd+Z for undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Celtic Ambient Music toggle
  const [ambientMusicEnabled, setAmbientMusicEnabled] = useState(() => ambientMusic.enabled);

  // Game Persistence / Save state
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [savedRound, setSavedRound] = useState<number | undefined>(undefined);

  // Check on initial load if a saved game exists in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY_STATE);
      if (saved) {
        const parsed: GameState = JSON.parse(saved);
        if (parsed && parsed.round && parsed.phase !== 'game_over') {
          setHasSavedGame(true);
          setSavedRound(parsed.round);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Auto-save game state on meaningful state updates
  useEffect(() => {
    if (state && state.phase !== 'game_over') {
      try {
        localStorage.setItem(SAVE_KEY_STATE, JSON.stringify(state));
        localStorage.setItem(SAVE_KEY_SETTINGS, JSON.stringify(currentSettings));
        setHasSavedGame(true);
        setSavedRound(state.round);
      } catch (e) {
        console.warn('Auto-save error', e);
      }
    } else if (state?.phase === 'game_over') {
      try {
        localStorage.removeItem(SAVE_KEY_STATE);
        setHasSavedGame(false);
      } catch {}
    }
  }, [state, currentSettings]);

  // Board view mode: 'smallworld' (inspired by Small World Android with sidebands), 'virtual' (classic standalone 3D board) or 'grid' (modular)
  const [boardView, setBoardView] = useState<'smallworld' | 'virtual' | 'grid'>('smallworld');

  // Mobile / Smartphone UI states
  const [isTribalDrawerOpen, setIsTribalDrawerOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isZoneEditorOpen, setIsZoneEditorOpen] = useState(false);
  const [showLandscapeNotice, setShowLandscapeNotice] = useState(true);
  const [isNativeFs, setIsNativeFs] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const isFullscreen = isNativeFs || immersiveMode;

  // Fullscreen state listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsNativeFs(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        // Attempt landscape lock for smartphones where supported
        if ('orientation' in screen && screen.orientation && 'lock' in screen.orientation) {
          // @ts-ignore
          await screen.orientation.lock('landscape').catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request:', err);
    } finally {
      // Toggle immersive mode (ensures full-screen landscape layout on iOS & devices without Fullscreen API)
      setImmersiveMode(prev => !prev);
    }
  };

  // App navigation state: Home Screen vs In-Game
  const [isInGame, setIsInGame] = useState(false);

  // Modals state
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showFirstPlayerDrawModal, setShowFirstPlayerDrawModal] = useState(false);

  // Interaction modals
  const [countModalLoc, setCountModalLoc] = useState<BoardLocationId | null>(null);
  const [diceModalLoc, setDiceModalLoc] = useState<BoardLocationId | null>(null);
  const [cardModalLoc, setCardModalLoc] = useState<BoardLocationId | null>(null);
  const [buildingModalLoc, setBuildingModalLoc] = useState<BoardLocationId | null>(null);
  const [draftingCard, setDraftingCard] = useState<{
    card: CivilizationCard;
    locationId: BoardLocationId;
    resourcesPaid: Record<ResourceType, number>;
    buyerId: string;
  } | null>(null);
  const [rollingCard, setRollingCard] = useState<{
    card: CivilizationCard;
    locationId: BoardLocationId;
    resourcesPaid: Record<ResourceType, number>;
    buyerId: string;
  } | null>(null);
  const [drawnCardReveal, setDrawnCardReveal] = useState<{
    card: CivilizationCard;
    player: PlayerState;
    originalCard: CivilizationCard;
  } | null>(null);

  // Extensions modals
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [showMammothModal, setShowMammothModal] = useState(false);

  // AI visual action toast & Round summary
  const [aiActionNotice, setAiActionNotice] = useState<AiActionData | null>(null);
  const [showRoundSummaryModal, setShowRoundSummaryModal] = useState(false);
  const prevRoundRef = React.useRef<number>(state.round);

  // Auto-detect round progression to show round summary
  useEffect(() => {
    if (state.round > prevRoundRef.current && state.phase === 'placement' && prevRoundRef.current > 0) {
      setShowRoundSummaryModal(true);
    }
    prevRoundRef.current = state.round;
  }, [state.round, state.phase]);

  // Safeguard: Auto-advance resolution phase if active player has nothing to resolve or if all players are done
  useEffect(() => {
    if (state.phase === 'resolution') {
      const activeP = state.players[state.activePlayerIndex];
      if (!activeP || getPlayerUnresolvedLocations(activeP).length === 0) {
        setState(prev => checkAdvanceResolution(prev));
      }
    }
  }, [state.phase, state.activePlayerIndex, state.players]);

  const triggerAiNotice = (data: AiActionData) => {
    setAiActionNotice(data);
    setTimeout(() => {
      setAiActionNotice(prev => (prev?.id === data.id ? null : prev));
    }, 2800);
  };

  const activePlayer = state.players[state.activePlayerIndex] || state.players[0];

  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const toggleAmbientMusic = () => {
    const active = ambientMusic.toggle();
    setAmbientMusicEnabled(active);
  };

  // Pause & Save game state
  const handlePauseGame = () => {
    try {
      localStorage.setItem(SAVE_KEY_STATE, JSON.stringify(state));
      localStorage.setItem(SAVE_KEY_SETTINGS, JSON.stringify(currentSettings));
      setHasSavedGame(true);
      setSavedRound(state.round);
    } catch (e) {
      console.warn('Pause error', e);
    }
    setIsInGame(false);
    setIsSettingsModalOpen(false);
  };

  // Resume game from in-memory or persisted localStorage
  const handleResumeGame = () => {
    try {
      const saved = localStorage.getItem(SAVE_KEY_STATE);
      const savedSettings = localStorage.getItem(SAVE_KEY_SETTINGS);
      if (saved) {
        const parsed: GameState = JSON.parse(saved);
        if (parsed && parsed.round) {
          setState(parsed);
          if (savedSettings) {
            setCurrentSettings(JSON.parse(savedSettings));
          }
        }
      }
    } catch (e) {
      console.warn('Resume parse error', e);
    }
    setIsInGame(true);
  };

  const handleStartNewGame = (settings: GameSettings) => {
    setCurrentSettings(settings);
    const freshState = createInitialGameState(settings);
    setState(freshState);
    try {
      localStorage.setItem(SAVE_KEY_STATE, JSON.stringify(freshState));
      localStorage.setItem(SAVE_KEY_SETTINGS, JSON.stringify(settings));
      setHasSavedGame(true);
      setSavedRound(1);
    } catch {}
    setShowNewGameModal(false);
    setShowFirstPlayerDrawModal(true);
    setIsInGame(true);
  };

  const handleRestartGame = () => {
    const freshState = createInitialGameState(currentSettings);
    setState(freshState);
    try {
      localStorage.setItem(SAVE_KEY_STATE, JSON.stringify(freshState));
      localStorage.setItem(SAVE_KEY_SETTINGS, JSON.stringify(currentSettings));
      setHasSavedGame(true);
      setSavedRound(1);
    } catch {}
    setShowFirstPlayerDrawModal(true);
    setIsInGame(true);
  };

  // --- SAFE & REACTIVE AI AUTOMATION LOOP ---
  useEffect(() => {
    if (state.phase === 'game_over' || draftingCard || rollingCard || drawnCardReveal) return;
    if (!activePlayer.isAi) return;

    let isCancelled = false;

    // AI in Placement Phase
    if (state.phase === 'placement') {
      const timer = setTimeout(() => {
        if (isCancelled) return;
        try {
          const choice = getAiPlacementChoice(state, activePlayer.id);
          if (choice) {
            sound.playMeeplePlace();
            setState(prev => placeMeeples(prev, activePlayer.id, choice.locationId, choice.count));
          } else {
            // No valid placement available for AI: Pass remaining meeples
            setState(prev => passPlayerPlacement(prev, activePlayer.id));
          }
        } catch (e) {
          console.error('AI placement error', e);
          setState(prev => passPlayerPlacement(prev, activePlayer.id));
        }
      }, 650);

      return () => {
        isCancelled = true;
        clearTimeout(timer);
      };
    }

    // AI in Resolution Phase
    if (state.phase === 'resolution') {
      const unresolved = getPlayerUnresolvedLocations(activePlayer);
      if (unresolved.length === 0) return;

      // Priority order: village -> harvest -> cards -> buildings
      const priorityOrder = (loc: BoardLocationId): number => {
        if (loc === 'tool_maker' || loc === 'hut' || loc === 'field') return 1;
        if (['hunting', 'forest', 'clay_pit', 'quarry', 'river'].includes(loc)) return 2;
        if (loc.startsWith('card_')) return 3;
        if (loc.startsWith('building_')) return 4;
        return 5;
      };

      unresolved.sort((a, b) => priorityOrder(a) - priorityOrder(b));
      const targetLoc = unresolved[0];

      const timer = setTimeout(() => {
        if (isCancelled) return;
        try {
          // Resolve Village
          if (targetLoc === 'tool_maker' || targetLoc === 'hut' || targetLoc === 'field') {
            sound.playHarvest();
            if (targetLoc === 'tool_maker') {
              triggerAiNotice({
                id: Date.now().toString(),
                playerName: activePlayer.name,
                playerColor: activePlayer.color,
                actionTitle: "Fabrication d'outils",
                locationName: "Village",
                gainBadge: "+1 Outil permanent",
                icon: "🔨",
              });
            } else if (targetLoc === 'hut') {
              triggerAiNotice({
                id: Date.now().toString(),
                playerName: activePlayer.name,
                playerColor: activePlayer.color,
                actionTitle: "Agrandissement tribu",
                locationName: "La Hutte",
                gainBadge: "+1 Ouvrier au tour suivant",
                icon: "👶",
              });
            } else if (targetLoc === 'field') {
              triggerAiNotice({
                id: Date.now().toString(),
                playerName: activePlayer.name,
                playerColor: activePlayer.color,
                actionTitle: "Travail des champs",
                locationName: "Agriculture",
                gainBadge: `Niveau ${activePlayer.agriculture + 1} Champs`,
                icon: "🌾",
              });
            }
            setState(prev => resolveVillageAction(prev, activePlayer.id, targetLoc));
          }
          // Resolve Harvest (Hunting or Resources)
          else if (['hunting', 'forest', 'clay_pit', 'quarry', 'river'].includes(targetLoc)) {
            const meepleCount = activePlayer.placements[targetLoc] || 1;
            const diceValues = Array.from({ length: meepleCount }, () => Math.floor(Math.random() * 6) + 1);
            const diceSum = diceValues.reduce((s, v) => s + v, 0);
            const divisor = getLocationInfo(targetLoc, state).diceDivisor || 2;

            const toolsToUse = getAiToolUsage(
              diceSum,
              divisor,
              activePlayer.toolTiles,
              activePlayer.toolsUsedThisRound
            );

            const resName = targetLoc === 'hunting' ? 'Nourriture' : targetLoc === 'forest' ? 'Bois' : targetLoc === 'clay_pit' ? 'Glaise' : targetLoc === 'quarry' ? 'Pierre' : 'Or';
            const resType: ResourceType | 'food' = targetLoc === 'hunting' ? 'food' : targetLoc === 'forest' ? 'wood' : targetLoc === 'clay_pit' ? 'clay' : targetLoc === 'quarry' ? 'stone' : 'gold';
            const resIcon = <ResourceIcon type={resType} size="xs" />;
            const toolsBonus = toolsToUse.reduce((s, u, idx) => s + (u ? (activePlayer.toolTiles[idx] || 0) : 0), 0);
            const totalVal = diceSum + toolsBonus;
            const harvestedQty = Math.floor(totalVal / divisor);

            triggerAiNotice({
              id: Date.now().toString(),
              playerName: activePlayer.name,
              playerColor: activePlayer.color,
              actionTitle: `Récolte : ${getLocationInfo(targetLoc, state).name}`,
              locationName: getLocationInfo(targetLoc, state).name,
              diceText: `🎲 Dés: [${diceValues.join(', ')}] = ${diceSum}${toolsBonus > 0 ? ` (+${toolsBonus} outils)` : ''} ÷ ${divisor}`,
              gainBadge: `+${harvestedQty} ${resName}`,
              icon: resIcon,
            });

            sound.playHarvest();
            setState(prev => resolveDiceHarvest(prev, activePlayer.id, targetLoc, diceValues, toolsToUse));
          }
          // Resolve Card Purchase
          else if (targetLoc.startsWith('card_')) {
            const slot = parseInt(targetLoc.split('_')[1], 10);
            const cost = slot + 1;
            const payment = getAiCardPayment(activePlayer, cost);
            const card = state.activeCards[slot];

            if (payment && card) {
              sound.playPurchase();
              if (card.topBonus.type === 'dice_all_players') {
                setDraftingCard({
                  card,
                  locationId: targetLoc,
                  resourcesPaid: payment,
                  buyerId: activePlayer.id,
                });
                return;
              }
              triggerAiNotice({
                id: Date.now().toString(),
                playerName: activePlayer.name,
                playerColor: activePlayer.color,
                actionTitle: "Achat de Carte Civilisation",
                locationName: `Marché (Coût: ${cost})`,
                gainBadge: card.name,
                icon: "📜",
              });

              const willDrawCard = card.topBonus.type === 'draw_card' && state.cardsDeck.length > 0;
              const extraCard = willDrawCard ? state.cardsDeck[0] : null;

              setState(prev => resolveCardPurchase(prev, activePlayer.id, targetLoc, payment));

              if (extraCard && card) {
                setDrawnCardReveal({
                  card: extraCard,
                  player: activePlayer,
                  originalCard: card,
                });
              }
            } else {
              setState(prev => forfeitResolution(prev, activePlayer.id, targetLoc));
            }
          }
          // Resolve Building Construction
          else if (targetLoc.startsWith('building_')) {
            const pileIndex = parseInt(targetLoc.split('_')[1], 10);
            const pile = state.buildingPiles[pileIndex];
            if (pile && pile.length > 0) {
              const topTile = pile[pile.length - 1];
              const payment = getAiBuildingPayment(activePlayer, topTile);
              if (payment) {
                sound.playPurchase();
                triggerAiNotice({
                  id: Date.now().toString(),
                  playerName: activePlayer.name,
                  playerColor: activePlayer.color,
                  actionTitle: "Construction de Bâtiment",
                  locationName: `Hutte ${pileIndex + 1}`,
                  gainBadge: topTile.description,
                  icon: <ResourceIcon type="building" size="xs" />,
                });
                setState(prev => resolveBuildingPurchase(prev, activePlayer.id, targetLoc, payment));
              } else {
                setState(prev => forfeitResolution(prev, activePlayer.id, targetLoc));
              }
            } else {
              setState(prev => forfeitResolution(prev, activePlayer.id, targetLoc));
            }
          }
          // Resolve Extension 2 : Merchant Visit
          else if (targetLoc === 'merchant') {
            sound.playHarvest();
            const nextLvl = Math.min(5, (activePlayer.merchantLevel || 0) + 1);
            triggerAiNotice({
              id: Date.now().toString(),
              playerName: activePlayer.name,
              playerColor: activePlayer.color,
              actionTitle: "Visite au Marchand",
              locationName: "Échoppe & Troc",
              gainBadge: `Niveau ${nextLvl} Troc`,
              icon: "⚖️",
            });
            // AI trades wood for jewelry if available
            let tradeDetails: any = undefined;
            if ((activePlayer.resources.wood || 0) >= 3) {
              tradeDetails = { giveRes: 'wood', giveAmount: nextLvl >= 3 ? 1 : (nextLvl === 2 ? 2 : 3), buyJewelry: true, jewelryCount: 1 };
            }
            setState(prev => resolveMerchantVisit(prev, activePlayer.id, tradeDetails));
          }
          // Resolve Extension 3 : Mammoth Hunt
          else if (targetLoc === 'mammoth') {
            // Check if a human player is also on the hunt: if so, let human trigger the hunt modal!
            const humanHunter = state.players.find(p => !p.isAi && (p.placements['mammoth'] || 0) > 0);
            if (humanHunter) {
              setShowMammothModal(true);
            } else {
              sound.playHarvest();
              const meepleCount = activePlayer.placements['mammoth'] || 1;
              const dice = Array.from({ length: meepleCount }, () => Math.floor(Math.random() * 6) + 1);
              const foodWager = activePlayer.food > activePlayer.totalMeeples + 2 ? 2 : 0;
              
              const wagers: Record<string, number> = {};
              const rolls: Record<string, number[]> = {};
              state.players.forEach(p => {
                if ((p.placements['mammoth'] || 0) > 0) {
                  const c = p.placements['mammoth'] || 1;
                  rolls[p.id] = Array.from({ length: c }, () => Math.floor(Math.random() * 6) + 1);
                  wagers[p.id] = p.food > p.totalMeeples + 2 ? 2 : 0;
                }
              });
              rolls[activePlayer.id] = dice;
              wagers[activePlayer.id] = foodWager;

              triggerAiNotice({
                id: Date.now().toString(),
                playerName: activePlayer.name,
                playerColor: activePlayer.color,
                actionTitle: "Chasse au Mammouth",
                locationName: state.activeMammoth?.name || "Harde",
                gainBadge: `🎲 ${dice.reduce((a, b) => a + b, 0)} pts`,
                icon: "🦣",
              });

              setState(prev => resolveMammothContest(prev, wagers, rolls));
            }
          } else {
            setState(prev => forfeitResolution(prev, activePlayer.id, targetLoc));
          }
        } catch (e) {
          console.error('AI resolution error', e);
          setState(prev => forfeitResolution(prev, activePlayer.id, targetLoc));
        }
      }, 1250);

      return () => {
        isCancelled = true;
        clearTimeout(timer);
      };
    }
  }, [state, activePlayer, draftingCard, rollingCard, drawnCardReveal]);

  // --- HUMAN ZONE INTERACTION ---
  const handleZoneClick = (locationId: BoardLocationId) => {
    if (activePlayer.isAi) return;

    // 1. Placement phase
    if (state.phase === 'placement') {
      // Village Spots
      if (locationId === 'hut') {
        if (canPlaceMeeples(state, activePlayer.id, 'hut', 2).allowed) {
          setUndoState(state);
          sound.playMeeplePlace();
          setState(prev => placeMeeples(prev, activePlayer.id, 'hut', 2));
        }
        return;
      }
      if (locationId === 'tool_maker' || locationId === 'field') {
        if (canPlaceMeeples(state, activePlayer.id, locationId, 1).allowed) {
          setUndoState(state);
          sound.playMeeplePlace();
          setState(prev => placeMeeples(prev, activePlayer.id, locationId, 1));
        }
        return;
      }

      // Card / Building Slots (1 meeple fixed)
      if (locationId.startsWith('card_') || locationId.startsWith('building_')) {
        if (canPlaceMeeples(state, activePlayer.id, locationId, 1).allowed) {
          setUndoState(state);
          sound.playMeeplePlace();
          setState(prev => placeMeeples(prev, activePlayer.id, locationId, 1));
        }
        return;
      }

      // Resource zones & Hunting (open meeple count modal)
      if (['hunting', 'forest', 'clay_pit', 'quarry', 'river'].includes(locationId)) {
        if (canPlaceMeeples(state, activePlayer.id, locationId, 1).allowed) {
          setCountModalLoc(locationId);
        }
        return;
      }
    }

    // 2. Resolution phase
    if (state.phase === 'resolution') {
      const hasMyMeeples = (activePlayer.placements[locationId] || 0) > 0;
      if (!hasMyMeeples) return;

      // Village Actions resolve immediately!
      if (locationId === 'tool_maker' || locationId === 'hut' || locationId === 'field') {
        setUndoState(state);
        sound.playHarvest();
        setState(prev => resolveVillageAction(prev, activePlayer.id, locationId));
        return;
      }

      // Dice Harvest
      if (['hunting', 'forest', 'clay_pit', 'quarry', 'river'].includes(locationId)) {
        setDiceModalLoc(locationId);
        return;
      }

      // Card Purchase
      if (locationId.startsWith('card_')) {
        const slot = parseInt(locationId.split('_')[1], 10);
        const card = state.activeCards[slot];
        if (!card) {
          // Empty slot: auto-forfeit to refund meeple and prevent getting stuck
          setUndoState(state);
          setState(prev => forfeitResolution(prev, activePlayer.id, locationId));
          return;
        }
        setCardModalLoc(locationId);
        return;
      }

      // Building Construction
      if (locationId.startsWith('building_')) {
        const pileIndex = parseInt(locationId.split('_')[1], 10);
        const pile = state.buildingPiles[pileIndex];
        const tile = pile && pile.length > 0 ? pile[pile.length - 1] : null;
        if (!tile) {
          // Empty pile: auto-forfeit to refund meeple and prevent getting stuck
          setUndoState(state);
          setState(prev => forfeitResolution(prev, activePlayer.id, locationId));
          return;
        }
        setBuildingModalLoc(locationId);
        return;
      }

      // Extension 2 : Échoppe du Marchand
      if (locationId === 'merchant') {
        setShowMerchantModal(true);
        return;
      }

      // Extension 3 : Chasse au Mammouth
      if (locationId === 'mammoth') {
        setShowMammothModal(true);
        return;
      }
    }
  };

  // Human passes placement phase
  const handlePassPlacement = () => {
    setUndoState(state);
    setState(prev => passPlayerPlacement(prev, activePlayer.id));
  };

  // Human forfeits a reserved card or building
  const handleForfeitPlacement = (locationId: BoardLocationId) => {
    setUndoState(state);
    setState(prev => forfeitResolution(prev, activePlayer.id, locationId));
    setCardModalLoc(null);
    setBuildingModalLoc(null);
  };

  // Human clicks "Résoudre l'action suivante" from HUD, guide or bandeau
  const handleResolveNextZone = (locationId?: BoardLocationId) => {
    if (locationId) {
      handleZoneClick(locationId);
    } else {
      const unresolved = getPlayerUnresolvedLocations(activePlayer);
      if (unresolved.length > 0) {
        handleZoneClick(unresolved[0]);
      }
    }
  };

  // Confirm meeple count placement
  const handleConfirmMeepleCount = (count: number) => {
    if (countModalLoc) {
      setUndoState(state);
      sound.playMeeplePlace();
      setState(prev => placeMeeples(prev, activePlayer.id, countModalLoc, count));
      setCountModalLoc(null);
    }
  };

  // Confirm dice roll harvest
  const handleConfirmDiceHarvest = (diceValues: number[], toolsUsed: number[], tempToolsUsed: number = 0) => {
    if (diceModalLoc) {
      setUndoState(state);
      setState(prev => resolveDiceHarvest(prev, activePlayer.id, diceModalLoc, diceValues, toolsUsed, tempToolsUsed));
      setDiceModalLoc(null);
    }
  };

  // Confirm card purchase
  const handleConfirmCardPurchase = (resourcesPaid: Record<ResourceType, number>) => {
    if (cardModalLoc) {
      const slot = parseInt(cardModalLoc.split('_')[1], 10);
      const card = state.activeCards[slot];
      if (card && card.topBonus.type === 'dice_all_players') {
        setDraftingCard({
          card,
          locationId: cardModalLoc,
          resourcesPaid,
          buyerId: activePlayer.id,
        });
        setCardModalLoc(null);
        return;
      }
      if (card && card.topBonus.type === 'dice_roll') {
        setRollingCard({
          card,
          locationId: cardModalLoc,
          resourcesPaid,
          buyerId: activePlayer.id,
        });
        setCardModalLoc(null);
        return;
      }

      const willDrawCard = card && card.topBonus.type === 'draw_card' && state.cardsDeck.length > 0;
      const extraCard = willDrawCard ? state.cardsDeck[0] : null;

      setUndoState(state);
      setState(prev => resolveCardPurchase(prev, activePlayer.id, cardModalLoc, resourcesPaid));
      setCardModalLoc(null);

      if (extraCard && card) {
        setDrawnCardReveal({
          card: extraCard,
          player: activePlayer,
          originalCard: card,
        });
      }
    }
  };

  // Complete single-player 2-dice roll card
  const handleCompleteCardDiceRoll = (diceValues: number[], usedTools: number[], tempToolsUsed: number = 0) => {
    if (!rollingCard) return;
    const { card, locationId, resourcesPaid, buyerId } = rollingCard;
    const buyer = state.players.find(p => p.id === buyerId) || activePlayer;

    setUndoState(state);
    setState(prev => resolveCardPurchase(prev, buyerId, locationId, resourcesPaid, { diceValues, toolsUsed: usedTools, tempToolsUsed }));
    setRollingCard(null);

    const resType = card.topBonus.resourceType || 'wood';
    const divisor = resType === 'wood' ? 3 : resType === 'clay' ? 4 : resType === 'stone' ? 5 : resType === 'gold' ? 6 : 2;
    const toolBonus = usedTools.reduce((s, idx) => s + (buyer.toolTiles[idx] || 0), 0);
    const total = diceValues.reduce((s, v) => s + v, 0) + toolBonus;
    const count = Math.floor(total / divisor);

    triggerAiNotice({
      id: Date.now().toString(),
      playerName: buyer.name,
      playerColor: buyer.color,
      actionTitle: `Récolte aux dés : ${card.name}`,
      locationName: "Marché aux cartes",
      gainBadge: `+${count} ${resType} (Total: ${total})`,
      icon: "🎲",
    });
  };

  // Complete multi-player dice draft
  const handleCompleteDiceDraft = (selections: any[]) => {
    if (!draftingCard) return;
    const { card, locationId, resourcesPaid, buyerId } = draftingCard;
    const buyer = state.players.find(p => p.id === buyerId);

    setUndoState(state);
    setState(prev => resolveCardDiceDraft(prev, buyerId, locationId, resourcesPaid, selections));
    setDraftingCard(null);

    triggerAiNotice({
      id: Date.now().toString(),
      playerName: buyer?.name || 'Tirage',
      playerColor: buyer?.color || 'red',
      actionTitle: `Tirage de Dés : ${card.name}`,
      locationName: "Marché aux cartes",
      gainBadge: `${selections.length} bonus attribués`,
      icon: "🎲",
    });
  };

  // Confirm building purchase
  const handleConfirmBuildingPurchase = (resourcesPaid: Record<ResourceType, number>) => {
    if (buildingModalLoc) {
      setUndoState(state);
      setState(prev => resolveBuildingPurchase(prev, activePlayer.id, buildingModalLoc, resourcesPaid));
      setBuildingModalLoc(null);
    }
  };

  // Extension 2 : Confirm Merchant Visit & Barter
  const handleConfirmMerchantVisit = (tradeDetails?: any) => {
    setUndoState(state);
    sound.playPurchase();
    setState(prev => resolveMerchantVisit(prev, activePlayer.id, tradeDetails));
    setShowMerchantModal(false);
  };

  // Extension 3 : Confirm Mammoth Contest
  const handleConfirmMammothContest = (wagers: Record<string, number>, rolls: Record<string, number[]>) => {
    setUndoState(state);
    sound.playHarvest();
    setState(prev => resolveMammothContest(prev, wagers, rolls));
    setShowMammothModal(false);
  };

  // Confirm human famine resolution
  const handleConfirmFeeding = (resourcesPaid: Record<ResourceType, number>, acceptPenalty: boolean) => {
    setState(prev => resolveHumanFeeding(prev, activePlayer.id, resourcesPaid, acceptPenalty));
  };

  // Check if human needs feeding modal
  const isFeedingDeficit = 
    state.phase === 'feeding' &&
    !activePlayer.isAi &&
    !activePlayer.fedThisRound &&
    Math.max(0, activePlayer.totalMeeples - activePlayer.agriculture) > activePlayer.food;

  // Render Home Screen if not in game
  if (!isInGame) {
    return (
      <div className="h-[100dvh] w-full overflow-hidden bg-stone-950 text-stone-100 select-none">
        <HomeScreen
          onStartNewGame={() => setShowNewGameModal(true)}
          onResumeGame={handleResumeGame}
          onOpenTutorial={() => setShowTutorialModal(true)}
          onOpenZoneEditor={() => setIsZoneEditorOpen(true)}
          hasActiveGame={hasSavedGame || state.round > 1 || state.phase !== 'placement'}
          savedRound={savedRound || state.round}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          ambientMusicEnabled={ambientMusicEnabled}
          onToggleAmbientMusic={toggleAmbientMusic}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />

        {/* Classic Board Interactive Zone Calibration Editor */}
        <ClassicBoardZoneEditor
          isOpen={isZoneEditorOpen}
          onClose={() => setIsZoneEditorOpen(false)}
        />

        {/* Modal Configuration / Nouvelle Partie */}
        {showNewGameModal && (
          <NewGameModal
            initialSettings={currentSettings}
            onStart={(settings) => {
              handleStartNewGame(settings);
            }}
            onClose={() => setShowNewGameModal(false)}
          />
        )}

        {/* Modal Tutoriel & Règles */}
        {showTutorialModal && (
          <TutorialModal
            onClose={() => setShowTutorialModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] w-full overflow-hidden flex flex-col bg-stone-950 text-stone-100 select-none p-0 relative transition-all duration-300 ${
      !activePlayer.isAi ? (
        activePlayer.color === 'red' ? 'ring-2 ring-inset ring-red-500/50' :
        activePlayer.color === 'blue' ? 'ring-2 ring-inset ring-blue-500/50' :
        activePlayer.color === 'yellow' ? 'ring-2 ring-inset ring-amber-500/50' : 'ring-2 ring-inset ring-emerald-500/50'
      ) : ''
    }`}>
      {/* 1. ULTRA-COMPACT NATIVE MINI-HUD (36-40px) */}
      <CompactNativeHUD
        state={state}
        activePlayer={activePlayer}
        onOpenTribesDrawer={() => setIsTribalDrawerOpen(prev => !prev)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenFirstPlayerDraw={() => setShowFirstPlayerDrawModal(true)}
        onPassPlacement={handlePassPlacement}
        onResolveNextZone={() => handleResolveNextZone()}
        onPauseGame={handlePauseGame}
        onUndo={handleUndo}
        canPassPlacement={!activePlayer.isAi && state.phase === 'placement'}
        canResolveNextZone={!activePlayer.isAi && state.phase === 'resolution' && getPlayerUnresolvedLocations(activePlayer).length > 0}
        canUndo={!!undoState && !activePlayer.isAi}
      />

      {/* 2. PROMINENT ACTIVE PLAYER TURN BANNER & UNDO ACTION */}
      <div className="absolute top-11 inset-x-0 z-30 pointer-events-none flex items-center justify-center px-2">
        <div className="pointer-events-auto flex items-center gap-2 max-w-full">
          <div className={`px-3 sm:px-4 py-1 rounded-full border-2 shadow-[0_4px_20px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center gap-2 text-xs sm:text-sm font-black transition-all ${
            activePlayer.isAi
              ? 'bg-stone-950/90 border-stone-700 text-stone-300'
              : activePlayer.color === 'red' ? 'bg-red-950/95 border-red-500 text-red-100 ring-2 ring-red-400/50 shadow-[0_0_25px_rgba(239,68,68,0.5)]'
              : activePlayer.color === 'blue' ? 'bg-blue-950/95 border-blue-500 text-blue-100 ring-2 ring-blue-400/50 shadow-[0_0_25px_rgba(59,130,246,0.5)]'
              : activePlayer.color === 'yellow' ? 'bg-amber-950/95 border-amber-500 text-amber-100 ring-2 ring-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.5)]'
              : 'bg-emerald-950/95 border-emerald-500 text-emerald-100 ring-2 ring-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
          }`}>
            {/* Pulsing Avatar Disc */}
            <div 
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs text-white shadow font-black border border-white shrink-0 ${
                !activePlayer.isAi ? 'animate-bounce' : ''
              }`} 
              style={{ 
                backgroundColor: activePlayer.color === 'red' ? '#dc2626' : 
                                 activePlayer.color === 'blue' ? '#2563eb' : 
                                 activePlayer.color === 'yellow' ? '#d97706' : '#16a34a' 
              }}
            >
              {activePlayer.isAi ? '🤖' : '👉'}
            </div>

            {/* Turn Announcement text */}
            <div className="flex items-center gap-1.5 truncate">
              <span className="uppercase tracking-wide font-black">
                {!activePlayer.isAi ? `À votre tour, ${activePlayer.name} !` : `${activePlayer.name} (IA)`}
              </span>
              <span className="opacity-50 text-[10px] hidden xs:inline">•</span>
              <span className="text-[11px] sm:text-xs font-bold text-amber-300 hidden xs:inline truncate">
                {state.phase === 'placement' ? `Posez vos ouvriers (${activePlayer.availableMeeples} dispo)` :
                 state.phase === 'resolution' ? `Résolvez une action sur le plateau` :
                 state.phase === 'feeding' ? `Nourrissez votre tribu` : 'Fin de partie'}
              </span>
            </div>
          </div>

          {/* UNDO BUTTON RIGHT NEXT TO THE ACTIVE PLAYER BANNER */}
          {undoState && !activePlayer.isAi && (
            <button
              onClick={handleUndo}
              className="px-2.5 sm:px-3 py-1 rounded-full bg-stone-900/95 hover:bg-stone-800 text-amber-300 hover:text-white border-2 border-amber-500 shadow-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black hover:scale-105 active:scale-95 animate-pulse"
              title="Annuler le dernier coup et revenir 1 action en arrière (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Annuler</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Real-time Action Notification Toast */}
      <AiActionToast action={aiActionNotice} />

      {/* 2. MAIN BOARD - OCCUPIES 100% OF REMAINING VIEWPORT HEIGHT */}
      <main className="flex-1 w-full h-full min-h-0 relative overflow-hidden flex items-center justify-center p-0">
        {boardView === 'smallworld' ? (
          <SmallWorldBoardView
            state={state}
            activePlayer={activePlayer}
            onZoneClick={handleZoneClick}
            onPassPlacement={handlePassPlacement}
            onResolveNextZone={() => handleResolveNextZone()}
            canPassPlacement={!activePlayer.isAi && state.phase === 'placement'}
            canResolveNextZone={!activePlayer.isAi && state.phase === 'resolution' && getPlayerUnresolvedLocations(activePlayer).length > 0}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            isTribesDrawerOpen={isTribalDrawerOpen}
            onToggleTribesDrawer={() => setIsTribalDrawerOpen(prev => !prev)}
          />
        ) : boardView === 'virtual' ? (
          <div className="w-full h-full overflow-hidden flex items-center justify-center p-0">
            <VirtualBoard3D
              state={state}
              activePlayer={activePlayer}
              onZoneClick={handleZoneClick}
              className="w-full h-full"
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
              onOpenZoneEditor={() => setIsZoneEditorOpen(true)}
            />
          </div>
        ) : (
          <div className="w-full h-full overflow-auto flex items-center justify-center">
            <GameBoard
              state={state}
              activePlayer={activePlayer}
              onZoneClick={handleZoneClick}
            />
          </div>
        )}
      </main>

      {/* Sliding Mobile Tribal Drawer for Classic 3D or Modular views when toggled from HUD */}
      {boardView !== 'smallworld' && (
        <MobileTribalDrawer
          state={state}
          activePlayer={activePlayer}
          isOpen={isTribalDrawerOpen}
          onToggle={() => setIsTribalDrawerOpen(prev => !prev)}
          onClose={() => setIsTribalDrawerOpen(false)}
        />
      )}

      {/* --- MODALS --- */}
      {/* Game Settings & Options Modal */}
      <GameSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        boardView={boardView}
        onSelectBoardView={setBoardView}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        ambientMusicEnabled={ambientMusicEnabled}
        onToggleAmbientMusic={toggleAmbientMusic}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onNewGame={() => setShowNewGameModal(true)}
        onOpenTutorial={() => setShowTutorialModal(true)}
        onOpenQR={() => setShowQRModal(true)}
        onOpenSummary={() => setShowRoundSummaryModal(true)}
        onOpenFirstPlayerDraw={() => setShowFirstPlayerDrawModal(true)}
        onPauseGame={handlePauseGame}
        onGoHome={handlePauseGame}
        onOpenZoneEditor={() => setIsZoneEditorOpen(true)}
      />

      {/* Classic Board Interactive Zone Calibration Editor */}
      <ClassicBoardZoneEditor
        isOpen={isZoneEditorOpen}
        onClose={() => setIsZoneEditorOpen(false)}
      />

      {/* First Player Draw Lottery Modal */}
      <FirstPlayerDrawModal
        isOpen={showFirstPlayerDrawModal}
        onClose={() => setShowFirstPlayerDrawModal(false)}
        state={state}
      />
      {/* Meeple Count Picker Modal */}
      {countModalLoc && (
        <MeepleCountModal
          locationId={countModalLoc}
          player={activePlayer}
          state={state}
          onConfirm={handleConfirmMeepleCount}
          onCancel={() => setCountModalLoc(null)}
        />
      )}

      {/* Dice Roll & Tools Modal */}
      {diceModalLoc && (
        <DiceRollModal
          locationId={diceModalLoc}
          player={activePlayer}
          state={state}
          onConfirm={handleConfirmDiceHarvest}
          onCancel={() => setDiceModalLoc(null)}
        />
      )}

      {/* Card Purchase Modal */}
      {cardModalLoc && (() => {
        const slot = parseInt(cardModalLoc.split('_')[1], 10);
        const card = state.activeCards[slot];
        if (!card) return null;
        return (
          <CardPurchaseModal
            locationId={cardModalLoc}
            card={card}
            player={activePlayer}
            onConfirm={handleConfirmCardPurchase}
            onForfeit={() => handleForfeitPlacement(cardModalLoc)}
            onClose={() => setCardModalLoc(null)}
            isModern={boardView === 'smallworld'}
          />
        );
      })()}

      {/* Multi-player Dice Draft Modal for Special Civilization Cards */}
      {draftingCard && (
        <DiceDraftModal
          card={draftingCard.card}
          buyerPlayer={state.players.find(p => p.id === draftingCard.buyerId) || activePlayer}
          allPlayers={state.players}
          onComplete={handleCompleteDiceDraft}
        />
      )}

      {/* 2-Dice Resource Harvest Modal for Special Civilization Cards */}
      {rollingCard && (
        <CardDiceRollModal
          card={rollingCard.card}
          player={state.players.find(p => p.id === rollingCard.buyerId) || activePlayer}
          onConfirm={handleCompleteCardDiceRoll}
          isModern={boardView === 'smallworld'}
        />
      )}

      {/* Free Civilization Card Reveal Modal */}
      {drawnCardReveal && (
        <DrawnCardRevealModal
          card={drawnCardReveal.card}
          player={state.players.find(p => p.id === drawnCardReveal.player.id) || drawnCardReveal.player}
          originalCard={drawnCardReveal.originalCard}
          onClose={() => setDrawnCardReveal(null)}
          isModern={boardView === 'smallworld'}
        />
      )}

      {/* Building Purchase Modal */}
      {buildingModalLoc && (() => {
        const pileIndex = parseInt(buildingModalLoc.split('_')[1], 10);
        const pile = state.buildingPiles[pileIndex];
        const tile = pile ? pile[pile.length - 1] : null;
        if (!tile) return null;
        return (
          <BuildingPurchaseModal
            locationId={buildingModalLoc}
            tile={tile}
            player={activePlayer}
            onConfirm={handleConfirmBuildingPurchase}
            onForfeit={() => handleForfeitPlacement(buildingModalLoc)}
            onClose={() => setBuildingModalLoc(null)}
            isModern={boardView === 'smallworld'}
          />
        );
      })()}

      {/* Extension 2 : Merchant & Barter Modal */}
      {showMerchantModal && (
        <MerchantBarterModal
          player={activePlayer}
          onConfirm={handleConfirmMerchantVisit}
          onClose={() => setShowMerchantModal(false)}
        />
      )}

      {/* Extension 3 : Mammoth Contest Modal */}
      {showMammothModal && state.activeMammoth && (
        <MammothContestModal
          state={state}
          activeMammoth={state.activeMammoth}
          humanPlayer={activePlayer}
          onResolve={handleConfirmMammothContest}
          onClose={() => setShowMammothModal(false)}
        />
      )}

      {/* Feeding Modal (if human in deficit) */}
      {isFeedingDeficit && (
        <FeedingModal
          player={activePlayer}
          onConfirm={handleConfirmFeeding}
        />
      )}

      {/* Round End Summary Modal */}
      {showRoundSummaryModal && (
        <RoundSummaryModal
          state={state}
          onNextRound={() => setShowRoundSummaryModal(false)}
          onClose={() => setShowRoundSummaryModal(false)}
        />
      )}

      {/* End Game Scoring Modal */}
      {state.phase === 'game_over' && (
        <EndGameModal
          state={state}
          onRestart={handleRestartGame}
          onNewGame={() => setShowNewGameModal(true)}
        />
      )}

      {/* Tutorial Walkthrough Modal */}
      {showTutorialModal && (
        <TutorialModal
          onClose={() => setShowTutorialModal(false)}
        />
      )}

      {/* Smartphone QR Code Modal */}
      {showQRModal && (
        <QRModal
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* New Game Setup Modal */}
      {showNewGameModal && (
        <NewGameModal
          initialSettings={currentSettings}
          onStart={handleStartNewGame}
          onClose={() => setShowNewGameModal(false)}
        />
      )}
    </div>
  );
};

export default App;
