import { Game, PlayerStats } from '../types';

export interface RecentWinner {
  id: string;
  date: string;
  playerName: string;
  playerAvatar: string;
  playerColor: string;
  points: number;
  totalPlayers: number;
  hitPercentage: number;
  gameName?: string;
}

export interface SavedGameRanking {
  rank: number;
  name: string;
  avatar: string;
  color: string;
  points: number;
  hits: number;
  misses: number;
  hitPercentage: number;
}

export interface SavedGameRecord {
  id: string;
  date: string;
  name: string;
  numPlayers: number;
  totalRounds: number;
  winner: RecentWinner;
  rankings: SavedGameRanking[];
  gameData?: Game;
}

export type SavedGame = SavedGameRecord;
export const loadRecentWinners = getRecentWinners;
export const loadSavedGames = getSavedGames;

const RECENT_WINNERS_KEY = 'pocha_recent_winners_v1';
const SAVED_GAMES_KEY = 'pocha_saved_games_v1';

/**
 * Retrieves the last 5 game winners from localStorage
 */
export function getRecentWinners(): RecentWinner[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(RECENT_WINNERS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 5);
    }
  } catch (e) {
    console.error('Error loading recent winners:', e);
  }
  return [];
}

/**
 * Retrieves all saved games from localStorage
 */
export function getSavedGames(): SavedGameRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(SAVED_GAMES_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.error('Error loading saved games:', e);
  }
  return [];
}

/**
 * Saves a completed game into history and records the winner into the recent 5 winners list
 */
export function saveCompletedGame(game: Game, stats: PlayerStats[]): void {
  if (typeof window === 'undefined' || !stats || stats.length === 0) return;

  try {
    const winnerStat = stats[0];
    const winner: RecentWinner = {
      id: `winner_${Date.now()}`,
      date: new Date().toISOString(),
      playerName: winnerStat.player.name,
      playerAvatar: winnerStat.player.avatar,
      playerColor: winnerStat.player.color,
      points: winnerStat.totalPoints,
      totalPlayers: game.players.length,
      hitPercentage: winnerStat.hitPercentage,
      gameName: game.name || `Partida de ${game.players.length} jugadores`,
    };

    // 1. Update Recent 5 Winners
    const currentWinners = getRecentWinners();
    // Avoid exact duplicate at the top
    const filteredWinners = currentWinners.filter(
      (w) => !(w.playerName === winner.playerName && Math.abs(new Date(w.date).getTime() - Date.now()) < 5000)
    );
    const updatedWinners = [winner, ...filteredWinners].slice(0, 5);
    localStorage.setItem(RECENT_WINNERS_KEY, JSON.stringify(updatedWinners));

    // 2. Update Saved Games History
    const rankings: SavedGameRanking[] = stats.map((st) => ({
      rank: st.rank,
      name: st.player.name,
      avatar: st.player.avatar,
      color: st.player.color,
      points: st.totalPoints,
      hits: st.totalHits,
      misses: st.totalMisses,
      hitPercentage: st.hitPercentage,
    }));

    const newRecord: SavedGameRecord = {
      id: game.id || `game_${Date.now()}`,
      date: new Date().toISOString(),
      name: game.name || `Partida de ${game.players.length} jugadores`,
      numPlayers: game.players.length,
      totalRounds: game.rounds.length,
      winner,
      rankings,
      gameData: game,
    };

    const currentSaved = getSavedGames();
    const existingIndex = currentSaved.findIndex((g) => g.id === newRecord.id);
    let updatedSaved: SavedGameRecord[];
    if (existingIndex >= 0) {
      updatedSaved = [...currentSaved];
      updatedSaved[existingIndex] = newRecord;
    } else {
      updatedSaved = [newRecord, ...currentSaved];
    }

    localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(updatedSaved));
  } catch (e) {
    console.error('Error saving completed game:', e);
  }
}

/**
 * Deletes a single game from saved games history
 */
export function deleteSavedGame(gameId: string): SavedGameRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSavedGames();
    const updated = current.filter((g) => g.id !== gameId);
    localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error deleting game:', e);
    return [];
  }
}

/**
 * Clears the entire saved games history
 */
export function clearAllSavedGames(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SAVED_GAMES_KEY);
  } catch (e) {
    console.error('Error clearing saved games:', e);
  }
}

/**
 * Clears the recent winners list
 */
export function clearRecentWinners(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_WINNERS_KEY);
  } catch (e) {
    console.error('Error clearing winners:', e);
  }
}
