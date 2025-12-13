import React from 'react';
import { Pressable, Text, StyleSheet, View, Platform, useWindowDimensions } from 'react-native';
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
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

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

    // Responsive styles
    const containerSize = isMobile ? { width: '100%' as const, height: 140, flexDirection: 'row' as const, paddingHorizontal: 20 } : { width: 280, height: 280, flexDirection: 'column' as const };
    const iconSize = isMobile ? { width: 60, height: 60 } : { width: 80, height: 80 };
    const iconFontSize = isMobile ? 30 : 40;

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            // @ts-ignore - Web only
            onMouseEnter={handleHoverIn}
            onMouseLeave={handleHoverOut}
            style={[styles.container, containerSize, animatedStyle]}
        >
            {/* Glow border */}
            <Animated.View
                style={[
                    styles.glowBorder,
                    { borderColor: iconColor },
                    glowStyle
                ]}
            />

            <View style={[styles.iconCircle, iconSize, { backgroundColor: iconColor + '33', marginRight: isMobile ? 16 : 0, marginBottom: isMobile ? 0 : 20 }]}>
                <Ionicons name={icon} size={iconFontSize} color={iconColor} />
            </View>

            <View style={isMobile ? styles.textContainerMobile : styles.textContainerDesktop}>
                <Text style={[styles.title, isMobile && styles.titleMobile]}>{title}</Text>
                <Text style={[styles.description, isMobile && styles.descriptionMobile]}>{description}</Text>
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(30, 30, 40, 0.6)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        cursor: 'pointer' as any,
        position: 'relative',
    },
    glowBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
        borderWidth: 2,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 20,
        shadowOpacity: 0.5,
    },
    iconCircle: {
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainerDesktop: {
        alignItems: 'center',
    },
    textContainerMobile: {
        flex: 1,
    },
    title: {
        color: Colors.text,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    titleMobile: {
        fontSize: 20,
        marginBottom: 4,
    },
    description: {
        color: Colors.textSecondary,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    descriptionMobile: {
        textAlign: 'left',
        fontSize: 13,
        lineHeight: 18,
    },
});
