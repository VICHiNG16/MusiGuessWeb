import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    useSharedValue,
    FadeIn,
    Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';

interface StreakCounterProps {
    streak: number;
    visible: boolean;
}

// Smooth easing for no-bounce effect
const SMOOTH_EASING = Easing.out(Easing.cubic);

export function StreakCounter({ streak, visible }: StreakCounterProps) {
    const scale = useSharedValue(1);

    useEffect(() => {
        if (streak > 0) {
            // Quick pulse animation on streak increase (no bounce)
            scale.value = withTiming(1.15, { duration: 100, easing: SMOOTH_EASING });
            setTimeout(() => {
                scale.value = withTiming(1, { duration: 150, easing: SMOOTH_EASING });
            }, 100);
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
            entering={FadeIn.duration(200)}
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
                    <Ionicons name="flame" size={18} color={Colors.fast} />
                ) : (
                    <Ionicons name="flash" size={18} color={Colors.primary} />
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
        padding: 10,
        paddingHorizontal: 14,
        backgroundColor: 'rgba(0, 243, 255, 0.1)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.primary,
        marginTop: 16,
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
        marginBottom: 2,
    },
    legendaryEmoji: {
        fontSize: 18,
    },
    count: {
        fontSize: 22,
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
        fontSize: 9,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 1,
    },
    bonus: {
        fontSize: 11,
        fontWeight: 'bold',
        color: Colors.success,
        marginTop: 2,
    },
});
