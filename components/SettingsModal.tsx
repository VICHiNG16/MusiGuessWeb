import { View, Text, StyleSheet, Switch, Pressable, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import { GlassButton } from './GlassButton';
import { useSettings } from '../context/SettingsContext';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

interface Props {
    onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
    const { soundEnabled, hapticsEnabled, toggleSound, toggleHaptics } = useSettings();

    return (
        <Animated.View
            style={styles.container}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
        >
            <BlurView intensity={30} tint="dark" style={styles.blur} />
            <Pressable style={styles.backdrop} onPress={onClose} />

            <Animated.View
                style={styles.modalView}
                entering={ZoomIn.springify().damping(15)}
                exiting={ZoomOut.duration(150)}
            >
                <Text style={styles.title}>SETTINGS</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Sound Effects</Text>
                    <Switch
                        value={soundEnabled}
                        onValueChange={toggleSound}
                        trackColor={{ false: "#767577", true: Colors.primary }}
                        thumbColor={"#f4f3f4"}
                    />
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Haptic Feedback</Text>
                    <Switch
                        value={hapticsEnabled}
                        onValueChange={toggleHaptics}
                        trackColor={{ false: "#767577", true: Colors.primary }}
                        thumbColor={"#f4f3f4"}
                    />
                </View>

                <View style={styles.divider} />

                <Pressable onPress={() => Linking.openURL('https://github.com/VICHiNG16/MusiGuessWeb')}>
                    <Text style={styles.link}>View on GitHub</Text>
                </Pressable>

                <GlassButton title="Close" onPress={onClose} style={{ marginTop: 20 }} />
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    blur: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalView: {
        width: '80%',
        maxWidth: 400,
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
        borderColor: Colors.surfaceHighlight
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.text,
        marginBottom: 30,
        letterSpacing: 4
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
        marginBottom: 20
    },
    label: {
        fontSize: 16,
        color: Colors.textSecondary
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: Colors.surfaceHighlight,
        marginVertical: 20
    },
    link: {
        color: Colors.primary,
        fontSize: 14,
        textDecorationLine: 'underline',
        marginBottom: 10
    }
});
