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
            <Text style={styles.label}>STREAK</Text>
            <Text style={[
                styles.count,
                isOnFire && styles.countFire,
                isLegendary && styles.countLegendary
            ]}>
                {streak}
            </Text>
            {streak > 0 && (
                <Text style={styles.bonus}>+{Math.min(streak * 100, 500)} PTS</Text>
            )}
        </Animated.View>
    );
}

export const StreakCounter = memo(StreakCounterComponent);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.primary,
        minWidth: 100,
    },
    onFire: {
        borderColor: Colors.fast,
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
    },
    legendary: {
        borderColor: Colors.lightning,
        backgroundColor: 'rgba(255, 204, 0, 0.1)',
    },
    count: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.primary,
        fontVariant: ['tabular-nums'],
        lineHeight: 32,
        marginVertical: 4,
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
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    bonus: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.success,
        marginTop: 2,
    },
});
