import React, { useEffect } from 'react';
import { TextInput, StyleSheet, TextStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface ScoreTickerProps {
    score: number;
    style?: TextStyle;
}

export function ScoreTicker({ score, style }: ScoreTickerProps) {
    const animatedScore = useSharedValue(0);

    useEffect(() => {
        animatedScore.value = withTiming(score, {
            duration: 1000,
            easing: Easing.out(Easing.exp),
        });
    }, [score]);

    const animatedProps = useAnimatedProps(() => {
        return {
            text: `${Math.round(animatedScore.value)}`,
        } as any;
    });

    return (
        <AnimatedTextInput
            underlineColorAndroid="transparent"
            editable={false}
            value={`${score}`}
            style={[styles.text, style]}
            animatedProps={animatedProps}
        />
    );
}

const styles = StyleSheet.create({
    text: {
        color: Colors.text,
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
    },
});
