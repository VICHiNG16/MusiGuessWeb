import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassButtonProps {
    onPress: () => void;
    title: string;
    style?: ViewStyle;
    textStyle?: TextStyle;
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
    disabled?: boolean;
}

const VARIANT_COLORS = {
    primary: { bg: 'rgba(0, 243, 255, 0.15)', border: Colors.primary },
    secondary: { bg: 'rgba(255, 255, 255, 0.08)', border: 'rgba(255, 255, 255, 0.2)' },
    success: { bg: 'rgba(76, 175, 80, 0.15)', border: Colors.success },
    danger: { bg: 'rgba(244, 67, 54, 0.15)', border: Colors.error },
};

// Smooth easing for no-bounce effect
const SMOOTH_EASING = Easing.out(Easing.cubic);

export function GlassButton({
    onPress,
    title,
    style,
    textStyle,
    variant = 'primary',
    disabled = false
}: GlassButtonProps) {
    const scale = useSharedValue(1);
    const glowIntensity = useSharedValue(0);

    const colors = VARIANT_COLORS[variant];

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        shadowOpacity: glowIntensity.value,
    }));

    const handlePressIn = () => {
        if (!disabled) {
            scale.value = withTiming(0.96, { duration: 100, easing: SMOOTH_EASING });
            glowIntensity.value = withTiming(0.8, { duration: 100 });
        }
    };

    const handlePressOut = () => {
        if (!disabled) {
            scale.value = withTiming(1, { duration: 120, easing: SMOOTH_EASING });
            glowIntensity.value = withTiming(0, { duration: 150 });
        }
    };

    const handleHoverIn = () => {
        if (!disabled && Platform.OS === 'web') {
            scale.value = withTiming(1.02, { duration: 120, easing: SMOOTH_EASING });
            glowIntensity.value = withTiming(0.5, { duration: 120 });
        }
    };

    const handleHoverOut = () => {
        if (!disabled && Platform.OS === 'web') {
            scale.value = withTiming(1, { duration: 120, easing: SMOOTH_EASING });
            glowIntensity.value = withTiming(0, { duration: 150 });
        }
    };

    return (
        <AnimatedPressable
            onPress={disabled ? undefined : onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            // @ts-ignore - Web only props
            onMouseEnter={handleHoverIn}
            onMouseLeave={handleHoverOut}
            style={[
                styles.container,
                { borderColor: colors.border },
                animatedStyle,
                glowStyle,
                disabled && styles.disabled,
                style
            ]}
        >
            <BlurView intensity={20} tint="dark" style={[styles.blur, { backgroundColor: colors.bg }]}>
                <Text style={[
                    styles.text,
                    { color: variant === 'primary' ? Colors.text : Colors.text },
                    textStyle
                ]}>
                    {title}
                </Text>
            </BlurView>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        cursor: 'pointer' as any,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 15,
    },
    disabled: {
        opacity: 0.5,
        cursor: 'not-allowed' as any,
    },
    blur: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    text: {
        color: Colors.text,
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
