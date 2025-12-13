import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { BackgroundGradient } from '../components/BackgroundGradient';
import { GlassButton } from '../components/GlassButton';
import { Colors } from '../constants/Colors';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function UsernameScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const [username, setUsername] = useState('');

    const handleContinue = () => {
        if (username.trim()) {
            router.push(`/multiplayer?username=${encodeURIComponent(username.trim())}`);
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            <BackgroundGradient />

            <Animated.View entering={FadeIn} style={styles.content}>
                <Animated.View entering={FadeInDown.delay(100)} style={styles.iconContainer}>
                    <Ionicons name="person-circle" size={80} color={Colors.primary} />
                </Animated.View>

                <Animated.Text entering={FadeInDown.delay(200)} style={styles.title}>
                    WHAT'S YOUR NAME?
                </Animated.Text>

                <Animated.Text entering={FadeInDown.delay(300)} style={styles.subtitle}>
                    This will be shown to other players
                </Animated.Text>

                <Animated.View entering={FadeInDown.delay(400)} style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        placeholderTextColor={Colors.textSecondary}
                        value={username}
                        onChangeText={setUsername}
                        maxLength={20}
                        autoFocus
                        onSubmitEditing={handleContinue}
                    />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(500)} style={styles.buttonContainer}>
                    <GlassButton
                        title="Continue"
                        onPress={handleContinue}
                        disabled={!username.trim()}
                        style={{ width: isMobile ? '100%' : 280 }}
                    />

                    <GlassButton
                        title="Back"
                        onPress={handleBack}
                        variant="secondary"
                        style={{ width: isMobile ? '100%' : 280, marginTop: 15 }}
                    />
                </Animated.View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
    },
    iconContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 40,
    },
    inputContainer: {
        width: '100%',
        maxWidth: 400,
        marginBottom: 30,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 18,
        fontSize: 18,
        color: Colors.text,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
});
