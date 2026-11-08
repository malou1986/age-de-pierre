import { 
  BoardLocationId, 
  BuildingTile, 
  CivilizationCard, 
  GameLogEntry, 
  GamePhase, 
  GameState, 
  GameVariants, 
  GameExpansionsConfig,
  GraphicEdition,
  DEFAULT_EXPANSIONS,
  DEFAULT_VARIANTS,
  MammothTile,
  PlayerState, 
  ResourceType 
} from '../types/game';
import { INITIAL_CIVILIZATION_CARDS } from '../data/cards';
import { ALL_BUILDING_TILES, RESOURCE_VALUES } from '../data/buildings';
import { NEW_HUTS_TILES } from '../data/newHuts';
import { ALL_MAMMOTH_TILES } from '../data/mammothTiles';

// Shuffle helper
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate unique id
export function uid(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Initialize tool array up to level (e.g. 1 -> [1, 0, 0], 4 -> [2, 1, 1], etc.)
export function addToolLevel(currentTiles: number[]): number[] {
  const tiles = [...currentTiles];
  while (tiles.length < 3) tiles.push(0);

  // Find lowest tile or first tile with lowest value
  let minIndex = 0;
  for (let i = 1; i < tiles.length; i++) {
    if (tiles[i] < tiles[minIndex]) {
      minIndex = i;
    }
  }

  if (tiles[minIndex] < 4) {
    tiles[minIndex] += 1;
  }
  tiles.sort((a, b) => b - a); // Keep sorted descending
  return tiles;
}

// Create Initial Game State
export function createInitialGameState(params: {
  players: {
    name: string;
    color: PlayerState['color'];
    isAi: boolean;
    aiDifficulty: 'easy' | 'normal' | 'hard';
  }[];
  variants?: GameVariants;
  expansions?: GameExpansionsConfig;
  edition?: GraphicEdition;
  firstPlayerIndex?: number;
}): GameState {
  const { players: playerConfigs } = params;
  const variants = params.variants || DEFAULT_VARIANTS;
  const expansions = params.expansions || DEFAULT_EXPANSIONS;
  const edition = params.edition || 'modern';
  const numPlayers = playerConfigs.length;

  // Draw the starting player by lot (or use provided index if explicitly set)
  const startingPlayerIndex = 
    params.firstPlayerIndex !== undefined 
      ? params.firstPlayerIndex 
      : Math.floor(Math.random() * numPlayers);

  // Initialize Players
  const players: PlayerState[] = playerConfigs.map((p, idx) => {
    let startingFood = 12;
    const resources: Record<ResourceType, number> = { wood: 0, clay: 0, stone: 0, gold: 0 };
    let toolTiles: number[] = [0, 0, 0];

    // Relative turn order starting from the starting player (0 = starting player, 1 = second, etc.)
    const turnOrder = (idx - startingPlayerIndex + numPlayers) % numPlayers;

    // Starting compensation variant (based on position relative to starting player)
    if (variants.startingCompensation) {
      if (numPlayers === 3) {
        // Discussion 3p recommendation:
        // P0 (starting): 12 food
        // P1: 12 food + 1 wood
        // P2: 12 food + 1 tool (or 1 clay + 1 wood)
        if (turnOrder === 1) resources.wood += 1;
        if (turnOrder === 2) toolTiles = [1, 0, 0]; // 1 direct permanent tool
      } else {
        // Standard compensation (4 players):
        if (turnOrder === 1) resources.wood += 1;
        if (turnOrder === 2) { resources.wood += 1; resources.clay += 1; }
        if (turnOrder === 3) { toolTiles = [1, 0, 0]; }
      }
    }

    return {
      id: `player_${idx}`,
      name: p.name,
      color: p.color,
      isAi: p.isAi,
      aiDifficulty: p.aiDifficulty,
      totalMeeples: 5,
      availableMeeples: 5,
      newMeepleNextRound: false,
      food: startingFood,
      agriculture: 0,
      toolTiles,
      toolsUsedThisRound: [false, false, false],
      temporaryTools: 0,
      resources,
      victoryPoints: 0,
      civilizationCards: [],
      buildings: [],
      jewelry: 0,
      merchantLevel: 0,
      mammothTiles: [],
      placements: {},
    };
  });

  // Prepare Civilization Cards (36 cards)
  const shuffledCards = shuffle(INITIAL_CIVILIZATION_CARDS);
  const activeCards: (CivilizationCard | null)[] = [
    shuffledCards.pop() || null,
    shuffledCards.pop() || null,
    shuffledCards.pop() || null,
    shuffledCards.pop() || null,
  ];

  // Prepare Building Piles (numPlayers piles of 7 tiles)
  // If "The New Huts" expansion is active, mix the 6 new unique huts into the building pool!
  const buildingPool = expansions.newHuts ? [...ALL_BUILDING_TILES, ...NEW_HUTS_TILES] : ALL_BUILDING_TILES;
  const shuffledBuildings = shuffle(buildingPool);
  const buildingPiles: BuildingTile[][] = [];
  for (let i = 0; i < numPlayers; i++) {
    buildingPiles.push(shuffledBuildings.slice(i * 7, (i + 1) * 7));
  }

  // Extension 3 : Préparer la pioche de Mammouths si activée
  let mammothDeck: MammothTile[] = [];
  let activeMammoth: MammothTile | null = null;
  if (expansions.mammothHerd) {
    const shuffledMammoths = shuffle(ALL_MAMMOTH_TILES);
    activeMammoth = shuffledMammoths.pop() || null;
    mammothDeck = shuffledMammoths;
  }

  const activeExpansionsList = [
    expansions.newHuts ? 'Nouvelles Huttes' : null,
    expansions.styleIsTheGoal ? 'Le Style c’est le But' : null,
    expansions.mammothHerd ? 'Harde de Mammouths' : null,
  ].filter(Boolean);

  const activeVariantsList = [
    variants.firstTurnCourtesy ? 'Courtoisie T1' : null,
    variants.startingCompensation ? 'Compensation de départ' : null,
    variants.twoPilesEnd ? 'Fin à 2 Piles' : null,
    variants.completeCycleEnd ? 'Égalité des tours' : null,
    variants.openResources2P ? 'Partage ressources 2J' : null,
  ].filter(Boolean);

  const initialLog: GameLogEntry[] = [
    {
      id: uid(),
      round: 1,
      text: `🎲 Tirage au sort : ${players[startingPlayerIndex].name} commence la partie (Premier Joueur 👑) !`,
      type: 'info',
      timestamp: Date.now(),
    },
    {
      id: uid(),
      round: 1,
      text: `Partie lancée (${edition === 'modern' ? 'Nouvelle Édition' : 'Édition Classique'}) avec ${numPlayers} joueurs ! ${
        activeExpansionsList.length > 0 ? `Extensions : ${activeExpansionsList.join(', ')} • ` : 'Jeu de base (sans extension) • '
      }${
        activeVariantsList.length > 0 ? `Variantes : ${activeVariantsList.join(', ')}` : 'Règles officielles pures'
      }`,
      type: 'info',
      timestamp: Date.now() + 1,
    }
  ];

  return {
    round: 1,
    phase: 'placement',
    players,
    firstPlayerIndex: startingPlayerIndex,
    activePlayerIndex: startingPlayerIndex,
    initialFirstPlayerIndex: startingPlayerIndex,
    endGameTriggered: false,
    cardsDeck: shuffledCards,
    activeCards,
    buildingPiles,
    currentResolutionZone: null,
    mammothDeck,
    activeMammoth,
    variants,
    expansions,
    edition,
    log: initialLog,
  };
}

// Check how many meeples are placed in a zone across all players
export function getZoneTotalMeeples(state: GameState, locationId: BoardLocationId): number {
  return state.players.reduce((sum, p) => sum + (p.placements[locationId] || 0), 0);
}

// Check which players have placed in a zone
export function getZonePlayers(state: GameState, locationId: BoardLocationId): string[] {
  return state.players.filter(p => (p.placements[locationId] || 0) > 0).map(p => p.id);
}

// Count occupied village spots (tool_maker, hut, field)
export function getOccupiedVillageSpotsCount(state: GameState): number {
  let count = 0;
  if (getZoneTotalMeeples(state, 'tool_maker') > 0) count++;
  if (getZoneTotalMeeples(state, 'hut') > 0) count++;
  if (getZoneTotalMeeples(state, 'field') > 0) count++;
  return count;
}

// Location metadata
export function getLocationInfo(locationId: BoardLocationId, state: GameState) {
  const numPlayers = state.players.length;
  const isRound1 = state.round === 1;

  switch (locationId) {
    case 'hunting':
      return { name: 'Chasse', diceDivisor: 2, resource: 'food', minMeeples: 1, maxTotal: 99 };
    case 'forest':
      return { name: 'Forêt (Bois)', diceDivisor: 3, resource: 'wood' as ResourceType, minMeeples: 1, maxTotal: 7 };
    case 'clay_pit':
      return { name: 'Glaisière (Glaise)', diceDivisor: 4, resource: 'clay' as ResourceType, minMeeples: 1, maxTotal: 7 };
    case 'quarry':
      return { name: 'Carrière (Pierre)', diceDivisor: 5, resource: 'stone' as ResourceType, minMeeples: 1, maxTotal: 7 };
    case 'river':
      return { name: 'Rivière (Or)', diceDivisor: 6, resource: 'gold' as ResourceType, minMeeples: 1, maxTotal: 7 };
    case 'tool_maker':
      return { name: 'Fabricant d’outils', minMeeples: 1, maxMeeples: 1, maxTotal: 1 };
    case 'hut':
      return { name: 'Hutte (Reproduction)', minMeeples: 2, maxMeeples: 2, maxTotal: 2 };
    case 'field':
      return { name: 'Champ (Agriculture)', minMeeples: 1, maxMeeples: 1, maxTotal: 1 };
    case 'merchant':
      return { name: 'Échoppe du Marchand (Troc & Parures)', minMeeples: 1, maxMeeples: 1, maxTotal: 1 };
    case 'mammoth':
      return { name: 'Chasse au Mammouth (Trophée de Harde)', minMeeples: 1, maxMeeples: 2, maxTotal: 4 };
    default:
      if (locationId.startsWith('card_')) {
        const slot = parseInt(locationId.split('_')[1], 10);
        return { name: `Carte Civilisation #${slot + 1}`, minMeeples: 1, maxMeeples: 1, maxTotal: 1, cost: slot + 1 };
      }
      if (locationId.startsWith('building_')) {
        const pile = parseInt(locationId.split('_')[1], 10);
        return { name: `Hutte / Bâtiment #${pile + 1}`, minMeeples: 1, maxMeeples: 1, maxTotal: 1 };
      }
      return { name: locationId, minMeeples: 1, maxTotal: 99 };
  }
}

// Can player place `count` meeples at `locationId`?
export function canPlaceMeeples(
  state: GameState,
  playerId: string,
  locationId: BoardLocationId,
  count: number
): { allowed: boolean; reason?: string } {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return { allowed: false, reason: 'Joueur introuvable.' };

  // Must have enough meeples
  if (player.availableMeeples < count) {
    return { allowed: false, reason: 'Pas assez d’ouvriers disponibles.' };
  }

  // Already placed in this zone this round
  if ((player.placements[locationId] || 0) > 0) {
    return { allowed: false, reason: 'Vous avez déjà posé des ouvriers ici cette manche.' };
  }

  const numPlayers = state.players.length;
  const zoneTotal = getZoneTotalMeeples(state, locationId);
  const zonePlayers = getZonePlayers(state, locationId);

  // Village checks
  if (locationId === 'tool_maker' || locationId === 'hut' || locationId === 'field') {
    // Village spot capacity
    if (zoneTotal > 0) {
      return { allowed: false, reason: 'Cet emplacement du village est déjà occupé.' };
    }

    // Player count village restriction
    // In 2 or 3 players: max 2 of 3 village spots can be occupied per round
    const villageOccupied = getOccupiedVillageSpotsCount(state);
    const allowAllVillage = state.variants.firstTurnCourtesy && state.round === 1 && numPlayers === 3;
    if (numPlayers <= 3 && !allowAllVillage && villageOccupied >= 2) {
      return { 
        allowed: false, 
        reason: 'À 2 ou 3 joueurs, seuls 2 des 3 emplacements du village peuvent être occupés par manche.' 
      };
    }

    if (locationId === 'hut') {
      if (count !== 2) return { allowed: false, reason: 'La hutte nécessite obligatoirement 2 ouvriers.' };
      if (player.totalMeeples >= 10) return { allowed: false, reason: 'Votre tribu a déjà atteint le maximum de 10 ouvriers.' };
    }

    if (locationId === 'field') {
      if (count !== 1) return { allowed: false, reason: 'Le champ nécessite 1 seul ouvrier.' };
      if (player.agriculture >= 10) return { allowed: false, reason: 'Votre agriculture est déjà au maximum (10).' };
    }

    if (locationId === 'tool_maker') {
      if (count !== 1) return { allowed: false, reason: 'Le fabricant d’outils nécessite 1 seul ouvrier.' };
      const currentToolSum = player.toolTiles.reduce((s, t) => s + t, 0);
      if (currentToolSum >= 12) return { allowed: false, reason: 'Vos outils sont déjà au niveau maximal (12).' };
    }

    return { allowed: true };
  }

  // Hunting
  if (locationId === 'hunting') {
    if (count < 1) return { allowed: false, reason: 'Il faut poser au moins 1 ouvrier.' };
    return { allowed: true };
  }

  // Resources (Forest, Clay, Quarry, River)
  if (['forest', 'clay_pit', 'quarry', 'river'].includes(locationId)) {
    if (count < 1) return { allowed: false, reason: 'Il faut poser au moins 1 ouvrier.' };
    if (zoneTotal + count > 7) {
      return { allowed: false, reason: `Zone pleine ! (Maximum 7 ouvriers, reste ${7 - zoneTotal}).` };
    }

    // Règles officielles de partage des ressources selon le nombre de joueurs :
    // - À 2 joueurs : un seul joueur peut occuper chaque zone de ressources par manche (sauf si variante openResources2P activée)
    if (numPlayers === 2 && !state.variants?.openResources2P) {
      if (zonePlayers.length >= 1 && !zonePlayers.includes(playerId)) {
        return { 
          allowed: false, 
          reason: 'À 2 joueurs (règle officielle), un seul joueur peut occuper chaque zone de ressources.' 
        };
      }
    } else if (numPlayers === 3) {
      // - À 3 joueurs : au maximum 2 joueurs différents peuvent partager une zone de ressources (max 7 ouvriers au total)
      if (zonePlayers.length >= 2 && !zonePlayers.includes(playerId)) {
        return { 
          allowed: false, 
          reason: 'À 3 joueurs, au maximum 2 joueurs différents peuvent partager une zone de ressources.' 
        };
      }
    }
    // - À 4 ou 5 joueurs : tous les joueurs peuvent placer des ouvriers dans la même zone (tant que le total <= 7).

    return { allowed: true };
  }

  // Civilization Cards
  if (locationId.startsWith('card_')) {
    const slot = parseInt(locationId.split('_')[1], 10);
    if (!state.activeCards[slot]) {
      return { allowed: false, reason: 'Aucune carte présente sur cet emplacement.' };
    }
    if (count !== 1) return { allowed: false, reason: '1 seul ouvrier pour réserver une carte.' };
    if (zoneTotal > 0) return { allowed: false, reason: 'Cette carte est déjà réservée.' };
    return { allowed: true };
  }

  // Buildings
  if (locationId.startsWith('building_')) {
    const pile = parseInt(locationId.split('_')[1], 10);
    if (!state.buildingPiles[pile] || state.buildingPiles[pile].length === 0) {
      return { allowed: false, reason: 'Cette pile de bâtiments est vide.' };
    }
    if (count !== 1) return { allowed: false, reason: '1 seul ouvrier pour construire un bâtiment.' };
    if (zoneTotal > 0) return { allowed: false, reason: 'Cet emplacement de bâtiment est déjà réservé.' };
    return { allowed: true };
  }

  // Extension 2 : Échoppe du Marchand (Le Style, c'est le But)
  if (locationId === 'merchant') {
    if (!state.expansions?.styleIsTheGoal) {
      return { allowed: false, reason: 'L’extension Le Style, c’est le But n’est pas active.' };
    }
    if (count !== 1) {
      return { allowed: false, reason: 'L’échoppe du marchand requiert exactement 1 ouvrier.' };
    }
    if (zoneTotal > 0) {
      return { allowed: false, reason: 'L’échoppe du marchand est déjà occupée cette manche.' };
    }
    return { allowed: true };
  }

  // Extension 3 : La Chasse au Mammouth (La Harde de Mammouths)
  if (locationId === 'mammoth') {
    if (!state.expansions?.mammothHerd) {
      return { allowed: false, reason: 'L’extension La Harde de Mammouths n’est pas active.' };
    }
    if (!state.activeMammoth) {
      return { allowed: false, reason: 'Aucun mammouth n’est présent sur la plaine de chasse.' };
    }
    if (count < 1 || count > 2) {
      return { allowed: false, reason: 'Vous pouvez envoyer 1 ou 2 chasseurs au mammouth.' };
    }
    if (zoneTotal + count > 4) {
      return { allowed: false, reason: `Chasse complète (max 4 chasseurs au total, reste ${4 - zoneTotal}).` };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Action inconnue.' };
}

// Perform placement
export function placeMeeples(
  state: GameState,
  playerId: string,
  locationId: BoardLocationId,
  count: number
): GameState {
  const validation = canPlaceMeeples(state, playerId, locationId, count);
  if (!validation.allowed) {
    throw new Error(validation.reason || 'Placement interdit.');
  }

  const newState: GameState = {
    ...state,
    players: state.players.map(p => {
      if (p.id !== playerId) return p;
      return {
        ...p,
        availableMeeples: p.availableMeeples - count,
        placements: {
          ...p.placements,
          [locationId]: count,
        },
      };
    }),
    log: [
      ...state.log,
      {
        id: uid(),
        round: state.round,
        playerId,
        text: `${state.players.find(p => p.id === playerId)?.name} pose ${count} ouvrier(s) sur : ${getLocationInfo(locationId, state).name}`,
        type: 'action',
        timestamp: Date.now(),
      }
    ],
  };

  // Find next active player who still has meeples
  let nextIndex = (newState.activePlayerIndex + 1) % newState.players.length;
  let loops = 0;
  while (newState.players[nextIndex].availableMeeples === 0 && loops < newState.players.length) {
    nextIndex = (nextIndex + 1) % newState.players.length;
    loops++;
  }

  // If no one has meeples left, switch to resolution phase!
  const allMeeplesPlaced = newState.players.every(p => p.availableMeeples === 0);
  if (allMeeplesPlaced) {
    newState.phase = 'resolution';
    newState.activePlayerIndex = newState.firstPlayerIndex;
    newState.log.push({
      id: uid(),
      round: newState.round,
      text: `Tous les ouvriers sont posés ! Début de la phase de résolution.`,
      type: 'info',
      timestamp: Date.now(),
    });
    // Check if active player has placements or advance immediately to next player / feeding
    return checkAdvanceResolution(newState);
  } else {
    newState.activePlayerIndex = nextIndex;
  }

  return newState;
}

// Player passes remaining placements (e.g. no valid spot or chooses to pass)
export function passPlayerPlacement(state: GameState, playerId: string): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return state;

  const newState: GameState = {
    ...state,
    players: state.players.map(p => {
      if (p.id !== playerId) return p;
      return {
        ...p,
        availableMeeples: 0,
      };
    }),
    log: [
      ...state.log,
      {
        id: uid(),
        round: state.round,
        playerId,
        text: `${player.name} passe et termine ses poses d'ouvriers pour cette manche.`,
        type: 'action',
        timestamp: Date.now(),
      }
    ],
  };

  // Find next active player who still has meeples
  let nextIndex = (newState.activePlayerIndex + 1) % newState.players.length;
  let loops = 0;
  while (newState.players[nextIndex].availableMeeples === 0 && loops < newState.players.length) {
    nextIndex = (nextIndex + 1) % newState.players.length;
    loops++;
  }

  // If no one has meeples left, switch to resolution phase!
  const allMeeplesPlaced = newState.players.every(p => p.availableMeeples === 0);
  if (allMeeplesPlaced) {
    newState.phase = 'resolution';
    newState.activePlayerIndex = newState.firstPlayerIndex;
    newState.log.push({
      id: uid(),
      round: newState.round,
      text: `Tous les ouvriers sont posés ! Début de la phase de résolution.`,
      type: 'info',
      timestamp: Date.now(),
    });
    // Check if active player has placements or advance immediately to next player / feeding
    return checkAdvanceResolution(newState);
  } else {
    newState.activePlayerIndex = nextIndex;
  }

  return newState;
}

// Helper: Check if active player has any unresolved placements
export function getPlayerUnresolvedLocations(player: PlayerState): BoardLocationId[] {
  return (Object.keys(player.placements) as BoardLocationId[]).filter(
    loc => (player.placements[loc] || 0) > 0
  );
}

// Resolve Village Actions
export function resolveVillageAction(
  state: GameState,
  playerId: string,
  locationId: 'tool_maker' | 'hut' | 'field'
): GameState {
  const player = state.players.find(p => p.id === playerId)!;
  let logText = '';

  const updatedPlayers = state.players.map(p => {
    if (p.id !== playerId) return p;
    const newPlacements = { ...p.placements };
    delete newPlacements[locationId];

    if (locationId === 'tool_maker') {
      const oldTools = [...p.toolTiles];
      const newTools = addToolLevel(p.toolTiles);
      const newToolsUsed = [...p.toolsUsedThisRound];
      for (let i = 0; i < newTools.length; i++) {
        if (newTools[i] > (oldTools[i] || 0)) {
          newToolsUsed[i] = false;
          break;
        }
      }
      logText = `${p.name} fabrique de nouveaux outils (Total : ${newTools.reduce((s, t) => s + t, 0)})`;
      return { ...p, toolTiles: newTools, toolsUsedThisRound: newToolsUsed, placements: newPlacements };
    } else if (locationId === 'hut') {
      logText = `${p.name} agrandit sa tribu (+1 ouvrier à la manche suivante !)`;
      return { ...p, newMeepleNextRound: true, placements: newPlacements };
    } else if (locationId === 'field') {
      const newAgri = Math.min(10, p.agriculture + 1);
      logText = `${p.name} cultive son champ (Agriculture : ${newAgri})`;
      return { ...p, agriculture: newAgri, placements: newPlacements };
    }
    return p;
  });

  return checkAdvanceResolution({
    ...state,
    players: updatedPlayers,
    log: [
      ...state.log,
      { id: uid(), round: state.round, playerId, text: logText, type: 'village', timestamp: Date.now() }
    ],
  });
}

// Extension 2 : Résolution de la visite chez le Marchand & Piste de Troc
export function resolveMerchantVisit(
  state: GameState,
  playerId: string,
  tradeDetails?: {
    giveRes?: ResourceType;
    giveAmount?: number;
    getRes?: ResourceType;
    getAmount?: number;
    buyJewelry?: boolean;
    jewelryCount?: number;
  }
): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return state;

  const currentLevel = player.merchantLevel || 0;
  const newLevel = Math.min(5, currentLevel + 1);
  let bonusJewelry = 0;
  if (newLevel === 3 && currentLevel < 3) bonusJewelry += 1;
  if (newLevel === 4 && currentLevel < 4) bonusJewelry += 1;
  if (newLevel === 5 && currentLevel < 5) bonusJewelry += 2;

  let logText = `⚖️ ${player.name} visite l'échoppe du marchand : niveau de troc ${newLevel}/5`;
  if (bonusJewelry > 0) {
    logText += ` (+${bonusJewelry} Parure(s) offerte(s) !)`;
  }

  const updatedPlayers = state.players.map(p => {
    if (p.id !== playerId) return p;
    const newPlacements = { ...p.placements };
    delete newPlacements['merchant'];

    const newResources = { ...p.resources };
    let totalJewelry = (p.jewelry || 0) + bonusJewelry;

    if (tradeDetails) {
      if (tradeDetails.giveRes && tradeDetails.giveAmount && (newResources[tradeDetails.giveRes] || 0) >= tradeDetails.giveAmount) {
        newResources[tradeDetails.giveRes] -= tradeDetails.giveAmount;
        if (tradeDetails.buyJewelry && tradeDetails.jewelryCount) {
          totalJewelry += tradeDetails.jewelryCount;
          logText += ` • Troc : ${tradeDetails.giveAmount} ${tradeDetails.giveRes} contre ${tradeDetails.jewelryCount} Parure(s) 📿`;
        } else if (tradeDetails.getRes && tradeDetails.getAmount) {
          newResources[tradeDetails.getRes] += tradeDetails.getAmount;
          logText += ` • Troc : ${tradeDetails.giveAmount} ${tradeDetails.giveRes} contre ${tradeDetails.getAmount} ${tradeDetails.getRes}`;
        }
      }
    }

    return {
      ...p,
      merchantLevel: newLevel,
      jewelry: totalJewelry,
      resources: newResources,
      placements: newPlacements,
    };
  });

  return checkAdvanceResolution({
    ...state,
    players: updatedPlayers,
    log: [
      ...state.log,
      { id: uid(), round: state.round, playerId, text: logText, type: 'village', timestamp: Date.now() }
    ],
  });
}

// Extension 3 : Résolution de la Chasse au Mammouth
export function resolveMammothContest(
  state: GameState,
  wagers: Record<string, number>, // playerId -> food wagered
  rolls: Record<string, number[]> // playerId -> dice roll values
): GameState {
  if (!state.activeMammoth) return state;

  const mammoth = state.activeMammoth;
  const hunters = state.players.filter(p => (p.placements['mammoth'] || 0) > 0);
  if (hunters.length === 0) return state;

  // Calcul des scores pour chaque chasseur
  const results = hunters.map(hunter => {
    const dice = rolls[hunter.id] || [Math.floor(Math.random() * 6) + 1];
    const diceSum = dice.reduce((s, v) => s + v, 0);
    const wager = Math.min(hunter.food, Math.max(0, wagers[hunter.id] || 0));
    const totalScore = diceSum + wager;
    return {
      hunter,
      dice,
      diceSum,
      wager,
      totalScore,
    };
  });

  // Tri décroissant
  results.sort((a, b) => b.totalScore - a.totalScore);
  const winner = results[0];

  let logText = `🦣 Chasse au Mammouth (${mammoth.name}) : ${winner.hunter.name} l'emporte avec ${winner.totalScore} pts (${winner.diceSum} dés + ${winner.wager} vivres) !`;

  const updatedPlayers = state.players.map(p => {
    const participant = results.find(r => r.hunter.id === p.id);
    if (!participant) return p;

    const newPlacements = { ...p.placements };
    delete newPlacements['mammoth'];

    const newFood = Math.max(0, p.food - participant.wager);
    let newTiles = p.mammothTiles ? [...p.mammothTiles] : [];
    let resources = { ...p.resources };
    let agri = p.agriculture;
    let toolTiles = [...p.toolTiles];

    if (p.id === winner.hunter.id) {
      newTiles.push(mammoth);

      // Appliquer les bonus instantanés de la tuile
      if (mammoth.bonusType === 'food') {
        const added = mammoth.bonusAmount || 2;
        logText += ` • Récompense : +${added} Nourritures & ${mammoth.victoryPoints} VP`;
        return {
          ...p,
          food: newFood + added,
          mammothTiles: newTiles,
          placements: newPlacements,
        };
      } else if (mammoth.bonusType === 'resource' && mammoth.bonusResource) {
        resources[mammoth.bonusResource] = (resources[mammoth.bonusResource] || 0) + (mammoth.bonusAmount || 1);
        logText += ` • Récompense : +${mammoth.bonusAmount} ${mammoth.bonusResource} & ${mammoth.victoryPoints} VP`;
      } else if (mammoth.bonusType === 'tool') {
        toolTiles = addToolLevel(toolTiles);
        logText += ` • Récompense : +1 Outil permanent & ${mammoth.victoryPoints} VP`;
      } else if (mammoth.bonusType === 'agriculture') {
        agri = Math.min(10, agri + 1);
        logText += ` • Récompense : +1 Agriculture & ${mammoth.victoryPoints} VP`;
      } else {
        logText += ` • Récompense : +${mammoth.victoryPoints} VP direct`;
      }

      return {
        ...p,
        food: newFood,
        resources,
        agriculture: agri,
        toolTiles,
        mammothTiles: newTiles,
        placements: newPlacements,
      };
    } else {
      // Consolation pour les autres participants : +1 nourriture
      return {
        ...p,
        food: newFood + 1,
        placements: newPlacements,
      };
    }
  });

  return checkAdvanceResolution({
    ...state,
    activeMammoth: null, // Capturé !
    players: updatedPlayers,
    log: [
      ...state.log,
      { id: uid(), round: state.round, text: logText, type: 'hunting', timestamp: Date.now() }
    ],
  });
}

// Resolve Dice Harvest (Hunting / Forest / Clay Pit / Quarry / River)
export function resolveDiceHarvest(
  state: GameState,
  playerId: string,
  locationId: BoardLocationId,
  diceValues: number[],
  toolsUsedIndices: number[], // indices in player.toolTiles
  tempToolsUsed: number = 0
): GameState {
  const player = state.players.find(p => p.id === playerId)!;
  const info = getLocationInfo(locationId, state);
  const divisor = info.diceDivisor || 2;

  // Calculate tool power used
  let toolBonus = 0;
  const newToolsUsed = [...player.toolsUsedThisRound];
  toolsUsedIndices.forEach(idx => {
    if (idx >= 0 && idx < player.toolTiles.length && !newToolsUsed[idx]) {
      toolBonus += player.toolTiles[idx];
      newToolsUsed[idx] = true;
    }
  });

  const actualTempTools = Math.min(Math.max(0, tempToolsUsed), player.temporaryTools || 0);
  toolBonus += actualTempTools;
  const newTempTools = Math.max(0, (player.temporaryTools || 0) - actualTempTools);

  const diceSum = diceValues.reduce((s, v) => s + v, 0);
  const totalValue = diceSum + toolBonus;
  const yieldCount = Math.floor(totalValue / divisor);

  let logText = `${player.name} lance ${diceValues.length} dés sur ${info.name} : [${diceValues.join(', ')}] = ${diceSum}`;
  if (toolBonus > 0) {
    logText += ` + ${toolBonus} (outils${actualTempTools > 0 ? ` dont ${actualTempTools} temp.` : ''}) = ${totalValue}`;
  }
  logText += ` ÷ ${divisor} ➔ Récolte : ${yieldCount} ${info.resource === 'food' ? 'Nourriture(s)' : info.resource}`;

  const updatedPlayers = state.players.map(p => {
    if (p.id !== playerId) return p;
    const newPlacements = { ...p.placements };
    delete newPlacements[locationId];

    if (info.resource === 'food') {
      return {
        ...p,
        food: p.food + yieldCount,
        toolsUsedThisRound: newToolsUsed,
        temporaryTools: newTempTools,
        placements: newPlacements,
      };
    } else {
      const resKey = info.resource as ResourceType;
      return {
        ...p,
        resources: {
          ...p.resources,
          [resKey]: p.resources[resKey] + yieldCount,
        },
        toolsUsedThisRound: newToolsUsed,
        temporaryTools: newTempTools,
        placements: newPlacements,
      };
    }
  });

  return checkAdvanceResolution({
    ...state,
    players: updatedPlayers,
    log: [
      ...state.log,
      { id: uid(), round: state.round, playerId, text: logText, type: 'harvest', timestamp: Date.now() }
    ],
  });
}

// Resolve Card Purchase
export function resolveCardPurchase(
  state: GameState,
  playerId: string,
  locationId: BoardLocationId,
  resourcesPaid: Record<ResourceType, number>,
  diceResult?: { diceValues: number[]; toolsUsed: number[]; tempToolsUsed?: number }
): GameState {
  const player = state.players.find(p => p.id === playerId)!;
  const slot = parseInt(locationId.split('_')[1], 10);
  const card = state.activeCards[slot];

  if (!card) {
    // If card missing, just release meeples
    const updatedPlayers = state.players.map(p => {
      if (p.id !== playerId) return p;
      const newPlacements = { ...p.placements };
      delete newPlacements[locationId];
      return { ...p, placements: newPlacements };
    });
    return checkAdvanceResolution({ ...state, players: updatedPlayers });
  }

  // Deduct resources paid
  const newResources = { ...player.resources };
  let totalPaid = 0;
  for (const [res, count] of Object.entries(resourcesPaid) as [ResourceType, number][]) {
    newResources[res] = Math.max(0, newResources[res] - count);
    totalPaid += count;
  }

  // Apply card top bonus
  let bonusDesc = card.topBonus.description;
  let newFood = player.food;
  let newAgri = player.agriculture;
  let newVP = player.victoryPoints;
  let newToolTiles = [...player.toolTiles];
  let newTempTools = player.temporaryTools;
  let newToolsUsedThisRound = [...player.toolsUsedThisRound];

  let newCardsDeck = [...state.cardsDeck];
  let extraCards: CivilizationCard[] = [];
  if (card.topBonus.type === 'food_fixed') {
    newFood += card.topBonus.value || 0;
  } else if (card.topBonus.type === 'agriculture') {
    newAgri = Math.min(10, newAgri + (card.topBonus.value || 1));
  } else if (card.topBonus.type === 'victory_points') {
    newVP += card.topBonus.value || 0;
  } else if (card.topBonus.type === 'tool_upgrade') {
    const oldTiles = [...player.toolTiles];
    newToolTiles = addToolLevel(newToolTiles);
    // Newly gained / upgraded tool is immediately usable during this round!
    for (let i = 0; i < newToolTiles.length; i++) {
      if (newToolTiles[i] > (oldTiles[i] || 0)) {
        newToolsUsedThisRound[i] = false;
        break;
      }
    }
  } else if (card.topBonus.type === 'temp_tool') {
    newTempTools += card.topBonus.value || 0;
  } else if (card.topBonus.type === 'draw_card') {
    if (newCardsDeck.length > 0) {
      const extraCard = newCardsDeck.shift()!;
      extraCards.push(extraCard);
      bonusDesc = `Pioché 1 carte civilisation supplémentaire (« ${extraCard.name} »)`;
    }
  } else if (card.topBonus.type === 'resource_fixed' && card.topBonus.resources) {
    for (const [r, amt] of Object.entries(card.topBonus.resources) as [ResourceType, number][]) {
      newResources[r] += amt;
    }
  } else if (card.topBonus.type === 'dice_roll') {
    const resType = card.topBonus.resourceType || 'wood';
    const divisor = resType === 'wood' ? 3 : resType === 'clay' ? 4 : resType === 'stone' ? 5 : resType === 'gold' ? 6 : 2;
    let d1: number;
    let d2: number;
    let toolBonus = 0;
    if (diceResult && diceResult.diceValues.length >= 2) {
      d1 = diceResult.diceValues[0];
      d2 = diceResult.diceValues[1];
      for (const toolIdx of (diceResult.toolsUsed || [])) {
        toolBonus += player.toolTiles[toolIdx] || 0;
        newToolsUsedThisRound[toolIdx] = true;
      }
      if (diceResult.tempToolsUsed && diceResult.tempToolsUsed > 0) {
        const actualTemp = Math.min(diceResult.tempToolsUsed, newTempTools);
        toolBonus += actualTemp;
        newTempTools -= actualTemp;
      }
    } else {
      d1 = Math.floor(Math.random() * 6) + 1;
      d2 = Math.floor(Math.random() * 6) + 1;
    }
    const total = d1 + d2 + toolBonus;
    const harvested = Math.floor(total / divisor);
    newResources[resType] = (newResources[resType] || 0) + harvested;
    bonusDesc = `2 dés pour ${resType} (${d1}+${d2}${toolBonus > 0 ? ` +${toolBonus} outil(s)` : ''} = ${total} ÷ ${divisor} = +${harvested} ${resType})`;
  }

  const updatedPlayers = state.players.map(p => {
    if (p.id !== playerId) return p;
    const newPlacements = { ...p.placements };
    delete newPlacements[locationId];
    return {
      ...p,
      resources: newResources,
      food: newFood,
      agriculture: newAgri,
      victoryPoints: newVP,
      toolTiles: newToolTiles,
      temporaryTools: newTempTools,
      toolsUsedThisRound: newToolsUsedThisRound,
      civilizationCards: [...p.civilizationCards, card, ...extraCards],
      placements: newPlacements,
    };
  });

  const newActiveCards = [...state.activeCards];
  newActiveCards[slot] = null; // Card taken

  const logText = `${player.name} achète la carte « ${card.name} » pour ${totalPaid} ressource(s) (Bonus : ${bonusDesc})`;

  return checkAdvanceResolution({
    ...state,
    activeCards: newActiveCards,
    cardsDeck: newCardsDeck,
    players: updatedPlayers,
    log: [
      ...state.log,
      { id: uid(), round: state.round, playerId, text: logText, type: 'card', timestamp: Date.now() }
    ],
  });
}

// Resolve Civilization Card Multi-player Dice Draft
export function resolveCardDiceDraft(
  state: GameState,
  buyerId: string,
  locationId: BoardLocationId,
  resourcesPaid: Record<ResourceType, number>,
  selections: {
    playerId: string;
    playerName: string;
    playerColor: string;
    dieIndex: number;
    reward: {
      dieValue: number;
      type: 'resource' | 'tool' | 'agriculture';
      resource?: ResourceType;
      label: string;
      icon: string;
    };
  }[]
): GameState {
  const buyer = state.players.find(p => p.id === buyerId)!;
  const slot = parseInt(locationId.split('_')[1], 10);
  const card = state.activeCards[slot];

  // 1. Deduct payment from buyer
  const newResources = { ...buyer.resources };
  let totalPaid = 0;
  for (const [res, count] of Object.entries(resourcesPaid) as [ResourceType, number][]) {
    newResources[res] = Math.max(0, newResources[res] - count);
    totalPaid += count;
  }

  // 2. Build map of bonus rewards per player
  const rewardsByPlayer: Record<string, typeof selections> = {};
  for (const sel of selections) {
    if (!rewardsByPlayer[sel.playerId]) {
      rewardsByPlayer[sel.playerId] = [];
    }
    rewardsByPlayer[sel.playerId].push(sel);
  }

  // 3. Update all players according to draft selections
  const updatedPlayers = state.players.map(p => {
    let pRes = p.id === buyerId ? { ...newResources } : { ...p.resources };
    let pFood = p.food;
    let pAgri = p.agriculture;
    let pTools = [...p.toolTiles];
    let pCards = p.id === buyerId && card ? [...p.civilizationCards, card] : [...p.civilizationCards];
    const pPlacements = { ...p.placements };
    if (p.id === buyerId) {
      delete pPlacements[locationId];
    }

    const playerSelections = rewardsByPlayer[p.id] || [];
    for (const sel of playerSelections) {
      if (sel.reward.type === 'resource' && sel.reward.resource) {
        pRes[sel.reward.resource] = (pRes[sel.reward.resource] || 0) + 1;
      } else if (sel.reward.type === 'tool') {
        pTools = addToolLevel(pTools);
      } else if (sel.reward.type === 'agriculture') {
        pAgri = Math.min(10, pAgri + 1);
      }
    }

    return {
      ...p,
      resources: pRes,
      food: pFood,
      agriculture: pAgri,
      toolTiles: pTools,
      civilizationCards: pCards,
      placements: pPlacements,
    };
  });

  const newActiveCards = [...state.activeCards];
  newActiveCards[slot] = null; // Card taken from market

  const summary = selections
    .map(s => `${s.playerName}: ${s.reward.icon} ${s.reward.label}`)
    .join(' • ');

  const logText = `${buyer.name} achète la carte « ${card?.name || 'Carte'} » (${totalPaid} ress.) • Tirage dés : ${summary}`;

  return checkAdvanceResolution({
    ...state,
    activeCards: newActiveCards,
    players: updatedPlayers,
    log: [
      ...state.log,
      { id: uid(), round: state.round, playerId: buyerId, text: logText, type: 'card', timestamp: Date.now() }
    ],
  });
}

// Resolve Building Construction
export function resolveBuildingPurchase(
  state: GameState,
  playerId: string,
  locationId: BoardLocationId,
  resourcesPaid: Record<ResourceType, number>
): GameState {
  const player = state.players.find(p => p.id === playerId)!;
  const pileIndex = parseInt(locationId.split('_')[1], 10);
  const pile = state.buildingPiles[pileIndex];

  if (!pile || pile.length === 0) {
    const updatedPlayers = state.players.map(p => {
      if (p.id !== playerId) return p;
      const newPlacements = { ...p.placements };
      delete newPlacements[locationId];
      return { ...p, placements: newPlacements };
    });
    return checkAdvanceResolution({ ...state, players: updatedPlayers });
  }

  const building = pile[pile.length - 1]; // Top tile
  const newPile = pile.slice(0, pile.length - 1); // Remove tile

  // Deduct resources paid and calculate victory points
  const newResources = { ...player.resources };
  let vpEarned = 0;
  if (building.isSpecialHut && building.victoryPoints !== undefined) {
    // Règle officielle des Nouvelles Huttes : les points de victoire sont fixes (3, 4, 5, 5, 5, 5 PV)
    // et ne cumulent pas la valeur des ressources car le pouvoir récurrent ou immédiat compense.
    vpEarned = building.victoryPoints;
    for (const [res, count] of Object.entries(resourcesPaid) as [ResourceType, number][]) {
      newResources[res] = Math.max(0, newResources[res] - count);
    }
  } else {
    for (const [res, count] of Object.entries(resourcesPaid) as [ResourceType, number][]) {
      newResources[res] = Math.max(0, newResources[res] - count);
      vpEarned += count * RESOURCE_VALUES[res];
    }
  }

  const updatedPlayers = state.players.map(p => {
    if (p.id !== playerId) return p;
    const newPlacements = { ...p.placements };
    delete newPlacements[locationId];

    // Handle immediate special hut benefits (The New Huts expansion)
    let totalMeeples = p.totalMeeples;
    let availableMeeples = p.availableMeeples;
    let toolTiles = [...p.toolTiles];
    let agriculture = p.agriculture;

    if (building.isSpecialHut) {
      if (building.passiveHutType === 'kindergarten') {
        totalMeeples = Math.min(10, totalMeeples + 1);
        availableMeeples = Math.min(10, availableMeeples + 1);
      } else if (building.passiveHutType === 'workshop_forge') {
        toolTiles = addToolLevel(toolTiles);
      } else if (building.passiveHutType === 'greenhouse') {
        agriculture = Math.min(10, agriculture + 1);
      }
    }

    return {
      ...p,
      totalMeeples,
      availableMeeples,
      toolTiles,
      agriculture,
      resources: newResources,
      victoryPoints: p.victoryPoints + vpEarned,
      buildings: [...p.buildings, building],
      placements: newPlacements,
    };
  });

  const newBuildingPiles = [...state.buildingPiles];
  newBuildingPiles[pileIndex] = newPile;

  const specialPowerNotice = building.isSpecialHut && building.passiveEffectDescription 
    ? ` ★ Pouvoir activé : ${building.passiveEffectDescription} !`
    : '';

  const logText = `${player.name} construit ${building.isSpecialHut ? 'la ' + building.description.split(':')[0] : 'un bâtiment'} et gagne +${vpEarned} VP !${specialPowerNotice}`;

  return checkAdvanceResolution({
    ...state,
    buildingPiles: newBuildingPiles,
    players: updatedPlayers,
    log: [
      ...state.log,
      { id: uid(), round: state.round, playerId, text: logText, type: 'building', timestamp: Date.now() }
    ],
  });
}

// Forfeit placement in resolution (e.g. Player can't or won't buy a reserved Card/Building)
export function forfeitResolution(
  state: GameState,
  playerId: string,
  locationId: BoardLocationId
): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return state;

  const updatedPlayers = state.players.map(p => {
    if (p.id !== playerId) return p;
    const newPlacements = { ...p.placements };
    delete newPlacements[locationId];
    return { ...p, placements: newPlacements };
  });

  const updatedState: GameState = {
    ...state,
    players: updatedPlayers,
    log: [
      ...state.log,
      {
        id: uid(),
        round: state.round,
        playerId,
        text: `${player.name} renonce à l'achat sur ${getLocationInfo(locationId, state).name} et récupère son ouvrier.`,
        type: 'action',
        timestamp: Date.now(),
      }
    ],
  };

  return checkAdvanceResolution(updatedState);
}

// Check if current player has finished resolving, or advance to next player / feeding phase
export function checkAdvanceResolution(state: GameState): GameState {
  const activePlayer = state.players[state.activePlayerIndex];
  const unresolved = getPlayerUnresolvedLocations(activePlayer);

  if (unresolved.length > 0) {
    // Current player still has placements to resolve
    return state;
  }

  // Active player has resolved everything!
  // Find next player with unresolved placements
  let nextIndex = (state.activePlayerIndex + 1) % state.players.length;
  let loops = 0;
  while (loops < state.players.length) {
    const p = state.players[nextIndex];
    if (getPlayerUnresolvedLocations(p).length > 0) {
      return {
        ...state,
        activePlayerIndex: nextIndex,
      };
    }
    nextIndex = (nextIndex + 1) % state.players.length;
    loops++;
  }

  // All players have resolved all placements -> Transition to FEEDING phase!
  return startFeedingPhase(state);
}

// Start Feeding Phase
export function startFeedingPhase(state: GameState): GameState {
  const resetPlayers = state.players.map(p => ({
    ...p,
    fedThisRound: false,
  }));

  const newState: GameState = {
    ...state,
    phase: 'feeding',
    players: resetPlayers,
    activePlayerIndex: state.firstPlayerIndex,
    log: [
      ...state.log,
      {
        id: uid(),
        round: state.round,
        text: `Fin des résolutions ! Phase 3 : Nourrir la tribu (1 nourriture par ouvrier).`,
        type: 'food',
        timestamp: Date.now(),
      }
    ],
  };

  // We can automatically feed players who have enough food/agriculture!
  return processAutomaticFeeding(newState);
}

// Automatic Feeding for players who have enough food, or pause for manual choice if famine
export function processAutomaticFeeding(state: GameState): GameState {
  let currentState = { ...state };

  for (let i = 0; i < currentState.players.length; i++) {
    const player = currentState.players[i];
    if (player.fedThisRound) continue; // Already processed this round

    const foodNeeded = Math.max(0, player.totalMeeples - player.agriculture);

    if (player.food >= foodNeeded) {
      // Can feed normally
      const newFood = player.food - foodNeeded;
      currentState.players = currentState.players.map(p => 
        p.id === player.id ? { ...p, food: newFood, fedThisRound: true } : p
      );
      currentState.log.push({
        id: uid(),
        round: currentState.round,
        playerId: player.id,
        text: `${player.name} nourrit sa tribu (${player.totalMeeples} ouvriers - ${player.agriculture} champ = ${foodNeeded} nourriture(s) consommée(s)).`,
        type: 'food',
        timestamp: Date.now(),
      });
    } else if (player.isAi) {
      // AI handles famine/resource substitution automatically
      const deficit = foodNeeded - player.food;
      const newResources = { ...player.resources };
      let paidResources = 0;

      // Pay with cheapest resources first (wood, clay, stone, gold)
      const order: ResourceType[] = ['wood', 'clay', 'stone', 'gold'];
      for (const res of order) {
        while (newResources[res] > 0 && paidResources < deficit) {
          newResources[res] -= 1;
          paidResources += 1;
        }
      }

      const stillMissing = deficit - paidResources;
      const penalty = stillMissing > 0 ? 10 : 0;

      currentState.players = currentState.players.map(p => 
        p.id === player.id ? {
          ...p,
          food: 0,
          resources: newResources,
          victoryPoints: Math.max(0, p.victoryPoints - penalty),
          fedThisRound: true,
        } : p
      );

      let aiLog = `${player.name} (IA) manque de nourriture ! Paye ${player.food} nourriture + ${paidResources} ressource(s).`;
      if (penalty > 0) {
        aiLog += ` ➔ Famine subie : -10 VP !`;
      }
      currentState.log.push({
        id: uid(),
        round: currentState.round,
        playerId: player.id,
        text: aiLog,
        type: 'food',
        timestamp: Date.now(),
      });
    } else {
      // Human player cannot feed normally, set activePlayerIndex to them for manual resolution!
      return {
        ...currentState,
        activePlayerIndex: i,
      };
    }
  }

  // Everyone is fed! Move to Round End / Maintenance
  return finishRound(currentState);
}

// Resolve Human Feeding Deficit (when player doesn't have enough food)
export function resolveHumanFeeding(
  state: GameState,
  playerId: string,
  resourcesPaid: Record<ResourceType, number>,
  acceptPenalty: boolean
): GameState {
  const player = state.players.find(p => p.id === playerId)!;
  const foodNeeded = Math.max(0, player.totalMeeples - player.agriculture);
  const paidWithFood = Math.min(player.food, foodNeeded);
  const deficit = foodNeeded - paidWithFood;

  const totalResPaid = Object.values(resourcesPaid).reduce((s, c) => s + c, 0);
  const newResources = { ...player.resources };
  for (const [r, count] of Object.entries(resourcesPaid) as [ResourceType, number][]) {
    newResources[r] = Math.max(0, newResources[r] - count);
  }

  const penalty = (acceptPenalty || totalResPaid < deficit) ? 10 : 0;
  const newVP = Math.max(0, player.victoryPoints - penalty);

  let logText = `${player.name} résout la nourriture : ${paidWithFood} nourriture + ${totalResPaid} ressource(s).`;
  if (penalty > 0) {
    logText += ` ➔ Famine : -10 VP !`;
  }

  const updatedPlayers = state.players.map(p => 
    p.id === playerId ? {
      ...p,
      food: Math.max(0, p.food - paidWithFood),
      resources: newResources,
      victoryPoints: newVP,
      fedThisRound: true,
    } : p
  );

  const updatedState: GameState = {
    ...state,
    players: updatedPlayers,
    log: [
      ...state.log,
      { id: uid(), round: state.round, playerId, text: logText, type: 'food', timestamp: Date.now() }
    ],
  };

  // Check if remaining human players need feeding, otherwise finish round
  return processAutomaticFeeding(updatedState);
}

// Finish Round: Maintenance, Card refilling, and End Game verification
export function finishRound(state: GameState): GameState {
  const numPlayers = state.players.length;
  const recurringLogs: GameLogEntry[] = [];

  // 1. Tribe growth, tool untap and recurring New Huts production
  const updatedPlayers: PlayerState[] = state.players.map(p => {
    const grew = p.newMeepleNextRound;
    const total = Math.min(10, p.totalMeeples + (grew ? 1 : 0));

    // Handle recurring hut production (The New Huts expansion)
    const resources = { ...p.resources };
    const gained: string[] = [];

    p.buildings.forEach(b => {
      if (b.isSpecialHut) {
        if (b.passiveHutType === 'wood_quarry') {
          resources.wood += 1;
          gained.push('+1 Bois (Bûcheron)');
        } else if (b.passiveHutType === 'clay_kiln') {
          resources.clay += 1;
          gained.push('+1 Glaise (Fournil)');
        } else if (b.passiveHutType === 'stone_shed') {
          resources.stone += 1;
          gained.push('+1 Pierre (Carrier)');
        }
      }
    });

    if (gained.length > 0) {
      recurringLogs.push({
        id: uid(),
        round: state.round + 1,
        playerId: p.id,
        text: `🛖 ${p.name} récolte ses huttes de production : ${gained.join(', ')} !`,
        type: 'village',
        timestamp: Date.now(),
      });
    }

    return {
      ...p,
      totalMeeples: total,
      availableMeeples: total,
      newMeepleNextRound: false,
      toolsUsedThisRound: [false, false, false],
      temporaryTools: 0,
      resources,
      placements: {},
      fedThisRound: false,
    };
  });

  // 2. Shift remaining cards right and draw new cards
  const remainingCards = state.activeCards.filter(c => c !== null) as CivilizationCard[];
  const newDeck = [...state.cardsDeck];
  const newActiveCards: (CivilizationCard | null)[] = [null, null, null, null];

  // Fill from slot 0 up to 4
  for (let slot = 0; slot < 4; slot++) {
    if (slot < remainingCards.length) {
      newActiveCards[slot] = remainingCards[slot];
    } else if (newDeck.length > 0) {
      newActiveCards[slot] = newDeck.pop() || null;
    }
  }

  // 3. Verify End Game Condition
  // Condition A: Building piles empty
  const emptyPilesCount = state.buildingPiles.filter(pile => pile.length === 0).length;
  let emptyPilesThreshold = 1;
  if (state.variants.twoPilesEnd && numPlayers >= 3) {
    emptyPilesThreshold = 2; // Discussion variant: 2 piles empty to trigger end
  }

  // Handle active mammoth replenishment if needed
  let nextActiveMammoth = state.activeMammoth;
  let nextMammothDeck = state.mammothDeck ? [...state.mammothDeck] : [];
  if (state.expansions?.mammothHerd && !nextActiveMammoth && nextMammothDeck.length > 0) {
    nextActiveMammoth = nextMammothDeck.pop() || null;
    recurringLogs.push({
      id: uid(),
      round: state.round + 1,
      text: `🦣 Un nouveau mammouth est apparu sur la toundra : ${nextActiveMammoth?.name} !`,
      type: 'info',
      timestamp: Date.now() + 2,
    });
  }

  let endTriggered = state.endGameTriggered;
  let endReason = state.endGameReason;

  if (!endTriggered) {
    if (emptyPilesCount >= emptyPilesThreshold) {
      endTriggered = true;
      endReason = `${emptyPilesCount} pile(s) de bâtiments épuisée(s) !`;
    } else if (newActiveCards.some(c => c === null)) {
      endTriggered = true;
      endReason = `La pioche de cartes civilisation est épuisée !`;
    }
  }

  // 4. Check if game actually finishes now or continues for complete cycle
  const nextFirstPlayer = (state.firstPlayerIndex + 1) % numPlayers;

  if (endTriggered) {
    if (state.variants.completeCycleEnd) {
      // Strict equality of turns: cycle completes when next first player is back to the initial first player
      // or if all cards AND all buildings are completely exhausted
      const allDepleted = emptyPilesCount === state.buildingPiles.length && newActiveCards.every(c => c === null);
      const cycleComplete = nextFirstPlayer === state.initialFirstPlayerIndex || allDepleted;
      if (cycleComplete) {
        return {
          ...state,
          players: updatedPlayers,
          activeCards: newActiveCards,
          cardsDeck: newDeck,
          phase: 'game_over',
          endGameTriggered: true,
          endGameReason: allDepleted 
            ? `Toutes les cartes civilisations et tous les bâtiments sont épuisés !` 
            : `${endReason} Cycle complet terminé : chaque joueur a été 1er joueur un nombre égal de fois !`,
          log: [
            ...state.log,
            {
              id: uid(),
              round: state.round,
              text: `Fin de partie atteinte ! Tous les joueurs ont eu exactement le même nombre de tours. Calcul des scores finaux...`,
              type: 'info',
              timestamp: Date.now(),
            }
          ]
        };
      } else {
        // Continue round for remaining players in cycle
        return {
          ...state,
          round: state.round + 1,
          phase: 'placement',
          players: updatedPlayers,
          firstPlayerIndex: nextFirstPlayer,
          activePlayerIndex: nextFirstPlayer,
          activeCards: newActiveCards,
          cardsDeck: newDeck,
          activeMammoth: nextActiveMammoth,
          mammothDeck: nextMammothDeck,
          endGameTriggered: true,
          endGameReason: endReason,
          log: [
            ...state.log,
            ...recurringLogs,
            {
              id: uid(),
              round: state.round + 1,
              text: `${endReason} Tour d'honneur (égalité stricte des tours) : la partie continue jusqu'à la fin du cycle !`,
              type: 'info',
              timestamp: Date.now(),
            }
          ]
        };
      }
    } else {
      // Standard end game: ends immediately at round end
      return {
        ...state,
        players: updatedPlayers,
        activeCards: newActiveCards,
        cardsDeck: newDeck,
        phase: 'game_over',
        endGameTriggered: true,
        endGameReason: endReason,
        log: [
          ...state.log,
          ...recurringLogs,
          {
            id: uid(),
            round: state.round,
            text: `Fin de partie atteinte (${endReason}) ! Calcul des scores finaux...`,
            type: 'info',
            timestamp: Date.now(),
          }
        ]
      };
    }
  }

  // Regular next round
  return {
    ...state,
    round: state.round + 1,
    phase: 'placement',
    players: updatedPlayers,
    firstPlayerIndex: nextFirstPlayer,
    activePlayerIndex: nextFirstPlayer,
    activeCards: newActiveCards,
    cardsDeck: newDeck,
    activeMammoth: nextActiveMammoth,
    mammothDeck: nextMammothDeck,
    log: [
      ...state.log,
      ...recurringLogs,
      {
        id: uid(),
        round: state.round + 1,
        text: `--- Manche ${state.round + 1} commencée. 1er joueur : ${updatedPlayers[nextFirstPlayer].name} ---`,
        type: 'info',
        timestamp: Date.now(),
      }
    ]
  };
}
