// Types and Data Models for L'Âge de Pierre (Stone Age)

export type ResourceType = 'wood' | 'clay' | 'stone' | 'gold';

export type BoardLocationId = 
  | 'hunting'
  | 'forest'
  | 'clay_pit'
  | 'quarry'
  | 'river'
  | 'tool_maker'
  | 'hut'
  | 'field'
  | 'card_0'
  | 'card_1'
  | 'card_2'
  | 'card_3'
  | 'building_0'
  | 'building_1'
  | 'building_2'
  | 'building_3';

export type GreenCultureSymbol =
  | 'writing'      // Écriture
  | 'pottery'      // Poterie
  | 'transport'    // Roue / Chariot
  | 'weaving'      // Tissage
  | 'art'          // Art / Peinture rupestre
  | 'music'        // Musique / Flûte
  | 'medicine'     // Médecine / Herbes
  | 'sundial';     // Cadran solaire / Astronomie

export type SandMultiplierType =
  | 'shaman'       // x population (meeples)
  | 'farmer'       // x agriculture track
  | 'tool_maker'   // x tool track value
  | 'builder';     // x number of buildings

export interface CivilizationCard {
  id: string;
  name: string;
  imageUrl?: string;
  classicImageUrl?: string;
  // Top bonus (immediate on purchase)
  topBonus: {
    type: 
      | 'resource_fixed'   // e.g. { wood: 2 }
      | 'food_fixed'       // e.g. 3 food
      | 'dice_roll'        // roll 2 dice for resources
      | 'dice_all_players' // roll 2 dice and everyone gets resources
      | 'tool_upgrade'     // +1 tool permanent
      | 'temp_tool'        // +1 to +4 temp tool
      | 'agriculture'      // +1 agriculture
      | 'victory_points'   // e.g. 3 VP
      | 'draw_card';       // draw 1 extra civilization card from deck
    value?: number;
    resources?: Partial<Record<ResourceType, number>>;
    resourceType?: ResourceType; // for dice_roll: resource being rolled (stone, wood, etc.)
    description: string;
  };
  // Bottom bonus (end-game scoring multiplier)
  bottomBonus: {
    type: 'green' | 'sand';
    greenSymbol?: GreenCultureSymbol;
    sandType?: SandMultiplierType;
    sandMultiplier?: number; // 1, 2, or 3
    description: string;
  };
}

export type BuildingCostType = 
  | 'fixed'          // Exact combination, e.g. 1 wood + 1 stone + 1 gold
  | 'any_1_to_7'     // Player chooses 1 to 7 resources of any type
  | 'variable'       // Variable building: exact resourceCount with differentTypesRequired types
  | '4_different'    // Legacy alias
  | '5_different'    // Legacy alias
  | '2_types_x2';    // Legacy alias

export interface BuildingTile {
  id: string;
  imageUrl?: string;
  costType: BuildingCostType;
  fixedCost?: Partial<Record<ResourceType, number>>;
  victoryPoints?: number;
  minResources?: number;
  maxResources?: number;
  resourceCount?: number;            // Total resources required (e.g. 4 or 5)
  differentTypesRequired?: number;   // Number of different resource types (1, 2, 3, 4)
  description: string;
}

export type PlayerColor = 'red' | 'blue' | 'yellow' | 'green';

export interface PlayerState {
  id: string;
  name: string;
  color: PlayerColor;
  isAi: boolean;
  aiDifficulty?: 'easy' | 'normal' | 'hard';
  
  // Meeples
  totalMeeples: number;       // Starts at 5, max 10
  availableMeeples: number;   // Available to place in current round
  newMeepleNextRound: boolean;// Did they visit the hut this round?
  
  // Village Engine
  food: number;               // Starts at 12 (or variant adjusted)
  agriculture: number;        // Starts at 0, max 10
  toolTiles: number[];        // Array of up to 3 tiles, each 0..4 (e.g. [1, 0, 0])
  toolsUsedThisRound: boolean[]; // Tracks which tool tiles were used this round
  temporaryTools: number;     // From cards
  
  // Resources
  resources: Record<ResourceType, number>;
  
  // Victory Points & Assets
  victoryPoints: number;
  civilizationCards: CivilizationCard[];
  buildings: BuildingTile[];
  
  // Placements in current round: locationId -> number of meeples
  placements: Partial<Record<BoardLocationId, number>>;
  
  // Feeding status
  fedThisRound?: boolean;
}

export type GamePhase = 
  | 'placement'     // Players take turns placing meeples
  | 'resolution'    // Players resolve their placed meeples
  | 'feeding'       // Feed the tribe (1 food per meeple)
  | 'round_end'     // Check end game, rotate first player
  | 'game_over';    // Score calculation & podium

export interface GameVariants {
  // Tour 1 balance
  firstTurnCourtesy: boolean;    // In 3 players: all 3 village spots open on Turn 1!
  startingCompensation: boolean;  // P1: standard, P2: +1 wood, P3: +1 clay, P4: +1 stone/tool
  
  // End Game balance
  twoPilesEnd: boolean;          // In 3-4 players: requires 2 piles empty instead of 1
  completeCycleEnd: boolean;     // Game ends only after full cycle (strict first-player equality)
}

export interface GameSettings {
  playerCount: number;
  players: {
    name: string;
    color: PlayerColor;
    isAi: boolean;
    aiDifficulty: 'easy' | 'normal' | 'hard';
  }[];
  variants: GameVariants;
}

export interface GameLogEntry {
  id: string;
  round: number;
  playerId?: string;
  text: string;
  type: 'action' | 'dice' | 'harvest' | 'village' | 'card' | 'building' | 'food' | 'info';
  timestamp: number;
}

export interface GameState {
  round: number;
  phase: GamePhase;
  players: PlayerState[];
  firstPlayerIndex: number;
  activePlayerIndex: number;
  initialFirstPlayerIndex: number; // For complete cycle tracking
  endGameTriggered: boolean;
  endGameReason?: string;
  
  // Board state
  cardsDeck: CivilizationCard[];
  activeCards: (CivilizationCard | null)[]; // 4 slots
  buildingPiles: BuildingTile[][];          // 2 to 4 piles
  
  // Current resolution state (when in resolution phase)
  currentResolutionZone: BoardLocationId | null;
  
  // Variants active
  variants: GameVariants;
  
  // Game log
  log: GameLogEntry[];
}

export interface FinalPlayerScore {
  playerId: string;
  name: string;
  color: PlayerColor;
  isAi: boolean;
  
  boardPoints: number;            // Points acquired during game (buildings & card VP)
  greenCardPoints: number;        // From unique green culture sets (K^2)
  greenSets: GreenCultureSymbol[][];
  shamanPoints: number;           // Shamans * Meeples
  farmerPoints: number;           // Farmers * Agriculture
  toolMakerPoints: number;        // Tool Makers * Tool value
  builderPoints: number;          // Builders * Buildings count
  remainingResourcePoints: number;// 1 VP per remaining resource
  
  totalScore: number;
  rank: number;
}
