import { GameRules, Player, PlayerStats, Round, RoundScore, Suit, SuitInfo } from '../types';

export const SUITS: Record<Suit, SuitInfo> = {
  oros: {
    id: 'oros',
    name: 'Oros',
    symbol: '🪙',
    icon: 'coins',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/40',
    isDouble: true,
  },
  copas: {
    id: 'copas',
    name: 'Copas',
    symbol: '🍷',
    icon: 'goblet',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/40',
    isDouble: false,
  },
  espadas: {
    id: 'espadas',
    name: 'Espadas',
    symbol: '⚔️',
    icon: 'sword',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/40',
    isDouble: false,
  },
  bastos: {
    id: 'bastos',
    name: 'Bastos',
    symbol: '🪵',
    icon: 'club',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/40',
    isDouble: false,
  },
  sin_triunfo: {
    id: 'sin_triunfo',
    name: 'Sin Triunfo',
    symbol: '🚫',
    icon: 'ban',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/40',
    isDouble: false,
  },
};

export const PLAYER_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

export const PLAYER_AVATARS = [
  '👑', '🦁', '🐉', '🦅', '🐺', '🦊', '🐯', '🦄',
];

/**
 * Exact target rounds distribution specified by the official rules:
 * 4 jugadores -> 32 rondas
 * 5 jugadores -> 32 rondas
 * 6 jugadores -> 38 rondas
 * 7 jugadores -> 38 rondas
 * 8 jugadores -> 44 rondas
 */
export const TARGET_ROUNDS_FOR_PLAYERS: Record<number, number> = {
  3: 28,
  4: 32,
  5: 32,
  6: 38,
  7: 38,
  8: 44,
};

/**
 * Calculates default deck cards based on exact player count rules:
 * 4 players -> 40 cards
 * 5 players -> 40 cards
 * 6 players -> 48 cards
 * 7 players -> 49 cards
 * 8 players -> 48 cards
 */
export function getDefaultDeckForPlayers(numPlayers: number): number {
  switch (numPlayers) {
    case 4: return 40;
    case 5: return 40;
    case 6: return 48;
    case 7: return 49;
    case 8: return 48;
    default: return 40;
  }
}

/**
 * Calculates max cards per player given total cards in deck
 */
export function getMaxCards(numPlayers: number, deckCards: number = 40): number {
  if (numPlayers <= 0) return 10;
  return Math.floor(deckCards / numPlayers);
}

/**
 * Generates the full list of rounds according to Spanish Pocha rules
 * Produces exactly the target round counts:
 * 4 jugadores -> 32 rondas
 * 5 jugadores -> 32 rondas
 * 6 jugadores -> 38 rondas
 * 7 jugadores -> 38 rondas
 * 8 jugadores -> 44 rondas
 */
export function generateDefaultRounds(
  numPlayers: number,
  deckCards: number = 40,
  rules?: GameRules
): Round[] {
  const maxCards = getMaxCards(numPlayers, deckCards);
  const suitsList: Suit[] = ['oros', 'copas', 'espadas', 'bastos'];
  let suitIndex = 0;
  let dealerIndex = 0;
  let roundNumber = 1;

  const rounds: Round[] = [];

  const getNextSuit = (): Suit => {
    const s = suitsList[suitIndex % suitsList.length];
    suitIndex++;
    return s;
  };

  const getNextDealer = (): number => {
    const d = dealerIndex % numPlayers;
    dealerIndex++;
    return d;
  };

  // Phase 1: Primera vuelta de 1 carta (1 mano por cada jugador = numPlayers rondas)
  for (let i = 0; i < numPlayers; i++) {
    rounds.push({
      id: `round_${roundNumber}`,
      roundNumber,
      cards: 1,
      dealerIndex: getNextDealer(),
      trump: getNextSuit(),
      phase: 'bidding',
      scores: {},
      phaseName: 'Primera Vuelta (1 carta)',
    });
    roundNumber++;
  }

  // Phase 2: Subida (2, 3, 4 ... hasta maxCards - 1 = maxCards - 2 rondas)
  for (let c = 2; c < maxCards; c++) {
    rounds.push({
      id: `round_${roundNumber}`,
      roundNumber,
      cards: c,
      dealerIndex: getNextDealer(),
      trump: getNextSuit(),
      phase: 'bidding',
      scores: {},
      phaseName: `Subida (${c} cartas)`,
    });
    roundNumber++;
  }

  // Phase 3: Rondas de Máximas (Todas las cartas)
  // Exact count of max cards hands to reach the target rounds:
  // Non-max phases = Phase 1 (numPlayers) + Phase 2 (maxCards - 2) + Phase 4 (maxCards - 2) + Phase 5 (numPlayers)
  const nonMaxRoundsCount = 2 * numPlayers + 2 * Math.max(0, maxCards - 2);
  const targetTotal = TARGET_ROUNDS_FOR_PLAYERS[numPlayers] || (nonMaxRoundsCount + numPlayers * 2);
  const maxRoundsCount = Math.max(1, targetTotal - nonMaxRoundsCount);

  const enableSubastado = rules?.enableSubastado !== false;
  const enableRandomTrumpMax = rules?.randomTrumpAfterSubastado !== false;

  for (let i = 0; i < maxRoundsCount; i++) {
    let trump: Suit = 'oros';
    let isSubastado = false;
    let isRandomTrump = false;
    let phaseName = `Todas las Cartas (${maxCards} cartas)`;

    // First cycle in max cards is Subastado if enabled
    if (enableSubastado && i < numPlayers) {
      isSubastado = true;
      trump = 'oros';
      phaseName = `Vuelta Máximas: Subastado (${maxCards} cartas)`;
    } else if (enableRandomTrumpMax) {
      isRandomTrump = true;
      const drawnCard = drawRandomCardForTrump();
      trump = drawnCard.suit;
      phaseName = `Vuelta Máximas: Triunfo Dador (${maxCards} cartas)`;
    } else {
      trump = getNextSuit();
      phaseName = `Vuelta Máximas (${maxCards} cartas)`;
    }

    rounds.push({
      id: `round_${roundNumber}`,
      roundNumber,
      cards: maxCards,
      dealerIndex: getNextDealer(),
      trump,
      phase: 'bidding',
      scores: {},
      phaseName,
      isSubastado,
      isRandomTrumpMax: isRandomTrump,
    });
    roundNumber++;
  }

  // Phase 4: Bajada (Descenso directo: maxCards - 1, ..., 2 = maxCards - 2 rondas)
  for (let c = maxCards - 1; c >= 2; c--) {
    rounds.push({
      id: `round_${roundNumber}`,
      roundNumber,
      cards: c,
      dealerIndex: getNextDealer(),
      trump: getNextSuit(),
      phase: 'bidding',
      scores: {},
      phaseName: `Bajada (${c} cartas)`,
    });
    roundNumber++;
  }

  // Phase 5: Vuelta final de 1 carta (1 mano por cada jugador = numPlayers rondas)
  for (let i = 0; i < numPlayers; i++) {
    rounds.push({
      id: `round_${roundNumber}`,
      roundNumber,
      cards: 1,
      dealerIndex: getNextDealer(),
      trump: getNextSuit(),
      phase: 'bidding',
      scores: {},
      phaseName: 'Vuelta Final (1 carta)',
    });
    roundNumber++;
  }

  return rounds;
}

export interface DeckCard {
  suit: Suit;
  rank: string;
  name: string;
  symbol: string;
}

/**
 * Draws a random Spanish deck card to randomly select trump suit
 */
export function drawRandomCardForTrump(): DeckCard {
  const suits: Suit[] = ['oros', 'copas', 'espadas', 'bastos'];
  const ranks = ['As', '2', '3', '4', '5', '6', '7', 'Sota', 'Caballo', 'Rey'];

  const selectedSuit = suits[Math.floor(Math.random() * suits.length)];
  const selectedRank = ranks[Math.floor(Math.random() * ranks.length)];
  const suitInfo = SUITS[selectedSuit];

  return {
    suit: selectedSuit,
    rank: selectedRank,
    name: `${selectedRank} de ${suitInfo.name}`,
    symbol: suitInfo.symbol,
  };
}

/**
 * Finds highest bidder player in a round
 */
export function getHighestBidder(
  players: Player[],
  round: Round
): { player: Player; bid: number } | null {
  let highestBid = -1;
  let topPlayer: Player | null = null;

  players.forEach((p) => {
    const b = round.scores[p.id]?.bid;
    if (b !== undefined && b !== null && b > highestBid) {
      highestBid = b;
      topPlayer = p;
    }
  });

  if (!topPlayer || highestBid < 0) return null;
  return { player: topPlayer, bid: highestBid };
}

/**
 * Calculates points for a single player in a round
 * Rules:
 * - Pocha (cards >= 4, actual === cards, bid === cards): (5 * cards) * 4 points (doble del doble)
 * - Hit: +10 base points + 5 * bid
 * - Miss: -10 base points - 5 * |bid - actual|
 * - If trump is 'oros' and doubleOros is enabled: Multiply entire result by 2.
 */
export function calculateScore(
  bid: number,
  actual: number,
  trump: Suit,
  cards: number = 1,
  rules: GameRules = { forbiddenDealerBid: true, doubleOros: true, allowSinTriunfo: true, pochaDoubleDouble: true }
): { points: number; hit: boolean; difference: number; isPocha: boolean } {
  const hit = bid === actual;
  const difference = Math.abs(bid - actual);

  // Pocha condition: player bids ALL tricks in round with 4+ cards (cards >= 4 && bid === cards)
  const isPochaAttempt = cards >= 4 && bid === cards && rules?.pochaDoubleDouble !== false;
  const isPocha = isPochaAttempt && hit;

  const isOrosDouble = trump === 'oros' && rules?.doubleOros !== false;

  if (isPochaAttempt) {
    // Base hit value: (5 * cards) + 10
    // Multiplier: x2 for Pocha bid, and additional x2 if trump is Oros (x4 total in Oros)
    // Non-Oros 8 cards: (40 + 10) * 2 = 100 pts (+100 hit, -100 fail)
    // Oros 8 cards: (40 + 10) * 2 * 2 = 200 pts (+200 hit, -200 fail)
    const baseValue = 5 * cards + 10;
    const pochaMultiplier = 2 * (isOrosDouble ? 2 : 1);
    const pochaMagnitude = baseValue * pochaMultiplier;
    const points = hit ? pochaMagnitude : -pochaMagnitude;

    console.log(
      `[POCHA SCORE LOG] 🃏 Cards: ${cards} | Bid: ${bid} | Actual: ${actual} | Trump: ${trump} | Hit: ${hit}\n` +
      `  - Base Value (5*cards + 10): ${baseValue}\n` +
      `  - Multipliers: Pocha (x2)${isOrosDouble ? ' x Oros (x2) = x4 Total' : ' = x2 Total'}\n` +
      `  - Calculation: ${baseValue} * ${pochaMultiplier} = ${pochaMagnitude} (${hit ? '+' : '-'}${pochaMagnitude} pts)\n` +
      `  - Final Points: ${points}`
    );

    return { points, hit, difference, isPocha };
  }

  let basePoints = 0;
  if (hit) {
    basePoints = 10 + 5 * bid;
  } else {
    basePoints = -10 - 5 * difference;
  }

  const points = isOrosDouble ? basePoints * 2 : basePoints;

  console.log(
    `[SCORE LOG] 🃏 Cards: ${cards} | Bid: ${bid} | Actual: ${actual} | Trump: ${trump} | Hit: ${hit}\n` +
    `  - Base Points: ${basePoints} (${hit ? `10 + 5*${bid}` : `-10 - 5*${difference}`})\n` +
    `  - Oros Double: ${isOrosDouble ? 'Yes (x2)' : 'No'}\n` +
    `  - Final Points: ${points}`
  );

  return { points, hit, difference, isPocha };
}

/**
 * Recalculates all scores and accumulated points across all rounds
 */
export function recalculateGameScores(
  players: Player[],
  rounds: Round[],
  rules: GameRules
): Round[] {
  const accumulatedMap: Record<string, number> = {};
  players.forEach((p) => {
    accumulatedMap[p.id] = p.startingPoints || 0;
  });

  return rounds.map((round, rIdx) => {
    const updatedScores: Record<string, RoundScore> = {};

    players.forEach((player) => {
      // If player joined mid-game after this round, they didn't participate in this round
      const joinedIdx = player.joinedAtRoundIndex;
      const joinedAfterThisRound = joinedIdx !== undefined && rIdx < joinedIdx;

      const currentScore = round.scores[player.id];
      const bid = joinedAfterThisRound ? null : (currentScore?.bid ?? null);
      const actual = joinedAfterThisRound ? null : (currentScore?.actual ?? null);

      let points = 0;
      let hit: boolean | null = null;
      let diff = 0;
      let isPocha = false;

      if (bid !== null && actual !== null) {
        const result = calculateScore(bid, actual, round.trump, round.cards, rules);
        points = result.points;
        hit = result.hit;
        diff = result.difference;
        isPocha = result.isPocha;
      }

      const prevAccumulated = accumulatedMap[player.id] ?? (player.startingPoints || 0);
      const newAccumulated = round.phase === 'completed' ? prevAccumulated + points : prevAccumulated;

      if (round.phase === 'completed') {
        accumulatedMap[player.id] = newAccumulated;
      }

      updatedScores[player.id] = {
        playerId: player.id,
        bid,
        actual,
        points: round.phase === 'completed' ? points : 0,
        accumulatedPoints: round.phase === 'completed' ? newAccumulated : prevAccumulated,
        hit,
        difference: diff,
        isPocha,
      };
    });

    return {
      ...round,
      scores: updatedScores,
    };
  });
}

/**
 * Gets the list of players ordered starting from the Mano (player after dealer)
 */
export function getBiddingOrder(players: Player[], dealerIndex: number): Player[] {
  const n = players.length;
  if (n === 0) return [];
  const safeDealerIndex = ((dealerIndex % n) + n) % n;
  const order: Player[] = [];
  for (let i = 1; i <= n; i++) {
    const idx = (safeDealerIndex + i) % n;
    if (players[idx]) {
      order.push(players[idx]);
    }
  }
  return order;
}

/**
 * Checks if a specific bid is forbidden for the dealer (Repartidor)
 */
export function getForbiddenDealerBid(
  players: Player[],
  dealerIndex: number,
  round: Round,
  rules: GameRules
): number | null {
  if (!rules.forbiddenDealerBid || players.length === 0) return null;

  const cards = round.cards;
  const safeDealerIndex = ((dealerIndex % players.length) + players.length) % players.length;
  const dealer = players[safeDealerIndex];
  if (!dealer) return null;

  const biddingOrder = getBiddingOrder(players, safeDealerIndex);

  let sumOthers = 0;
  let otherBidsCount = 0;

  biddingOrder.forEach((p) => {
    if (p && p.id !== dealer.id) {
      const b = round.scores[p.id]?.bid;
      if (b !== undefined && b !== null) {
        sumOthers += b;
        otherBidsCount++;
      }
    }
  });

  // Only apply restriction if all non-dealer players have placed their bids
  if (otherBidsCount === players.length - 1) {
    const forbidden = cards - sumOthers;
    if (forbidden >= 0 && forbidden <= cards) {
      return forbidden;
    }
  }

  return null;
}

/**
 * Parses natural Spanish spoken or typed text into player bids or actuals
 * E.g., "Carlos 2, Ana 1, Pedro cero" -> { "p_1": 2, "p_2": 1, "p_3": 0 }
 */
export function parseVoiceInput(
  text: string,
  players: Player[]
): { parsedScores: Record<string, number>; unmatchedText: string } {
  const normalizedText = text.toLowerCase().trim();

  // Map Spanish number words
  const wordToNum: Record<string, number> = {
    cero: 0,
    ninguna: 0,
    ninguno: 0,
    nada: 0,
    una: 1,
    uno: 1,
    un: 1,
    dos: 2,
    tres: 3,
    cuatro: 4,
    cinco: 5,
    seis: 6,
    siete: 7,
    ocho: 8,
    nueve: 9,
    diez: 10,
  };

  const parsedScores: Record<string, number> = {};

  // For each player, search for player name followed by number or number word
  players.forEach((player) => {
    const pName = player.name.toLowerCase().trim();
    // Regex for player name followed by number or word
    const regex = new RegExp(`${pName}\\s*(?:pide|pido|hace|hizo|tiene|:|=)?\\s*(\\d+|cero|ninguna|ninguno|nada|una|uno|un|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)`, 'i');
    const match = normalizedText.match(regex);

    if (match && match[1]) {
      const valStr = match[1];
      const val = !isNaN(parseInt(valStr, 10))
        ? parseInt(valStr, 10)
        : wordToNum[valStr] ?? null;

      if (val !== null) {
        parsedScores[player.id] = val;
      }
    }
  });

  // Fallback: If text is just a list of numbers like "2 1 0 3", assign in dealer order
  if (Object.keys(parsedScores).length === 0) {
    const numbersMatch = normalizedText.match(/\d+/g);
    if (numbersMatch && numbersMatch.length === players.length) {
      players.forEach((p, idx) => {
        parsedScores[p.id] = parseInt(numbersMatch[idx], 10);
      });
    }
  }

  return { parsedScores, unmatchedText: normalizedText };
}

/**
 * Calculates detailed game statistics for analysis
 */
export function calculatePlayerStats(players: Player[], rounds: Round[]): PlayerStats[] {
  const completedRounds = rounds.filter((r) => r.phase === 'completed');

  return players.map((player) => {
    let totalPoints = 0;
    let totalHits = 0;
    let totalMisses = 0;
    let totalBids = 0;
    let totalActuals = 0;
    let orosPoints = 0;
    let normalPoints = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let totalDiff = 0;

    let bestRound: { roundNumber: number; points: number } | null = null;
    let worstRound: { roundNumber: number; points: number } | null = null;

    completedRounds.forEach((round) => {
      const s = round.scores[player.id];
      if (!s || s.bid === null || s.actual === null) return;

      totalPoints += s.points;
      totalBids += s.bid;
      totalActuals += s.actual;
      totalDiff += s.difference;

      if (round.trump === 'oros') {
        orosPoints += s.points;
      } else {
        normalPoints += s.points;
      }

      if (s.hit) {
        totalHits++;
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else {
        totalMisses++;
        currentStreak = 0;
      }

      if (!bestRound || s.points > bestRound.points) {
        bestRound = { roundNumber: round.roundNumber, points: s.points };
      }
      if (!worstRound || s.points < worstRound.points) {
        worstRound = { roundNumber: round.roundNumber, points: s.points };
      }
    });

    const totalRoundsPlayed = totalHits + totalMisses;
    const hitPercentage = totalRoundsPlayed > 0 ? Math.round((totalHits / totalRoundsPlayed) * 100) : 0;
    const avgErrorMargin = totalRoundsPlayed > 0 ? Number((totalDiff / totalRoundsPlayed).toFixed(2)) : 0;

    return {
      player,
      totalPoints,
      rank: 1, // Will be set after sorting
      totalRounds: totalRoundsPlayed,
      totalHits,
      totalMisses,
      hitPercentage,
      totalBids,
      totalActuals,
      orosPoints,
      normalPoints,
      bestRound,
      worstRound,
      currentStreak,
      maxStreak,
      avgErrorMargin,
    };
  })
  .sort((a, b) => b.totalPoints - a.totalPoints)
  .map((stat, idx) => ({ ...stat, rank: idx + 1 }));
}
