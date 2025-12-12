import { Pressable, Text, StyleSheet, Image, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SongCardProps {
    onPress: () => void;
    title: string;
    artwork: string;
    disabled?: boolean;
}

export function SongCard({ onPress, title, artwork, disabled }: SongCardProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        if (!disabled) scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        if (!disabled) scale.value = withSpring(1);
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[styles.container, animatedStyle, disabled && styles.disabled]}
        >
            <Image source={{ uri: artwork }} style={styles.image} />
            <BlurView intensity={40} tint="dark" style={styles.labelContainer}>
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
        backgroundColor: '#000',
        aspectRatio: 1, // Square card
        flex: 1,
    },
    disabled: {
        opacity: 0.5
    },
    image: {
        width: '100%',
        height: '100%',
        position: 'absolute'
    },
    labelContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.6)'
    },
    text: {
        color: Colors.text,
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center'
    },
});
