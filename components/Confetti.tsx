import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSequence,
    Easing,
    runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiPiece {
    id: number;
    x: number;
    color: string;
    size: number;
    rotation: number;
    delay: number;
}

const COLORS = ['#00f3ff', '#ff00ff', '#ffcc00', '#4caf50', '#ff6b35', '#ffffff'];
const PIECE_COUNT = 50;

interface ConfettiProps {
    active: boolean;
    onComplete?: () => void;
}

function ConfettiPieceComponent({ piece, onComplete }: { piece: ConfettiPiece; onComplete?: () => void }) {
    const translateY = useSharedValue(-50);
    const translateX = useSharedValue(piece.x);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        const endX = piece.x + (Math.random() - 0.5) * 200;

        translateY.value = withDelay(
            piece.delay,
            withTiming(SCREEN_HEIGHT + 100, { duration: 3000, easing: Easing.out(Easing.quad) })
        );

        translateX.value = withDelay(
            piece.delay,
            withSequence(
                withTiming(piece.x + 50, { duration: 500 }),
                withTiming(piece.x - 30, { duration: 500 }),
                withTiming(endX, { duration: 2000 })
            )
        );

        rotate.value = withDelay(
            piece.delay,
            withTiming(piece.rotation + 720, { duration: 3000 })
        );

        opacity.value = withDelay(
            piece.delay + 2500,
            withTiming(0, { duration: 500 }, () => {
                if (piece.id === 0 && onComplete) {
                    runOnJS(onComplete)();
                }
            })
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { rotate: `${rotate.value}deg` },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.piece,
                {
                    width: piece.size,
                    height: piece.size * 0.6,
                    backgroundColor: piece.color,
                    borderRadius: piece.size * 0.1,
                },
                animatedStyle,
            ]}
        />
    );
}

export function Confetti({ active, onComplete }: ConfettiProps) {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

    useEffect(() => {
        if (active) {
            const newPieces: ConfettiPiece[] = Array.from({ length: PIECE_COUNT }, (_, i) => ({
                id: i,
                x: Math.random() * SCREEN_WIDTH,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                size: 8 + Math.random() * 8,
                rotation: Math.random() * 360,
                delay: Math.random() * 500,
            }));
            setPieces(newPieces);
        } else {
            setPieces([]);
        }
    }, [active]);

    if (!active || pieces.length === 0) return null;

    // Only render on web for performance
    if (Platform.OS !== 'web') return null;

    return (
        <View style={styles.container} pointerEvents="none">
            {pieces.map((piece) => (
                <ConfettiPieceComponent
                    key={piece.id}
                    piece={piece}
                    onComplete={piece.id === 0 ? onComplete : undefined}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
        overflow: 'hidden',
    },
    piece: {
        position: 'absolute',
        top: 0,
    },
});
