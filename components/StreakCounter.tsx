import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    useSharedValue,
    FadeIn,
    Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface StreakCounterProps {
    streak: number;
    visible: boolean;
    style?: StyleProp<ViewStyle>;
}

// Smooth easing for no-bounce effect
const SMOOTH_EASING = Easing.out(Easing.cubic);

function StreakCounterComponent({ streak, visible, style }: StreakCounterProps) {
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
                style,
                animatedStyle,
                isOnFire && styles.onFire,
                isLegendary && styles.legendary
            ]}
        >

            <View style={styles.topRow}>
                <View style={styles.iconContainer}>
                    {isLegendary ? (
                        <Text style={styles.legendaryEmoji}>🏆</Text>
                    ) : isOnFire ? (
                        <Ionicons name="flame" size={24} color={Colors.fast} />
                    ) : (
                        <Ionicons name="flash" size={24} color={Colors.primary} />
                    )}
                </View>
                <Text style={[
                    styles.count,
                    isOnFire && styles.countFire,
                    isLegendary && styles.countLegendary
                ]}>
                    {streak}
                </Text>
            </View>

            <Text style={styles.label}>STREAK</Text>
            {streak > 0 && (
                <Text style={styles.bonus}>+{Math.min(streak * 100, 500)}</Text>
            )}
        </Animated.View>
    );
}

export const StreakCounter = memo(StreakCounterComponent);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0, 243, 255, 0.1)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.primary,
        minWidth: 100,
        width: '100%',
        height: '100%',
    },
    onFire: {
        backgroundColor: 'rgba(255, 107, 53, 0.15)',
        borderColor: Colors.fast,
    },
    legendary: {
        backgroundColor: 'rgba(255, 204, 0, 0.15)',
        borderColor: Colors.lightning,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 2,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    legendaryEmoji: {
        fontSize: 24,
    },
    count: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.primary,
        textAlign: 'center',
        fontVariant: ['tabular-nums'],
    },
    countFire: {
        color: Colors.fast,
    },
    countLegendary: {
        color: Colors.lightning,
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        color: Colors.textSecondary,
        letterSpacing: 1,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    bonus: {
        fontSize: 11,
        fontWeight: 'bold',
        color: Colors.success,
        marginTop: 2,
        textAlign: 'center',
    },
});
