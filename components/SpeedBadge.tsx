import React, { memo } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
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
            style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.6)', borderColor: info.color }, style]}
        >
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 4,
        borderWidth: 1,
        minWidth: 140,
    },
    textContainer: {
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    points: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.text,
        fontVariant: ['tabular-nums'],
    },
});
