/**
 * Scoring System for MusiGuess
 * Professional-grade scoring with speed tiers and streak bonuses
 */

import { SpeedTier, ScoreResult, DifficultySettings, DIFFICULTY_PRESETS } from '../types';

/**
 * Base points for a correct answer
 */
const BASE_POINTS = 1000;

/**
 * Speed tier thresholds (in seconds)
 */
const SPEED_THRESHOLDS = {
    LIGHTNING: 3,   // 0-3 seconds
    FAST: 7,        // 3-7 seconds
    GOOD: 15,       // 7-15 seconds
    // BASE: 15+    // 15-30 seconds
};

/**
 * Speed tier multipliers
 */
const SPEED_MULTIPLIERS: Record<SpeedTier, number> = {
    lightning: 2.0,
    fast: 1.5,
    good: 1.2,
    base: 1.0,
};

/**
 * Speed tier display info
 */
export const SPEED_TIER_INFO: Record<SpeedTier, { label: string; emoji: string; color: string }> = {
    lightning: { label: 'LIGHTNING', emoji: '⚡', color: '#ffcc00' },
    fast: { label: 'FAST', emoji: '🔥', color: '#ff6b35' },
    good: { label: 'GOOD', emoji: '👍', color: '#4caf50' },
    base: { label: 'NICE', emoji: '✓', color: '#8899ac' },
};

/**
 * Streak bonus per consecutive correct answer (max 5)
 */
const STREAK_BONUS = 100;
const MAX_STREAK_BONUS = 500;

/**
 * Determine the speed tier based on elapsed time
 */
export const getSpeedTier = (elapsedSeconds: number): SpeedTier => {
    if (elapsedSeconds <= SPEED_THRESHOLDS.LIGHTNING) return 'lightning';
    if (elapsedSeconds <= SPEED_THRESHOLDS.FAST) return 'fast';
    if (elapsedSeconds <= SPEED_THRESHOLDS.GOOD) return 'good';
    return 'base';
};

/**
 * Calculate score for a correct answer
 * 
 * @param elapsedSeconds - Time taken to answer
 * @param currentStreak - Current consecutive correct answers
 * @param difficulty - Difficulty level (affects multiplier)
 * @returns ScoreResult with points breakdown
 */
export const calculateScore = (
    elapsedSeconds: number,
    currentStreak: number = 0,
    difficulty: string = 'normal'
): ScoreResult => {
    const speedTier = getSpeedTier(elapsedSeconds);
    const speedMultiplier = SPEED_MULTIPLIERS[speedTier];
    const difficultySettings = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.normal;

    // Base points with speed multiplier
    const baseWithSpeed = Math.round(BASE_POINTS * speedMultiplier);

    // Streak bonus (capped)
    const streakBonus = Math.min(currentStreak * STREAK_BONUS, MAX_STREAK_BONUS);

    // Apply difficulty multiplier to total
    const subtotal = baseWithSpeed + streakBonus;
    const totalPoints = Math.round(subtotal * difficultySettings.scoreMultiplier);

    return {
        points: baseWithSpeed,
        speedTier,
        streakBonus,
        totalPoints,
    };
};

/**
 * Calculate score for wrong answer or timeout
 */
export const calculateWrongScore = (): ScoreResult => {
    return {
        points: 0,
        speedTier: 'base',
        streakBonus: 0,
        totalPoints: 0,
    };
};

/**
 * Format score for display
 */
export const formatScore = (score: number): string => {
    return score.toLocaleString();
};

/**
 * Get difficulty settings
 */
export const getDifficultySettings = (difficulty: string): DifficultySettings => {
    return DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.normal;
};

/**
 * Legacy scoring (for backward compatibility during transition)
 * Maps old exponential decay to approximate new system
 */
export const legacyToNewScore = (legacyPoints: number): number => {
    // Old max was 100, new max is 2000 (with lightning + streak)
    // Scale factor: 20
    return Math.round(legacyPoints * 20);
};
