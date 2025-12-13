import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsContextType = {
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    toggleSound: () => void;
    toggleHaptics: () => void;
};

const SettingsContext = createContext<SettingsContextType>({
    soundEnabled: true,
    hapticsEnabled: true,
    toggleSound: () => { },
    toggleHaptics: () => { },
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [hapticsEnabled, setHapticsEnabled] = useState(true);

    useEffect(() => {
        // Load settings
        AsyncStorage.getItem('settings').then(json => {
            if (json) {
                const data = JSON.parse(json);
                if (data.soundEnabled !== undefined) setSoundEnabled(data.soundEnabled);
                if (data.hapticsEnabled !== undefined) setHapticsEnabled(data.hapticsEnabled);
            }
        });
    }, []);

    const saveSettings = async (sound: boolean, haptics: boolean) => {
        try {
            await AsyncStorage.setItem('settings', JSON.stringify({ soundEnabled: sound, hapticsEnabled: haptics }));
        } catch (e) {
            console.error("Failed to save settings", e);
        }
    };

    const toggleSound = () => {
        setSoundEnabled(prev => {
            const newVal = !prev;
            saveSettings(newVal, hapticsEnabled);
            return newVal;
        });
    };

    const toggleHaptics = () => {
        setHapticsEnabled(prev => {
            const newVal = !prev;
            saveSettings(soundEnabled, newVal);
            return newVal;
        });
    };

    return (
        <SettingsContext.Provider value={{ soundEnabled, hapticsEnabled, toggleSound, toggleHaptics }}>
            {children}
        </SettingsContext.Provider>
    );
}
