// Centralized TypeScript interfaces for MusiGuess

/**
 * Song data from iTunes API
 */
export interface Song {
    trackId: number;
    trackName: string;
    artistName: string;
    previewUrl: string;
    artworkUrl100: string;
    trackViewUrl: string;
}

/**
 * Song option displayed during gameplay
 */
export interface SongOption {
    trackId: number;
    trackName: string;
    artworkUrl100: string;
}

/**
 * Song with answer options for a game round
 */
export interface GameSong extends Song {
    options: SongOption[];
}

/**
 * Player in a game room
 */
export interface Player {
    uid: string;
    name: string;
    score: number;
    misses: number;
    isHost: boolean;
    joinedAt: number;
    streak?: number;
}

/**
 * Guess data for a player in a round
 */
export interface GuessData {
    guess: string;
    scoreDelta: number;
    isCorrect: boolean;
    speedTier?: 'lightning' | 'fast' | 'good' | 'base';
}

/**
 * Round state during gameplay
 */
export interface RoundState {
    startedAt: number;
    suddenDeath?: boolean;
    guesses: Record<string, GuessData> | null;
    votes: Record<string, { ready: boolean }> | null;
}

/**
 * Game room data stored in Firebase
 */
export interface RoomData {
    hostUid: string;
    artist: string;
    artistImage?: string;
    status: 'waiting' | 'playing' | 'gameOver';
    mode: 'solo' | 'multi';
    difficulty?: 'easy' | 'normal' | 'hard' | 'extreme';
    createdAt: number;
    players: Record<string, Omit<Player, 'uid'>>;
    songs?: GameSong[];
    currentRound?: number;
    gameState?: 'preview' | 'reveal' | 'gameOver';
    roundState?: RoundState;
}

/**
 * Artist search result
 */
export interface ArtistResult {
    artistId: number;
    artistName: string;
    primaryGenreName: string;
    image: string | null;
}

/**
 * Speed tier for scoring
 */
export type SpeedTier = 'lightning' | 'fast' | 'good' | 'base';

/**
 * Score calculation result
 */
export interface ScoreResult {
    points: number;
    speedTier: SpeedTier;
    streakBonus: number;
    totalPoints: number;
}

/**
 * Difficulty level
 */
export type Difficulty = 'easy' | 'normal' | 'hard' | 'extreme';

/**
 * Difficulty settings
 */
export interface DifficultySettings {
    timeLimit: number;
    scoreMultiplier: number;
    label: string;
}

export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultySettings> = {
    easy: { timeLimit: 40, scoreMultiplier: 0.8, label: 'Easy' },
    normal: { timeLimit: 30, scoreMultiplier: 1.0, label: 'Normal' },
    hard: { timeLimit: 20, scoreMultiplier: 1.5, label: 'Hard' },
    extreme: { timeLimit: 10, scoreMultiplier: 2.0, label: 'Extreme' },
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
    COOKIE_CONSENT: 'musiguess_cookie_consent',
    HIGH_SCORES: 'musiguess_high_scores',
    PREFERENCES: 'musiguess_preferences',
} as const;

/**
 * High score entry
 */
export interface HighScoreEntry {
    artist: string;
    score: number;
    date: string;
    difficulty: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    volume: number;
}
