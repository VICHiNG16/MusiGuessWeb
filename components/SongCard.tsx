import { Pressable, Text, StyleSheet, Image, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useState } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SongCardProps {
    onPress: () => void;
    title: string;
    artwork: string;
    disabled?: boolean;
    style?: any;
}

// Smooth easing for no-bounce effect
const SMOOTH_EASING = Easing.out(Easing.cubic);

export function SongCard({ onPress, title, artwork, disabled, style }: SongCardProps) {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);
    const [imageLoaded, setImageLoaded] = useState(false);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const handlePressIn = () => {
        if (!disabled) {
            scale.value = withTiming(0.96, { duration: 100, easing: SMOOTH_EASING });
            glowOpacity.value = withTiming(1, { duration: 100 });
        }
    };

    const handlePressOut = () => {
        if (!disabled) {
            scale.value = withTiming(1, { duration: 120, easing: SMOOTH_EASING });
            glowOpacity.value = withTiming(0, { duration: 150 });
        }
    };

    const handleHoverIn = () => {
        if (!disabled && Platform.OS === 'web') {
            scale.value = withTiming(1.02, { duration: 120, easing: SMOOTH_EASING });
            glowOpacity.value = withTiming(0.6, { duration: 120 });
        }
    };

    const handleHoverOut = () => {
        if (!disabled && Platform.OS === 'web') {
            scale.value = withTiming(1, { duration: 120, easing: SMOOTH_EASING });
            glowOpacity.value = withTiming(0, { duration: 150 });
        }
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            // @ts-ignore - Web only props
            onMouseEnter={handleHoverIn}
            onMouseLeave={handleHoverOut}
            disabled={disabled}
            style={[styles.container, style, animatedStyle, disabled && styles.disabled]}
        >
            {/* Glow Effect Layer */}
            <Animated.View style={[styles.glowLayer, glowStyle]} />

            {/* Loading placeholder */}
            {!imageLoaded && (
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderEmoji}>🎵</Text>
                </View>
            )}

            <Image
                source={{ uri: artwork }}
                style={[styles.image, !imageLoaded && { opacity: 0 }]}
                onLoad={() => setImageLoaded(true)}
            />

            <BlurView intensity={60} tint="dark" style={styles.labelContainer}>
                <Text style={styles.text} numberOfLines={2}>{title}</Text>
            </BlurView>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: '#0a0e17',
        aspectRatio: 1,
        flex: 1,
        cursor: 'pointer' as any,
    },
    disabled: {
        opacity: 0.5,
        cursor: 'not-allowed' as any,
    },
    glowLayer: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: 'transparent',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        zIndex: 10,
    },
    image: {
        width: '100%',
        height: '100%',
        position: 'absolute'
    },
    placeholder: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderEmoji: {
        fontSize: 48,
        opacity: 0.3,
    },
    labelContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.7)'
    },
    text: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center'
    },
});
