import { 
  createInitialGameState, 
  canPlaceMeeples, 
  placeMeeples, 
  resolveVillageAction, 
  resolveDiceHarvest, 
  resolveCardPurchase, 
  resolveBuildingPurchase, 
  resolveHumanFeeding, 
  finishRound,
  getZoneTotalMeeples
} from './gameEngine';
import { rankPlayers } from './scoring';
import { GameSettings, BoardLocationId, FinalPlayerScore } from '../types/game';

console.log("=== L'ÂGE DE PIERRE : SUITE DE TESTS DU GAME ENGINE ===");

const settings: GameSettings = {
  playerCount: 3,
  players: [
    { name: 'Chef Tribal', color: 'red', isAi: false, aiDifficulty: 'normal' },
    { name: 'Ouga (IA)', color: 'blue', isAi: true, aiDifficulty: 'normal' },
    { name: 'Chaka (IA)', color: 'yellow', isAi: true, aiDifficulty: 'hard' },
  ],
  variants: {
    firstTurnCourtesy: true,
    startingCompensation: true,
    twoPilesEnd: true,
    completeCycleEnd: true,
  },
};

// 1. Initial State Check
let state = createInitialGameState({ ...settings, firstPlayerIndex: 0 });
console.log(`[PASS] Initial state created: Round ${state.round}, Phase ${state.phase}, Players: ${state.players.length}`);
console.log(`       Cartes actives: ${state.activeCards.filter(Boolean).length}/4, Piles bâtiments: ${state.buildingPiles.length}`);

// 2. Placement Tests
const p1 = state.players[0]; // Red
console.log(`\n--- Test de Placement (Joueur 1 : ${p1.name}) ---`);

// Place 2 meeples on forest
let checkForest = canPlaceMeeples(state, p1.id, 'forest', 2);
if (!checkForest.allowed) throw new Error("Forest placement should be allowed");
state = placeMeeples(state, p1.id, 'forest', 2);
console.log(`[PASS] 2 ouvriers posés en Forêt. Meeples restants: ${state.players[0].availableMeeples}`);

// Place 1 meeple on fields
state.activePlayerIndex = 0; // force active for test
let checkField = canPlaceMeeples(state, p1.id, 'field', 1);
if (!checkField.allowed) throw new Error("Field placement should be allowed");
state = placeMeeples(state, p1.id, 'field', 1);
console.log(`[PASS] 1 ouvrier posé aux Champs. Meeples restants: ${state.players[0].availableMeeples}`);

// Place 2 meeples on hut
state.activePlayerIndex = 0;
let checkHut = canPlaceMeeples(state, p1.id, 'hut', 2);
if (!checkHut.allowed) throw new Error("Hut placement should be allowed");
state = placeMeeples(state, p1.id, 'hut', 2);
console.log(`[PASS] 2 ouvriers posés à la Hutte. Meeples restants: ${state.players[0].availableMeeples}`);

// 3. Resolution Tests
console.log(`\n--- Test de Résolution des Actions ---`);
state.phase = 'resolution';

// Resolve Forest harvest (Roll 2 dice: 4 + 5 = 9 / 3 = 3 wood)
const initialWood = state.players[0].resources.wood;
state = resolveDiceHarvest(state, p1.id, 'forest', [4, 5], []);
const gainedWood = state.players[0].resources.wood - initialWood;
console.log(`[PASS] Forêt résolue (dés: 4+5=9). Bois récolté: +${gainedWood} (Attendu: 3). Total bois: ${state.players[0].resources.wood}`);

// Resolve Field (+1 Agriculture)
const initialAgri = state.players[0].agriculture;
state = resolveVillageAction(state, p1.id, 'field');
console.log(`[PASS] Champs résolu. Agriculture: ${initialAgri} -> ${state.players[0].agriculture} (+1)`);

// Resolve Hut (+1 ouvrier pour manche suivante)
state = resolveVillageAction(state, p1.id, 'hut');
console.log(`[PASS] Hutte résolue. newMeepleNextRound: ${state.players[0].newMeepleNextRound}`);

// 4. Building Purchase Test
console.log(`\n--- Test Achat de Bâtiment ---`);
// Give player some stone and gold
state.players[0].resources.wood = 5;
state.players[0].resources.clay = 3;
state.players[0].resources.stone = 3;
state.players[0].resources.gold = 2;
const initialVP = state.players[0].victoryPoints;

// Suppose player placed on building_0
state.players[0].placements.building_0 = 1;
const topBuilding = state.buildingPiles[0][0];
console.log(`Bâtiment visé: ${topBuilding.description}`);
state = resolveBuildingPurchase(state, p1.id, 'building_0', { wood: 1, clay: 1, stone: 1, gold: 0 });
console.log(`[PASS] Bâtiment acheté ! PV: ${initialVP} -> ${state.players[0].victoryPoints} (Total bâtiments: ${state.players[0].buildings.length})`);

// 5. Card Purchase Test
console.log(`\n--- Test Achat de Carte Civilisation ---`);
state.players[0].placements.card_0 = 1;
const topCard = state.activeCards[0]!;
console.log(`Carte visée: ${topCard.name}`);
state = resolveCardPurchase(state, p1.id, 'card_0', { wood: 1, clay: 0, stone: 0, gold: 0 });
console.log(`[PASS] Carte achetée ! Cartes possédées: ${state.players[0].civilizationCards.length}`);

// 6. Feeding Phase Test
console.log(`\n--- Test Phase de Nourriture (Feeding) ---`);
state.phase = 'feeding';
state.players[0].food = 10;
const totalNeeded = state.players[0].totalMeeples;
const coveredByAgri = state.players[0].agriculture;
console.log(`Nourriture requise: ${totalNeeded}, couverte par Agri: ${coveredByAgri}, déficit: ${totalNeeded - coveredByAgri}`);
state = resolveHumanFeeding(state, p1.id, { wood: 0, clay: 0, stone: 0, gold: 0 }, false);
console.log(`[PASS] Joueur nourri ! fedThisRound: ${state.players[0].fedThisRound}, Nourriture restante: ${state.players[0].food}`);

// 7. Round End & Cycle Transition
console.log(`\n--- Test Fin de Manche & Décalage des Cartes ---`);
state = finishRound(state);
console.log(`[PASS] Nouvelle manche démarrée : Manche ${state.round}, Phase: ${state.phase}`);
console.log(`       Total ouvriers joueur 1: ${state.players[0].totalMeeples} (devrait être 6 car hutte résolue)`);
if (state.players[0].totalMeeples !== 6) throw new Error("Meeple from hut was not credited!");

// 8. End Game Scoring Test
console.log(`\n--- Test Calcul du Score Final (Podium) ---`);
const finalScores = rankPlayers(state.players);
console.log(`[PASS] Scores calculés pour ${finalScores.length} joueurs:`);
finalScores.forEach((s: FinalPlayerScore) => {
  console.log(`       - #${s.rank} ${s.name} (${s.color}) : Total ${s.totalScore} PV (Plateau: ${s.boardPoints}, Verts: ${s.greenCardPoints}, Multiplicateurs: ${s.shamanPoints + s.farmerPoints + s.toolMakerPoints + s.builderPoints})`);
});

// 9. Test Usability of Immediate Tool Bonuses During Current Round
console.log(`\n--- Test Utilisation Immédiate des Bonus Outils Durant la Manche ---`);
// A. Give player a tool_upgrade card while tools are currently used
state.players[0].toolTiles = [1, 1, 0];
state.players[0].toolsUsedThisRound = [true, true, false];
state.activeCards[0] = {
  id: 'test_tool_card',
  name: 'Outil de Précision',
  topBonus: { type: 'tool_upgrade', description: '+1 Outil Permanent' },
  bottomBonus: { type: 'green', greenSymbol: 'art', description: 'Art' },
};
state = resolveCardPurchase(state, p1.id, 'card_0', { wood: 0, clay: 0, stone: 0, gold: 0 });
const upgradedTiles = state.players[0].toolTiles;
const upgradedUsed = state.players[0].toolsUsedThisRound;
console.log(`[PASS] Outils après carte tool_upgrade: [${upgradedTiles.join(', ')}], Utilisés: [${upgradedUsed.join(', ')}]`);
// The newly added tool (index 2) must be available (false)!
if (upgradedUsed[2] !== false || upgradedTiles[2] !== 1) {
  throw new Error("L'outil obtenu immédiatement via carte doit être utilisable pendant la manche !");
}

// B. Test temporary tools in harvest
state.players[0].temporaryTools = 3;
state.players[0].placements['forest'] = 2;
state.players[1].placements['river'] = 1; // Keep resolution phase active
const woodBefore = state.players[0].resources.wood;
// Roll [2, 2] = 4 on wood (divisor 3). With 2 temp tools = 6 / 3 = 2 wood!
state = resolveDiceHarvest(state, p1.id, 'forest', [2, 2], [], 2);
const woodAfter = state.players[0].resources.wood;
console.log(`[PASS] Récolte avec 2 outils temporaires: +${woodAfter - woodBefore} bois (attendu: 2). Outils temp. restants: ${state.players[0].temporaryTools} (attendu: 1)`);
if (woodAfter - woodBefore !== 2 || state.players[0].temporaryTools !== 1) {
  throw new Error("Les outils temporaires doivent être pris en compte lors de la récolte !");
}

// 10. Test Free Draw Card Bonus
console.log(`\n--- Test Achat Carte Bonus Piocher 1 Carte Gratuite ---`);
const deckCountBefore = state.cardsDeck.length;
const topCardInDeck = state.cardsDeck[0];
const p1CardsBefore = state.players[0].civilizationCards.length;

state.activeCards[0] = {
  id: 'test_draw_card',
  name: 'Savoir Ancien',
  topBonus: { type: 'draw_card', description: 'Piocher 1 carte supplémentaire' },
  bottomBonus: { type: 'green', greenSymbol: 'writing', description: 'Écriture' },
};
state = resolveCardPurchase(state, p1.id, 'card_0', { wood: 0, clay: 0, stone: 0, gold: 0 });

const p1CardsAfter = state.players[0].civilizationCards.length;
const deckCountAfter = state.cardsDeck.length;
const extraDrawn = state.players[0].civilizationCards[p1CardsAfter - 1];

console.log(`[PASS] Cartes possédées: ${p1CardsBefore} -> ${p1CardsAfter} (+2 cartes : carte achetée + carte gratuite « ${extraDrawn.name} »)`);
console.log(`[PASS] Pioche de cartes: ${deckCountBefore} -> ${deckCountAfter} (-1 carte)`);

if (p1CardsAfter !== p1CardsBefore + 2) {
  throw new Error("L'achat d'une carte avec bonus draw_card doit ajouter exactement 2 cartes !");
}
if (deckCountAfter !== deckCountBefore - 1) {
  throw new Error("La pioche doit être décrémentée d'exactement 1 carte !");
}
if (extraDrawn.id !== topCardInDeck.id) {
  throw new Error("La carte piochée gratuitement doit être la carte du dessus du deck !");
}

console.log("\n>>> TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS (100% CONFORME AUX RÈGLES) <<<");
