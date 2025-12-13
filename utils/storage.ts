/**
 * Local Storage Utilities for MusiGuess
 * Handles persistence of user preferences, high scores, and consent
 */

import { Platform } from 'react-native';
import { STORAGE_KEYS, HighScoreEntry, UserPreferences } from '../types';

/**
 * Check if localStorage is available (web only)
 */
const isStorageAvailable = (): boolean => {
    if (Platform.OS !== 'web') return false;
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
};

/**
 * Get an item from localStorage with JSON parsing
 */
const getItem = <T>(key: string, defaultValue: T): T => {
    if (!isStorageAvailable()) return defaultValue;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
};

/**
 * Set an item in localStorage with JSON stringification
 */
const setItem = <T>(key: string, value: T): void => {
    if (!isStorageAvailable()) return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
    }
};

/**
 * Cookie Consent
 */
export const getCookieConsent = (): boolean => {
    return getItem(STORAGE_KEYS.COOKIE_CONSENT, false);
};

export const setCookieConsent = (accepted: boolean): void => {
    setItem(STORAGE_KEYS.COOKIE_CONSENT, accepted);
};

/**
 * High Scores
 */
export const getHighScores = (): HighScoreEntry[] => {
    return getItem(STORAGE_KEYS.HIGH_SCORES, []);
};

export const addHighScore = (entry: HighScoreEntry): void => {
    const scores = getHighScores();
    scores.push(entry);
    // Sort by score descending and keep top 10
    scores.sort((a, b) => b.score - a.score);
    setItem(STORAGE_KEYS.HIGH_SCORES, scores.slice(0, 10));
};

export const getPersonalBest = (artist?: string): number => {
    const scores = getHighScores();
    if (artist) {
        const artistScores = scores.filter(s => s.artist.toLowerCase() === artist.toLowerCase());
        return artistScores.length > 0 ? artistScores[0].score : 0;
    }
    return scores.length > 0 ? scores[0].score : 0;
};

/**
 * User Preferences
 */
const DEFAULT_PREFERENCES: UserPreferences = {
    soundEnabled: true,
    hapticsEnabled: true,
    volume: 1.0,
};

export const getPreferences = (): UserPreferences => {
    return getItem(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
};

export const setPreferences = (prefs: Partial<UserPreferences>): void => {
    const current = getPreferences();
    setItem(STORAGE_KEYS.PREFERENCES, { ...current, ...prefs });
};

/**
 * Clear all stored data
 */
export const clearAllData = (): void => {
    if (!isStorageAvailable()) return;
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
};
