export type Suit = 'oros' | 'copas' | 'espadas' | 'bastos' | 'sin_triunfo';

export interface SuitInfo {
  id: Suit;
  name: string;
  symbol: string;
  icon: string; // Emoji or SVG key
  color: string;
  bgColor: string;
  borderColor: string;
  isDouble: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  avatar: string;
  startingPoints?: number;       // Score offset when joining mid-game (starts with fewest points)
  joinedAtRoundIndex?: number;   // Round index when the player joined mid-game
}

export interface RoundScore {
  playerId: string;
  bid: number | null;     // Bazas pedidas
  actual: number | null;  // Bazas hechas
  points: number;         // Points gained/lost in this round
  accumulatedPoints: number; // Total points up to this round
  hit: boolean | null;    // true if bid === actual
  difference: number;     // Math.abs((bid || 0) - (actual || 0))
  isPocha?: boolean;      // true if player made all tricks in round >= 4 cards
}

export type RoundPhase = 'bidding' | 'playing' | 'completed';

export interface Round {
  id: string;
  roundNumber: number;
  cards: number;
  dealerIndex: number;    // Index of the player dealing
  trump: Suit;
  phase: RoundPhase;
  scores: Record<string, RoundScore>; // Keyed by playerId
  phaseName?: string;     // e.g., '1 carta', 'Subida', 'Subastado', 'Máximas Triunfo Visible', 'Bajada'
  isSubastado?: boolean;  // True if it's a Subastado round (highest bidder picks trump)
  isRandomTrumpMax?: boolean; // True if it's max cards round with random trump per dealer
  isVisibleTrumpMax?: boolean; // True if it's max cards round with visible trump
  subastadoWinnerId?: string;  // Player ID who won subastado and chose trump
}

export interface GameRules {
  forbiddenDealerBid: boolean; // Dealer cannot match total cards
  doubleOros: boolean;         // Oros scores double
  allowSinTriunfo: boolean;    // Allow "Sin Triunfo" rounds
  deckCards?: number;          // Total cards in deck (e.g. 40, 48, 49, 52)
  pochaDoubleDouble?: boolean; // Make all tricks in >= 4 cards scores 4x (doble del doble)
  enableSubastado?: boolean;   // Enable subastado round in max cards
  randomTrumpAfterSubastado?: boolean; // Enable max cards round with random trump drawn by dealer
  visibleTrumpAfterSubastado?: boolean; // Enable max cards round with visible trump after subastado
}

export interface Game {
  id: string;
  createdAt: string;
  updatedAt: string;
  players: Player[];
  rounds: Round[];
  currentRoundIndex: number;
  rules: GameRules;
  isFinished: boolean;
  name?: string;
}

export interface PlayerStats {
  player: Player;
  totalPoints: number;
  rank: number;
  totalRounds: number;
  totalHits: number;
  totalMisses: number;
  hitPercentage: number;
  totalBids: number;
  totalActuals: number;
  orosPoints: number;
  normalPoints: number;
  bestRound: { roundNumber: number; points: number } | null;
  worstRound: { roundNumber: number; points: number } | null;
  currentStreak: number;
  maxStreak: number;
  avgErrorMargin: number;
}
