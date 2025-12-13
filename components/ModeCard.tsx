import React from 'react';
import { Pressable, Text, StyleSheet, View, Platform } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ModeCardProps {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    onPress: () => void;
}

// Smooth easing for no-bounce effect
const SMOOTH_EASING = Easing.out(Easing.cubic);

export function ModeCard({ title, description, icon, iconColor, onPress }: ModeCardProps) {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);
    const translateY = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateY: translateY.value },
        ],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const handlePressIn = () => {
        scale.value = withTiming(0.97, { duration: 120, easing: SMOOTH_EASING });
        glowOpacity.value = withTiming(1, { duration: 100 });
    };

    const handlePressOut = () => {
        scale.value = withTiming(1, { duration: 150, easing: SMOOTH_EASING });
        glowOpacity.value = withTiming(0, { duration: 150 });
    };

    const handleHoverIn = () => {
        if (Platform.OS === 'web') {
            scale.value = withTiming(1.02, { duration: 150, easing: SMOOTH_EASING });
            translateY.value = withTiming(-4, { duration: 150, easing: SMOOTH_EASING });
            glowOpacity.value = withTiming(0.6, { duration: 150 });
        }
    };

    const handleHoverOut = () => {
        if (Platform.OS === 'web') {
            scale.value = withTiming(1, { duration: 150, easing: SMOOTH_EASING });
            translateY.value = withTiming(0, { duration: 150, easing: SMOOTH_EASING });
            glowOpacity.value = withTiming(0, { duration: 150 });
        }
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            // @ts-ignore - Web only
            onMouseEnter={handleHoverIn}
            onMouseLeave={handleHoverOut}
            style={[styles.container, animatedStyle]}
        >
            {/* Glow border */}
            <Animated.View
                style={[
                    styles.glowBorder,
                    { borderColor: iconColor },
                    glowStyle
                ]}
            />

            <View style={[styles.iconCircle, { backgroundColor: iconColor + '33' }]}>
                <Ionicons name={icon} size={40} color={iconColor} />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 280,
        height: 280,
        backgroundColor: 'rgba(30, 30, 40, 0.6)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        cursor: 'pointer' as any,
        position: 'relative',
    },
    glowBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24,
        borderWidth: 2,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 20,
        shadowOpacity: 0.5,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        color: Colors.text,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        color: Colors.textSecondary,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
});
