import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    useSharedValue,
    FadeIn
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';

interface StreakCounterProps {
    streak: number;
    visible: boolean;
}

export function StreakCounter({ streak, visible }: StreakCounterProps) {
    const scale = useSharedValue(1);

    useEffect(() => {
        if (streak > 0) {
            // Pulse animation on streak increase
            scale.value = withSequence(
                withSpring(1.2, { damping: 5 }),
                withSpring(1, { damping: 8 })
            );
        }
    }, [streak]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    if (!visible || streak === 0) return null;

    const isOnFire = streak >= 3;
    const isLegendary = streak >= 5;

    return (
        <Animated.View
            entering={FadeIn}
            style={[
                styles.container,
                animatedStyle,
                isOnFire && styles.onFire,
                isLegendary && styles.legendary
            ]}
        >
            <View style={styles.iconContainer}>
                {isLegendary ? (
                    <Text style={styles.legendaryEmoji}>🏆</Text>
                ) : isOnFire ? (
                    <Ionicons name="flame" size={20} color={Colors.fast} />
                ) : (
                    <Ionicons name="flash" size={20} color={Colors.primary} />
                )}
            </View>
            <Text style={[
                styles.count,
                isOnFire && styles.countFire,
                isLegendary && styles.countLegendary
            ]}>
                {streak}
            </Text>
            <Text style={styles.label}>STREAK</Text>
            {streak > 0 && (
                <Text style={styles.bonus}>+{Math.min(streak * 100, 500)}</Text>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(0, 243, 255, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary,
        minWidth: 80,
    },
    onFire: {
        backgroundColor: 'rgba(255, 107, 53, 0.15)',
        borderColor: Colors.fast,
    },
    legendary: {
        backgroundColor: 'rgba(255, 204, 0, 0.15)',
        borderColor: Colors.lightning,
    },
    iconContainer: {
        marginBottom: 4,
    },
    legendaryEmoji: {
        fontSize: 20,
    },
    count: {
        fontSize: 28,
        fontWeight: '900',
        color: Colors.primary,
    },
    countFire: {
        color: Colors.fast,
    },
    countLegendary: {
        color: Colors.lightning,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 1,
    },
    bonus: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.success,
        marginTop: 4,
    },
});
