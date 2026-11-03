import { FinalPlayerScore, GreenCultureSymbol, PlayerState } from '../types/game';

// Compute optimal green card sets ($K^2$ for each set of distinct cards)
export function calculateGreenSets(symbols: GreenCultureSymbol[]): { sets: GreenCultureSymbol[][]; points: number } {
  if (symbols.length === 0) return { sets: [], points: 0 };

  // Count occurrences of each symbol
  const counts: Record<string, number> = {};
  symbols.forEach(s => {
    counts[s] = (counts[s] || 0) + 1;
  });

  const sets: GreenCultureSymbol[][] = [];
  let remaining = true;

  while (remaining) {
    const currentSet: GreenCultureSymbol[] = [];
    remaining = false;
    for (const [sym, count] of Object.entries(counts)) {
      if (count > 0) {
        currentSet.push(sym as GreenCultureSymbol);
        counts[sym] = count - 1;
        if (count - 1 > 0) {
          remaining = true;
        }
      }
    }
    if (currentSet.length > 0) {
      sets.push(currentSet);
    }
  }

  // Calculate total points: sum of (len)^2
  const points = sets.reduce((sum, s) => sum + s.length * s.length, 0);
  return { sets, points };
}

export function calculatePlayerScore(player: PlayerState): FinalPlayerScore {
  // Extract green symbols
  const greenSymbols: GreenCultureSymbol[] = [];
  let shamanMult = 0;
  let farmerMult = 0;
  let toolMakerMult = 0;
  let builderMult = 0;

  player.civilizationCards.forEach(c => {
    if (c.bottomBonus.type === 'green' && c.bottomBonus.greenSymbol) {
      greenSymbols.push(c.bottomBonus.greenSymbol);
    } else if (c.bottomBonus.type === 'sand' && c.bottomBonus.sandType) {
      const mult = c.bottomBonus.sandMultiplier || 1;
      if (c.bottomBonus.sandType === 'shaman') shamanMult += mult;
      else if (c.bottomBonus.sandType === 'farmer') farmerMult += mult;
      else if (c.bottomBonus.sandType === 'tool_maker') toolMakerMult += mult;
      else if (c.bottomBonus.sandType === 'builder') builderMult += mult;
    }
  });

  // Green sets
  const { sets: greenSets, points: greenCardPoints } = calculateGreenSets(greenSymbols);

  // Sand multipliers
  const shamanPoints = shamanMult * player.totalMeeples;
  const farmerPoints = farmerMult * player.agriculture;
  const totalToolPower = player.toolTiles.reduce((acc, t) => acc + t, 0);
  const toolMakerPoints = toolMakerMult * totalToolPower;
  const builderPoints = builderMult * player.buildings.length;

  // Remaining resources (1 VP per resource token)
  const remainingResourcePoints = 
    player.resources.wood + 
    player.resources.clay + 
    player.resources.stone + 
    player.resources.gold;

  const totalScore = 
    player.victoryPoints +
    greenCardPoints +
    shamanPoints +
    farmerPoints +
    toolMakerPoints +
    builderPoints +
    remainingResourcePoints;

  return {
    playerId: player.id,
    name: player.name,
    color: player.color,
    isAi: player.isAi,
    boardPoints: player.victoryPoints,
    greenCardPoints,
    greenSets,
    shamanPoints,
    farmerPoints,
    toolMakerPoints,
    builderPoints,
    remainingResourcePoints,
    totalScore,
    rank: 1, // Will be set in ranking
  };
}

export function rankPlayers(players: PlayerState[]): FinalPlayerScore[] {
  const scores = players.map(calculatePlayerScore);

  // Sort descending by total score, then tie break (food track + tools + meeples)
  scores.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    const pA = players.find(p => p.id === a.playerId)!;
    const pB = players.find(p => p.id === b.playerId)!;
    const tieA = pA.agriculture + pA.toolTiles.reduce((s, t) => s + t, 0) + pA.totalMeeples;
    const tieB = pB.agriculture + pB.toolTiles.reduce((s, t) => s + t, 0) + pB.totalMeeples;
    return tieB - tieA;
  });

  scores.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  return scores;
}
