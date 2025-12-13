import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withSequence,
    withDelay,
    FadeIn,
    ZoomIn
} from 'react-native-reanimated';
import { SpeedTier } from '../types';
import { SPEED_TIER_INFO } from '../utils/scoring';
import { Colors } from '../constants/Colors';

import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface SpeedBadgeProps {
    tier: SpeedTier;
    points: number;
    visible: boolean;
    style?: StyleProp<ViewStyle>;
}

function SpeedBadgeComponent({ tier, points, visible, style }: SpeedBadgeProps) {
    if (!visible) return null;

    const info = SPEED_TIER_INFO[tier];

    return (
        <Animated.View
            entering={ZoomIn.springify().damping(12)}
            style={[styles.container, { backgroundColor: info.color + '30', borderColor: info.color }, style]}
        >
            <Text style={styles.emoji}>{info.emoji}</Text>
            <View style={styles.textContainer}>
                <Text style={[styles.label, { color: info.color }]}>{info.label}</Text>
                <Text style={styles.points}>+{points.toLocaleString()}</Text>
            </View>
        </Animated.View>
    );
}

export const SpeedBadge = memo(SpeedBadgeComponent);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 2,
        gap: 12,
    },
    emoji: {
        fontSize: 32,
    },
    textContainer: {
        alignItems: 'flex-start',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    points: {
        fontSize: 24,
        fontWeight: '900',
        color: Colors.text,
    },
});
