import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSequence,
    Easing,
    runOnJS
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

interface CountdownProps {
    onComplete: () => void;
    startFrom?: number;
}

export function Countdown({ onComplete, startFrom = 3 }: CountdownProps) {
    const [count, setCount] = useState(startFrom);
    const scale = useSharedValue(0.5);
    const opacity = useSharedValue(0);

    useEffect(() => {
        // Animate in
        scale.value = withSequence(
            withTiming(1.2, { duration: 200, easing: Easing.out(Easing.back(2)) }),
            withTiming(1, { duration: 100 })
        );
        opacity.value = withTiming(1, { duration: 150 });

        // Countdown timer
        const interval = setInterval(() => {
            setCount(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    // Animate out then call onComplete
                    scale.value = withTiming(0.5, { duration: 200 });
                    opacity.value = withTiming(0, { duration: 200 }, () => {
                        runOnJS(onComplete)();
                    });
                    return 0;
                }
                // Pulse animation for each tick
                scale.value = withSequence(
                    withTiming(1.3, { duration: 100 }),
                    withTiming(1, { duration: 100 })
                );
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const getCountText = () => {
        if (count === 0) return 'GO!';
        return count.toString();
    };

    const getColor = () => {
        if (count === 0) return Colors.success;
        if (count === 1) return Colors.error;
        if (count === 2) return Colors.warning;
        return Colors.primary;
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.circle, { borderColor: getColor() }, animatedStyle]}>
                <Text style={[styles.text, { color: getColor() }]}>{getCountText()}</Text>
            </Animated.View>
            <Text style={styles.label}>Get Ready!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    circle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        backgroundColor: 'rgba(30, 30, 45, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 72,
        fontWeight: '900',
    },
    label: {
        marginTop: 30,
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 2,
    },
});
