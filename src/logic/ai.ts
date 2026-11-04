import { 
  BoardLocationId, 
  BuildingTile, 
  CivilizationCard, 
  GameState, 
  PlayerState, 
  ResourceType 
} from '../types/game';
import { canPlaceMeeples, getLocationInfo, getZoneTotalMeeples } from './gameEngine';
import { RESOURCE_VALUES } from '../data/buildings';

export interface AiPlacementChoice {
  locationId: BoardLocationId;
  count: number;
}

export interface AiDiceResolutionChoice {
  diceValues: number[];
  toolsToUse: number[]; // indices of toolTiles
}

// AI Placement Logic
export function getAiPlacementChoice(state: GameState, aiPlayerId: string): AiPlacementChoice | null {
  const player = state.players.find(p => p.id === aiPlayerId);
  if (!player || player.availableMeeples === 0) return null;

  const difficulty = player.aiDifficulty || 'normal';
  const round = state.round;
  const foodDeficit = Math.max(0, player.totalMeeples - player.agriculture - player.food);

  const candidates: { locationId: BoardLocationId; count: number; score: number }[] = [];

  // 1. Village Spots
  // Hut (2 meeples)
  if (player.availableMeeples >= 2 && canPlaceMeeples(state, aiPlayerId, 'hut', 2).allowed) {
    let hutScore = (10 - player.totalMeeples) * 15; // Higher value early
    if (round <= 3) hutScore += 30;
    candidates.push({ locationId: 'hut', count: 2, score: hutScore });
  }

  // Field (1 meeple)
  if (player.availableMeeples >= 1 && canPlaceMeeples(state, aiPlayerId, 'field', 1).allowed) {
    let fieldScore = (10 - player.agriculture) * 10;
    if (player.agriculture < player.totalMeeples) fieldScore += 25; // Prioritize self-sufficiency
    candidates.push({ locationId: 'field', count: 1, score: fieldScore });
  }

  // Tool Maker (1 meeple)
  if (player.availableMeeples >= 1 && canPlaceMeeples(state, aiPlayerId, 'tool_maker', 1).allowed) {
    const totalTools = player.toolTiles.reduce((s, t) => s + t, 0);
    const toolScore = (12 - totalTools) * 8;
    candidates.push({ locationId: 'tool_maker', count: 1, score: toolScore });
  }

  // Extension 2 : Échoppe du Marchand (1 ouvrier)
  if (state.expansions?.styleIsTheGoal && player.availableMeeples >= 1 && canPlaceMeeples(state, aiPlayerId, 'merchant', 1).allowed) {
    const merchantLevel = player.merchantLevel || 0;
    const merchantScore = (5 - merchantLevel) * 10 + 20;
    candidates.push({ locationId: 'merchant', count: 1, score: merchantScore });
  }

  // Extension 3 : Chasse au Mammouth (1 ou 2 ouvriers)
  if (state.expansions?.mammothHerd && state.activeMammoth && player.availableMeeples >= 1) {
    const count = Math.min(player.availableMeeples, 2);
    if (canPlaceMeeples(state, aiPlayerId, 'mammoth', count).allowed) {
      const mammothVal = state.activeMammoth.victoryPoints * 8;
      candidates.push({ locationId: 'mammoth', count, score: 25 + mammothVal });
    }
  }

  // 2. Hunting (Food)
  if (foodDeficit > 0) {
    const neededMeeples = Math.min(player.availableMeeples, Math.max(1, Math.ceil((foodDeficit * 2) / 3.5)));
    if (canPlaceMeeples(state, aiPlayerId, 'hunting', neededMeeples).allowed) {
      candidates.push({ 
        locationId: 'hunting', 
        count: neededMeeples, 
        score: 60 + foodDeficit * 15 // Very urgent if starving
      });
    }
  }

  // 3. Civilization Cards (Slots 0 to 3)
  for (let slot = 0; slot < 4; slot++) {
    const locId = `card_${slot}` as BoardLocationId;
    const card = state.activeCards[slot];
    if (card && canPlaceMeeples(state, aiPlayerId, locId, 1).allowed) {
      const cost = slot + 1;
      const totalRes = Object.values(player.resources).reduce((s, c) => s + c, 0);
      let cardScore = 20 - cost * 3; // Cheaper is better

      if (totalRes >= cost) {
        // High interest if can afford
        cardScore += 30;

        // Synergies
        if (card.bottomBonus.type === 'green') {
          // Check if symbol is new for player
          const hasSymbol = player.civilizationCards.some(
            c => c.bottomBonus.greenSymbol === card.bottomBonus.greenSymbol
          );
          if (!hasSymbol) cardScore += 35; // Huge boost for new green symbol!
        } else if (card.bottomBonus.type === 'sand') {
          if (card.bottomBonus.sandType === 'farmer' && player.agriculture >= 4) cardScore += 25;
          if (card.bottomBonus.sandType === 'tool_maker' && player.toolTiles.some(t => t > 0)) cardScore += 25;
          if (card.bottomBonus.sandType === 'shaman' && player.totalMeeples >= 7) cardScore += 25;
          if (card.bottomBonus.sandType === 'builder' && player.buildings.length >= 2) cardScore += 25;
        }

        candidates.push({ locationId: locId, count: 1, score: cardScore });
      }
    }
  }

  // 4. Buildings (Piles 0 to N-1)
  for (let pile = 0; pile < state.buildingPiles.length; pile++) {
    const locId = `building_${pile}` as BoardLocationId;
    const bPile = state.buildingPiles[pile];
    if (bPile && bPile.length > 0 && canPlaceMeeples(state, aiPlayerId, locId, 1).allowed) {
      const topTile = bPile[bPile.length - 1];
      const affordable = canPlayerAffordBuilding(player, topTile);
      let buildingScore = 15;
      if (affordable) {
        buildingScore += 40; // High value if ready to build
      }
      candidates.push({ locationId: locId, count: 1, score: buildingScore });
    }
  }

  // 5. Resource Gathering (Forest, Clay, Quarry, River)
  const resourceZones: { locId: BoardLocationId; res: ResourceType; divisor: number }[] = [
    { locId: 'forest', res: 'wood', divisor: 3 },
    { locId: 'clay_pit', res: 'clay', divisor: 4 },
    { locId: 'quarry', res: 'stone', divisor: 5 },
    { locId: 'river', res: 'gold', divisor: 6 },
  ];

  for (const zone of resourceZones) {
    const currentOccupied = getZoneTotalMeeples(state, zone.locId);
    const maxPlaceable = Math.min(player.availableMeeples, 7 - currentOccupied);

    if (maxPlaceable > 0) {
      // Decide how many meeples to place (e.g. 2, 3, or maxPlaceable)
      const count = Math.min(maxPlaceable, Math.max(1, Math.min(player.availableMeeples, 3)));
      if (canPlaceMeeples(state, aiPlayerId, zone.locId, count).allowed) {
        // Evaluate need for this resource
        const currentQty = player.resources[zone.res];
        let resScore = 25 - currentQty * 5 + RESOURCE_VALUES[zone.res] * 3;

        // Difficulty tweaks
        if (difficulty === 'easy') {
          resScore += (Math.random() - 0.5) * 30;
        }

        candidates.push({ locationId: zone.locId, count, score: resScore });
      }
    }
  }

  // Fallback to hunting if no other spots
  if (candidates.length === 0 && canPlaceMeeples(state, aiPlayerId, 'hunting', player.availableMeeples).allowed) {
    return { locationId: 'hunting', count: player.availableMeeples };
  }

  if (candidates.length === 0) return null;

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  // Return highest scoring valid choice
  return {
    locationId: candidates[0].locationId,
    count: candidates[0].count,
  };
}

// Can player afford building tile?
export function canPlayerAffordBuilding(player: PlayerState, tile: BuildingTile): boolean {
  const res = player.resources;
  const totalRes = Object.values(res).reduce((s, c) => s + c, 0);

  if (tile.costType === 'fixed' && tile.fixedCost) {
    for (const [r, count] of Object.entries(tile.fixedCost) as [ResourceType, number][]) {
      if ((res[r] || 0) < count) return false;
    }
    return true;
  }

  if (tile.costType === 'any_1_to_7') {
    return totalRes >= (tile.minResources || 1);
  }

  if (tile.costType === 'variable') {
    const requiredTotal = tile.resourceCount || 4;
    const requiredTypes = tile.differentTypesRequired || 1;
    if (totalRes < requiredTotal) return false;
    const availableTypes = (Object.keys(res) as ResourceType[]).filter(r => res[r] > 0);
    if (availableTypes.length < requiredTypes) return false;
    const topCounts = availableTypes.map(r => res[r]).sort((a, b) => b - a).slice(0, requiredTypes);
    const sumTop = topCounts.reduce((s, c) => s + c, 0);
    return sumTop >= requiredTotal;
  }

  if (tile.costType === '4_different') {
    return res.wood > 0 && res.clay > 0 && res.stone > 0 && res.gold > 0;
  }

  if (tile.costType === '5_different') {
    return totalRes >= 5;
  }

  if (tile.costType === '2_types_x2') {
    const typesWithAtLeast2 = (Object.keys(res) as ResourceType[]).filter(r => res[r] >= 2);
    return typesWithAtLeast2.length >= 2;
  }

  return false;
}

// AI Dice Resolution (Optimal Tool Usage)
export function getAiToolUsage(
  diceSum: number,
  divisor: number,
  toolTiles: number[],
  toolsUsedThisRound: boolean[]
): number[] {
  const currentYield = Math.floor(diceSum / divisor);
  const neededForNextYield = (currentYield + 1) * divisor - diceSum;

  const availableIndices = toolTiles
    .map((val, idx) => ({ val, idx, used: toolsUsedThisRound[idx] }))
    .filter(t => !t.used && t.val > 0)
    .sort((a, b) => a.val - b.val); // Ascending order to avoid wasting big tools

  let toolBonus = 0;
  const chosenIndices: number[] = [];

  for (const t of availableIndices) {
    if (toolBonus < neededForNextYield) {
      toolBonus += t.val;
      chosenIndices.push(t.idx);
    }
  }

  // Only use tools if they actually yielded an extra resource!
  if (diceSum + toolBonus >= (currentYield + 1) * divisor) {
    return chosenIndices;
  }

  return [];
}

// AI Payment for Card (Choose cheapest resources first)
export function getAiCardPayment(
  player: PlayerState,
  cost: number
): Record<ResourceType, number> | null {
  const payment: Record<ResourceType, number> = { wood: 0, clay: 0, stone: 0, gold: 0 };
  const currentRes = { ...player.resources };
  let paid = 0;

  // Pay in order: wood -> clay -> stone -> gold
  const order: ResourceType[] = ['wood', 'clay', 'stone', 'gold'];

  for (const r of order) {
    while (currentRes[r] > 0 && paid < cost) {
      currentRes[r] -= 1;
      payment[r] += 1;
      paid += 1;
    }
  }

  if (paid === cost) return payment;
  return null;
}

// AI Payment for Building
export function getAiBuildingPayment(
  player: PlayerState,
  tile: BuildingTile
): Record<ResourceType, number> | null {
  const payment: Record<ResourceType, number> = { wood: 0, clay: 0, stone: 0, gold: 0 };
  const res = { ...player.resources };

  if (tile.costType === 'fixed' && tile.fixedCost) {
    for (const [r, count] of Object.entries(tile.fixedCost) as [ResourceType, number][]) {
      if ((res[r] || 0) < count) return null;
      payment[r] = count;
    }
    return payment;
  }

  if (tile.costType === '4_different') {
    if (res.wood < 1 || res.clay < 1 || res.stone < 1 || res.gold < 1) return null;
    return { wood: 1, clay: 1, stone: 1, gold: 1 };
  }

  if (tile.costType === 'variable') {
    const requiredTotal = tile.resourceCount || 4;
    const requiredTypes = tile.differentTypesRequired || 1;
    const availableTypes = (['gold', 'stone', 'clay', 'wood'] as ResourceType[]).filter(r => res[r] > 0);
    if (availableTypes.length < requiredTypes) return null;

    // Helper to get combinations of k elements
    const getCombos = <T>(arr: T[], k: number): T[][] => {
      if (k === 0) return [[]];
      if (arr.length < k) return [];
      const [head, ...tail] = arr;
      const withHead = getCombos(tail, k - 1).map(c => [head, ...c]);
      const withoutHead = getCombos(tail, k);
      return [...withHead, ...withoutHead];
    };

    const validCombos = getCombos(availableTypes, requiredTypes).filter(combo => {
      return combo.reduce((s, r) => s + res[r], 0) >= requiredTotal;
    });

    if (validCombos.length === 0) return null;

    const bestCombo = validCombos[0];
    const payment: Record<ResourceType, number> = { wood: 0, clay: 0, stone: 0, gold: 0 };
    for (const r of bestCombo) {
      payment[r] = 1;
      res[r] -= 1;
    }
    let remaining = requiredTotal - requiredTypes;
    for (const r of bestCombo) {
      const take = Math.min(res[r], remaining);
      payment[r] += take;
      res[r] -= take;
      remaining -= take;
      if (remaining === 0) break;
    }
    return payment;
  }

  if (tile.costType === 'any_1_to_7' || tile.costType === '5_different') {
    const required = tile.costType === '5_different' ? 5 : Math.min(Object.values(res).reduce((s, c) => s + c, 0), 7);
    let paid = 0;
    // Prefer higher value resources for higher VP if available
    const order: ResourceType[] = ['gold', 'stone', 'clay', 'wood'];
    for (const r of order) {
      while (res[r] > 0 && paid < required) {
        res[r] -= 1;
        payment[r] += 1;
        paid += 1;
      }
    }
    if (paid >= (tile.minResources || 1)) return payment;
  }

  if (tile.costType === '2_types_x2') {
    const candidates = (Object.keys(res) as ResourceType[]).filter(r => res[r] >= 2);
    if (candidates.length < 2) return null;
    payment[candidates[0]] = 2;
    payment[candidates[1]] = 2;
    return payment;
  }

  return null;
}
