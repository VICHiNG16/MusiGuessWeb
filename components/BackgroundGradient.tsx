import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';

export function BackgroundGradient({ style }: { style?: ViewStyle }) {
    return (
        <LinearGradient
            colors={[Colors.background, '#1a1f35']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, style]}
        />
    );
}
